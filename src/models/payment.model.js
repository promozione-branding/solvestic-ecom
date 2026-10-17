
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
    {
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        provider: {
            type: String,
            enum: ["razorpay"],
            default: "razorpay",
        },
        amount: { type: Number, required: true, min: 0 },
        currency: { type: String, default: "INR" },

        status: {
            type: String,
            enum: [
                "created",
                "pending",
                "authorized",
                "captured",
                "failed",
                "refunded",
                "partially_refunded",
            ],
            default: "created",
            index: true,
        },

        razorpayOrderId: { type: String, default: "" },
        razorpayPaymentId: { type: String, default: "" },
        razorpaySignature: { type: String, default: "", select: false },

        failureReason: { type: String, default: "" },
        refundId: { type: String, default: "" },
        refundedAmount: { type: Number, default: 0, min: 0 },
        paidAt: { type: Date, default: null },
        refundedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

PaymentSchema.index(
    { razorpayPaymentId: 1 },
    {
        unique: true,
        partialFilterExpression: {
            razorpayPaymentId: { $gt: "" },
        },
    }
);

const Payment =
    mongoose.models.Payment ||
    mongoose.model("Payment", PaymentSchema);

export default Payment;
