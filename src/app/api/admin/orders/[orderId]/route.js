import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
];

export async function GET(request, { params }) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    try {
        const { orderId } = await params;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const order = await Order.findById(orderId).lean();

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, order });
    } catch (error) {
        console.error("Admin get order error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to fetch order." },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    try {
        const { orderId } = await params;
        const body = await request.json();
        const { orderStatus } = body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID." },
                { status: 400 }
            );
        }

        if (!ORDER_STATUSES.includes(orderStatus)) {
            return NextResponse.json(
                { success: false, message: "Invalid order status." },
                { status: 400 }
            );
        }

        await connectDB();

        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        if (
            order.paymentStatus === "refunded" &&
            !["cancelled", "returned"].includes(orderStatus)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A refunded order cannot be moved to this status.",
                },
                { status: 400 }
            );
        }

        order.orderStatus = orderStatus;

        if (orderStatus === "cancelled" && !order.cancelledAt) {
            order.cancelledAt = new Date();
        }

        await order.save();

        return NextResponse.json({
            success: true,
            message: "Order status updated successfully.",
            order,
        });
    } catch (error) {
        console.error("Admin update order error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to update order status." },
            { status: 500 }
        );
    }
}