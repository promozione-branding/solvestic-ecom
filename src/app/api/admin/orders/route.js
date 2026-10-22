
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";
import { requireAdmin } from "@/lib/require-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
];

const PAYMENT_STATUSES = [
    "pending",
    "paid",
    "failed",
    "refunded",
    "partially_refunded",
];

const PAYMENT_METHODS = [
    "razorpay",
    "cod",
];

function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function escapeRegex(value) {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}

function getPositiveInteger(value, fallback, max) {
    const parsed = Number(value);

    if (
        !Number.isSafeInteger(parsed) ||
        parsed < 1
    ) {
        return fallback;
    }

    return Math.min(parsed, max);
}

function getPlacedOrderFilter() {
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

function formatOrder(order) {
    const shipment = order.shipment || {};

    return {
        _id: String(order._id),
        orderId: String(order._id),

        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,

        customer: {
            userId: String(order.userId),
            name:
                order.shippingAddress?.fullName ||
                "",
            email: order.customerEmail || "",
            mobile:
                order.shippingAddress?.mobile ||
                "",
        },

        items: (order.items || []).map(
            (item) => ({
                productId: String(
                    item.productId
                ),
                name: item.name,
                image: item.image || "",
                variant: item.variant || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                lineTotal: item.lineTotal,
            })
        ),

        itemCount: (order.items || []).reduce(
            (sum, item) =>
                sum + Number(item.quantity || 0),
            0
        ),

        shippingAddress:
            order.shippingAddress,

        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discount: order.discount,
        couponCode: order.couponCode,
        couponDiscount: order.couponDiscount,
        totalAmount: order.totalAmount,
        currency: order.currency || "INR",

        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,

        confirmedAt:
            order.confirmedAt || null,
        paidAt: order.paidAt || null,
        codCollectedAt:
            order.codCollectedAt || null,
        cancelledAt:
            order.cancelledAt || null,

        codCollectionPending:
            order.paymentMethod === "cod" &&
            order.paymentStatus === "pending" &&
            !["cancelled", "returned"].includes(
                order.orderStatus
            ),

        shipment: {
            status:
                shipment.status ||
                "not_created",
            shiprocketOrderId:
                shipment.shiprocketOrderId ||
                "",
            shipmentId:
                shipment.shipmentId || "",
            awbCode:
                shipment.awbCode || "",
            courierName:
                shipment.courierName || "",
            trackingUrl:
                shipment.trackingUrl || "",
            currentStatusText:
                shipment.currentStatusText ||
                "",
            estimatedDeliveryDate:
                shipment.estimatedDeliveryDate ||
                null,
        },
    };
}

export async function GET(request) {
    try {
        // 1. Authenticate admin
        const authError = requireAdmin(request);

        if (authError) {
            return authError;
        }

        await connectDB();

        // 2. Read query parameters
        const { searchParams } =
            new URL(request.url);

        const page = getPositiveInteger(
            searchParams.get("page"),
            1,
            100000
        );

        const limit = getPositiveInteger(
            searchParams.get("limit"),
            20,
            100
        );

        const search = String(
            searchParams.get("search") || ""
        )
            .trim()
            .slice(0, 100);

        const orderStatus = String(
            searchParams.get("status") || "all"
        ).toLowerCase();

        const paymentMethod = String(
            searchParams.get("paymentMethod") ||
            "all"
        ).toLowerCase();

        const paymentStatus = String(
            searchParams.get("paymentStatus") ||
            "all"
        ).toLowerCase();

        if (
            orderStatus !== "all" &&
            !ORDER_STATUSES.includes(orderStatus)
        ) {
            return errorResponse(
                "Invalid order status filter."
            );
        }

        if (
            paymentMethod !== "all" &&
            !PAYMENT_METHODS.includes(paymentMethod)
        ) {
            return errorResponse(
                "Invalid payment method filter."
            );
        }

        if (
            paymentStatus !== "all" &&
            !PAYMENT_STATUSES.includes(paymentStatus)
        ) {
            return errorResponse(
                "Invalid payment status filter."
            );
        }

        // 3. Build filters
        const placedFilter =
            getPlacedOrderFilter();

        const conditions = [
            placedFilter,
        ];

        if (orderStatus !== "all") {
            conditions.push({
                orderStatus,
            });
        }

        if (paymentMethod !== "all") {
            conditions.push({
                paymentMethod,
            });
        }

        if (paymentStatus !== "all") {
            conditions.push({
                paymentStatus,
            });
        }

        if (search) {
            const regex = new RegExp(
                escapeRegex(search),
                "i"
            );

            const searchConditions = [
                { orderNumber: regex },
                { customerEmail: regex },
                {
                    "shippingAddress.fullName":
                        regex,
                },
                {
                    "shippingAddress.mobile":
                        regex,
                },
            ];

            if (
                mongoose.isValidObjectId(search)
            ) {
                searchConditions.push({
                    _id:
                        new mongoose.Types.ObjectId(
                            search
                        ),
                });
            }

            conditions.push({
                $or: searchConditions,
            });
        }

        const filter = {
            $and: conditions,
        };

        const skip = (page - 1) * limit;

        // 4. Fetch paginated orders
        const [
            orders,
            filteredCount,
            summary,
        ] = await Promise.all([
            Order.find(filter)
                .sort({
                    createdAt: -1,
                    _id: -1,
                })
                .skip(skip)
                .limit(limit)
                .lean(),

            Order.countDocuments(filter),

            // Dashboard summary is global,
            // not limited to current filters.
            Order.aggregate([
                {
                    $match:
                        getPlacedOrderFilter(),
                },
                {
                    $group: {
                        _id: null,

                        totalOrders: {
                            $sum: 1,
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

                        cancelledOrders: {
                            $sum: {
                                $cond: [
                                    {
                                        $eq: [
                                            "$orderStatus",
                                            "cancelled",
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),
        ]);

        const stats = summary[0] || {};

        const totalPages = Math.ceil(
            filteredCount / limit
        );

        return NextResponse.json({
            success: true,
            message:
                "Admin orders fetched successfully.",

            orders: orders.map(formatOrder),

            pagination: {
                page,
                limit,
                total: filteredCount,
                totalPages,
                hasNextPage:
                    page < totalPages,
                hasPreviousPage:
                    page > 1,
            },

            summary: {
                totalOrders:
                    stats.totalOrders || 0,

                codOrders:
                    stats.codOrders || 0,

                prepaidOrders:
                    stats.prepaidOrders || 0,

                pendingCODAmount:
                    stats.pendingCODAmount || 0,

                collectedRevenue:
                    stats.collectedRevenue || 0,

                cancelledOrders:
                    stats.cancelledOrders || 0,
            },
        });
    } catch (error) {
        console.error(
            "GET admin orders error:",
            error
        );

        return errorResponse(
            "Unable to fetch admin orders.",
            500
        );
    }
}
