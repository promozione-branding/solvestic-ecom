import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";

export async function GET(request) {
    const authError = requireAdmin(request);
    if (authError) return authError;

    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search")?.trim() || "";
        const orderStatus = searchParams.get("orderStatus") || "";
        const paymentStatus = searchParams.get("paymentStatus") || "";

        const filter = {};

        if (orderStatus) {
            filter.orderStatus = orderStatus;
        }

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }

        if (search) {
            const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const regex = new RegExp(escaped, "i");

            filter.$or = [
                { orderNumber: regex },
                { customerEmail: regex },
                { "shippingAddress.fullName": regex },
                { "shippingAddress.mobile": regex },
            ];
        }

        const [orders, totalOrders, pendingOrders, deliveredOrders, revenue] =
            await Promise.all([
                Order.find(filter).sort({ createdAt: -1 }).lean(),

                Order.countDocuments(),

                Order.countDocuments({
                    orderStatus: "pending",
                }),

                Order.countDocuments({
                    orderStatus: "delivered",
                }),

                Order.aggregate([
                    {
                        $match: {
                            paymentStatus: "paid",
                        },
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: "$totalAmount" },
                        },
                    },
                ]),
            ]);

        return NextResponse.json({
            success: true,
            orders,
            stats: {
                totalOrders,
                pendingOrders,
                deliveredOrders,
                paidRevenue: revenue[0]?.total || 0,
                filteredOrders: orders.length,
            },
        });
    } catch (error) {
        console.error("Admin fetch orders error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch orders.",
            },
            { status: 500 }
        );
    }
}