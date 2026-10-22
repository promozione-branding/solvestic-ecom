
import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: { type: String, required: true },
        slug: { type: String, default: "" },
        image: { type: String, default: "" },
        variant: { type: String, default: "" },
        quantity: { type: Number, required: true, min: 1, max: 99 },
        unitPrice: { type: Number, required: true, min: 0 },
        lineTotal: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const AddressSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        mobile: { type: String, required: true, trim: true },
        addressLine1: { type: String, required: true, trim: true },
        addressLine2: { type: String, default: "", trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        country: { type: String, default: "India", trim: true },
        pincode: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const TrackingEventSchema = new mongoose.Schema(
    {
        status: { type: String, default: "" },
        activity: { type: String, default: "" },
        location: { type: String, default: "" },
        description: { type: String, default: "" },
        eventTime: { type: Date, default: null },
        source: {
            type: String,
            enum: ["shiprocket", "system"],
            default: "shiprocket",
        },
    },
    { timestamps: true }
);

const ShipmentSchema = new mongoose.Schema(
    {
        shipmentId: { type: String, default: "" },
        shiprocketOrderId: { type: String, default: "" },
        channelOrderId: { type: String, default: "" },
        awbCode: { type: String, default: "" },
        courierName: { type: String, default: "" },
        trackingUrl: { type: String, default: "" },

        status: {
            type: String,
            enum: [
                "not_created",
                "pending",
                "created",
                "pickup_scheduled",
                "picked_up",
                "in_transit",
                "out_for_delivery",
                "delivered",
                "cancelled",
                "rto",
                "lost",
                "failed",
            ],
            default: "not_created",
        },

        currentStatusText: { type: String, default: "" },
        estimatedDeliveryDate: { type: Date, default: null },
        lastSyncedAt: { type: Date, default: null },

        trackingEvents: {
            type: [TrackingEventSchema],
            default: [],
        },

        shiprocketCreateStatus: {
            type: String,
            enum: ["not_started", "processing", "created", "failed"],
            default: "not_started",
        },

        shiprocketCreateError: { type: String, default: "" },
        shiprocketCreateLockedAt: { type: Date, default: null },
        lastError: { type: String, default: "" },
    },
    { _id: false }
);

const OrderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        customerEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (items) =>
                    Array.isArray(items) && items.length > 0,
                message: "An order must contain at least one item.",
            },
        },

        shippingAddress: {
            type: AddressSchema,
            required: true,
        },

        currency: {
            type: String,
            enum: ["INR"],
            default: "INR",
        },

        subtotal: { type: Number, required: true, min: 0 },
        shippingFee: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },

        couponCode: {
            type: String,
            trim: true,
            uppercase: true,
            default: null,
        },

        couponDiscount: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        paymentMethod: {
            type: String,
            enum: ["razorpay", "cod"],
            required: true,
            default: "razorpay",
        },

        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded",
                "partially_refunded",
            ],
            default: "pending",
            index: true,
        },

        orderStatus: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
                "returned",
            ],
            default: "pending",
            index: true,
        },

        confirmedAt: {
            type: Date,
            default: null,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        codCollectedAt: {
            type: Date,
            default: null,
        },

        cancelledAt: {
            type: Date,
            default: null,
        },

        shipment: {
            type: ShipmentSchema,
            default: () => ({}),
        },
    },
    { timestamps: true }
);

// Customer order history
OrderSchema.index({
    userId: 1,
    createdAt: -1,
});

// Admin order filtering
OrderSchema.index({
    orderStatus: 1,
    createdAt: -1,
});

// Payment reporting
OrderSchema.index({
    paymentMethod: 1,
    paymentStatus: 1,
    createdAt: -1,
});

// Shiprocket tracking lookup
OrderSchema.index(
    { "shipment.awbCode": 1 },
    {
        partialFilterExpression: {
            "shipment.awbCode": { $type: "string", $gt: "" },
        },
    }
);

const Order =
    mongoose.models.Order ||
    mongoose.model("Order", OrderSchema);

export default Order;
