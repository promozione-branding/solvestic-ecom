
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";

import {
    getShiprocketToken,
    shiprocketRequest,
} from "@/lib/shiprocket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;

function errorResponse(message, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status }
    );
}

function isShipmentEligible(order) {
    if (!order) return false;

    if (
        ["cancelled", "returned", "delivered"].includes(
            order.orderStatus
        )
    ) {
        return false;
    }

    if (
        order.paymentMethod === "razorpay"
    ) {
        return (
            order.paymentStatus === "paid" &&
            ["confirmed", "processing"].includes(
                order.orderStatus
            )
        );
    }

    if (
        order.paymentMethod === "cod"
    ) {
        return (
            order.paymentStatus === "pending" &&
            ["confirmed", "processing"].includes(
                order.orderStatus
            )
        );
    }

    return false;
}

function getPackageDetails() {
    const details = {
        length: Number(
            process.env.SHIPROCKET_PACKAGE_LENGTH || 10
        ),
        breadth: Number(
            process.env.SHIPROCKET_PACKAGE_BREADTH || 10
        ),
        height: Number(
            process.env.SHIPROCKET_PACKAGE_HEIGHT || 10
        ),
        weight: Number(
            process.env.SHIPROCKET_PACKAGE_WEIGHT || 0.5
        ),
    };

    if (
        Object.values(details).some(
            (value) =>
                !Number.isFinite(value) ||
                value <= 0
        )
    ) {
        throw new Error(
            "Invalid Shiprocket package dimensions or weight."
        );
    }

    return details;
}

function validateAddress(address) {
    const required = [
        "fullName",
        "mobile",
        "addressLine1",
        "city",
        "state",
        "pincode",
    ];

    return required.every(
        (field) =>
            String(address?.[field] || "").trim()
                .length > 0
    );
}

function buildShiprocketPayload(order) {
    const address = order.shippingAddress;

    if (!validateAddress(address)) {
        throw new Error(
            "Shipping address is incomplete."
        );
    }

    const pickupLocation =
        process.env.SHIPROCKET_PICKUP_LOCATION;

    if (!pickupLocation) {
        throw new Error(
            "SHIPROCKET_PICKUP_LOCATION is missing."
        );
    }

    const packageDetails = getPackageDetails();

    const paymentMethod =
        order.paymentMethod === "cod"
            ? "COD"
            : "Prepaid";

    // Keep each product's original selling price.
    // Order-level discount is sent through sub_total.
    const orderItems = order.items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            !Number.isFinite(unitPrice) ||
            unitPrice < 0
        ) {
            throw new Error(
                "Invalid order item data."
            );
        }

        return {
            name: item.name,
            sku: [
                String(item.productId),
                String(item.variant || "")
                    .trim()
                    .replace(/\s+/g, "-"),
            ]
                .filter(Boolean)
                .join("-"),

            units: quantity,
            selling_price: unitPrice,
            discount: 0,
            tax: 0,
            hsn: "",
        };
    });

    return {
        order_id: String(order.orderNumber),

        order_date: new Date(
            order.createdAt
        )
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),

        pickup_location: pickupLocation,

        billing_customer_name:
            address.fullName,

        billing_last_name: "",

        billing_address:
            address.addressLine1,

        billing_address_2:
            address.addressLine2 || "",

        billing_city: address.city,
        billing_state: address.state,

        billing_pincode:
            String(address.pincode),

        billing_country:
            address.country || "India",

        billing_email:
            order.customerEmail,

        billing_phone:
            String(address.mobile),

        shipping_is_billing: true,

        order_items: orderItems,

        payment_method: paymentMethod,

        sub_total: Number(
            order.totalAmount
        ),

        ...packageDetails,
    };
}

export async function POST(request, context) {
    let claimedOrderId = null;
    let lockTime = null;
    let requestMayHaveReachedShiprocket = false;

    try {
        // 1. Authenticate the customer
        const cookieStore = await cookies();

        const token = cookieStore.get(
            "solvestic_user_token"
        )?.value;

        if (!token) {
            return errorResponse(
                "Please log in.",
                401
            );
        }

        if (!process.env.JWT_USER_SECRET) {
            throw new Error(
                "JWT_USER_SECRET is missing."
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_USER_SECRET
            );
        } catch {
            return errorResponse(
                "Invalid or expired session.",
                401
            );
        }

        if (
            decoded.type !== "customer" ||
            !mongoose.isValidObjectId(
                decoded.userId
            )
        ) {
            return errorResponse(
                "Unauthorized.",
                401
            );
        }

        // 2. Validate order ID
        const { orderId } =
            await context.params;

        if (
            !mongoose.isValidObjectId(orderId)
        ) {
            return errorResponse(
                "Invalid order ID."
            );
        }

        await connectDB();

        // 3. Find only this customer's order
        const order = await Order.findOne({
            _id: orderId,
            userId: decoded.userId,
        });

        if (!order) {
            return errorResponse(
                "Order not found.",
                404
            );
        }

        // 4. Return existing shipment
        if (
            order.shipment?.shiprocketOrderId
        ) {
            return NextResponse.json({
                success: true,
                alreadyCreated: true,
                message:
                    "Shiprocket order already exists.",
                orderId: String(order._id),
                orderNumber:
                    order.orderNumber,
                shipment: order.shipment,
            });
        }

        // 5. Check payment and order status
        if (!isShipmentEligible(order)) {
            return errorResponse(
                "This order is not eligible for shipment creation.",
                409
            );
        }

        // 6. Prevent duplicate creation
        const createStatus =
            order.shipment
                ?.shiprocketCreateStatus ||
            "not_started";

        if (
            createStatus === "processing"
        ) {
            const lockedAt =
                order.shipment
                    ?.shiprocketCreateLockedAt;

            const isStale =
                lockedAt &&
                Date.now() -
                new Date(
                    lockedAt
                ).getTime() >
                PROCESSING_TIMEOUT_MS;

            return errorResponse(
                isStale
                    ? "Shipment creation is taking longer than expected. Check Shiprocket before retrying."
                    : "Shipment creation is already in progress.",
                409
            );
        }

        if (createStatus === "failed") {
            return errorResponse(
                "Previous shipment creation needs review. Check Shiprocket for this order number before retrying.",
                409
            );
        }

        // 7. Prepare payload before locking
        const payload =
            buildShiprocketPayload(order);

        const now = new Date();

        // 8. Atomically lock this order
        const claimedOrder =
            await Order.findOneAndUpdate(
                {
                    _id: order._id,
                    userId: decoded.userId,

                    paymentMethod:
                        order.paymentMethod,

                    paymentStatus:
                        order.paymentStatus,

                    orderStatus: {
                        $in: [
                            "confirmed",
                            "processing",
                        ],
                    },

                    "shipment.shiprocketOrderId": {
                        $in: ["", null],
                    },

                    "shipment.shiprocketCreateStatus": {
                        $in: [
                            "not_started",
                            null,
                        ],
                    },
                },
                {
                    $set: {
                        "shipment.shiprocketCreateStatus":
                            "processing",

                        "shipment.shiprocketCreateLockedAt":
                            now,

                        "shipment.shiprocketCreateError":
                            "",

                        "shipment.lastError":
                            "",

                        "shipment.status":
                            "pending",
                    },
                },
                {
                    new: true,
                }
            );

        if (!claimedOrder) {
            return errorResponse(
                "Shipment creation is already running or the order status has changed.",
                409
            );
        }

        claimedOrderId =
            claimedOrder._id;

        lockTime = now;

        // 9. Authenticate with Shiprocket
        const shiprocketToken =
            await getShiprocketToken();

        // 10. Create Shiprocket order
        requestMayHaveReachedShiprocket = true;

        const result =
            await shiprocketRequest(
                "/orders/create/adhoc",
                shiprocketToken,
                {
                    method: "POST",
                    body: JSON.stringify(
                        payload
                    ),
                }
            );

        if (
            !result?.order_id ||
            !result?.shipment_id
        ) {
            throw new Error(
                "Shiprocket response is missing order_id or shipment_id."
            );
        }

        // 11. Save shipment information
        const updatedOrder =
            await Order.findOneAndUpdate(
                {
                    _id: claimedOrderId,

                    "shipment.shiprocketCreateStatus":
                        "processing",

                    "shipment.shiprocketCreateLockedAt":
                        lockTime,

                    "shipment.shiprocketOrderId": {
                        $in: ["", null],
                    },
                },
                {
                    $set: {
                        "shipment.shiprocketOrderId":
                            String(
                                result.order_id
                            ),

                        "shipment.shipmentId":
                            String(
                                result.shipment_id
                            ),

                        "shipment.channelOrderId":
                            String(
                                claimedOrder.orderNumber
                            ),

                        "shipment.status":
                            "created",

                        "shipment.currentStatusText":
                            "Order created in Shiprocket",

                        "shipment.shiprocketCreateStatus":
                            "created",

                        "shipment.shiprocketCreateError":
                            "",

                        "shipment.lastError":
                            "",

                        "shipment.shiprocketCreateLockedAt":
                            null,
                    },
                },
                {
                    new: true,
                }
            );

        if (!updatedOrder) {
            console.error(
                "Shiprocket created an order, but local save failed:",
                {
                    orderId:
                        String(
                            claimedOrderId
                        ),
                    shiprocketOrderId:
                        result.order_id,
                    shipmentId:
                        result.shipment_id,
                }
            );

            return errorResponse(
                "Shipment was created in Shiprocket, but local synchronization needs review.",
                500
            );
        }

        // 12. Success
        return NextResponse.json({
            success: true,

            message:
                "Shiprocket order created successfully.",

            orderId:
                String(updatedOrder._id),

            orderNumber:
                updatedOrder.orderNumber,

            paymentMethod:
                updatedOrder.paymentMethod,

            shipment:
                updatedOrder.shipment,
        });
    } catch (error) {
        console.error(
            "Shiprocket order creation error:",
            error
        );

        if (
            claimedOrderId &&
            lockTime
        ) {
            try {
                await Order.findOneAndUpdate(
                    {
                        _id: claimedOrderId,

                        "shipment.shiprocketCreateStatus":
                            "processing",

                        "shipment.shiprocketCreateLockedAt":
                            lockTime,

                        "shipment.shiprocketOrderId": {
                            $in: ["", null],
                        },
                    },
                    {
                        $set: {
                            "shipment.shiprocketCreateStatus":
                                "failed",

                            "shipment.shiprocketCreateError":
                                String(
                                    error.message ||
                                    "Unknown error"
                                ).slice(0, 500),

                            "shipment.lastError":
                                String(
                                    error.message ||
                                    "Unknown error"
                                ).slice(0, 500),

                            "shipment.shiprocketCreateLockedAt":
                                null,

                            "shipment.status":
                                "failed",
                        },
                    }
                );
            } catch (saveError) {
                console.error(
                    "Unable to save shipment failure:",
                    saveError
                );
            }
        }

        return errorResponse(
            requestMayHaveReachedShiprocket
                ? "Shipment creation could not be confirmed. Check Shiprocket before retrying."
                : "Unable to prepare shipment. Review the order and shipping configuration.",
            500
        );
    }
}
