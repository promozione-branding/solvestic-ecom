import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { getAuthenticatedCartUserId } from "@/lib/cart-api";
import Cart from "@/models/cart.model";
import Product from "@/models/product.model";

const MAX_QUANTITY = 99;

function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function normalizeVariant(value) {
    const variant =
        typeof value === "object" && value !== null
            ? value.size
            : value;

    return String(variant ?? "").trim();
}

function normalizeProductId(value) {
    if (value && typeof value === "object") {
        return String(value._id || value.id || "").trim();
    }

    return String(value || "").trim();
}

function findItemIndex(items, productId, variant = "") {
    const targetId = normalizeProductId(productId);
    const targetVariant = normalizeVariant(variant).toLowerCase();

    return items.findIndex((item) => {
        const itemId = normalizeProductId(item.productId);
        const itemVariant = normalizeVariant(item.variant).toLowerCase();

        return itemId === targetId && itemVariant === targetVariant;
    });
}

async function getOrCreateCart(userId) {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        try {
            cart = await Cart.create({ userId, items: [] });
        } catch (error) {
            if (error?.code !== 11000) throw error;
            cart = await Cart.findOne({ userId });
        }
    }

    if (!cart) {
        throw new Error("Unable to load the cart.");
    }

    return cart;
}

// GET /api/user/cart
export async function GET() {
    try {
        const auth = await getAuthenticatedCartUserId();

        if (!auth.userId) {
            return errorResponse(auth.error, auth.status);
        }

        await connectDB();

        const cart = await getOrCreateCart(auth.userId);
        await cart.populate("items.productId");

        return NextResponse.json({ success: true, cart });
    } catch (error) {
        console.error("GET cart error:", error);
        return errorResponse("Unable to load your cart.", 500);
    }
}

// PUT /api/user/cart
export async function PUT(request) {
    try {
        const auth = await getAuthenticatedCartUserId();

        if (!auth.userId) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await request.json();
        const productId = normalizeProductId(body.productId);
        const quantity = Number(body.quantity);
        const variant = normalizeVariant(body.variant);

        if (!mongoose.isValidObjectId(productId)) {
            return errorResponse("A valid product ID is required.");
        }

        if (
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > MAX_QUANTITY
        ) {
            return errorResponse("Quantity must be between 1 and 99.");
        }

        if (variant.length > 100) {
            return errorResponse("Variant cannot exceed 100 characters.");
        }

        await connectDB();

        const productExists = await Product.exists({ _id: productId });

        if (!productExists) {
            return errorResponse("This product is no longer available.", 404);
        }

        const cart = await getOrCreateCart(auth.userId);
        const index = findItemIndex(cart.items, productId, variant);

        if (index === -1) {
            return errorResponse("This product variant is not in your cart.", 404);
        }

        cart.items[index].quantity = quantity;

        await cart.save();
        await cart.populate("items.productId");

        return NextResponse.json({
            success: true,
            message: "Cart quantity updated.",
            cart,
        });
    } catch (error) {
        console.error("PUT cart error:", error);
        return errorResponse("Unable to update your cart.", 500);
    }
}

// DELETE /api/user/cart
export async function DELETE(request) {
    try {
        const auth = await getAuthenticatedCartUserId();

        if (!auth.userId) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await request.json().catch(() => ({}));

        await connectDB();

        const cart = await getOrCreateCart(auth.userId);

        if (body.clearAll === true) {
            cart.items = [];
        } else {
            const productId = normalizeProductId(body.productId);
            const variant = normalizeVariant(body.variant);

            if (!mongoose.isValidObjectId(productId)) {
                return errorResponse("A valid product ID is required.");
            }

            const index = findItemIndex(cart.items, productId, variant);

            if (index === -1) {
                console.error("Cart item not found:", {
                    userId: String(auth.userId),
                    requestedProductId: productId,
                    requestedVariant: variant,
                    storedItems: cart.items.map((item) => ({
                        productId: normalizeProductId(item.productId),
                        variant: normalizeVariant(item.variant),
                    })),
                });

                return errorResponse("This product variant is not in your cart.", 404);
            }

            cart.items.splice(index, 1);
        }

        await cart.save();
        await cart.populate("items.productId");

        return NextResponse.json({
            success: true,
            message: body.clearAll
                ? "Cart cleared successfully."
                : "Item removed successfully.",
            cart,
        });
    } catch (error) {
        console.error("DELETE cart error:", error);
        return errorResponse("Unable to update your cart.", 500);
    }
}