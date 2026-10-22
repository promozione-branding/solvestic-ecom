
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";

import { syncShiprocketShipment } from "@/lib/sync-shiprocket-shipment";

import {
    getShiprocketToken,
    shiprocketRequest,
} from "@/lib/shiprocket";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function normalizeStatus(value) {
    const status = String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

    if (!status) return null;

    if (status.includes("out for delivery")) {
        return "out_for_delivery";
    }

    if (
        status.includes("rto") ||
        status.includes("return to origin") ||
        status.includes("return to sender")
    ) {
        return "rto";
    }

    if (status.includes("lost")) {
        return "lost";
    }

    if (status.includes("cancel")) {
        return "cancelled";
    }

    if (status.includes("delivered")) {
        return "delivered";
    }

    if (
        status.includes("in transit") ||
        status.includes("intransit") ||
        status.includes("reached at") ||
        status.includes("arrived at") ||
        status.includes("departed")
    ) {
        return "in_transit";
    }

    if (
        status.includes("picked up") ||
        status.includes("pickup done") ||
        status.includes("pickup completed")
    ) {
        return "picked_up";
    }

    if (
        status.includes("pickup scheduled") ||
        status.includes("pickup generated") ||
        status.includes("pickup assigned")
    ) {
        return "pickup_scheduled";
    }

    if (
        status.includes("awb assigned") ||
        status.includes("manifest")
    ) {
        return "created";
    }

    if (
        status.includes("undelivered") ||
        status.includes("failed") ||
        status.includes("delivery attempted")
    ) {
        return "failed";
    }

    return "pending";
}

function parseDate(value) {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? null
        : date;
}

function normalizeTrackingEvent(event) {
    return {
        status: String(
            event.status ||
            event.activity ||
            ""
        ),

        activity: String(
            event.activity ||
            event.status ||
            event.description ||
            ""
        ),

        location: String(
            event.location ||
            event.current_location ||
            ""
        ),

        description: String(
            event.description ||
            event.activity ||
            ""
        ),

        eventTime: parseDate(
            event.date ||
            event.event_time ||
            event.timestamp
        ),

        source: "shiprocket",
    };
}

function getTrackingData(response) {
    const tracking =
        response?.tracking_data ||
        response?.data?.tracking_data ||
        response?.data ||
        response ||
        {};

    const shipmentTrack = Array.isArray(
        tracking.shipment_track
    )
        ? tracking.shipment_track[0] || {}
        : tracking.shipment_track || {};

    const activities = Array.isArray(
        tracking.shipment_track_activities
    )
        ? tracking.shipment_track_activities
        : [];

    const rawStatus =
        shipmentTrack.current_status ||
        tracking.current_status ||
        tracking.status ||
        "";

    return {
        status: rawStatus
            ? normalizeStatus(rawStatus)
            : null,

        currentStatusText: String(rawStatus),

        courierName: String(
            shipmentTrack.courier_name ||
            tracking.courier_name ||
            ""
        ),

        awbCode: String(
            shipmentTrack.awb_code ||
            shipmentTrack.awb ||
            tracking.awb_code ||
            tracking.awb ||
            ""
        ),

        trackingUrl: String(
            tracking.track_url ||
            tracking.tracking_url ||
            ""
        ),

        estimatedDeliveryDate: parseDate(
            shipmentTrack.edd ||
            tracking.edd ||
            tracking.estimated_delivery_date
        ),

        trackingEvents: activities
            .map(normalizeTrackingEvent)
            .sort((a, b) => {
                const aTime =
                    a.eventTime?.getTime() || 0;

                const bTime =
                    b.eventTime?.getTime() || 0;

                return bTime - aTime;
            }),
    };
}

function getVisibleTracking(order) {
    const shipment = order.shipment || {};

    const awbCode = String(
        shipment.awbCode || ""
    );

    return {
        order: {
            _id: String(order._id),
            orderNumber: order.orderNumber,
            orderStatus: order.orderStatus,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,

            shippingAddress: {
                fullName:
                    order.shippingAddress?.fullName || "",
            },
        },

        shipment: {
            shipmentId:
                shipment.shipmentId || "",

            shiprocketOrderId:
                shipment.shiprocketOrderId || "",

            awbCode,

            courierName:
                shipment.courierName || "",

            trackingUrl:
                shipment.trackingUrl || "",

            status:
                shipment.status || "not_created",

            currentStatusText:
                shipment.currentStatusText ||
                "Preparing your order",

            estimatedDeliveryDate:
                shipment.estimatedDeliveryDate || null,

            lastSyncedAt:
                shipment.lastSyncedAt || null,

            events: Array.isArray(
                shipment.trackingEvents
            )
                ? shipment.trackingEvents
                : [],
        },

        trackingAvailable: Boolean(awbCode),
    };
}

export async function GET(request, context) {
    try {
        // 1. Authenticate customer
        const cookieStore = await cookies();

        const token = cookieStore.get(
            "solvestic_user_token"
        )?.value;

        if (!token) {
            return errorResponse(
                "Please log in to track your order.",
                401
            );
        }

        if (!process.env.JWT_USER_SECRET) {
            throw new Error(
                "JWT_USER_SECRET is missing."
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
                "Unauthorized.",
                401
            );
        }

        // 2. Validate order ID
        const { orderId } =
            await context.params;

        if (
            !mongoose.isValidObjectId(orderId)
        ) {
            return errorResponse(
                "Invalid order ID."
            );
        }

        await connectDB();

        // 3. Find customer's order
        let order = await Order.findOne({
            _id: orderId,
            userId: decoded.userId,
        });

        if (!order) {
            return errorResponse(
                "Order not found.",
                404
            );
        }

        // 4. Check whether customer clicked Refresh
        const { searchParams } =
            new URL(request.url);

        const forceRefresh =
            searchParams.get("refresh") === "true";

        // Normal page load: MongoDB only
        if (!forceRefresh) {
            return NextResponse.json({
                success: true,
                cached: true,
                message:
                    "Showing saved tracking details.",
                ...getVisibleTracking(order),
            });
        }

        // 5. Do not sync cancelled/returned orders
        if (
            ["cancelled", "returned"].includes(
                order.orderStatus
            )
        ) {
            return NextResponse.json({
                success: true,
                cached: true,
                message:
                    "Tracking refresh is unavailable for this order.",
                ...getVisibleTracking(order),
            });
        }

        // 6. Check Shiprocket shipment ID / AWB
        const shipmentId =
            order.shipment?.shipmentId;

        const existingAwb =
            order.shipment?.awbCode;

        if (!shipmentId && !existingAwb) {
            return NextResponse.json({
                success: true,
                cached: true,
                message:
                    "Shiprocket shipment has not been created yet.",
                ...getVisibleTracking(order),
            });
        }

        let syncFailed = false;

        // 7. Sync AWB and courier from Shiprocket
        // Only when AWB is missing
        if (
            shipmentId &&
            !existingAwb
        ) {
            try {
                await syncShiprocketShipment(order);

                // Re-fetch order because the helper
                // may update MongoDB directly.
                const syncedOrder =
                    await Order.findOne({
                        _id: orderId,
                        userId: decoded.userId,
                    });

                if (syncedOrder) {
                    order = syncedOrder;
                }
            } catch (syncError) {
                syncFailed = true;

                console.error(
                    "Shiprocket AWB sync failed:",
                    syncError
                );
            }
        }

        // 8. If AWB is still unavailable,
        // return the latest saved shipment details.
        if (!order.shipment?.awbCode) {
            return NextResponse.json({
                success: true,
                cached: true,
                syncFailed,
                message: syncFailed
                    ? "Unable to check AWB right now. Showing saved details."
                    : "AWB has not been assigned yet.",
                ...getVisibleTracking(order),
            });
        }

        // 9. Fetch live tracking using AWB
        let trackingResponse;

        try {
            const shiprocketToken =
                await getShiprocketToken();

            trackingResponse =
                await shiprocketRequest(
                    `/courier/track/awb/${encodeURIComponent(
                        order.shipment.awbCode
                    )}`,
                    shiprocketToken,
                    {
                        method: "GET",
                    }
                );
        } catch (trackingError) {
            console.error(
                "Shiprocket tracking fetch error:",
                trackingError
            );

            return NextResponse.json({
                success: true,
                cached: true,
                syncFailed: true,
                message:
                    "Live tracking is temporarily unavailable. Showing the last saved update.",
                ...getVisibleTracking(order),
            });
        }

        // 10. Normalize tracking response
        const normalized =
            getTrackingData(trackingResponse);

        // 11. Prepare MongoDB updates
        const updates = {
            "shipment.lastSyncedAt":
                new Date(),

            "shipment.lastError": "",
        };

        if (normalized.awbCode) {
            updates[
                "shipment.awbCode"
            ] = normalized.awbCode;
        }

        if (normalized.courierName) {
            updates[
                "shipment.courierName"
            ] = normalized.courierName;
        }

        if (normalized.trackingUrl) {
            updates[
                "shipment.trackingUrl"
            ] = normalized.trackingUrl;
        }

        if (normalized.status) {
            updates[
                "shipment.status"
            ] = normalized.status;

            updates[
                "shipment.currentStatusText"
            ] = normalized.currentStatusText;
        }

        if (
            normalized.estimatedDeliveryDate
        ) {
            updates[
                "shipment.estimatedDeliveryDate"
            ] =
                normalized.estimatedDeliveryDate;
        }

        if (
            normalized.trackingEvents.length > 0
        ) {
            updates[
                "shipment.trackingEvents"
            ] =
                normalized.trackingEvents;
        }

        // 12. Update order fulfillment status
        if (
            normalized.status === "delivered"
        ) {
            updates.orderStatus =
                "delivered";
        } else if (
            [
                "picked_up",
                "in_transit",
                "out_for_delivery",
            ].includes(normalized.status) &&
            [
                "confirmed",
                "processing",
                "shipped",
            ].includes(order.orderStatus)
        ) {
            updates.orderStatus =
                "shipped";
        }

        // Never update paymentStatus here.
        // COD collection is handled separately.

        // 13. Save latest tracking in MongoDB
        const updatedOrder =
            await Order.findOneAndUpdate(
                {
                    _id: order._id,
                    userId: decoded.userId,

                    "shipment.awbCode":
                        order.shipment.awbCode,

                    orderStatus: {
                        $nin: [
                            "cancelled",
                            "returned",
                        ],
                    },
                },
                {
                    $set: updates,
                },
                {
                    new: true,
                }
            );

        // 14. Handle concurrent changes
        if (!updatedOrder) {
            const latestOrder =
                await Order.findOne({
                    _id: order._id,
                    userId: decoded.userId,
                });

            if (!latestOrder) {
                return errorResponse(
                    "Order not found.",
                    404
                );
            }

            return NextResponse.json({
                success: true,
                cached: true,
                message:
                    "Showing the latest saved tracking details.",
                ...getVisibleTracking(latestOrder),
            });
        }

        // 15. Return refreshed tracking
        return NextResponse.json({
            success: true,
            cached: false,
            syncFailed: false,
            message:
                "Tracking refreshed successfully.",
            ...getVisibleTracking(updatedOrder),
        });
    } catch (error) {
        console.error(
            "GET order tracking error:",
            error
        );

        return errorResponse(
            "Unable to fetch order tracking details.",
            500
        );
    }
}
