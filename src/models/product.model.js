
import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    size: {
        type: String,
        required: true,
        trim: true,
    },
    oldPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
}, { _id: false });

const specificationSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        trim: true,
    },
    value: {
        type: String,
        required: true,
        trim: true,
    },
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
        index: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },

    metaTitle: {
        type: String,
        default: "",
        trim: true,
    },

    metaDescription: {
        type: String,
        default: "",
        trim: true,
    },

    variants: {
        type: [variantSchema],
        required: true,
        validate: {
            validator: (variants) =>
                variants.length > 0 &&
                new Set(variants.map((v) => v.size)).size ===
                variants.length,
            message: "Add at least one variant with a unique bottle size.",
        },
    },

    images: {
        type: [
            {
                url: { type: String, required: true },
                key: { type: String, default: "" },
            },
        ],
        default: [],
    },

    videoUrl: {
        type: String,
        default: "",
        trim: true,
    },

    specifications: {
        type: [specificationSchema],
        default: [],
    },

    shortDescription: {
        type: String,
        default: "",
        trim: true,
    },

    longDescription: {
        type: String,
        default: "",
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
    },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", productSchema);