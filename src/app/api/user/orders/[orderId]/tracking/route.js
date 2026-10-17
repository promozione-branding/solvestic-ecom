
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";

const SHIPROCKET_BASE = "https://apiv2.shiprocket.in/v1/external";
async function getShiprocketToken() {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
        throw new Error("Shiprocket API credentials are missing.");
    }

    const response = await fetch(
        `${SHIPROCKET_BASE}/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            cache: "no-store",
        }
    );

    const data = await response.json();

    if (!response.ok || !data.token) {
        throw new Error("Shiprocket authentication failed.");
    }

    return data.token;
}

function normalizeStatus(value = "") {
    const status = String(value).toLowerCase();

    if (status.includes("deliver")) {
        return "delivered";
    }

    if (
        status.includes("out for delivery") ||
        status.includes("out-for-delivery")
    ) {
        return "out_for_delivery";
    }

    if (
        status.includes("picked up") ||
        status.includes("pickup complete")
    ) {
        return "picked_up";
    }

    if (
        status.includes("transit") ||
        status.includes("dispatched") ||
        status.includes("shipped")
    ) {
        return "in_transit";
    }

    if (
        status.includes("rto") ||
        status.includes("return to origin")
    ) {
        return "rto";
    }

    if (
        status.includes("cancel")
    ) {
        return "cancelled";
    }

    return "created";
}

export async function GET(request, { params }) {
    try {
        const { orderId } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get(
            "solvestic_user_token"
        )?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Please log in to track your order." },
                { status: 401 }
            );
        }

        let session;

        try {
            session = jwt.verify(
                token,
                process.env.JWT_USER_SECRET
            );
        } catch {
            return NextResponse.json(
                { message: "Your session has expired." },
                { status: 401 }
            );
        }

        if (
            session.type !== "customer" ||
            !session.userId
        ) {
            return NextResponse.json(
                { message: "Unauthorized." },
                { status: 401 }
            );
        }

        if (!mongoose.isValidObjectId(orderId)) {
            return NextResponse.json(
                { message: "Invalid order ID." },
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
                { message: "Order not found." },
                { status: 404 }
            );
        }

        const shipment = order.shipment;

        if (!shipment?.awbCode) {
            return NextResponse.json({
                success: true,
                trackingAvailable: false,
                order: {
                    id: String(order._id),
                    orderNumber: order.orderNumber,
                    orderStatus: order.orderStatus,
                    paymentStatus: order.paymentStatus,
                },
                shipment: {
                    status: shipment?.status || "not_created",
                    currentStatusText:
                        shipment?.currentStatusText ||
                        "Shipment tracking will be available after dispatch.",
                    events: shipment?.trackingEvents || [],
                },
            });
        }

        const shiprocketToken =
            await getShiprocketToken();

        const trackingResponse = await fetch(
            `${SHIPROCKET_BASE}/courier/track/awb/${encodeURIComponent(
                shipment.awbCode
            )}`,
            {
                headers: {
                    Authorization: `Bearer ${shiprocketToken}`,
                    "Content-Type": "application/json",
                },
                cache: "no-store",
            }
        );

        const trackingData =
            await trackingResponse.json();

        if (!trackingResponse.ok) {
            throw new Error(
                trackingData.message ||
                "Unable to fetch shipment tracking."
            );
        }

        const tracking =
            trackingData.tracking_data || trackingData;

        const activities =
            tracking.shipment_track_activities || [];

        const shipmentInfo =
            tracking.shipment_track?.[0] || {};

        const statusText =
            shipmentInfo.current_status ||
            tracking.track_status ||
            trackingData.message ||
            shipment.currentStatusText ||
            "Tracking information received";

        const normalizedStatus =
            normalizeStatus(statusText);

        const events = activities.map((activity) => ({
            status:
                activity["sr-status-label"] ||
                activity.status ||
                statusText,
            activity:
                activity.activity ||
                activity["sr-status-label"] ||
                statusText,
            location: activity.location || "",
            description: activity.activity || "",
            eventTime: activity.date
                ? new Date(activity.date)
                : null,
            source: "shiprocket",
        })).filter((event) =>
            !event.eventTime ||
            !Number.isNaN(event.eventTime.getTime())
        );

        // Save the latest snapshot and deduplicated event history.
        const existingEvents =
            shipment.trackingEvents || [];

        const eventKey = (event) =>
            [
                event.activity,
                event.location,
                event.eventTime
                    ? new Date(event.eventTime).toISOString()
                    : "",
            ].join("|");

        const seen = new Set(
            existingEvents.map(eventKey)
        );

        for (const event of events) {
            const key = eventKey(event);

            if (!seen.has(key)) {
                existingEvents.push(event);
                seen.add(key);
            }
        }

        shipment.trackingEvents = existingEvents;

        shipment.currentStatusText = statusText;
        shipment.status = normalizedStatus;
        shipment.lastSyncedAt = new Date();
        shipment.lastError = "";

        if (shipmentInfo.courier_name) {
            shipment.courierName =
                shipmentInfo.courier_name;
        }

        if (shipmentInfo.awb_code) {
            shipment.awbCode =
                String(shipmentInfo.awb_code);
        }

        if (shipmentInfo.etd) {
            const estimatedDate =
                new Date(shipmentInfo.etd);

            if (!Number.isNaN(estimatedDate.getTime())) {
                shipment.estimatedDeliveryDate =
                    estimatedDate;
            }
        }

        // Do not downgrade delivered orders due to an
        // unexpected or older tracking response.
        if (
            normalizedStatus === "delivered" &&
            order.orderStatus !== "cancelled" &&
            order.orderStatus !== "returned"
        ) {
            order.orderStatus = "delivered";
        } else if (
            ["in_transit", "out_for_delivery"].includes(
                normalizedStatus
            ) &&
            !["delivered", "cancelled", "returned"].includes(
                order.orderStatus
            )
        ) {
            order.orderStatus = "shipped";
        }

        order.markModified("shipment");
        await order.save();

        return NextResponse.json({
            success: true,
            trackingAvailable: true,
            order: {
                id: String(order._id),
                orderNumber: order.orderNumber,
                orderStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                createdAt: order.createdAt,
            },
            shipment: {
                awbCode: shipment.awbCode,
                courierName: shipment.courierName,
                trackingUrl: shipment.trackingUrl,
                status: shipment.status,
                currentStatusText:
                    shipment.currentStatusText,
                estimatedDeliveryDate:
                    shipment.estimatedDeliveryDate,
                lastSyncedAt: shipment.lastSyncedAt,
                events: [...shipment.trackingEvents].sort(
                    (a, b) =>
                        new Date(b.eventTime || b.createdAt) -
                        new Date(a.eventTime || a.createdAt)
                ),
            },
        });
    } catch (error) {
        console.error(
            "Order tracking error:",
            error.message
        );

        return NextResponse.json(
            { message: "Unable to retrieve order tracking right now." },
            { status: 502 }
        );
    }
}