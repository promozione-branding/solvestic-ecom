
import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product ID is required"],
        },

        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
            max: [99, "Quantity cannot exceed 99"],
            default: 1,
            validate: {
                validator: Number.isInteger,
                message: "Quantity must be a whole number",
            },
        },

        // Optional selected variant, e.g. "Black" or "Grey / Premium".
        // Keep this as a string for now; we can adapt it to your
        // actual product variant schema if needed.
        variant: {
            type: String,
            trim: true,
            default: "",
            maxlength: [100, "Variant cannot exceed 100 characters"],
        },
    },
    {
        _id: false,
    }
);

const CartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User ID is required"],
            unique: true,
            index: true,
        },

        items: {
            type: [CartItemSchema],
            default: [],
            validate: [
                {
                    validator(items) {
                        return items.length <= 100;
                    },
                    message: "A cart cannot contain more than 100 items",
                },
                {
                    validator(items) {
                        const seen = new Set();

                        for (const item of items) {
                            const productId = item.productId?.toString();
                            const variant = (item.variant || "").trim().toLowerCase();
                            const key = `${productId}:${variant}`;

                            if (seen.has(key)) {
                                return false;
                            }

                            seen.add(key);
                        }

                        return true;
                    },
                    message:
                        "The same product and variant cannot appear twice in a cart",
                },
            ],
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);
export default Cart;