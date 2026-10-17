
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Order from "@/models/order.model";
import {
    getShiprocketToken,
    shiprocketRequest,
} from "@/lib/shiprocket";

export const runtime = "nodejs";

export async function POST(request, { params }) {
    let orderId;
    let lockTime;

    try {
        const cookieStore = await cookies();
        const authToken = cookieStore.get("solvestic_user_token")?.value;

        if (!authToken) {
            return NextResponse.json(
                { success: false, message: "Please log in." },
                { status: 401 }
            );
        }

        const decoded = jwt.verify(
            authToken,
            process.env.JWT_USER_SECRET
        );

        if (decoded.type !== "customer") {
            return NextResponse.json(
                { success: false, message: "Unauthorized." },
                { status: 401 }
            );
        }

        await connectDB();

        ({ orderId } = await params);

        if (!mongoose.isValidObjectId(orderId)) {
            return NextResponse.json(
                { success: false, message: "Invalid order ID." },
                { status: 400 }
            );
        }

        const order = await Order.findOne({
            _id: orderId,
            userId: decoded.userId,
        });

        console.log("SHIPROCKET ORDER CHECK:", {
            requestedOrderId: orderId,
            foundOrderId: order ? String(order._id) : null,
            paymentStatus: order?.paymentStatus,
            orderStatus: order?.orderStatus,
            database: Order.db.name,
        });

        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found." },
                { status: 404 }
            );
        }

        if (order.paymentStatus !== "paid") {
            return NextResponse.json(
                { success: false, message: "Order is not paid." },
                { status: 400 }
            );
        }

        if (order.orderStatus === "cancelled") {
            return NextResponse.json(
                { success: false, message: "Order is cancelled." },
                { status: 400 }
            );
        }

        if (order.shipment?.shiprocketOrderId) {
            return NextResponse.json({
                success: true,
                message: "Shiprocket order already exists.",
                shipment: order.shipment,
            });
        }

        const now = new Date();
        const staleBefore = new Date(now.getTime() - 10 * 60 * 1000);

        // Atomically claim the order. An old lock can be reclaimed,
        // but check for uncertain Shiprocket outcomes before retrying.
        const claimedOrder = await Order.findOneAndUpdate(
            {
                _id: order._id,
                paymentStatus: "paid",
                orderStatus: { $ne: "cancelled" },
                "shipment.shiprocketOrderId": { $in: ["", null] },
                $or: [
                    {
                        "shipment.shiprocketCreateStatus": {
                            $in: ["not_started", "failed", null],
                        },
                    },
                    {
                        "shipment.shiprocketCreateStatus": "processing",
                        "shipment.shiprocketCreateLockedAt": {
                            $lt: staleBefore,
                        },
                    },
                ],
            },
            {
                $set: {
                    "shipment.shiprocketCreateStatus": "processing",
                    "shipment.shiprocketCreateLockedAt": now,
                    "shipment.shiprocketCreateError": "",
                    "shipment.lastError": "",
                },
            },
            { new: true }
        );

        if (!claimedOrder) {
            const latest = await Order.findById(orderId).select("shipment");

            return NextResponse.json(
                {
                    success: false,
                    message: latest?.shipment?.shiprocketOrderId
                        ? "Shiprocket order already exists."
                        : "Shipment creation is already running or needs review.",
                    shipment: latest?.shipment,
                },
                { status: 409 }
            );
        }

        lockTime = now;

        const address = claimedOrder.shippingAddress;

        if (
            !address?.fullName ||
            !address?.mobile ||
            !address?.addressLine1 ||
            !address?.city ||
            !address?.state ||
            !address?.pincode
        ) {
            throw new Error("Shipping address is incomplete.");
        }

        const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION;

        if (!pickupLocation) {
            throw new Error("SHIPROCKET_PICKUP_LOCATION is missing.");
        }

        const shiprocketToken = await getShiprocketToken();

        const payload = {
            order_id: String(claimedOrder.orderNumber),
            order_date: new Date(claimedOrder.createdAt || Date.now())
                .toISOString()
                .slice(0, 19)
                .replace("T", " "),
            pickup_location: pickupLocation,
            billing_customer_name: address.fullName,
            billing_last_name: "",
            billing_address: address.addressLine1,
            billing_address_2: address.addressLine2 || "",
            billing_city: address.city,
            billing_state: address.state,
            billing_pincode: String(address.pincode),
            billing_country: address.country || "India",
            billing_email: claimedOrder.customerEmail,
            billing_phone: String(address.mobile),
            shipping_is_billing: true,
            order_items: claimedOrder.items.map((item) => ({
                name: item.name,
                sku: String(item.productId),
                units: item.quantity,
                selling_price: Number(item.unitPrice),
                discount: 0,
                tax: 0,
                hsn: "",
            })),
            payment_method: "Prepaid",
            sub_total: Number(claimedOrder.subtotal),
            length: Number(process.env.SHIPROCKET_PACKAGE_LENGTH || 10),
            breadth: Number(process.env.SHIPROCKET_PACKAGE_BREADTH || 10),
            height: Number(process.env.SHIPROCKET_PACKAGE_HEIGHT || 10),
            weight: Number(process.env.SHIPROCKET_PACKAGE_WEIGHT || 0.5),
        };

        const result = await shiprocketRequest(
            "/orders/create/adhoc",
            shiprocketToken,
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        );

        if (!result.order_id || !result.shipment_id) {
            throw new Error(
                "Shiprocket response did not contain the expected order and shipment IDs."
            );
        }

        // Only update the shipment still owned by this request.
        const savedOrder = await Order.findOneAndUpdate(
            {
                _id: claimedOrder._id,
                "shipment.shiprocketCreateStatus": "processing",
                "shipment.shiprocketCreateLockedAt": lockTime,
            },
            {
                $set: {
                    "shipment.shiprocketOrderId": String(result.order_id),
                    "shipment.shipmentId": String(result.shipment_id),
                    "shipment.status": "created",
                    "shipment.currentStatusText": "Order created in Shiprocket",
                    "shipment.shiprocketCreateStatus": "created",
                    "shipment.shiprocketCreateError": "",
                    "shipment.lastError": "",
                    "shipment.shiprocketCreateLockedAt": null,
                },
            },
            { new: true }
        );

        if (!savedOrder) {
            // Shiprocket may already have created the order.
            // Do not blindly retry: reconcile it in Shiprocket first.
            return NextResponse.json(
                {
                    success: false,
                    message: "Shiprocket created the order, but local saving needs reconciliation.",
                },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Shiprocket order created successfully.",
            shipment: savedOrder.shipment,
        });
    } catch (error) {
        console.error("Shiprocket creation error:", error);

        if (orderId && lockTime) {
            try {
                await Order.findOneAndUpdate(
                    {
                        _id: orderId,
                        "shipment.shiprocketCreateStatus": "processing",
                        "shipment.shiprocketCreateLockedAt": lockTime,
                        "shipment.shiprocketOrderId": { $in: ["", null] },
                    },
                    {
                        $set: {
                            "shipment.shiprocketCreateStatus": "failed",
                            "shipment.shiprocketCreateError": error.message,
                            "shipment.lastError": error.message,
                            "shipment.shiprocketCreateLockedAt": null,
                            "shipment.status": "failed",
                        },
                    }
                );
            } catch (saveError) {
                console.error(
                    "Could not save Shiprocket error:",
                    saveError
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                message: "Could not create the Shiprocket order.",
            },
            { status: 500 }
        );
    }
}
