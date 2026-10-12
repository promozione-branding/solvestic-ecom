
"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiShoppingCart,
    FiHeart,
    FiSearch,
    FiSliders,
    FiArrowUpRight,
    FiX,
} from "react-icons/fi";

const PRODUCTS = [
    {
        id: 1,
        name: "Rapid Pigment Correcting Face Cleanser",
        category: "Cleansers",
        price: 499,
        oldPrice: 699,
        image: "/products/1.png",
        badge: "Bestseller",
        href: "/our-products/pigment-correcting-face-cleanser",
    },
    {
        id: 2,
        name: "Hydra-Crème 100H",
        category: "Moisturizers",
        price: 599,
        oldPrice: 799,
        image: "/products/2.png",
        badge: "New",
        href: "/our-products/hydra-creme",
    },
    {
        id: 3,
        name: "Daily Glow Cleanser",
        category: "Cleansers",
        price: 449,
        oldPrice: 599,
        image: "/products/3.png",
        badge: "",
        href: "/our-products/daily-glow-cleanser",
    },
    {
        id: 4,
        name: "Hydrating Skin Cream",
        category: "Moisturizers",
        price: 549,
        oldPrice: 749,
        image: "/products/4.png",
        badge: "Popular",
        href: "/our-products/hydrating-skin-cream",
    },
    {
        id: 5,
        name: "Radiance Face Cleanser",
        category: "Cleansers",
        price: 479,
        oldPrice: 649,
        image: "/products/5.png",
        badge: "",
        href: "/our-products/radiance-face-cleanser",
    },
    {
        id: 6,
        name: "Daily Hydration Cream",
        category: "Moisturizers",
        price: 629,
        oldPrice: 849,
        image: "/products/6.png",
        badge: "New",
        href: "/our-products/daily-hydration-cream",
    },
];

const CATEGORIES = [
    "All Products",
    "Cleansers",
    "Moisturizers",
    "Serums",
    "Sunscreen",
];

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);

export default function Products() {
    const [category, setCategory] = useState("All Products");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("featured");
    const [wishlist, setWishlist] = useState([]);
    const [cart, setCart] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
    const [notice, setNotice] = useState("");

    const filteredProducts = useMemo(() => {
        let result = PRODUCTS.filter((product) => {
            const matchesCategory =
                category === "All Products" ||
                product.category === category;

            const matchesSearch = product.name
                .toLowerCase()
                .includes(search.trim().toLowerCase());

            return matchesCategory && matchesSearch;
        });

        if (sort === "price-low") {
            result = [...result].sort((a, b) => a.price - b.price);
        } else if (sort === "price-high") {
            result = [...result].sort((a, b) => b.price - a.price);
        } else if (sort === "newest") {
            result = [...result].sort(
                (a, b) => (b.badge === "New") - (a.badge === "New")
            );
        }

        return result;
    }, [category, search, sort]);

    const toggleWishlist = (id) => {
        setWishlist((previous) =>
            previous.includes(id)
                ? previous.filter((item) => item !== id)
                : [...previous, id]
        );
    };

    const addToCart = (product) => {
        setCart((previous) => [...previous, product]);
        setNotice(`${product.name} added to cart`);
        // Connect this function to your existing cart/API when ready.
    };

    return (
        <main className="min-h-screen bg-[#fffdfb] text-[#28232f]">
            {/* Page hero */}
            {/* <section className="relative overflow-hidden bg-[#f0ebfa] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/60 blur-3xl" />
                <div className="relative mx-auto max-w-[1440px]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#8b78bd] sm:text-xs">
                            The Solvestic collection
                        </p>

                        <h1 className="max-w-3xl text-4xl font-medium leading-[1.08] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
                            Skincare that feels
                            <span className="block font-light text-[#9d91c8]">
                                like self-care.
                            </span>
                        </h1>

                        <p className="mt-5 max-w-lg text-sm leading-7 text-[#77717f] sm:text-base">
                            Explore thoughtful skincare essentials for your
                            everyday routine.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3 text-xs text-[#6f638d]">
                            <span className="rounded-full border border-[#d9d0ed] bg-white/60 px-4 py-2">
                                Everyday essentials
                            </span>
                            <span className="rounded-full border border-[#d9d0ed] bg-white/60 px-4 py-2">
                                Your skincare ritual
                            </span>
                        </div>
                    </motion.div>
                </div>
            </section> */}

            {/* Products */}
            <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
                {/* Toolbar */}
                <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#7D45C2]">
                            Find your favourites
                        </p>
                        <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
                            All Products
                        </h2>
                        {/* <p className="text-sm text-[#85808a]">
                            {filteredProducts.length} products found
                        </p> */}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex h-11 items-center gap-2 rounded-full border border-[#e9e3ef] bg-white px-4 sm:w-[260px]">
                            <FiSearch className="shrink-0 text-[#8b7ab9]" size={17} />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search products..."
                                aria-label="Search products"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#aaa3b0]"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="text-[#88808e]"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>

                        {/* <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#e9e3ef] px-5 text-sm transition hover:border-[#a99bd0]"
                        >
                            <FiSliders size={16} />
                            Filters
                        </button> */}

                        <select
                            value={sort}
                            onChange={(event) => setSort(event.target.value)}
                            aria-label="Sort products"
                            className="h-11 rounded-full border border-[#e9e3ef] bg-white px-4 text-sm outline-none focus:border-[#a99bd0]"
                        >
                            <option value="featured">Featured</option>
                            <option value="newest">Newest</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                        </select>
                    </div>
                </div>

                {/* Category filters */}
                <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map((item) => (
                        <button
                            key={item}
                            type="button"
                            onClick={() => setCategory(item)}
                            className={`shrink-0 rounded-full px-5 py-3 text-xs font-medium transition-all duration-300 sm:text-sm ${category === item
                                ? "bg-[#7D45C2] text-white shadow-md shadow-[#7d68b0]/15"
                                : "border border-[#e9e3ef] bg-white text-[#716a79] hover:border-[#b7a9d8] hover:text-[#7d68b0]"
                                }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Optional filters panel */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-7 overflow-hidden"
                        >
                            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#e9e3ef] bg-white p-4">
                                <span className="mr-2 text-sm font-medium">
                                    Browse by category
                                </span>
                                {CATEGORIES.map((item) => (
                                    <button
                                        key={item}
                                        onClick={() => setCategory(item)}
                                        className={`rounded-full px-4 py-2 text-xs ${category === item
                                            ? "bg-[#eee9f8] text-[#725ca9]"
                                            : "bg-[#faf8fc] text-[#77717f]"
                                            }`}
                                    >
                                        {item}
                                    </button>
                                ))}
                                <button
                                    onClick={() => {
                                        setCategory("All Products");
                                        setSearch("");
                                        setSort("featured");
                                    }}
                                    className="ml-auto text-xs text-[#8b78bd] underline underline-offset-4"
                                >
                                    Clear all
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Product grid */}
                <motion.div
                    layout
                    className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredProducts.map((product) => {
                            const isWishlisted = wishlist.includes(product.id);

                            return (
                                <motion.article
                                    layout
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    transition={{ duration: 0.35 }}
                                    className="group relative overflow-hidden rounded-[16px] border border-[#f0eaf3] bg-white transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(75,55,100,0.09)] sm:rounded-[20px]"
                                >
                                    {/* Product image */}
                                    <div className="relative overflow-hidden bg-[#f3effa]">
                                        <Link
                                            href={product.href}
                                            aria-label={`View ${product.name}`}
                                            className="relative block aspect-[1/1]"
                                        >
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 23vw"
                                                className="object-contain transition-transform duration-700 group-hover:scale-105"
                                            />
                                        </Link>

                                        {product.badge && (
                                            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-medium text-[#7D45C2] shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
                                                {product.badge}
                                            </span>
                                        )}

                                        {/* Wishlist */}
                                        <button
                                            type="button"
                                            onClick={() => toggleWishlist(product.id)}
                                            aria-label={
                                                isWishlisted
                                                    ? `Remove ${product.name} from wishlist`
                                                    : `Add ${product.name} to wishlist`
                                            }
                                            aria-pressed={isWishlisted}
                                            className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition sm:right-3 sm:top-3 ${isWishlisted
                                                ? "bg-[#7D45C2] text-white"
                                                : "bg-white/90 text-[#7D45C2] hover:bg-[#7D45C2] hover:text-white"
                                                }`}
                                        >
                                            <FiHeart
                                                size={17}
                                                className={isWishlisted ? "fill-current" : ""}
                                            />
                                        </button>
                                    </div>

                                    {/* Product details */}
                                    <div className="p-3 sm:p-4">
                                        <p className="mb-1 text-[9px] uppercase tracking-[0.15em] text-[#7D45C2] sm:text-[10px]">
                                            {product.category}
                                        </p>

                                        <Link href={product.href}>
                                            <h3 className="line-clamp-2 text-xs font-medium leading-5 text-[#302b35] transition-colors hover:text-[#7D45C2] sm:text-base">
                                                {product.name}
                                            </h3>
                                        </Link>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                                            <span className="text-sm font-semibold text-[#28232f] sm:text-base">
                                                {formatPrice(product.price)}
                                            </span>
                                            <span className="text-[10px] text-[#aaa2af] line-through sm:text-xs">
                                                {formatPrice(product.oldPrice)}
                                            </span>
                                            <span className="text-[9px] font-medium text-[#7D45C2] sm:text-[10px]">
                                                {Math.round(
                                                    ((product.oldPrice - product.price) /
                                                        product.oldPrice) *
                                                    100
                                                )}
                                                % OFF
                                            </span>
                                        </div>

                                        {/* Add to cart */}
                                        <button
                                            type="button"
                                            onClick={() => addToCart(product)}
                                            aria-label={`Add ${product.name} to cart`}
                                            className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#eee9f8] text-[#7D45C2] transition-all duration-300 hover:bg-[#7D45C2] hover:text-white active:scale-[0.98] sm:h-11"
                                        >
                                            <FiShoppingCart size={17} />
                                            <span className="text-xs font-medium">
                                                Add to Cart
                                            </span>
                                        </button>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>

                {/* Empty state */}
                {filteredProducts.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ebfa] text-[#7D45C2]">
                            <FiSearch size={22} />
                        </div>
                        <h3 className="mt-5 text-lg font-medium">
                            No products found
                        </h3>
                        <p className="mt-2 text-sm text-[#85808a]">
                            Try another search or choose a different category.
                        </p>
                        <button
                            onClick={() => {
                                setCategory("All Products");
                                setSearch("");
                            }}
                            className="mt-5 rounded-full bg-[#7D45C2] px-5 py-3 text-xs font-medium text-white"
                        >
                            View all products
                        </button>
                    </div>
                )}

                {/* Cart feedback */}
                <AnimatePresence>
                    {notice && (
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#29232f] px-5 py-3 text-xs text-white shadow-xl"
                        >
                            <FiShoppingCart size={16} />
                            <span>{notice}</span>
                            <button
                                onClick={() => setNotice("")}
                                aria-label="Dismiss notification"
                            >
                                <FiX size={15} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>
        </main>
    );
}
