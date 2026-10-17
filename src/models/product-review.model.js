
import mongoose from "mongoose";

const reviewMediaSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        key: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },
        mimeType: {
            type: String,
            required: true,
        },
        size: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    { _id: true }
);

const productReviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 0.5,
            max: 5,
            validate: {
                validator: (value) => Number.isInteger(value * 2),
                message: "Rating must use half-star increments from 0.5 to 5.",
            },
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },

        review: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },

        media: {
            type: [reviewMediaSchema],
            default: [],
            validate: {
                validator: (items) => items.length <= 6,
                message: "A review can contain up to 6 media files.",
            },
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },

        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },

        helpfulCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { timestamps: true }
);

// One review per customer per product.
productReviewSchema.index(
    { productId: 1, userId: 1 },
    { unique: true }
);

// Retrieve approved reviews in newest-first order.
productReviewSchema.index({
    productId: 1,
    status: 1,
    createdAt: -1,
});

const ProductReview =
    mongoose.models.ProductReview ||
    mongoose.model("ProductReview", productReviewSchema);

export default ProductReview;
