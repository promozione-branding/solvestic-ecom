
import Order from "@/models/order.model";
import connectDB from "@/lib/mongodb";

import {
    getShiprocketToken,
    shiprocketRequest,
} from "@/lib/shiprocket";

const PROCESSING_TIMEOUT_MS = 10 * 60 * 1000;

function getPackageDetails() {
    const details = {
        length: Number(
            process.env.SHIPROCKET_PACKAGE_LENGTH || 10
        ),
        breadth: Number(
            process.env.SHIPROCKET_PACKAGE_BREADTH || 10
        ),
        height: Number(
            process.env.SHIPROCKET_PACKAGE_HEIGHT || 10
        ),
        weight: Number(
            process.env.SHIPROCKET_PACKAGE_WEIGHT || 0.5
        ),
    };

    if (
        Object.values(details).some(
            (value) =>
                !Number.isFinite(value) ||
                value <= 0
        )
    ) {
        throw new Error(
            "Invalid Shiprocket package dimensions or weight."
        );
    }

    return details;
}

function isShipmentEligible(order) {
    if (!order) return false;

    if (
        !["confirmed", "processing"].includes(
            order.orderStatus
        )
    ) {
        return false;
    }

    if (order.paymentMethod === "razorpay") {
        return order.paymentStatus === "paid";
    }

    if (order.paymentMethod === "cod") {
        return order.paymentStatus === "pending";
    }

    return false;
}

function buildPayload(order) {
    const address = order.shippingAddress;

    const requiredFields = [
        "fullName",
        "mobile",
        "addressLine1",
        "city",
        "state",
        "pincode",
    ];

    if (
        requiredFields.some(
            (field) =>
                !String(address?.[field] || "").trim()
        )
    ) {
        throw new Error(
            "Shipping address is incomplete."
        );
    }

    if (!order.customerEmail) {
        throw new Error(
            "Customer email is missing."
        );
    }

    const pickupLocation =
        process.env.SHIPROCKET_PICKUP_LOCATION;

    if (!pickupLocation) {
        throw new Error(
            "SHIPROCKET_PICKUP_LOCATION is missing."
        );
    }

    if (!Array.isArray(order.items) || !order.items.length) {
        throw new Error(
            "Order has no items."
        );
    }

    const orderItems = order.items.map((item) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            !Number.isFinite(unitPrice) ||
            unitPrice < 0
        ) {
            throw new Error(
                "Invalid order item data."
            );
        }

        return {
            name: item.name,
            sku: [
                String(item.productId),
                String(item.variant || "")
                    .trim()
                    .replace(/\s+/g, "-"),
            ]
                .filter(Boolean)
                .join("-"),
            units: quantity,
            selling_price: unitPrice,
            discount: 0,
            tax: 0,
            hsn: "",
        };
    });

    return {
        order_id: String(order.orderNumber),

        order_date: new Date(order.createdAt)
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
        billing_email: order.customerEmail,
        billing_phone: String(address.mobile),

        shipping_is_billing: true,
        order_items: orderItems,

        payment_method:
            order.paymentMethod === "cod"
                ? "COD"
                : "Prepaid",

        sub_total: Number(order.totalAmount),

        ...getPackageDetails(),
    };
}

/**
 * Creates a Shiprocket order for an eligible
 * confirmed Solvestic order.
 *
 * Never automatically retries ambiguous failures.
 */
export async function createShiprocketOrder(orderId) {
    await connectDB();

    const order = await Order.findById(orderId);

    if (!order) {
        return {
            success: false,
            status: "not_found",
            message: "Order not found.",
        };
    }

    if (order.shipment?.shiprocketOrderId) {
        return {
            success: true,
            status: "already_created",
            shiprocketOrderId:
                order.shipment.shiprocketOrderId,
            shipmentId:
                order.shipment.shipmentId,
        };
    }

    if (!isShipmentEligible(order)) {
        return {
            success: false,
            status: "not_eligible",
            message:
                "Order is not eligible for shipment creation.",
        };
    }

    const createStatus =
        order.shipment?.shiprocketCreateStatus ||
        "not_started";

    if (createStatus === "processing") {
        const lockedAt =
            order.shipment?.shiprocketCreateLockedAt;

        const stale =
            lockedAt &&
            Date.now() -
            new Date(lockedAt).getTime() >
            PROCESSING_TIMEOUT_MS;

        return {
            success: false,
            status: stale
                ? "needs_review"
                : "processing",
            message: stale
                ? "Shipment lock is stale. Check Shiprocket before retrying."
                : "Shipment creation is already running.",
        };
    }

    if (createStatus === "failed") {
        return {
            success: false,
            status: "needs_review",
            message:
                "Previous attempt needs manual review before retrying.",
        };
    }

    // Validate everything before claiming the lock.
    const payload = buildPayload(order);
    const lockTime = new Date();

    const claimed = await Order.findOneAndUpdate(
        {
            _id: order._id,

            orderStatus: {
                $in: ["confirmed", "processing"],
            },

            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,

            "shipment.shiprocketOrderId": {
                $in: ["", null],
            },

            "shipment.shiprocketCreateStatus": {
                $in: ["not_started", null],
            },
        },
        {
            $set: {
                "shipment.shiprocketCreateStatus":
                    "processing",
                "shipment.shiprocketCreateLockedAt":
                    lockTime,
                "shipment.shiprocketCreateError": "",
                "shipment.lastError": "",
                "shipment.status": "pending",
            },
        },
        { new: true }
    );

    if (!claimed) {
        return {
            success: false,
            status: "conflict",
            message:
                "Shipment creation already claimed or order changed.",
        };
    }

    let requestMayHaveReachedShiprocket = false;

    try {
        const token = await getShiprocketToken();

        requestMayHaveReachedShiprocket = true;

        const result = await shiprocketRequest(
            "/orders/create/adhoc",
            token,
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        );

        if (!result?.order_id || !result?.shipment_id) {
            throw new Error(
                "Shiprocket response missing order_id or shipment_id."
            );
        }

        const updated = await Order.findOneAndUpdate(
            {
                _id: order._id,

                "shipment.shiprocketCreateStatus":
                    "processing",

                "shipment.shiprocketCreateLockedAt":
                    lockTime,

                "shipment.shiprocketOrderId": {
                    $in: ["", null],
                },
            },
            {
                $set: {
                    "shipment.shiprocketOrderId":
                        String(result.order_id),

                    "shipment.shipmentId":
                        String(result.shipment_id),

                    "shipment.channelOrderId":
                        String(order.orderNumber),

                    "shipment.status": "created",

                    "shipment.currentStatusText":
                        "Order created in Shiprocket",

                    "shipment.shiprocketCreateStatus":
                        "created",

                    "shipment.shiprocketCreateError": "",
                    "shipment.lastError": "",

                    "shipment.shiprocketCreateLockedAt":
                        null,
                },
            },
            { new: true }
        );

        if (!updated) {
            console.error(
                "Shiprocket created order but local save failed",
                {
                    orderId: String(order._id),
                    shiprocketOrderId: result.order_id,
                    shipmentId: result.shipment_id,
                }
            );

            return {
                success: false,
                status: "needs_review",
                message:
                    "Shiprocket order created, but local save needs reconciliation.",
            };
        }

        return {
            success: true,
            status: "created",
            orderId: String(updated._id),
            shiprocketOrderId:
                updated.shipment.shiprocketOrderId,
            shipmentId:
                updated.shipment.shipmentId,
        };
    } catch (error) {
        console.error(
            "Automatic Shiprocket creation error:",
            error
        );

        await Order.findOneAndUpdate(
            {
                _id: order._id,

                "shipment.shiprocketCreateStatus":
                    "processing",

                "shipment.shiprocketCreateLockedAt":
                    lockTime,

                "shipment.shiprocketOrderId": {
                    $in: ["", null],
                },
            },
            {
                $set: {
                    "shipment.shiprocketCreateStatus":
                        "failed",

                    "shipment.shiprocketCreateError":
                        String(error.message || "Unknown error")
                            .slice(0, 500),

                    "shipment.lastError":
                        String(error.message || "Unknown error")
                            .slice(0, 500),

                    "shipment.shiprocketCreateLockedAt":
                        null,

                    "shipment.status": "failed",
                },
            }
        );

        return {
            success: false,
            status: requestMayHaveReachedShiprocket
                ? "needs_review"
                : "failed",
            message: requestMayHaveReachedShiprocket
                ? "Shiprocket request may have succeeded. Reconcile before retrying."
                : "Shipment creation failed before Shiprocket request.",
        };
    }
}
