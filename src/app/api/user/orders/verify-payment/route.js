
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import razorpay from "@/lib/razorpay";

import Order from "@/models/order.model";
import Payment from "@/models/payment.model";
import Cart from "@/models/cart.model";

import { createShiprocketOrder } from "@/lib/create-shiprocket-order";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function verifySignature({
    razorpayOrderId,
    razorpayPaymentId,
    signature,
}) {
    if (!/^[a-f0-9]{64}$/i.test(signature)) {
        return false;
    }

    const expected = crypto
        .createHmac(
            "sha256",
            process.env.RAZORPAY_KEY_SECRET
        )
        .update(
            `${razorpayOrderId}|${razorpayPaymentId}`
        )
        .digest("hex");

    const receivedBuffer = Buffer.from(
        signature,
        "hex"
    );

    const expectedBuffer = Buffer.from(
        expected,
        "hex"
    );

    return (
        receivedBuffer.length ===
        expectedBuffer.length &&
        crypto.timingSafeEqual(
            receivedBuffer,
            expectedBuffer
        )
    );
}

function cartItemKey(productId, variant) {
    const size =
        typeof variant === "object"
            ? variant?.size || ""
            : variant || "";

    return `${String(productId)}:${String(size)
        .trim()
        .toLowerCase()}`;
}

async function removePurchasedCartItems(
    userId,
    purchasedItems
) {
    const purchasedKeys = new Set(
        purchasedItems.map((item) =>
            cartItemKey(
                item.productId,
                item.variant
            )
        )
    );

    const cart = await Cart.findOne({
        userId,
    });

    if (!cart?.items?.length) {
        return;
    }

    const remainingItems = cart.items.filter(
        (item) =>
            !purchasedKeys.has(
                cartItemKey(
                    item.productId,
                    item.variant
                )
            )
    );

    if (
        remainingItems.length !==
        cart.items.length
    ) {
        cart.items = remainingItems;
        await cart.save();
    }
}

/**
 * Shiprocket failures must not invalidate
 * an already captured Razorpay payment.
 */
async function createShipmentSafely(orderId) {
    try {
        const result =
            await createShiprocketOrder(orderId);

        if (!result.success) {
            console.error(
                "Razorpay Shiprocket creation needs attention:",
                {
                    orderId: String(orderId),
                    status: result.status,
                    message: result.message,
                }
            );
        }

        return {
            success: result.success,
            status: result.status,
            shiprocketOrderId:
                result.shiprocketOrderId || null,
            shipmentId:
                result.shipmentId || null,
        };
    } catch (error) {
        console.error(
            "Razorpay Shiprocket creation error:",
            error
        );

        return {
            success: false,
            status: "failed",
            shiprocketOrderId: null,
            shipmentId: null,
        };
    }
}

export async function POST(request) {
    try {
        // 1. Validate configuration
        if (
            !process.env.JWT_USER_SECRET ||
            !process.env.RAZORPAY_KEY_SECRET
        ) {
            console.error(
                "Payment verification configuration missing."
            );

            return errorResponse(
                "Payment service is unavailable.",
                500
            );
        }

        // 2. Authenticate customer
        const cookieStore = await cookies();

        const token = cookieStore.get(
            "solvestic_user_token"
        )?.value;

        if (!token) {
            return errorResponse(
                "Please log in to verify your payment.",
                401
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
                "Your session has expired.",
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
                "Invalid customer session.",
                401
            );
        }

        // 3. Validate payment response
        const body = await request
            .json()
            .catch(() => ({}));

        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = body;

        if (
            !mongoose.isValidObjectId(orderId) ||
            ![
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
            ].every(
                (value) =>
                    typeof value === "string" &&
                    value.length > 0
            )
        ) {
            return errorResponse(
                "Invalid payment verification details."
            );
        }

        // 4. Verify Razorpay signature
        const signatureValid =
            verifySignature({
                razorpayOrderId:
                    razorpay_order_id,
                razorpayPaymentId:
                    razorpay_payment_id,
                signature:
                    razorpay_signature,
            });

        if (!signatureValid) {
            return errorResponse(
                "Payment signature verification failed.",
                400
            );
        }

        await connectDB();

        // 5. Find customer's order
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

        if (
            order.paymentMethod !==
            "razorpay"
        ) {
            return errorResponse(
                "This order does not require Razorpay verification.",
                400
            );
        }

        // 6. Find matching payment record
        const payment =
            await Payment.findOne({
                orderId: order._id,
                userId: decoded.userId,
                provider: "razorpay",
                razorpayOrderId:
                    razorpay_order_id,
            });

        if (!payment) {
            return errorResponse(
                "Matching payment record not found.",
                404
            );
        }

        if (
            payment.razorpayPaymentId &&
            payment.razorpayPaymentId !==
            razorpay_payment_id &&
            payment.status === "captured"
        ) {
            return errorResponse(
                "Another payment is already recorded for this order.",
                409
            );
        }

        // 7. Verify payment with Razorpay
        const expectedAmount = Math.round(
            Number(order.totalAmount) * 100
        );

        if (
            !Number.isSafeInteger(
                expectedAmount
            ) ||
            expectedAmount <= 0
        ) {
            return errorResponse(
                "Invalid order amount.",
                409
            );
        }

        let gatewayPayment =
            await razorpay.payments.fetch(
                razorpay_payment_id
            );

        if (
            gatewayPayment.order_id !==
            razorpay_order_id ||
            Number(gatewayPayment.amount) !==
            expectedAmount ||
            gatewayPayment.currency !==
            (order.currency || "INR")
        ) {
            return errorResponse(
                "Razorpay payment details do not match this order.",
                400
            );
        }

        // 8. Capture authorized payment
        if (
            gatewayPayment.status ===
            "authorized"
        ) {
            try {
                gatewayPayment =
                    await razorpay.payments.capture(
                        razorpay_payment_id,
                        expectedAmount,
                        order.currency || "INR"
                    );
            } catch (captureError) {
                // Capture might have completed
                // even if the API timed out.
                gatewayPayment =
                    await razorpay.payments.fetch(
                        razorpay_payment_id
                    );

                if (
                    gatewayPayment.status !==
                    "captured"
                ) {
                    console.error(
                        "Razorpay capture error:",
                        captureError
                    );

                    return errorResponse(
                        "Payment capture is pending. Please check your order before retrying.",
                        409
                    );
                }
            }
        }

        // 9. Handle unsuccessful payment
        if (
            gatewayPayment.status !==
            "captured"
        ) {
            if (
                gatewayPayment.status ===
                "failed"
            ) {
                await Payment.updateOne(
                    {
                        _id: payment._id,
                        status: {
                            $ne: "captured",
                        },
                    },
                    {
                        $set: {
                            status: "failed",
                            razorpayPaymentId:
                                razorpay_payment_id,
                            failureReason:
                                gatewayPayment.error_description ||
                                "Payment failed.",
                        },
                    }
                );
            }

            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Payment has not been captured.",
                    paymentStatus:
                        gatewayPayment.status,
                },
                { status: 409 }
            );
        }

        // 10. Save captured payment
        const paymentUpdate =
            await Payment.updateOne(
                {
                    _id: payment._id,
                    $or: [
                        {
                            razorpayPaymentId:
                                razorpay_payment_id,
                        },
                        {
                            razorpayPaymentId: "",
                        },
                        {
                            razorpayPaymentId: null,
                        },
                        {
                            razorpayPaymentId: {
                                $exists: false,
                            },
                        },
                    ],
                },
                {
                    $set: {
                        status: "captured",
                        razorpayPaymentId:
                            razorpay_payment_id,
                        razorpaySignature:
                            razorpay_signature,
                        failureReason: "",
                    },
                }
            );

        if (
            paymentUpdate.matchedCount !== 1
        ) {
            return errorResponse(
                "Payment was captured but needs reconciliation. Please contact support.",
                409
            );
        }

        // 11. Confirm order atomically
        const now = new Date();

        const confirmation =
            await Order.updateOne(
                {
                    _id: order._id,
                    userId: decoded.userId,
                    paymentMethod: "razorpay",
                    paymentStatus: "pending",
                    orderStatus: {
                        $ne: "cancelled",
                    },
                },
                {
                    $set: {
                        paymentStatus: "paid",
                        orderStatus: "confirmed",
                        paidAt: now,
                        confirmedAt: now,
                    },
                }
            );

        const confirmedOrder =
            await Order.findById(
                order._id
            ).lean();

        if (
            confirmedOrder?.paymentStatus !==
            "paid"
        ) {
            return errorResponse(
                "Payment was captured, but the order requires reconciliation. Please contact support.",
                409
            );
        }

        // 12. Clean purchased items from cart
        if (
            confirmation.modifiedCount === 1
        ) {
            try {
                await removePurchasedCartItems(
                    decoded.userId,
                    confirmedOrder.items
                );
            } catch (cartError) {
                console.error(
                    "Cart cleanup failed:",
                    cartError
                );
            }
        }

        // 13. NEW: Automatic Shiprocket creation
        // Only after payment is captured
        // and order is confirmed.
        let shipment = {
            success: false,
            status: "not_eligible",
            shiprocketOrderId: null,
            shipmentId: null,
        };

        if (
            ["confirmed", "processing"].includes(
                confirmedOrder.orderStatus
            )
        ) {
            shipment =
                await createShipmentSafely(
                    confirmedOrder._id
                );
        }

        // 14. Return successful payment response
        return NextResponse.json({
            success: true,

            message:
                "Payment verified successfully.",

            orderId: String(
                confirmedOrder._id
            ),

            orderNumber:
                confirmedOrder.orderNumber,

            paymentMethod: "razorpay",
            paymentStatus: "paid",

            orderStatus:
                confirmedOrder.orderStatus,

            totalAmount:
                confirmedOrder.totalAmount,

            shipmentCreated:
                shipment.success,

            shipmentCreationStatus:
                shipment.status,

            shiprocketOrderId:
                shipment.shiprocketOrderId,

            shipmentId:
                shipment.shipmentId,
        });
    } catch (error) {
        console.error(
            "Verify payment error:",
            error
        );

        return errorResponse(
            "Unable to verify payment right now. Check My Orders before retrying.",
            500
        );
    }
}
