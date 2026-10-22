
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function jsonError(message, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status }
    );
}

export async function GET(request) {
    try {
        // 1. Authenticate customer
        const cookieStore = await cookies();

        const token = cookieStore.get(
            "solvestic_user_token"
        )?.value;

        if (!token) {
            return jsonError(
                "Please log in to view your orders.",
                401
            );
        }

        if (!process.env.JWT_USER_SECRET) {
            throw new Error(
                "JWT_USER_SECRET is not configured."
            );
        }

        let decoded;

        try {
            decoded = jwt.verify(
                token,
                process.env.JWT_USER_SECRET
            );
        } catch {
            return jsonError(
                "Your session has expired. Please log in again.",
                401
            );
        }

        if (
            decoded.type !== "customer" ||
            !mongoose.isValidObjectId(decoded.userId)
        ) {
            return jsonError(
                "Invalid customer session.",
                401
            );
        }

        // 2. Read pagination and filter parameters
        const { searchParams } = new URL(request.url);

        const rawPage = Number(
            searchParams.get("page") || 1
        );

        const rawLimit = Number(
            searchParams.get("limit") || 10
        );

        const page =
            Number.isSafeInteger(rawPage) && rawPage > 0
                ? Math.min(rawPage, 100000)
                : 1;

        const limit =
            Number.isSafeInteger(rawLimit) && rawLimit > 0
                ? Math.min(rawLimit, 50)
                : 10;

        const skip = (page - 1) * limit;

        const requestedStatus = String(
            searchParams.get("status") || "all"
        ).toLowerCase();

        const allowedStatuses = [
            "all",
            "confirmed",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
            "returned",
        ];

        if (!allowedStatuses.includes(requestedStatus)) {
            return jsonError(
                "Invalid order status filter."
            );
        }

        await connectDB();

        // 3. Show paid Razorpay and placed COD orders
        const visibleOrders = {
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

        const filter = {
            userId: new mongoose.Types.ObjectId(
                decoded.userId
            ),
            ...visibleOrders,
        };

        if (requestedStatus !== "all") {
            filter.orderStatus = requestedStatus;
        }

        // 4. Query orders and pagination
        const [orders, totalOrders] =
            await Promise.all([
                Order.find(filter)
                    .sort({
                        createdAt: -1,
                        _id: -1,
                    })
                    .skip(skip)
                    .limit(limit)
                    .lean(),

                Order.countDocuments(filter),
            ]);

        // 5. Normalize response for frontend
        const formattedOrders = orders.map((order) => {
            const shipment = order.shipment || {};

            return {
                _id: String(order._id),
                orderId: String(order._id),
                orderNumber: order.orderNumber,

                createdAt: order.createdAt,
                updatedAt: order.updatedAt,

                confirmedAt:
                    order.confirmedAt || null,

                paidAt: order.paidAt || null,

                cancelledAt:
                    order.cancelledAt || null,

                paymentMethod:
                    order.paymentMethod,

                paymentStatus:
                    order.paymentStatus,

                orderStatus:
                    order.orderStatus,

                currency:
                    order.currency || "INR",

                subtotal:
                    Number(order.subtotal) || 0,

                shippingFee:
                    Number(order.shippingFee) || 0,

                discount:
                    Number(order.discount) || 0,

                couponCode:
                    order.couponCode || null,

                couponDiscount:
                    Number(order.couponDiscount) || 0,

                totalAmount:
                    Number(order.totalAmount) || 0,

                items: (order.items || []).map(
                    (item) => ({
                        productId: String(
                            item.productId
                        ),
                        name: item.name,
                        slug: item.slug || "",
                        image: item.image || "",
                        variant: item.variant || "",
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        lineTotal: item.lineTotal,
                    })
                ),

                shippingAddress:
                    order.shippingAddress,

                shipment: {
                    status:
                        shipment.status ||
                        "not_created",

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

                    lastSyncedAt:
                        shipment.lastSyncedAt || null,
                },

                canTrack: Boolean(
                    shipment.awbCode
                ),

                isCOD:
                    order.paymentMethod === "cod",

                paymentPending:
                    order.paymentStatus === "pending",

                isCancelled:
                    order.orderStatus === "cancelled",
            };
        });

        const totalPages = Math.ceil(
            totalOrders / limit
        );

        return NextResponse.json({
            success: true,
            message:
                "Orders fetched successfully.",

            orders: formattedOrders,

            pagination: {
                page,
                limit,
                total: totalOrders,
                totalPages,
                hasNextPage:
                    page < totalPages,
                hasPreviousPage:
                    page > 1,
            },
        });
    } catch (error) {
        console.error(
            "GET customer orders error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message:
                    "Unable to fetch orders. Please try again.",
            },
            { status: 500 }
        );
    }
}
