
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

export const runtime = "nodejs";

async function createShiprocketOrder(orderId, cookieStore) {
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "http://localhost:3000";

    const response = await fetch(
        `${baseUrl}/api/user/orders/${orderId}/shiprocket`,
        {
            method: "POST",
            headers: {
                Cookie: cookieStore.toString(),
            },
            cache: "no-store",
        }
    );

    const result = await response.json();

    if (!response.ok) {
        console.error("Shiprocket order creation failed:", {
            orderId: String(orderId),
            status: response.status,
            message: result.message,
        });

        return {
            success: false,
            message: result.message || "Shiprocket order creation failed.",
        };
    }

    return { success: true, shipment: result.shipment };
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("solvestic_user_token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Please log in to verify payment." },
                { status: 401 }
            );
        }

        if (!process.env.JWT_USER_SECRET || !process.env.RAZORPAY_KEY_SECRET) {
            throw new Error("Required authentication or Razorpay configuration is missing.");
        }

        const session = jwt.verify(token, process.env.JWT_USER_SECRET);

        if (
            session.type !== "customer" ||
            !mongoose.Types.ObjectId.isValid(session.userId)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid customer session." },
                { status: 401 }
            );
        }

        const {
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = await request.json();

        if (
            !mongoose.Types.ObjectId.isValid(orderId) ||
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {
            return NextResponse.json(
                { success: false, message: "Missing or invalid payment details." },
                { status: 400 }
            );
        }

        await connectDB();

        const order = await Order.findOne({
            _id: orderId,
            userId: session.userId,
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        const payment = await Payment.findOne({
            orderId: order._id,
            userId: session.userId,
            razorpayOrderId: razorpay_order_id,
            provider: "razorpay",
        }).select("+razorpaySignature");

        if (!payment) {
            return NextResponse.json(
                { success: false, message: "Payment record not found." },
                { status: 404 }
            );
        }

        if (order.orderStatus === "cancelled") {
            return NextResponse.json(
                { success: false, message: "This order has been cancelled." },
                { status: 409 }
            );
        }

        if (payment.razorpayPaymentId &&
            payment.razorpayPaymentId !== razorpay_payment_id &&
            payment.status === "captured") {
            return NextResponse.json(
                { success: false, message: "A different payment is already recorded for this order." },
                { status: 409 }
            );
        }

        // Verify Checkout signature.
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const received = Buffer.from(razorpay_signature, "hex");
        const expected = Buffer.from(expectedSignature, "hex");

        if (
            received.length !== expected.length ||
            !crypto.timingSafeEqual(received, expected)
        ) {
            return NextResponse.json(
                { success: false, message: "Payment signature verification failed." },
                { status: 400 }
            );
        }

        const expectedAmount = Math.round(Number(order.totalAmount) * 100);

        // Fetch the payment from Razorpay to verify its real status.
        let razorpayPayment = await razorpay.payments.fetch(
            razorpay_payment_id
        );

        if (
            razorpayPayment.order_id !== razorpay_order_id ||
            Number(razorpayPayment.amount) !== expectedAmount ||
            razorpayPayment.currency !== (order.currency || "INR")
        ) {
            return NextResponse.json(
                { success: false, message: "Payment details do not match this order." },
                { status: 400 }
            );
        }

        // Capture only if Razorpay reports an authorized payment.
        if (razorpayPayment.status === "authorized") {
            razorpayPayment = await razorpay.payments.capture(
                razorpay_payment_id,
                expectedAmount,
                order.currency || "INR"
            );
        }

        if (razorpayPayment.status !== "captured") {
            if (razorpayPayment.status === "failed") {
                payment.status = "failed";
                payment.razorpayPaymentId = razorpay_payment_id;
                payment.failureReason =
                    razorpayPayment.error_description ||
                    razorpayPayment.error_reason ||
                    "Payment failed";
                await payment.save();
            }

            return NextResponse.json(
                {
                    success: false,
                    message: "Payment has not been captured.",
                    paymentStatus: razorpayPayment.status,
                },
                { status: 409 }
            );
        }

        // Save payment confirmation first.
        payment.razorpayPaymentId = razorpay_payment_id;
        payment.razorpaySignature = razorpay_signature;
        payment.status = "captured";
        payment.paidAt = payment.paidAt || new Date();
        payment.failureReason = "";

        await payment.save();

        // IMPORTANT: Save the order as paid BEFORE calling Shiprocket.
        order.paymentStatus = "paid";
        order.orderStatus = "confirmed";
        order.paidAt = order.paidAt || new Date();

        await order.save();

        // Clear the database cart only after payment is confirmed.
        await Cart.findOneAndUpdate(
            { userId: order.userId },
            { $set: { items: [] } }
        );

        // If Shiprocket is unavailable, payment remains successful.
        let shipmentResult = { success: false };

        try {
            shipmentResult = await createShiprocketOrder(
                order._id,
                cookieStore
            );
        } catch (shipmentError) {
            console.error(
                "Shiprocket request failed:",
                shipmentError.message
            );
        }

        return NextResponse.json({
            success: true,
            message: "Payment verified successfully.",
            orderId: String(order._id),
            orderNumber: order.orderNumber,
            paymentStatus: "paid",
            shipmentCreated: shipmentResult.success,
            shipmentMessage: shipmentResult.success
                ? "Shiprocket order created."
                : "Payment succeeded. Shipment creation needs retry.",
        });
    } catch (error) {
        console.error(
            "Payment verification error:",
            error?.message || error
        );

        return NextResponse.json(
            { success: false, message: "Unable to verify payment. Please try again." },
            { status: 500 }
        );
    }
}
