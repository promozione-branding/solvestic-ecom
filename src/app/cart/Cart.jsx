
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState, } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    BadgePercent,
    Check,
    ChevronRight,
    Heart,
    LoaderCircle,
    LockKeyhole,
    Minus,
    Plus,
    ShoppingBag,
    Tag,
    Trash2,
    Truck,
} from "lucide-react";

import {
    getGuestCart,
    saveGuestCart,
    addToGuestCart,
    updateGuestCartQuantity,
    removeFromGuestCart,
    clearGuestCart,
} from "@/lib/cart-storage";

const MAX_QUANTITY = 99;
const ORIGINAL_SHIPPING = 99;

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(price) || 0);

function getProductPrice(product) {
    return Number(
        product?.sellingPrice ??
        product?.salePrice ??
        product?.price ??
        0
    );
}

function getOriginalPrice(product) {
    return Number(
        product?.originalPrice ??
        product?.compareAtPrice ??
        product?.mrp ??
        product?.price ??
        0
    );
}

function getProduct(item) {
    if (item?.productId && typeof item.productId === "object") {
        return item.productId;
    }

    if (item?.product && typeof item.product === "object") {
        return item.product;
    }

    return item;
}

function getProductId(item) {
    const product = getProduct(item);

    return String(
        product?._id ||
        product?.id ||
        (typeof item?.productId === "string" ? item.productId : "") ||
        ""
    );
}

function getProductName(product) {
    return product?.name || product?.title || "Product";
}

function getProductImage(product) {
    return (
        product?.images?.[0]?.url ||
        product?.imageUrl ||
        product?.thumbnail ||
        product?.image ||
        "/placeholder.png"
    );
}

function getSelectedVariant(product, variant) {
    const size =
        typeof variant === "object"
            ? variant?.size
            : variant;

    const variants = product?.variants || [];

    return (
        variants.find(
            (item) =>
                String(item.size).trim().toLowerCase() ===
                String(size || "").trim().toLowerCase()
        ) ||
        (!size ? variants[0] : null) ||
        null
    );
}

function normalizeCartItem(item) {
    const product = getProduct(item);
    const selectedVariant =
        typeof item.variant === "object"
            ? item.variant
            : getSelectedVariant(product, item.variant);

    return {
        productId: getProductId(item),
        name: getProductName(product),
        slug: product?.slug || "",
        image: getProductImage(product),
        price: Number(selectedVariant?.price ?? 0),
        oldPrice: Number(selectedVariant?.oldPrice ?? selectedVariant?.price ?? 0),
        variant: selectedVariant?.size || "",
        quantity: Number(item.quantity) || 1,
        inStock: product?.status !== "inactive",
    };
}

export default function Cart() {
    const mergeStartedRef = useRef(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyKey, setBusyKey] = useState("");
    const [error, setError] = useState("");
    const [coupon, setCoupon] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [couponLoading, setCouponLoading] = useState(false);

    const request = useCallback(async (url, options = {}) => {
        const response = await fetch(url, {
            credentials: "include",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const err = new Error(data.message || "Request failed.");
            err.status = response.status;
            throw err;
        }

        return data;
    }, []);

    // Loads either the logged-in cart or the guest cart.
    const loadCart = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            let guestItems = getGuestCart();
            // console.log(guestItems);

            try {
                const data = await request("/api/user/cart");
                setIsAuthenticated(true);

                // Merge browser items into the account cart only once.
                if (guestItems.length > 0 && !mergeStartedRef.current) {
                    mergeStartedRef.current = true;

                    try {
                        const merged = await request("/api/user/cart/merge", {
                            method: "POST",
                            body: JSON.stringify({
                                items: guestItems.map((item) => ({
                                    productId: item.productId,
                                    quantity: item.quantity,
                                    variant:
                                        typeof item.variant === "object"
                                            ? item.variant?.size || ""
                                            : item.variant || "",
                                })),
                            }),
                        });

                        if (merged.success) {
                            clearGuestCart();
                            data.cart = merged.cart;
                        } else {
                            mergeStartedRef.current = false;
                        }
                    } catch (mergeError) {
                        mergeStartedRef.current = false;

                        console.error("Guest cart merge failed:", mergeError);
                        setError(
                            "Your account cart loaded, but guest items could not be merged. Please try again."
                        );
                    }
                }

                const accountItems = (data.cart?.items || []).map(normalizeCartItem);
                setItems(accountItems);
            } catch (authError) {
                if (authError.status !== 401) throw authError;

                setIsAuthenticated(false);
                guestItems = getGuestCart();

                // Resolve product details for guest cart IDs.
                const resolved = await Promise.all(
                    guestItems.map(async (item) => {
                        try {
                            const data = await request(
                                `/api/admin/products/${encodeURIComponent(item.productId)}`
                            );

                            const product =
                                data.product ||
                                data.data?.product ||
                                data.data ||
                                data;

                            return normalizeCartItem({
                                productId: product,
                                variant: item.variant,
                                quantity: item.quantity,
                            });
                        } catch (productError) {
                            console.error(
                                `Unable to load product ${item.productId}:`,
                                productError
                            );

                            return null;
                        }
                    })
                );

                setItems(resolved.filter(Boolean));

            }
        } catch (loadError) {
            console.error("Cart loading error:", loadError);
            setError(loadError.message || "Unable to load your cart.");
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    // Coupon eligibility comes from the server, never from a local code check.
    useEffect(() => {
        if (!isAuthenticated) {
            setAppliedCoupon(false);
            setCoupon("");
            return;
        }
        let cancelled = false;
        const checkCoupon = async () => {
            setCouponLoading(true);
            try {
                const data = await request("/api/user/coupon");
                if (cancelled) return;
                const eligible = data.eligible === true;
                setAppliedCoupon(eligible);
                setCoupon(eligible ? "WELCOME10" : "");
                setCouponMessage(eligible ? "WELCOME10 automatically applied — 10% off!" : "");
            } catch (err) {
                if (!cancelled) {
                    setAppliedCoupon(false);
                    setCouponMessage("");
                }
            } finally {
                if (!cancelled) setCouponLoading(false);
            }
        };
        checkCoupon();
        return () => { cancelled = true; };
    }, [isAuthenticated, request]);

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [items]
    );

    const originalTotal = useMemo(() =>
        items.reduce((sum, item) => sum + item.oldPrice * item.quantity, 0),
        [items]);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const productDiscount = Math.max(0, originalTotal - subtotal);
    const couponDiscount = appliedCoupon ? Math.round(subtotal * 100 * 0.1) / 100 : 0;
    const shipping = 0; // Free shipping on all orders
    const total = Math.max(0, subtotal - couponDiscount);

    const persistGuestItems = (nextItems) => {
        const success = saveGuestCart(
            nextItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                variant: item.variant,
            }))
        );

        if (!success) {
            setError("Unable to save your cart in this browser.");
        }

        return success;
    };

    const updateQuantity = async (item, change) => {
        const nextQuantity = item.quantity + change;

        if (nextQuantity < 1 || nextQuantity > MAX_QUANTITY) return;

        const key = `${item.productId}:${item.variant}`;
        setBusyKey(key);
        setError("");

        const nextItems = items.map((current) =>
            current.productId === item.productId &&
                current.variant === item.variant
                ? { ...current, quantity: nextQuantity }
                : current
        );

        // Optimistic update for a responsive UI.
        setItems(nextItems);

        try {
            if (isAuthenticated) {
                await request("/api/user/cart", {
                    method: "PUT",
                    body: JSON.stringify({
                        productId: item.productId,
                        quantity: nextQuantity,
                        variant: item.variant,
                    }),
                });
            } else {
                const result = updateGuestCartQuantity(
                    item.productId,
                    nextQuantity,
                    item.variant
                );

                if (!result.success) throw new Error("Unable to update guest cart.");
            }
        } catch (updateError) {
            setError(updateError.message || "Unable to update quantity.");
            await loadCart();
        } finally {
            setBusyKey("");
        }
    };

    const removeItem = async (item) => {
        const key = `${item.productId}:${item.variant}`;

        if (busyKey) return;

        setBusyKey(key);
        setError("");

        try {
            if (isAuthenticated) {
                await request("/api/user/cart", {
                    method: "DELETE",
                    body: JSON.stringify({
                        productId: item.productId,
                        variant: item.variant || "",
                    }),
                });
                window.dispatchEvent(
                    new Event("solvestic-cart-updated")
                );
            } else {
                const result = removeFromGuestCart(
                    item.productId,
                    item.variant || ""
                );

                if (result?.success === false) {
                    throw new Error("Unable to remove this item from your cart.");
                }
            }
            window.dispatchEvent(
                new Event("solvestic-cart-updated")
            );
            setItems((prev) =>
                prev.filter(
                    (cartItem) =>
                        !(
                            String(cartItem.productId) === String(item.productId) &&
                            String(cartItem.variant || "").toLowerCase() ===
                            String(item.variant || "").toLowerCase()
                        )
                )
            );
        } catch (error) {
            console.error("Remove cart item error:", error);
            setError(error.message || "Unable to remove this item.");
            await loadCart();
        } finally {
            setBusyKey("");
        }
    };

    const applyCoupon = async (event) => {
        event.preventDefault();
        if (!isAuthenticated) {
            setCouponMessage("Log in to receive your first-order discount.");
            return;
        }
        if (coupon.trim().toUpperCase() !== "WELCOME10") {
            setCouponMessage("Invalid coupon code.");
            return;
        }
        setCouponLoading(true);
        try {
            const data = await request("/api/user/coupon");
            setAppliedCoupon(data.eligible === true);
            setCouponMessage(data.eligible ? "WELCOME10 applied — 10% off!" : "This coupon is no longer available for your account.");
        } catch (error) {
            setAppliedCoupon(false);
            setCouponMessage(error.message || "Unable to validate coupon.");
        } finally {
            setCouponLoading(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-[65vh] items-center justify-center bg-[#F7F2FC] px-4">
                <div className="flex items-center gap-3 text-[#7D45C2]">
                    <LoaderCircle className="animate-spin" size={25} />
                    <span className="font-medium">Loading your cart...</span>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-7 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="transition hover:text-[#7D45C2]">
                        Home
                    </Link>
                    <ChevronRight size={15} />
                    <span className="font-medium text-gray-900">Shopping Cart</span>
                </div>

                <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7D45C2]">
                            YOUR SHOPPING BAG
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
                            Shopping Cart
                            <span className="ml-3 text-lg font-medium text-gray-400 sm:text-xl">
                                ({totalItems} {totalItems === 1 ? "item" : "items"})
                            </span>
                        </h1>
                        <p className="mt-3 text-sm text-gray-500 sm:text-base">
                            Review your selections before proceeding to checkout.
                        </p>
                    </div>

                    <Link
                        href="/our-products"
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#7D45C2] transition hover:gap-3"
                    >
                        <ArrowLeft size={17} />
                        Continue Shopping
                    </Link>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={loadCart}
                            className="shrink-0 font-semibold underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="rounded-3xl border border-[#E9DDF5] bg-white px-6 py-16 text-center shadow-sm sm:py-24">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F1E8FA] text-[#7D45C2]">
                            <ShoppingBag size={34} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Your cart is empty
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                            You haven&apos;t added anything to your cart yet. Explore our
                            collection and find something you love.
                        </p>
                        <Link
                            href="/our-products"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#6937AA]"
                        >
                            Explore Products
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_410px]">
                        <section className="space-y-5">
                            <div className="overflow-hidden rounded-3xl border border-[#E9DDF5] bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
                                    <h2 className="font-bold text-gray-900">Cart Items</h2>
                                    <span className="text-xs text-gray-400">
                                        Prices may be updated at checkout
                                    </span>
                                </div>

                                <div className="divide-y divide-gray-100 px-4 sm:px-7">
                                    {items.map((item, index) => {
                                        const key = `${item.productId}:${item.variant}:${index}`;
                                        const busy = busyKey === `${item.productId}:${item.variant}`;
                                        const productHref = item.slug
                                            ? `/our-products/${item.slug}`
                                            : "/our-products";

                                        return (
                                            <article
                                                key={key}
                                                className="flex flex-col gap-4 py-6 sm:flex-row sm:gap-6"
                                            >
                                                <Link
                                                    href={productHref}
                                                    className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F7F2FC] sm:aspect-square sm:w-36"
                                                >
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="h-full w-full object-contain p-3 transition duration-500 hover:scale-105"
                                                    />
                                                </Link>

                                                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                                                    <div>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <Link
                                                                    href={productHref}
                                                                    className="text-base font-bold text-gray-900 transition hover:text-[#7D45C2] sm:text-lg"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                                {item.variant && (
                                                                    <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">
                                                                        {item.variant}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(item)}
                                                                disabled={busy}
                                                                aria-label={`Remove ${item.name}`}
                                                                className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>

                                                        <div className="mt-3 flex items-center gap-2">
                                                            <span
                                                                className={`flex items-center gap-1.5 text-xs font-medium ${item.inStock
                                                                    ? "text-emerald-600"
                                                                    : "text-red-500"
                                                                    }`}
                                                            >
                                                                <span
                                                                    className={`h-1.5 w-1.5 rounded-full ${item.inStock
                                                                        ? "bg-emerald-500"
                                                                        : "bg-red-500"
                                                                        }`}
                                                                />
                                                                {item.inStock ? "Available" : "Check availability"}
                                                            </span>

                                                            <span className="text-gray-300">|</span>

                                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                                                <Heart size={14} />
                                                                Save for later (coming soon)
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-end justify-between gap-4">
                                                        <div className="inline-flex items-center rounded-xl border border-gray-200">
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item, -1)}
                                                                disabled={busy || item.quantity <= 1}
                                                                aria-label="Decrease quantity"
                                                                className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:text-[#7D45C2] disabled:cursor-not-allowed disabled:opacity-30"
                                                            >
                                                                <Minus size={15} />
                                                            </button>
                                                            <span className="min-w-9 text-center text-sm font-semibold text-gray-900">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => updateQuantity(item, 1)}
                                                                disabled={busy || item.quantity >= MAX_QUANTITY}
                                                                aria-label="Increase quantity"
                                                                className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:text-[#7D45C2] disabled:cursor-not-allowed disabled:opacity-30"
                                                            >
                                                                <Plus size={15} />
                                                            </button>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-gray-950">
                                                                {formatPrice(item.price * item.quantity)}
                                                            </p>
                                                            {item.oldPrice > item.price && (
                                                                <p className="mt-1 text-xs text-gray-400 line-through">
                                                                    {formatPrice(item.oldPrice * item.quantity)}
                                                                </p>
                                                            )}
                                                            {busy && (
                                                                <p className="mt-1 text-xs text-[#7D45C2]">
                                                                    Updating...
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>

                                <div className="border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-7">
                                    <Link
                                        href="/our-products"
                                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#7D45C2] transition hover:gap-3"
                                    >
                                        <Plus size={17} />
                                        Add more products
                                    </Link>
                                </div>
                            </div>


                            {/* Free Shipping Banner */}
                            <div className="flex items-start gap-4 rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2]">
                                    <Truck size={23} />
                                </div>

                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">
                                        Free Shipping on All Orders
                                    </h3>

                                    <p className="mt-1 text-sm leading-6 text-gray-500">
                                        Enjoy complimentary standard delivery on every order,
                                        with no minimum purchase required.
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-gray-400 line-through">
                                            {formatPrice(ORIGINAL_SHIPPING)}
                                        </span>

                                        <span className="text-sm font-bold text-emerald-600">
                                            FREE Shipping
                                        </span>

                                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                            You Save ₹99
                                        </span>
                                    </div>
                                </div>
                            </div>

                        </section>

                        <aside className="lg:sticky lg:top-6">
                            <div className="overflow-hidden rounded-3xl border border-[#E9DDF5] bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
                                    <h2 className="text-xl font-bold text-gray-950">
                                        Order Summary
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Review your total
                                    </p>
                                </div>

                                <div className="space-y-4 px-6 py-6 sm:px-7">
                                    <form
                                        onSubmit={applyCoupon}
                                        className="space-y-2"
                                    >
                                        <label
                                            htmlFor="coupon"
                                            className="block text-sm font-semibold text-gray-800"
                                        >
                                            Have a coupon?
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative min-w-0 flex-1">
                                                <Tag
                                                    size={17}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    id="coupon"
                                                    value={coupon}
                                                    onChange={(event) => {
                                                        setCoupon(event.target.value);
                                                        setCouponMessage("");
                                                    }}
                                                    placeholder="Enter code"
                                                    disabled={appliedCoupon || couponLoading}
                                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10 disabled:bg-gray-50"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={appliedCoupon || couponLoading}
                                                className="rounded-xl border border-[#7D45C2] px-4 text-sm font-bold text-[#7D45C2] transition hover:bg-[#F1E8FA] disabled:opacity-50"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponMessage && (
                                            <p
                                                className={`text-xs ${appliedCoupon ? "text-emerald-600" : "text-red-500"
                                                    }`}
                                            >
                                                {couponMessage}
                                            </p>
                                        )}
                                        {!appliedCoupon && (
                                            <p className="text-xs text-gray-400">
                                                WELCOME10 is automatically applied to eligible accounts
                                            </p>
                                        )}
                                    </form>

                                    <div className="my-5 border-t border-dashed border-gray-200" />

                                    <div className="space-y-4 text-sm">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-gray-500">
                                                Subtotal ({totalItems} items)
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                {formatPrice(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-gray-500">Product discount</span>
                                            <span className="font-semibold text-emerald-600">
                                                -{formatPrice(productDiscount)}
                                            </span>
                                        </div>

                                        {appliedCoupon && (
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="flex items-center gap-1.5 text-gray-500">
                                                    <BadgePercent size={15} />
                                                    Coupon discount
                                                </span>
                                                <span className="font-semibold text-emerald-600">
                                                    -{formatPrice(couponDiscount)}
                                                </span>
                                            </div>
                                        )}


                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-gray-500">
                                                Shipping
                                            </span>

                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-400 line-through">
                                                    {formatPrice(ORIGINAL_SHIPPING)}
                                                </span>

                                                <span className="font-bold text-emerald-600">
                                                    FREE
                                                </span>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="border-t border-gray-100 pt-5">
                                        <div className="flex items-end justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-gray-950">Total Amount</p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Estimated total
                                                </p>
                                            </div>
                                            <p className="text-2xl font-bold tracking-tight text-gray-950">
                                                {formatPrice(total)}
                                            </p>
                                        </div>
                                    </div>

                                    <Link
                                        aria-disabled={items.length === 0 || items.some((item) => !item.inStock)}
                                        href={items.length === 0 || items.some((item) => !item.inStock) ? "#" : "/checkout"}
                                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#6937AA] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </Link>

                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <LockKeyhole size={14} />
                                        Secure checkout
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-2xl border border-[#E9DDF5] bg-white p-4 text-center">
                                <p className="text-xs font-medium text-gray-500">
                                    Secure payment options available at checkout
                                </p>
                                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                    {["UPI", "VISA", "Mastercard", "COD"].map((method) => (
                                        <span
                                            key={method}
                                            className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-gray-600"
                                        >
                                            {method}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </aside>
                    </div>
                )}

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 border-t border-[#E9DDF5] pt-7 text-xs font-medium text-gray-500 sm:text-sm">
                    <span className="flex items-center gap-2">
                        <LockKeyhole size={16} className="text-[#7D45C2]" />
                        Safe & Secure Shopping
                    </span>
                    <span className="flex items-center gap-2">
                        <Truck size={17} className="text-[#7D45C2]" />
                        Reliable Delivery
                    </span>
                    <span className="flex items-center gap-2">
                        <Check size={17} className="text-[#7D45C2]" />
                        Quality Products
                    </span>
                </div>
            </div>
        </main>
    );
}
