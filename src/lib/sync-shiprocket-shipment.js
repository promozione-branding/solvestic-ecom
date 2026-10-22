
import Order from "@/models/order.model";
import {
    getShiprocketToken,
    shiprocketRequest,
} from "@/lib/shiprocket";

function getShipmentDetails(response, shipmentId) {
    const data = response?.data ?? response;

    const shipments = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.shipments)
                ? data.shipments
                : data?.data?.shipments &&
                    Array.isArray(data.data.shipments)
                    ? data.data.shipments
                    : [];

    return shipments.find(
        (item) =>
            String(item.id ?? item.shipment_id) ===
            String(shipmentId)
    );
}

export async function syncShiprocketShipment(
    order,
    token = null
) {
    const shipmentId = order.shipment?.shipmentId;

    if (!shipmentId) {
        return {
            success: false,
            message: "Shipment ID missing",
        };
    }

    const shiprocketToken =
        token || (await getShiprocketToken());

    // Fetch shipment information.
    // Confirm endpoint and response structure
    // against your Shiprocket API version.
    const response = await shiprocketRequest(
        `/shipments?per_page=50`,
        shiprocketToken,
        { method: "GET" }
    );

    const shipment = getShipmentDetails(
        response,
        shipmentId
    );

    if (!shipment) {
        return {
            success: false,
            message:
                "Shipment not found in Shiprocket response",
        };
    }

    const awbCode = String(
        shipment.awb_code ||
        shipment.awb ||
        ""
    );

    const courierName = String(
        shipment.courier_name || ""
    );

    const updates = {
        "shipment.lastSyncedAt": new Date(),
    };

    if (awbCode) {
        updates["shipment.awbCode"] = awbCode;
    }

    if (courierName) {
        updates["shipment.courierName"] =
            courierName;
    }

    if (shipment.status) {
        updates["shipment.currentStatusText"] =
            String(shipment.status);
    }

    const updatedOrder = await Order.findOneAndUpdate(
        {
            _id: order._id,
            "shipment.shipmentId": shipmentId,
            orderStatus: {
                $nin: ["cancelled", "returned"],
            },
        },
        { $set: updates },
        { new: true, runValidators: true }
    );

    return {
        success: Boolean(updatedOrder),
        orderId: String(order._id),
        awbCode,
        courierName,
        message: updatedOrder
            ? "Shipment synchronized"
            : "Order was not updated",
    };
}
