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

// POST /api/user/cart — Add product to authenticated user's cart
export async function POST(request) {
    try {
        const auth = await getAuthenticatedCartUserId();

        if (!auth.userId) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await request.json();

        const productId = normalizeProductId(body.productId);
        const quantity = Number(body.quantity ?? 1);
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

        if (!variant || variant.length > 100) {
            return errorResponse("A valid product variant is required.");
        }

        await connectDB();

        const product = await Product.findById(productId);

        if (!product) {
            return errorResponse(
                "This product is no longer available.",
                404
            );
        }

        // Verify that the requested variant belongs to this product.
        const selectedVariant = product.variants?.find(
            (item) =>
                String(item.size || "").trim().toLowerCase() ===
                variant.toLowerCase()
        );

        if (!selectedVariant) {
            return errorResponse(
                "This product variant is unavailable.",
                400
            );
        }

        if (
            product.status === "inactive" ||
            product.status === "coming-soon"
        ) {
            return errorResponse(
                "This product is currently unavailable.",
                400
            );
        }

        const cart = await getOrCreateCart(auth.userId);

        const index = findItemIndex(
            cart.items,
            productId,
            variant
        );

        if (index !== -1) {
            // Same product and variant: increase quantity.
            const currentQuantity = Number(
                cart.items[index].quantity || 0
            );

            if (currentQuantity + quantity > MAX_QUANTITY) {
                return errorResponse(
                    "Maximum quantity per variant is 99."
                );
            }

            cart.items[index].quantity =
                currentQuantity + quantity;
        } else {
            if (cart.items.length >= 100) {
                return errorResponse(
                    "Your cart has reached its item limit."
                );
            }

            cart.items.push({
                productId,
                quantity,
                variant: String(selectedVariant.size).trim(),
            });
        }

        await cart.save();
        await cart.populate("items.productId");

        return NextResponse.json({
            success: true,
            message: "Product added to cart successfully.",
            cart,
        });
    } catch (error) {
        console.error("POST cart error:", error);

        return errorResponse(
            "Unable to add product to your cart.",
            500
        );
    }
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