
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { verifyAdminToken } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Change collection names if your MongoDB collections differ.
const COLLECTIONS = {
    products: "products",
    orders: "orders",
    inquiries: "inquiries",
    blogs: "blogs",
    users: "users",
    payments: "payments",
    reviews: "productreviews",
    carts: "carts",
};

const number = (value) => Number(value || 0);

function getPeriodStart(period) {
    const now = new Date();
    const start = new Date(now);

    if (period === "7days") {
        start.setUTCDate(start.getUTCDate() - 6);
    } else if (period === "12months") {
        start.setUTCMonth(start.getUTCMonth() - 11);
        start.setUTCDate(1);
    } else {
        start.setUTCDate(start.getUTCDate() - 29);
    }

    start.setUTCHours(0, 0, 0, 0);
    return start;
}

function buildSalesChart(payments, period) {
    const monthly = period === "12months";
    const now = new Date();
    const points = [];
    const map = new Map();

    const count =
        period === "7days" ? 7 :
            monthly ? 12 : 30;

    for (let i = count - 1; i >= 0; i--) {
        const date = new Date(now);

        if (monthly) {
            date.setUTCDate(1);
            date.setUTCMonth(date.getUTCMonth() - i);
        } else {
            date.setUTCDate(date.getUTCDate() - i);
        }

        const key = monthly
            ? date.toISOString().slice(0, 7)
            : date.toISOString().slice(0, 10);

        const label = monthly
            ? date.toLocaleDateString("en-IN", {
                month: "short",
                year: "2-digit",
                timeZone: "UTC",
            })
            : date.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                timeZone: "UTC",
            });

        const point = {
            date: key,
            label,
            revenue: 0,
            orders: 0,
        };

        map.set(key, point);
        points.push(point);
    }

    for (const payment of payments) {
        const date = new Date(payment.date);

        const key = monthly
            ? date.toISOString().slice(0, 7)
            : date.toISOString().slice(0, 10);

        const point = map.get(key);

        if (point) {
            point.revenue += number(payment.revenue);
            point.orders += number(payment.orders);
        }
    }

    return points.map((point) => ({
        ...point,
        revenue: Math.round(point.revenue * 100) / 100,
    }));
}

export async function GET(request) {
    try {
        // Admin authentication
        const token = request.cookies.get("admin_token")?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        let admin;

        try {
            admin = await verifyAdminToken(token);
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid admin session" },
                { status: 401 }
            );
        }

        if (!admin) {
            return NextResponse.json(
                { success: false, message: "Unauthorized" },
                { status: 401 }
            );
        }

        await connectDB();

        const db = mongoose.connection.db;
        const { searchParams } = new URL(request.url);

        const requestedPeriod = searchParams.get("period");

        const period = ["7days", "30days", "12months"].includes(
            requestedPeriod
        )
            ? requestedPeriod
            : "30days";

        const startDate = getPeriodStart(period);

        const products = db.collection(COLLECTIONS.products);
        const orders = db.collection(COLLECTIONS.orders);
        const inquiries = db.collection(COLLECTIONS.inquiries);
        const blogs = db.collection(COLLECTIONS.blogs);
        const users = db.collection(COLLECTIONS.users);
        const payments = db.collection(COLLECTIONS.payments);
        const reviews = db.collection(COLLECTIONS.reviews);
        const carts = db.collection(COLLECTIONS.carts);

        const [
            totalProducts,
            totalOrders,
            totalInquiries,
            publishedBlogs,
            totalCustomers,
            pendingReviews,
            activeCarts,
            paymentStats,
            salesData,
            orderStatuses,
            recentOrders,
            topProducts,
        ] = await Promise.all([
            products.countDocuments(),

            orders.countDocuments(),

            inquiries.countDocuments(),

            blogs.countDocuments(),

            users.countDocuments(),

            reviews.countDocuments({ status: "pending" }),

            carts.countDocuments({
                "items.0": { $exists: true },
            }),

            payments.aggregate([
                {
                    $match: {
                        status: "captured",
                        currency: "INR",
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" },
                        successfulPayments: { $sum: 1 },
                        uniqueOrders: { $addToSet: "$orderId" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        totalRevenue: 1,
                        successfulPayments: 1,
                        paidOrders: { $size: "$uniqueOrders" },
                    },
                },
            ]).toArray(),

            payments.aggregate([
                {
                    $match: {
                        status: "captured",
                        currency: "INR",
                        $or: [
                            { paidAt: { $gte: startDate } },
                            {
                                paidAt: null,
                                createdAt: { $gte: startDate },
                            },
                        ],
                    },
                },
                {
                    $project: {
                        amount: 1,
                        orderId: 1,
                        date: { $ifNull: ["$paidAt", "$createdAt"] },
                    },
                },
                {
                    $group: {
                        _id: {
                            $dateToString: {
                                format:
                                    period === "12months"
                                        ? "%Y-%m"
                                        : "%Y-%m-%d",
                                date: "$date",
                                timezone: "UTC",
                            },
                        },
                        revenue: { $sum: "$amount" },
                        uniqueOrders: { $addToSet: "$orderId" },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        date: "$_id",
                        revenue: 1,
                        orders: { $size: "$uniqueOrders" },
                    },
                },
                { $sort: { date: 1 } },
            ]).toArray(),

            orders.aggregate([
                {
                    $group: {
                        _id: { $ifNull: ["$status", "unknown"] },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
            ]).toArray(),

            orders.aggregate([
                { $sort: { createdAt: -1 } },
                { $limit: 6 },
                {
                    $lookup: {
                        from: COLLECTIONS.users,
                        localField: "userId",
                        foreignField: "_id",
                        as: "customer",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        orderNumber: 1,
                        status: 1,
                        paymentStatus: 1,
                        totalAmount: 1,
                        total: 1,
                        grandTotal: 1,
                        createdAt: 1,
                        customerName: {
                            $ifNull: [
                                { $arrayElemAt: ["$customer.name", 0] },
                                "Guest Customer",
                            ],
                        },
                    },
                },
            ]).toArray(),

            orders.aggregate([
                {
                    $match: {
                        status: {
                            $nin: ["cancelled", "canceled"],
                        },
                    },
                },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.productId",
                        sold: {
                            $sum: {
                                $ifNull: ["$items.quantity", 1],
                            },
                        },
                    },
                },
                { $sort: { sold: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: COLLECTIONS.products,
                        localField: "_id",
                        foreignField: "_id",
                        as: "product",
                    },
                },
                {
                    $project: {
                        _id: 1,
                        sold: 1,
                        name: {
                            $ifNull: [
                                { $arrayElemAt: ["$product.name", 0] },
                                "Unknown Product",
                            ],
                        },
                    },
                },
            ]).toArray(),
        ]);

        const revenue = number(paymentStats[0]?.totalRevenue);
        const paidOrders = number(paymentStats[0]?.paidOrders);

        // Assumes Payment.amount is stored in INR.
        // If you store paise, divide revenue and chart values by 100.
        const chart = buildSalesChart(salesData, period);

        return NextResponse.json(
            {
                success: true,
                period,
                stats: {
                    totalProducts,
                    totalOrders,
                    totalInquiries,
                    publishedBlogs,
                    totalCustomers,
                    pendingReviews,
                    activeCarts,
                    totalRevenue: revenue,
                    paidOrders,
                    averageOrderValue:
                        paidOrders > 0 ? revenue / paidOrders : 0,
                },
                salesChart: chart,
                orderStatuses: orderStatuses.map((item) => ({
                    name: item._id,
                    value: item.count,
                })),
                recentOrders: recentOrders.map((order) => ({
                    id: order._id.toString(),
                    orderNumber:
                        order.orderNumber || order._id.toString(),
                    customer: order.customerName,
                    amount: number(
                        order.totalAmount ??
                        order.grandTotal ??
                        order.total
                    ),
                    status: order.status || "pending",
                    paymentStatus:
                        order.paymentStatus || "pending",
                    createdAt: order.createdAt,
                })),
                topProducts: topProducts.map((product) => ({
                    id: product._id?.toString() || "",
                    name: product.name,
                    sold: product.sold,
                })),
            },
            {
                headers: {
                    "Cache-Control": "no-store",
                },
            }
        );
    } catch (error) {
        console.error("Dashboard API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to load dashboard data",
            },
            { status: 500 }
        );
    }
}
