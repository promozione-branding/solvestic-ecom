"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    Heart,
    LoaderCircle,
    ShoppingBag,
    Trash2,
} from "lucide-react";

const WISHLIST_KEY = "solvestic_wishlist";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(price) || 0);

function getPrice(product) {
    return Number(product?.variants?.[0]?.price ?? 0);
}

function getOldPrice(product) {
    return Number(
        product?.variants?.[0]?.oldPrice ??
        product?.variants?.[0]?.mrp ??
        product?.variants?.[0]?.price ??
        0
    );
}

function getImage(product) {
    return (
        product?.images?.[0]?.url ||
        product?.imageUrl ||
        product?.thumbnail ||
        product?.image ||
        "/placeholder.png"
    );
}

export default function Wishlist() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem(WISHLIST_KEY) || "[]"
            );

            setItems(Array.isArray(saved) ? saved : []);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const saveWishlist = (nextItems) => {
        try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(nextItems));
            setItems(nextItems);
            setMessage("");
        } catch {
            setMessage("Unable to save your wishlist in this browser.");
        }
    };

    const removeItem = (productId) => {
        saveWishlist(
            items.filter(
                (item) =>
                    String(item._id || item.id || item.productId) !==
                    String(productId)
            )
        );
    };

    const clearWishlist = () => saveWishlist([]);

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-[#F7F2FC]">
                <LoaderCircle className="animate-spin text-[#7D45C2]" size={28} />
            </main>
        );
    }

    console.log(items);


    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-10 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Link
                            href="/"
                            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#7D45C2]"
                        >
                            <ArrowLeft size={16} />
                            Back to Home
                        </Link>

                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7D45C2]">
                            YOUR COLLECTION
                        </p>

                        <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-5xl">
                            My Wishlist
                            <span className="ml-3 text-lg font-medium text-gray-400">
                                ({items.length})
                            </span>
                        </h1>

                        <p className="mt-3 text-sm text-gray-500 sm:text-base">
                            Your favourite products, all in one place.
                        </p>
                    </div>

                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={clearWishlist}
                            className="text-sm font-semibold text-red-500 transition hover:text-red-700"
                        >
                            Clear wishlist
                        </button>
                    )}
                </div>

                {message && (
                    <p role="alert" className="mb-5 text-sm text-red-600">
                        {message}
                    </p>
                )}

                {items.length === 0 ? (
                    <div className="rounded-3xl border border-[#E9DDF5] bg-white px-6 py-16 text-center shadow-sm sm:py-24">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F1E8FA] text-[#7D45C2]">
                            <Heart size={34} />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            Your wishlist is empty
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                            Save products you love and come back to them whenever
                            you&apos;re ready.
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
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((product) => {
                            const id = product._id || product.id || product.productId;
                            const price = getPrice(product);
                            const oldPrice = getOldPrice(product);

                            return (
                                <article
                                    key={String(id)}
                                    className="group overflow-hidden rounded-2xl border border-[#E9DDF5] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                                >
                                    <div className="relative aspect-[4/4.5] overflow-hidden bg-[#F7F2FC]">
                                        <Link
                                            href={
                                                product.slug
                                                    ? `/our-products/${product.slug}`
                                                    : "/our-products"
                                            }
                                            className="block h-full w-full"
                                        >
                                            <img
                                                src={getImage(product)}
                                                alt={product.name || product.title || "Product"}
                                                className="h-full w-full object- transition duration-500 group-hover:scale-105"
                                            />
                                        </Link>

                                        <button
                                            type="button"
                                            onClick={() => removeItem(id)}
                                            aria-label="Remove from wishlist"
                                            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-500 shadow-sm transition hover:bg-red-50"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>

                                    <div className="p-5">
                                        <Link
                                            href={
                                                product.slug
                                                    ? `/our-products/${product.slug}`
                                                    : "/our-products"
                                            }
                                            className="line-clamp-2 font-semibold text-gray-900 transition hover:text-[#7D45C2]"
                                        >
                                            {product.name || product.title || "Product"}
                                        </Link>

                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            <p className="text-lg font-bold text-gray-950">
                                                {formatPrice(price)}
                                            </p>

                                            {oldPrice > price && (
                                                <>
                                                    <p className="text-sm text-gray-400 line-through">
                                                        {formatPrice(oldPrice)}
                                                    </p>

                                                    <span className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                                                        {Math.round(((oldPrice - price) / oldPrice) * 100)}% OFF
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <Link
                                            href={
                                                product.slug
                                                    ? `/our-products/${product.slug}`
                                                    : "/our-products"
                                            }
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA]"
                                        >
                                            <ShoppingBag size={16} />
                                            View Product
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
