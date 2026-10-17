
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";

export const runtime = "nodejs";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("solvestic_user_token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Please log in." },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(token, process.env.JWT_USER_SECRET);

        if (
            decoded.type !== "customer" ||
            !mongoose.Types.ObjectId.isValid(decoded.userId)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid session." },
                { status: 401 }
            );
        }

        await connectDB();

        const orders = await Order.find({ userId: decoded.userId })
            .select(
                "orderNumber items subtotal shippingFee discount totalAmount currency paymentMethod paymentStatus orderStatus createdAt shipment"
            )
            .sort({ createdAt: -1 })
            .limit(2)
            .lean();

        return NextResponse.json({
            success: true,
            orders,
        });
    } catch (error) {
        console.error("Fetch customer orders error:", error.message);

        return NextResponse.json(
            { success: false, message: "Unable to load your orders." },
            { status: 500 }
        );
    }
}
