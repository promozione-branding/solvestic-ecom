
import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import Payment from "@/models/payment.model";
import Order from "@/models/order.model";

export const runtime = "nodejs";

function verifyWebhookSignature(body, signature) {
    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET) {
        return false;
    }

    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(body)
        .digest("hex");

    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    return (
        expectedBuffer.length === receivedBuffer.length &&
        crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    );
}

export async function POST(request) {
    try {
        // Read the exact raw body required for signature verification.
        const rawBody = await request.text();
        const signature = request.headers.get("x-razorpay-signature");

        if (!verifyWebhookSignature(rawBody, signature)) {
            return NextResponse.json(
                { success: false, message: "Invalid webhook signature" },
                { status: 400 }
            );
        }

        const event = JSON.parse(rawBody);

        // Handle payment events only.
        if (
            !["payment.captured", "payment.failed"].includes(event.event)
        ) {
            return NextResponse.json({
                success: true,
                message: "Event ignored",
            });
        }

        const paymentEntity = event.payload?.payment?.entity;

        if (!paymentEntity?.order_id || !paymentEntity?.id) {
            return NextResponse.json(
                { success: false, message: "Payment details missing" },
                { status: 400 }
            );
        }

        await connectDB();

        const payment = await Payment.findOne({
            razorpayOrderId: paymentEntity.order_id,
            provider: "razorpay",
        });

        // Unknown payments should not be acknowledged as processed.
        // Returning an error allows investigation and webhook retries.
        if (!payment) {
            return NextResponse.json(
                { success: false, message: "Payment record not found" },
                { status: 500 }
            );
        }

        const order = await Order.findById(payment.orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 500 }
            );
        }

        // Never let a delayed failure event downgrade a paid order.
        if (
            payment.status === "captured" ||
            order.paymentStatus === "paid"
        ) {
            return NextResponse.json({
                success: true,
                message: "Payment already processed",
            });
        }

        // Confirm amount and currency before marking an order as paid.
        const expectedAmount = Math.round(Number(order.totalAmount) * 100);

        if (
            Number(paymentEntity.amount) !== expectedAmount ||
            paymentEntity.currency !== (order.currency || "INR")
        ) {
            return NextResponse.json(
                { success: false, message: "Payment amount mismatch" },
                { status: 400 }
            );
        }

        if (event.event === "payment.captured") {
            payment.status = "captured";
            payment.razorpayPaymentId = paymentEntity.id;
            payment.paidAt = payment.paidAt || new Date();
            payment.failureReason = undefined;

            order.paymentStatus = "paid";
            order.orderStatus = "confirmed";
            order.paidAt = order.paidAt || new Date();

            await payment.save();
            await order.save();
        }

        if (event.event === "payment.failed") {
            payment.status = "failed";
            payment.razorpayPaymentId = paymentEntity.id;
            payment.failureReason =
                paymentEntity.error_description ||
                paymentEntity.error_reason ||
                "Payment failed";

            order.paymentStatus = "failed";

            await payment.save();
            await order.save();
        }

        return NextResponse.json({
            success: true,
            message: "Webhook processed",
        });
    } catch (error) {
        console.error("Razorpay webhook error:", error);

        return NextResponse.json(
            { success: false, message: "Webhook processing failed" },
            { status: 500 }
        );
    }
}
