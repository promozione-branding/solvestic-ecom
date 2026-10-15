import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import { getAuthenticatedCartUserId } from "@/lib/cart-api";
import Cart from "@/models/cart.model";
import Product from "@/models/product.model";

const MAX_QUANTITY = 99;
const MAX_CART_ITEMS = 100;

function errorResponse(message, status = 400) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function normalizeVariant(value) {
    if (value && typeof value === "object") {
        value = value.size ?? "";
    }

    return String(value ?? "").trim();
}

function itemKey(productId, variant) {
    return `${String(productId).trim()}:${normalizeVariant(variant).toLowerCase()}`;
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

// POST /api/user/cart/merge
// Body: { items: [{ productId, quantity, variant? }] }
export async function POST(request) {
    try {
        const auth = await getAuthenticatedCartUserId();

        if (!auth.userId) {
            return errorResponse(auth.error, auth.status);
        }

        const body = await request.json();
        const guestItems = body?.items;

        if (!Array.isArray(guestItems)) {
            return errorResponse("Cart items must be an array.");
        }

        if (guestItems.length > MAX_CART_ITEMS) {
            return errorResponse("The guest cart contains too many items.");
        }

        const normalizedItems = new Map();

        for (const rawItem of guestItems) {
            const productId = String(rawItem?.productId || "").trim();
            const quantity = Number(rawItem?.quantity);
            const variant = normalizeVariant(rawItem?.variant);

            if (!mongoose.isValidObjectId(productId)) {
                return errorResponse("The guest cart contains an invalid product ID.");
            }

            if (
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > MAX_QUANTITY
            ) {
                return errorResponse("Cart quantities must be between 1 and 99.");
            }

            if (variant.length > 100) {
                return errorResponse("A product variant is too long.");
            }

            const key = itemKey(productId, variant);
            const existing = normalizedItems.get(key);

            if (existing) {
                existing.quantity = Math.min(
                    MAX_QUANTITY,
                    existing.quantity + quantity
                );
            } else {
                normalizedItems.set(key, {
                    productId,
                    quantity,
                    variant,
                });
            }
        }

        await connectDB();

        const incoming = Array.from(normalizedItems.values());

        if (incoming.length > 0) {
            const productIds = [
                ...new Set(incoming.map((item) => item.productId)),
            ];

            const existingProducts = await Product.find({
                _id: { $in: productIds },
            })
                .select("_id")
                .lean();

            const validProductIds = new Set(
                existingProducts.map((product) => String(product._id))
            );

            if (incoming.some((item) => !validProductIds.has(item.productId))) {
                return errorResponse(
                    "One or more guest cart products no longer exist. Refresh your cart and try again.",
                    404
                );
            }
        }

        const cart = await getOrCreateCart(auth.userId);

        // Combine existing account-cart duplicates as well.
        const combinedItems = new Map();

        for (const item of cart.items) {
            const productId = String(item.productId?._id || item.productId);
            const variant = normalizeVariant(item.variant);
            const key = itemKey(productId, variant);
            const existing = combinedItems.get(key);

            if (existing) {
                existing.quantity = Math.min(
                    MAX_QUANTITY,
                    existing.quantity + Number(item.quantity || 1)
                );
            } else {
                combinedItems.set(key, {
                    productId,
                    variant,
                    quantity: Number(item.quantity) || 1,
                });
            }
        }

        // Merge guest items into the account cart.
        for (const guestItem of incoming) {
            const key = itemKey(guestItem.productId, guestItem.variant);
            const existing = combinedItems.get(key);

            if (existing) {
                existing.quantity = Math.min(
                    MAX_QUANTITY,
                    existing.quantity + guestItem.quantity
                );
            } else {
                combinedItems.set(key, { ...guestItem });
            }
        }

        if (combinedItems.size > MAX_CART_ITEMS) {
            return errorResponse(
                "Your account cart has reached its item limit. Remove some items and try again."
            );
        }

        cart.items = Array.from(combinedItems.values());

        await cart.save();
        await cart.populate("items.productId");

        return NextResponse.json({
            success: true,
            message: "Guest cart merged successfully.",
            cart,
        });
    } catch (error) {
        console.error("Merge cart error:", error);
        return errorResponse("Unable to merge your cart.", 500);
    }
}