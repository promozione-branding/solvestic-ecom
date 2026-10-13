
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    BadgePercent,
    Check,
    ChevronRight,
    Heart,
    LockKeyhole,
    Minus,
    Plus,
    ShoppingBag,
    ShoppingCart,
    Tag,
    Trash2,
    Truck,
} from "lucide-react";

const initialItems = [
    {
        id: 1,
        name: "Solvestic Premium Chair",
        variant: "Black / Premium Edition",
        price: 12999,
        oldPrice: 15999,
        quantity: 1,
        image: "/products/chair-1.png",
        inStock: true,
    },
    {
        id: 2,
        name: "Solvestic Ergonomic Chair",
        variant: "Grey / Standard Edition",
        price: 8999,
        oldPrice: 10999,
        quantity: 1,
        image: "/products/chair-2.png",
        inStock: true,
    },
];

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);

export default function Cart() {
    const [items, setItems] = useState(initialItems);
    const [coupon, setCoupon] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(false);
    const [couponMessage, setCouponMessage] = useState("");

    const updateQuantity = (id, change) => {
        setItems((current) =>
            current.map((item) =>
                item.id === id
                    ? {
                        ...item,
                        quantity: Math.max(
                            1,
                            Math.min(10, item.quantity + change)
                        ),
                    }
                    : item
            )
        );
    };

    const removeItem = (id) => {
        setItems((current) => current.filter((item) => item.id !== id));
    };

    const subtotal = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    const originalTotal = items.reduce(
        (total, item) => total + item.oldPrice * item.quantity,
        0
    );

    const discount = originalTotal - subtotal;
    const couponDiscount = appliedCoupon ? Math.round(subtotal * 0.1) : 0;
    const shipping = subtotal === 0 || subtotal >= 1999 ? 0 : 99;
    const total = subtotal - couponDiscount + shipping;
    const totalItems = items.reduce((total, item) => total + item.quantity, 0);

    const applyCoupon = (e) => {
        e.preventDefault();
        const value = coupon.trim().toUpperCase();

        if (!value) {
            setCouponMessage("Please enter a coupon code.");
            return;
        }

        // Demo UI coupon only.
        if (value === "WELCOME10" && !appliedCoupon) {
            setAppliedCoupon(true);
            setCouponMessage("WELCOME10 applied — you saved 10%!");
        } else if (value === "WELCOME10" && appliedCoupon) {
            setCouponMessage("This coupon is already applied.");
        } else {
            setCouponMessage("Invalid coupon code. Try WELCOME10.");
        }
    };

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-7 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="transition hover:text-[#7D45C2]">
                        Home
                    </Link>
                    <ChevronRight size={15} />
                    <span className="font-medium text-gray-900">Shopping Cart</span>
                </div>

                {/* Page heading */}
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

                {items.length === 0 ? (
                    <div className="rounded-3xl border border-[#E9DDF5] bg-white px-6 py-16 text-center shadow-sm sm:py-24">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F1E8FA] text-[#7D45C2]">
                            <ShoppingBag size={34} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            Your cart is empty
                        </h2>
                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                            Looks like you haven't added anything to your cart
                            yet. Explore our collection and find something you love.
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
                        {/* Cart items */}
                        <section className="space-y-5">
                            <div className="overflow-hidden rounded-3xl border border-[#E9DDF5] bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-7">
                                    <h2 className="font-bold text-gray-900">
                                        Cart Items
                                    </h2>
                                    <span className="text-xs text-gray-400">
                                        Prices include applicable taxes
                                    </span>
                                </div>

                                <div className="divide-y divide-gray-100 px-4 sm:px-7">
                                    {items.map((item) => (
                                        <article
                                            key={item.id}
                                            className="flex flex-col gap-4 py-6 sm:flex-row sm:gap-6"
                                        >
                                            {/* Product image */}
                                            <Link
                                                href="/our-products"
                                                className="relative block aspect-[4/3] w-full shrink-0 overflow-hidden rounded-2xl bg-[#F7F2FC] sm:aspect-square sm:w-36"
                                            >
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, 144px"
                                                    className="object-contain p-3 transition duration-500 hover:scale-105"
                                                />
                                                <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#7D45C2] shadow-sm">
                                                    SALE
                                                </span>
                                            </Link>

                                            {/* Product details */}
                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                                                <div>
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <Link
                                                                href="/our-products"
                                                                className="text-base font-bold text-gray-900 transition hover:text-[#7D45C2] sm:text-lg"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                            <p className="mt-1.5 text-xs text-gray-500 sm:text-sm">
                                                                {item.variant}
                                                            </p>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.id)}
                                                            aria-label={`Remove ${item.name}`}
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>

                                                    <div className="mt-3 flex items-center gap-2">
                                                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                            In stock
                                                        </span>
                                                        <span className="text-gray-300">|</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                // UI only
                                                            }}
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-[#7D45C2]"
                                                        >
                                                            <Heart size={14} />
                                                            Save for later
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-end justify-between gap-4">
                                                    {/* Quantity */}
                                                    <div className="inline-flex items-center rounded-xl border border-gray-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => updateQuantity(item.id, -1)}
                                                            disabled={item.quantity <= 1}
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
                                                            onClick={() => updateQuantity(item.id, 1)}
                                                            disabled={item.quantity >= 10}
                                                            aria-label="Increase quantity"
                                                            className="flex h-10 w-10 items-center justify-center text-gray-600 transition hover:text-[#7D45C2] disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            <Plus size={15} />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <p className="text-lg font-bold text-gray-950">
                                                            {formatPrice(item.price * item.quantity)}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400 line-through">
                                                            {formatPrice(item.oldPrice * item.quantity)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
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

                            {/* Delivery information */}
                            <div className="flex items-start gap-4 rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2]">
                                    <Truck size={23} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        Complimentary shipping
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-gray-500">
                                        Enjoy free shipping on eligible orders.
                                        Final delivery charges and estimated dates
                                        will be confirmed at checkout.
                                    </p>
                                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-100">
                                        <div
                                            className="h-full rounded-full bg-[#7D45C2] transition-all"
                                            style={{
                                                width: `${Math.min((subtotal / 1999) * 100, 100)}%`,
                                            }}
                                        />
                                    </div>
                                    <p className="mt-2 text-xs font-medium text-gray-500">
                                        {subtotal >= 1999
                                            ? "You've unlocked free shipping!"
                                            : `Add ${formatPrice(1999 - subtotal)} more for free shipping.`}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Order summary */}
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
                                    {/* Coupon */}
                                    <form onSubmit={applyCoupon}>
                                        <label
                                            htmlFor="coupon"
                                            className="mb-2 block text-sm font-semibold text-gray-800"
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
                                                    onChange={(e) => {
                                                        setCoupon(e.target.value);
                                                        setCouponMessage("");
                                                    }}
                                                    placeholder="Enter code"
                                                    disabled={appliedCoupon}
                                                    className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10 disabled:bg-gray-50"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={appliedCoupon}
                                                className="rounded-xl border border-[#7D45C2] px-4 text-sm font-bold text-[#7D45C2] transition hover:bg-[#F1E8FA] disabled:opacity-50"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponMessage && (
                                            <p
                                                className={`mt-2 text-xs ${appliedCoupon
                                                        ? "text-emerald-600"
                                                        : "text-red-500"
                                                    }`}
                                            >
                                                {couponMessage}
                                            </p>
                                        )}
                                        {!appliedCoupon && (
                                            <p className="mt-2 text-xs text-gray-400">
                                                Demo code: WELCOME10
                                            </p>
                                        )}
                                    </form>

                                    <div className="my-5 border-t border-dashed border-gray-200" />

                                    {/* Price breakdown */}
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
                                            <span className="text-gray-500">
                                                Product discount
                                            </span>
                                            <span className="font-semibold text-emerald-600">
                                                -{formatPrice(discount)}
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
                                            <span
                                                className={`font-semibold ${shipping === 0
                                                        ? "text-emerald-600"
                                                        : "text-gray-900"
                                                    }`}
                                            >
                                                {shipping === 0
                                                    ? "FREE"
                                                    : formatPrice(shipping)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-5">
                                        <div className="flex items-end justify-between gap-3">
                                            <div>
                                                <p className="font-bold text-gray-950">
                                                    Total Amount
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    Inclusive of applicable taxes
                                                </p>
                                            </div>
                                            <p className="text-2xl font-bold tracking-tight text-gray-950">
                                                {formatPrice(total)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Checkout is not connected yet.
                                        }}
                                        className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-4 text-sm font-bold text-white transition hover:bg-[#6937AA]"
                                    >
                                        Proceed to Checkout
                                        <ArrowRight
                                            size={18}
                                            className="transition-transform group-hover:translate-x-1"
                                        />
                                    </button>

                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                        <LockKeyhole size={14} />
                                        Secure checkout
                                    </div>
                                </div>
                            </div>

                            {/* Payment methods placeholder */}
                            <div className="mt-4 rounded-2xl border border-[#E9DDF5] bg-white p-4 text-center">
                                <p className="text-xs font-medium text-gray-500">
                                    Secure payment options available at checkout
                                </p>
                                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                                    {["UPI", "VISA", "Mastercard", "COD"].map(
                                        (method) => (
                                            <span
                                                key={method}
                                                className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-gray-600"
                                            >
                                                {method}
                                            </span>
                                        )
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                )}

                {/* Bottom reassurance */}
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
