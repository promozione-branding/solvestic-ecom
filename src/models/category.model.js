import mongoose from "mongoose";

function generateSlug(value) {
    return value
        .toLowerCase()
        .trim()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Category name is required."],
            trim: true,
            unique: true,
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },

        metaTitle: {
            type: String,
            trim: true,
            default: "",
        },

        metaDescription: {
            type: String,
            trim: true,
            default: "",
        },

        description: {
            type: String,
            trim: true,
            default: "",
        },

        imageUrl: {
            type: String,
            default: "",
        },

        imageKey: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);

// Automatically generate the slug when the category name changes.
categorySchema.pre("validate", function () {
    if (this.isModified("name") && this.name) {
        this.slug = generateSlug(this.name);
    }
});

export default mongoose.models.Category ||
    mongoose.model("Category", categorySchema);