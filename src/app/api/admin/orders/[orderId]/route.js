
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "returned"],
    delivered: ["returned"],
    cancelled: [],
    returned: [],
};

const ACTIVE_SHIPMENT_STATUSES = [
    "created",
    "pickup_scheduled",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "rto",
];

function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function formatOrder(order) {
    return {
        _id: String(order._id),
        orderId: String(order._id),
        orderNumber: order.orderNumber,

        userId: String(order.userId),
        customerEmail: order.customerEmail,

        items: order.items,
        shippingAddress: order.shippingAddress,

        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.discount,
        couponCode: order.couponCode,
        couponDiscount: order.couponDiscount,
        totalAmount: order.totalAmount,
        currency: order.currency,

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,

        confirmedAt: order.confirmedAt,
        paidAt: order.paidAt,
        codCollectedAt: order.codCollectedAt,
        cancelledAt: order.cancelledAt,

        shipment: order.shipment,

        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        codCollectionPending:
            order.paymentMethod === "cod" &&
            order.paymentStatus === "pending" &&
            !["cancelled", "returned"].includes(
                order.orderStatus
            ),
    };
}

async function getAdmin(request) {
    const authError = requireAdmin(request);

    if (authError) {
        return authError;
    }
}

export async function GET(request, context) {
    try {
        const authError = requireAdmin(request);

        if (authError) {
            return authError;
        }

        const { orderId } = await context.params;

        if (!mongoose.isValidObjectId(orderId)) {
            return errorResponse(
                "Invalid order ID."
            );
        }

        await connectDB();

        const order = await Order.findById(
            orderId
        ).lean();

        if (!order) {
            return errorResponse(
                "Order not found.",
                404
            );
        }

        return NextResponse.json({
            success: true,
            order: formatOrder(order),
        });
    } catch (error) {
        console.error(
            "GET admin order error:",
            error
        );

        return errorResponse(
            "Unable to fetch order details.",
            500
        );
    }
}

export async function PATCH(request, context) {
    try {
        // 1. Authenticate admin
        const authError = requireAdmin(request);

        if (authError) {
            return authError;
        }

        // 2. Validate order ID
        const { orderId } = await context.params;

        if (!mongoose.isValidObjectId(orderId)) {
            return errorResponse(
                "Invalid order ID."
            );
        }

        const body = await request
            .json()
            .catch(() => ({}));

        const action = String(
            body.action || "update_status"
        );

        await connectDB();

        // 3. Load order
        const order = await Order.findById(
            orderId
        );

        if (!order) {
            return errorResponse(
                "Order not found.",
                404
            );
        }

        // =====================================
        // ACTION 1: MARK COD PAYMENT COLLECTED
        // =====================================
        if (action === "collect_cod") {
            if (
                order.paymentMethod !== "cod"
            ) {
                return errorResponse(
                    "COD collection is only available for Cash on Delivery orders."
                );
            }

            if (
                order.paymentStatus === "paid"
            ) {
                return NextResponse.json({
                    success: true,
                    message:
                        "COD payment is already marked as collected.",
                    order: formatOrder(order),
                });
            }

            if (
                order.paymentStatus !== "pending"
            ) {
                return errorResponse(
                    "This payment cannot be marked as collected.",
                    409
                );
            }

            if (
                [
                    "pending",
                    "cancelled",
                    "returned",
                ].includes(order.orderStatus)
            ) {
                return errorResponse(
                    "COD collection cannot be confirmed for this order status.",
                    409
                );
            }

            // Require explicit admin confirmation.
            if (
                body.confirmCollected !== true
            ) {
                return errorResponse(
                    "Confirm that the COD payment has actually been received."
                );
            }

            const now = new Date();

            // Atomic update protects against
            // duplicate collection requests.
            const updatedOrder =
                await Order.findOneAndUpdate(
                    {
                        _id: order._id,
                        paymentMethod: "cod",
                        paymentStatus: "pending",
                        orderStatus: {
                            $nin: [
                                "pending",
                                "cancelled",
                                "returned",
                            ],
                        },
                    },
                    {
                        $set: {
                            paymentStatus: "paid",
                            paidAt: now,
                            codCollectedAt: now,
                        },
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );

            if (!updatedOrder) {
                return errorResponse(
                    "Order payment status changed. Refresh and try again.",
                    409
                );
            }

            return NextResponse.json({
                success: true,
                message:
                    "COD payment marked as collected successfully.",
                order: formatOrder(updatedOrder),
            });
        }

        // =====================================
        // ACTION 2: UPDATE ORDER STATUS
        // =====================================
        if (action === "update_status") {
            const newStatus = String(
                body.orderStatus ||
                body.status ||
                ""
            ).toLowerCase();

            const currentStatus =
                order.orderStatus;

            if (
                !Object.prototype.hasOwnProperty.call(
                    STATUS_TRANSITIONS,
                    newStatus
                )
            ) {
                return errorResponse(
                    "Invalid order status."
                );
            }

            if (newStatus === currentStatus) {
                return NextResponse.json({
                    success: true,
                    message:
                        "Order already has this status.",
                    order: formatOrder(order),
                });
            }

            const allowed =
                STATUS_TRANSITIONS[
                currentStatus
                ] || [];

            if (!allowed.includes(newStatus)) {
                return errorResponse(
                    `Cannot change order status from ${currentStatus} to ${newStatus}.`,
                    409
                );
            }

            // Razorpay orders must be paid
            // before fulfillment.
            if (
                order.paymentMethod ===
                "razorpay" &&
                order.paymentStatus !== "paid" &&
                newStatus !== "cancelled"
            ) {
                return errorResponse(
                    "Razorpay payment must be confirmed before processing the order.",
                    409
                );
            }

            // COD order must be placed first.
            if (
                order.paymentMethod === "cod" &&
                currentStatus === "pending" &&
                newStatus === "confirmed"
            ) {
                return errorResponse(
                    "COD orders should be confirmed during checkout.",
                    409
                );
            }

            // Do not allow cancelling orders
            // that already have an active
            // Shiprocket shipment.
            if (
                newStatus === "cancelled"
            ) {
                const shipment =
                    order.shipment || {};

                const hasActiveShipment =
                    Boolean(
                        shipment.shiprocketOrderId
                    ) ||
                    Boolean(
                        shipment.awbCode
                    ) ||
                    ACTIVE_SHIPMENT_STATUSES.includes(
                        shipment.status
                    );

                if (hasActiveShipment) {
                    return errorResponse(
                        "This order has a Shiprocket shipment. Cancel or resolve the shipment in Shiprocket before cancelling the order.",
                        409
                    );
                }

                if (
                    order.paymentStatus === "paid"
                ) {
                    return errorResponse(
                        "Paid orders require a refund workflow before cancellation.",
                        409
                    );
                }
            }

            // Shipment must be created before
            // manually marking an order shipped.
            if (
                newStatus === "shipped" &&
                !order.shipment?.shiprocketOrderId
            ) {
                return errorResponse(
                    "Create a Shiprocket shipment before marking this order as shipped.",
                    409
                );
            }

            // Delivered status should be
            // verified through tracking.
            if (
                newStatus === "delivered" &&
                order.shipment?.status !==
                "delivered"
            ) {
                return errorResponse(
                    "Shiprocket must confirm delivery before the order can be marked delivered.",
                    409
                );
            }

            const now = new Date();

            const updates = {
                orderStatus: newStatus,
            };

            if (
                newStatus === "confirmed"
            ) {
                updates.confirmedAt =
                    order.confirmedAt || now;
            }

            if (
                newStatus === "cancelled"
            ) {
                updates.cancelledAt = now;
            }

            // Conditional update avoids overwriting
            // a concurrent status change.
            const updatedOrder =
                await Order.findOneAndUpdate(
                    {
                        _id: order._id,
                        orderStatus:
                            currentStatus,
                        paymentStatus:
                            order.paymentStatus,
                        "shipment.shiprocketOrderId":
                            order.shipment
                                ?.shiprocketOrderId ||
                            "",
                        "shipment.status":
                            order.shipment
                                ?.status ||
                            "not_created",
                    },
                    {
                        $set: updates,
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );

            if (!updatedOrder) {
                return errorResponse(
                    "Order was updated by another process. Refresh and try again.",
                    409
                );
            }

            return NextResponse.json({
                success: true,
                message:
                    `Order status updated to ${newStatus}.`,
                order: formatOrder(updatedOrder),
            });
        }

        return errorResponse(
            "Invalid admin action."
        );
    } catch (error) {
        console.error(
            "PATCH admin order error:",
            error
        );

        return errorResponse(
            "Unable to update order.",
            500
        );
    }
}
