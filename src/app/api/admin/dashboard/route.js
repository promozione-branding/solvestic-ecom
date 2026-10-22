
import { NextResponse } from "next/server";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import Product from "@/models/product.model";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message, status = 500) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status }
    );
}

function placedOrdersFilter() {
    return {
        $or: [
            {
                paymentMethod: "razorpay",
                paymentStatus: {
                    $in: [
                        "paid",
                        "refunded",
                        "partially_refunded",
                    ],
                },
            },
            {
                paymentMethod: "cod",
                orderStatus: {
                    $in: [
                        "confirmed",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                        "returned",
                    ],
                },
            },
        ],
    };
}

function getDateRange(period) {
    const now = new Date();

    if (period === "all") {
        return null;
    }

    const days = {
        today: 1,
        "7days": 7,
        "30days": 30,
        "90days": 90,
    };

    const start = new Date(now);

    if (period === "today") {
        start.setHours(0, 0, 0, 0);
    } else {
        start.setDate(
            start.getDate() -
            (days[period] || 30) +
            1
        );
        start.setHours(0, 0, 0, 0);
    }

    return {
        $gte: start,
        $lte: now,
    };
}

function getOrderFilter(period) {
    const dateRange = getDateRange(period);

    const filter = placedOrdersFilter();

    if (dateRange) {
        filter.createdAt = dateRange;
    }

    return filter;
}

function formatRecentOrder(order) {
    return {
        _id: String(order._id),
        orderId: String(order._id),
        orderNumber: order.orderNumber,

        customerName:
            order.shippingAddress?.fullName ||
            "Customer",

        customerEmail:
            order.customerEmail || "",

        customerMobile:
            order.shippingAddress?.mobile ||
            "",

        totalAmount:
            Number(order.totalAmount) || 0,

        paymentMethod:
            order.paymentMethod,

        paymentStatus:
            order.paymentStatus,

        orderStatus:
            order.orderStatus,

        itemCount: (order.items || []).reduce(
            (total, item) =>
                total +
                Number(item.quantity || 0),
            0
        ),

        shipmentStatus:
            order.shipment?.status ||
            "not_created",

        awbCode:
            order.shipment?.awbCode || "",

        createdAt:
            order.createdAt,
    };
}

export async function GET(request) {
    try {
        // 1. Admin authentication
        const authError = requireAdmin(request);

        if (authError) {
            return authError;
        }

        await connectDB();

        // 2. Date range filter
        const { searchParams } =
            new URL(request.url);

        const period =
            searchParams.get("period") ||
            "30days";

        const allowedPeriods = [
            "today",
            "7days",
            "30days",
            "90days",
            "all",
        ];

        if (!allowedPeriods.includes(period)) {
            return errorResponse(
                "Invalid dashboard period.",
                400
            );
        }

        const orderFilter =
            getOrderFilter(period);

        const dateRange =
            getDateRange(period);

        const userFilter = dateRange
            ? { createdAt: dateRange }
            : {};

        // 3. Fetch all dashboard data
        const [
            orderSummary,
            statusSummary,
            paymentSummary,
            shipmentSummary,
            recentOrders,
            totalCustomers,
            newCustomers,
            totalProducts,
        ] = await Promise.all([
            // Order and revenue totals
            Order.aggregate([
                {
                    $match: orderFilter,
                },
                {
                    $group: {
                        _id: null,

                        totalOrders: {
                            $sum: 1,
                        },

                        totalOrderValue: {
                            $sum: "$totalAmount",
                        },

                        codOrders: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$paymentMethod",
                                            "cod",
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },

                        prepaidOrders: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$paymentMethod",
                                            "razorpay",
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },

                        pendingCODAmount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$paymentMethod",
                                                    "cod",
                                                ],
                                            },
                                            {
                                                $eq: [
                                                    "$paymentStatus",
                                                    "pending",
                                                ],
                                            },
                                            {
                                                $not: [
                                                    {
                                                        $in: [
                                                            "$orderStatus",
                                                            [
                                                                "cancelled",
                                                                "returned",
                                                            ],
                                                        ],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                    "$totalAmount",
                                    0,
                                ],
                            },
                        },

                        collectedRevenue: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$paymentStatus",
                                            "paid",
                                        ],
                                    },
                                    "$totalAmount",
                                    0,
                                ],
                            },
                        },

                        prepaidRevenue: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$paymentMethod",
                                                    "razorpay",
                                                ],
                                            },
                                            {
                                                $eq: [
                                                    "$paymentStatus",
                                                    "paid",
                                                ],
                                            },
                                        ],
                                    },
                                    "$totalAmount",
                                    0,
                                ],
                            },
                        },

                        codCollectedAmount: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$paymentMethod",
                                                    "cod",
                                                ],
                                            },
                                            {
                                                $eq: [
                                                    "$paymentStatus",
                                                    "paid",
                                                ],
                                            },
                                        ],
                                    },
                                    "$totalAmount",
                                    0,
                                ],
                            },
                        },

                        averageOrderValue: {
                            $avg: "$totalAmount",
                        },
                    },
                },
            ]),

            // Order status breakdown
            Order.aggregate([
                {
                    $match: orderFilter,
                },
                {
                    $group: {
                        _id: "$orderStatus",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]),

            // Payment status breakdown
            Order.aggregate([
                {
                    $match: orderFilter,
                },
                {
                    $group: {
                        _id: "$paymentStatus",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]),

            // Shiprocket shipment breakdown
            Order.aggregate([
                {
                    $match: orderFilter,
                },
                {
                    $group: {
                        _id: {
                            $ifNull: [
                                "$shipment.status",
                                "not_created",
                            ],
                        },
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]),

            // Recent orders
            Order.find(orderFilter)
                .sort({
                    createdAt: -1,
                    _id: -1,
                })
                .limit(10)
                .lean(),

            // Total customers
            User.countDocuments({}),

            // Customers created during period
            User.countDocuments(userFilter),

            // Total products
            Product.countDocuments({}),
        ]);

        const summary =
            orderSummary[0] || {};

        const orderStatusCounts = {
            pending: 0,
            confirmed: 0,
            processing: 0,
            shipped: 0,
            delivered: 0,
            cancelled: 0,
            returned: 0,
        };

        statusSummary.forEach((item) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    orderStatusCounts,
                    item._id
                )
            ) {
                orderStatusCounts[item._id] =
                    item.count;
            }
        });

        const paymentStatusCounts = {
            pending: 0,
            paid: 0,
            failed: 0,
            refunded: 0,
            partially_refunded: 0,
        };

        paymentSummary.forEach((item) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    paymentStatusCounts,
                    item._id
                )
            ) {
                paymentStatusCounts[item._id] =
                    item.count;
            }
        });

        const shipmentStatusCounts = {
            not_created: 0,
            pending: 0,
            created: 0,
            pickup_scheduled: 0,
            picked_up: 0,
            in_transit: 0,
            out_for_delivery: 0,
            delivered: 0,
            cancelled: 0,
            rto: 0,
            lost: 0,
            failed: 0,
        };

        shipmentSummary.forEach((item) => {
            if (
                Object.prototype.hasOwnProperty.call(
                    shipmentStatusCounts,
                    item._id
                )
            ) {
                shipmentStatusCounts[item._id] =
                    item.count;
            }
        });

        const totalOrders =
            summary.totalOrders || 0;

        const pendingOrders =
            orderStatusCounts.pending +
            orderStatusCounts.confirmed +
            orderStatusCounts.processing;

        const activeShipments =
            shipmentStatusCounts.created +
            shipmentStatusCounts.pickup_scheduled +
            shipmentStatusCounts.picked_up +
            shipmentStatusCounts.in_transit +
            shipmentStatusCounts.out_for_delivery;

        // 4. Return dashboard data
        return NextResponse.json({
            success: true,

            period,

            stats: {
                totalOrders,

                totalOrderValue:
                    summary.totalOrderValue || 0,

                codOrders:
                    summary.codOrders || 0,

                prepaidOrders:
                    summary.prepaidOrders || 0,

                pendingCODAmount:
                    summary.pendingCODAmount || 0,

                collectedRevenue:
                    summary.collectedRevenue || 0,

                prepaidRevenue:
                    summary.prepaidRevenue || 0,

                codCollectedAmount:
                    summary.codCollectedAmount || 0,

                averageOrderValue:
                    Math.round(
                        (summary.averageOrderValue ||
                            0) * 100
                    ) / 100,

                pendingOrders,

                deliveredOrders:
                    orderStatusCounts.delivered,

                cancelledOrders:
                    orderStatusCounts.cancelled,

                activeShipments,

                totalCustomers,
                newCustomers,
                totalProducts,

                // Compatibility with older UI
                paidRevenue:
                    summary.collectedRevenue || 0,
            },

            orderStatuses:
                orderStatusCounts,

            paymentStatuses:
                paymentStatusCounts,

            shipmentStatuses:
                shipmentStatusCounts,

            recentOrders:
                recentOrders.map(
                    formatRecentOrder
                ),
        });
    } catch (error) {
        console.error(
            "GET admin dashboard error:",
            error
        );

        return errorResponse(
            "Unable to fetch dashboard statistics."
        );
    }
}
