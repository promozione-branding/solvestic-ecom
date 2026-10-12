
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import {
    FiChevronRight,
    FiMinus,
    FiPlus,
    FiShoppingBag,
    FiHeart,
    FiStar,
    FiTruck,
    FiShield,
    FiRefreshCw,
    FiCheckCircle,
    FiArrowUpRight,
} from "react-icons/fi";


const product = {
    name: "Rapid Pigment Correcting Face Cleanser",
    category: "Face Cleanser",
    badge: "Best Seller",
    shortDescription:
        "A refreshing daily cleanser designed to leave your skincare routine feeling gentle, clean and comfortable.",
    longDescription:
        "Discover a refreshing cleansing experience with the Solvestic Rapid Pigment Correcting Face Cleanser. Its smooth texture makes it easy to incorporate into your daily skincare routine. Use as directed on the product packaging.",
    images: [
        "/products/1.png",
        "/products/3.png",
        "/products/5.png",
        "/products/3.png",
        "/products/5.png",
    ],
    variants: [
        { size: "50 ml", price: 399, oldPrice: 499 },
        { size: "100 ml", price: 699, oldPrice: 899 },
        { size: "150 ml", price: 899, oldPrice: 1199 },
    ],
    specifications: [
        { key: "Brand", value: "Solvestic" },
        { key: "Product type", value: "Face Cleanser" },
        { key: "Suitable for", value: "Refer to product packaging" },
        { key: "Skin concern", value: "Pigmentation care" },
        { key: "Available sizes", value: "50 ml, 100 ml, 150 ml" },
        { key: "Usage", value: "As directed on the packaging" },
    ],
};

const initialReviews = [
    {
        id: 1,
        name: "Priya Sharma",
        rating: 5,
        title: "Lovely product",
        comment:
            "The packaging looks premium and the cleanser feels nice to use as part of my daily routine.",
        date: "12 September 2026",
    },
    {
        id: 2,
        name: "Ananya Mehta",
        rating: 4,
        title: "Good experience",
        comment:
            "Beautiful packaging and a good overall shopping experience. Would love to explore more products.",
        date: "05 September 2026",
    },
    {
        id: 3,
        name: "Ritika Verma",
        rating: 5,
        title: "Worth trying",
        comment:
            "A nice addition to my skincare routine. The product arrived in good condition.",
        date: "28 August 2026",
    },
];

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);

const tabs = [
    { id: "description", label: "Description" },
    { id: "benefits", label: "Benefits" },
    { id: "specifications", label: "Specifications" },
    { id: "reviews", label: "Reviews" },
];

export default function ProductPage() {
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("description");
    const [wishlist, setWishlist] = useState(false);
    const [purchaseType, setPurchaseType] = useState("one-time");
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [notice, setNotice] = useState("");
    const [reviews, setReviews] = useState(initialReviews);
    const [form, setForm] = useState({
        name: "",
        rating: 5,
        title: "",
        comment: "",
    });


    const variant = product.variants[selectedVariant];

    const displayedPrice =
        purchaseType === "subscription"
            ? Math.round(variant.price * 0.9)
            : variant.price;

    const discount = Math.round(
        ((variant.oldPrice - displayedPrice) / variant.oldPrice) * 100
    );


    const averageRating =
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        (reviews.length || 1);

    const handleAddToCart = () => {
        setNotice(
            `${product.name} (${variant.size}) added to your demo cart.`
        );
    };

    const handleBuyNow = () => {
        setNotice(
            `Demo checkout selected: ${variant.size} × ${quantity}.`
        );
    };

    const handleSubmitReview = (event) => {
        event.preventDefault();

        const newReview = {
            id: Date.now(),
            ...form,
            date: new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            }),
        };

        setReviews((previous) => [newReview, ...previous]);
        setForm({ name: "", rating: 5, title: "", comment: "" });
        setShowReviewForm(false);
        setActiveTab("reviews");
        setNotice("Your demo review has been added.");
    };

    const submitReview = (event) => {
        event.preventDefault();

        setReviews((previous) => [
            {
                ...form,
                id: Date.now(),
                date: new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                }),
            },
            ...previous,
        ]);

        setForm({ name: "", rating: 5, title: "", comment: "" });
        setShowReviewForm(false);
        setActiveTab("reviews");
        setNotice("Your review has been added to this demo page.");
    };

    return (
        <main className="min-h-screen bg-[#fffdfb] text-[#28232f]">
            {/* Breadcrumb */}
            <div className="mx-auto max-w-[1440px] px-5 pb-5 pt-6 sm:px-8 lg:px-12">
                <nav className="flex items-center gap-2 text-xs text-[#996bd2]">
                    <Link href="/" className="hover:text-[#7D45C2]">
                        Home
                    </Link>
                    <FiChevronRight size={12} />
                    <Link href="/our-products" className="hover:text-[#7D45C2]">
                        Shop
                    </Link>
                    <FiChevronRight size={12} />
                    <span className="text-[#26352a]">{product.name}</span>
                </nav>
            </div>

            {/* Product section */}
            <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:px-12">
                {/* Gallery */}
                <div>
                    <div className="relative flex aspect-[4/4] items-center justify-center overflow-hidden border border-[#e4e8dd] bg-[#eef1e8]">
                        <span className="absolute left-5 top-5 z-10 bg-[#fffdfb] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[#7D45C2]">
                            {product.badge}
                        </span>

                        <button
                            type="button"
                            onClick={() => setWishlist(!wishlist)}
                            aria-label="Toggle wishlist"
                            className={`absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center border border-[#dce2d7] bg-white ${wishlist ? "text-red-500" : "text-[#7D45C2]"
                                }`}
                        >
                            <FiHeart
                                size={18}
                                fill={wishlist ? "currentColor" : "none"}
                            />
                        </button>

                        <Image
                            src={product.images[selectedImage]}
                            alt={product.name}
                            width={850}
                            height={950}
                            priority
                            className="h-full max-h-full w-full object-contain transition duration-500"
                        />
                    </div>

                    <div className="mt-4 grid grid-cols-5 gap-3">
                        {product.images.map((image, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedImage(index)}
                                className={`flex aspect-square items-center justify-center border bg-[#fffdfb] ${selectedImage === index
                                    ? "border-[#7D45C2] ring-1 ring-[#7D45C2]"
                                    : "border-[#e2e6dd]"
                                    }`}
                            >
                                <Image
                                    src={image}
                                    alt={`${product.name} view ${index + 1}`}
                                    width={160}
                                    height={160}
                                    className="h-full w-full object-contain"
                                />
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-3 border-y border-[#dbc3f9] py-5">
                        <div className="flex flex-col items-center gap-2 text-center">
                            <FiTruck size={22} className="text-[#7D45C2]" />
                            <span className="text-[10px] text-[#7D45C2] sm:text-xs">
                                Delivery available
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <FiShield size={22} className="text-[#7D45C2]" />
                            <span className="text-[10px] text-[#7D45C2] sm:text-xs">
                                Quality focused
                            </span>
                        </div>
                        <div className="flex flex-col items-center gap-2 text-center">
                            <FiRefreshCw size={22} className="text-[#7D45C2]" />
                            <span className="text-[10px] text-[#7D45C2] sm:text-xs">
                                Customer support
                            </span>
                        </div>
                    </div>
                </div>

                {/* Product information */}
                <div className="pt-1 lg:pt-3">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.24em] text-[#7D45C2]">
                        {product.category}
                    </p>

                    <h1 className="font-serif text-3xl font-medium uppercase leading-tight tracking-wide text-[#253b2a] sm:text-4xl">
                        {product.name}
                    </h1>

                    {/* Rating */}
                    <button
                        type="button"
                        onClick={() => {
                            setActiveTab("reviews");
                            document
                                .getElementById("product-details")
                                ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="flex flex-wrap items-center gap-2 text-sm text-[#7D45C2]"
                    >
                        <span className="flex gap-0.5 text-[#7D45C2]">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <FiStar
                                    key={index}
                                    size={15}
                                    fill={index < Math.round(averageRating) ? "currentColor" : "none"}
                                />
                            ))}
                        </span>
                        <span className="font-medium text-[#344a37]">
                            {averageRating.toFixed(1)}
                        </span>
                        <span>({reviews.length} reviews)</span>
                    </button>

                    {/* Price */}
                    <div className="mt-2 border-b border-[#e2e6dc] pb-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-3xl font-medium tracking-tight">
                                {formatPrice(displayedPrice)}
                            </span>
                            <span className="text-base text-[#92988f] line-through">
                                {formatPrice(variant.oldPrice)}
                            </span>
                            <span className="text-xs font-medium text-[#7D45C2]">
                                {discount}% OFF
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-[#7D45C2]">
                            Inclusive of applicable taxes
                        </p>
                    </div>

                    {/* Size options */}
                    <div className="mt-6">
                        <div className="mb-3 flex items-center justify-between">
                            <label className="text-xs font-semibold">Select size</label>
                            <span className="text-xs text-[#858e82]">{variant.size}</span>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {product.variants.map((item, index) => (
                                <button
                                    key={item.size}
                                    type="button"
                                    onClick={() => setSelectedVariant(index)}
                                    className={`min-w-[100px] border px-4 py-3 text-left transition ${selectedVariant === index
                                        ? "border-[#7D45C2] bg-[#eee7f8] ring-1 ring-[#7D45C2]"
                                        : "border-[#dfe4d9] bg-white hover:border-[#b3a0cf]"
                                        }`}
                                >
                                    <span className="block text-xs font-semibold">
                                        {item.size}
                                    </span>
                                    <span className="mt-1 block text-sm">
                                        {formatPrice(item.price)}
                                    </span>
                                    <span className="mt-1 block text-[10px] text-[#91988e] line-through">
                                        {formatPrice(item.oldPrice)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Purchase option */}
                    <div className="mt-7">
                        <p className="mb-3 text-xs font-semibold">Purchase option</p>

                        <div className="space-y-3">
                            <label className="flex cursor-pointer items-center justify-between gap-4 border border-[#dfe4d9] bg-white px-4 py-4 hover:border-[#b3a0cf]">
                                <span className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="purchaseType"
                                        checked={purchaseType === "one-time"}
                                        onChange={() => setPurchaseType("one-time")}
                                        className="accent-[#7D45C2]"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium">
                                            One-time purchase
                                        </span>
                                        <span className="mt-1 block text-xs text-[#899187]">
                                            Purchase this product once
                                        </span>
                                    </span>
                                </span>
                                <span className="text-sm font-semibold">
                                    {formatPrice(variant.price)}
                                </span>
                            </label>

                            <label className="flex cursor-pointer items-center justify-between gap-4 border border-[#dfe4d9] bg-white px-4 py-4 hover:border-[#b3a0cf]">
                                <span className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="purchaseType"
                                        checked={purchaseType === "subscription"}
                                        onChange={() => setPurchaseType("subscription")}
                                        className="accent-[#7D45C2]"
                                    />
                                    <span>
                                        <span className="block text-sm font-medium">
                                            Subscribe & save
                                        </span>
                                        <span className="mt-1 block text-xs text-[#899187]">
                                            Repeat delivery every 30 days
                                        </span>
                                    </span>
                                </span>
                                <span className="text-right">
                                    <span className="block text-sm font-semibold">
                                        {formatPrice(Math.round(variant.price * 0.9))}
                                    </span>
                                    <span className="text-[10px] text-[#7D45C2]">
                                        Save 10%
                                    </span>
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs font-semibold">Quantity</span>
                        <div className="flex h-11 items-center border border-[#dce2d7] bg-white">
                            <button
                                type="button"
                                aria-label="Decrease quantity"
                                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                className="flex h-full w-11 items-center justify-center hover:bg-[#eee7f8]"
                            >
                                <FiMinus size={14} />
                            </button>
                            <span className="min-w-9 text-center text-sm">{quantity}</span>
                            <button
                                type="button"
                                aria-label="Increase quantity"
                                onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                                className="flex h-full w-11 items-center justify-center hover:bg-[#eee7f8]"
                            >
                                <FiPlus size={14} />
                            </button>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            className="flex min-h-12 items-center justify-center gap-2 bg-[#7D45C2] px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-white transition hover:bg-[#6636a5]"
                        >
                            <FiShoppingBag size={16} />
                            Add to cart
                        </button>

                        <button
                            type="button"
                            onClick={handleBuyNow}
                            className="min-h-12 border border-[#7D45C2] px-5 py-4 text-xs font-medium uppercase tracking-[0.12em] text-[#7041a6] transition hover:bg-[#eee7f8]"
                        >
                            Buy now
                        </button>
                    </div>

                    {notice && (
                        <div
                            role="status"
                            className="mt-4 border border-[#d8c9eb] bg-[#f2ecfa] px-4 py-3 text-xs leading-5 text-[#7041a6]"
                        >
                            {notice}
                            <button
                                type="button"
                                onClick={() => setNotice("")}
                                className="ml-3 font-semibold underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    <p className="mt-4 text-center text-[11px] text-[#8b9288]">
                        Secure checkout · Carefully packed · Customer support
                    </p>
                </div>
            </section>

            {/* Description, specifications and reviews */}
            <section
                id="product-details"
                className="scroll-mt-8 border-y border-[#eee8f2] bg-[#f8f5fb]"
            >
                <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
                    <div className="mx-auto max-w-5xl">
                        <div className="text-center">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8c779e]">
                                THE DETAILS
                            </p>
                            <h2 className="mt-3 font-serif text-3xl font-normal text-[#30253a] sm:text-4xl">
                                Get to know your skincare
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#817786]">
                                Everything you need to know about your selected Solvestic product.
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="mt-10 flex flex-wrap justify-center gap-x-8 border-b border-[#e5ddec]">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative py-4 text-xs transition sm:text-sm ${activeTab === tab.id
                                        ? "font-semibold text-[#7041a6]"
                                        : "text-[#928898] hover:text-[#7041a6]"
                                        }`}
                                >
                                    {tab.label}
                                    {tab.id === "reviews" && ` (${reviews.length})`}
                                    {activeTab === tab.id && (
                                        <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#7D45C2]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="pt-9">
                            {activeTab === "description" && (
                                <div className="mx-auto max-w-3xl text-center">
                                    <h3 className="font-serif text-2xl text-[#30253a]">
                                        About {product.name}
                                    </h3>
                                    <p className="mt-5 text-sm leading-8 text-[#79717f]">
                                        {product.longDescription}
                                    </p>
                                    <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
                                        {[
                                            "Thoughtful daily care",
                                            "Easy-to-use format",
                                            "Made for your routine",
                                        ].map((item) => (
                                            <div
                                                key={item}
                                                className="flex items-center gap-3 border border-[#e8e0ee] bg-white p-4 text-xs text-[#66596f]"
                                            >
                                                <FiCheckCircle className="shrink-0 text-[#7D45C2]" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Full specifications section */}
                            {activeTab === "specifications" && (
                                <div>

                                    <section className="mt-10">
                                        <div className="mb-5">
                                            <p className="text-xs uppercase tracking-[0.2em] text-[#7D45C2]">
                                                Product information
                                            </p>
                                            <h2 className="mt-2 font-serif text-2xl text-[#30253a]">
                                                Product Specifications
                                            </h2>
                                        </div>

                                        <div className="overflow-hidden rounded-xl border border-[#e8e0ee] bg-white">
                                            {product.specifications.map((spec, index) => (
                                                <div
                                                    key={spec.key}
                                                    className={`grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-2 sm:gap-6 ${index !== product.specifications.length - 1
                                                        ? "border-b border-[#eee8f2]"
                                                        : ""
                                                        } ${index % 2 === 0 ? "bg-white" : "bg-[#fcfaff]"}`}
                                                >
                                                    <span className="text-sm text-[#817786]">
                                                        {spec.key}
                                                    </span>
                                                    <span className="break-words text-sm font-medium text-[#30253a]">
                                                        {spec.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>


                                    <div className="overflow-hidden border border-[#e7dfed] bg-white">
                                        {product.specifications.map((spec, index) => (
                                            <div
                                                key={spec.key}
                                                className={`grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[0.8fr_1.2fr] sm:gap-8 sm:px-7 ${index !== product.specifications.length - 1
                                                    ? "border-b border-[#eee8f2]"
                                                    : ""
                                                    } ${index % 2 === 0 ? "bg-white" : "bg-[#fcfaff]"}`}
                                            >
                                                <span className="text-xs font-medium text-[#8a7d94] sm:text-sm">
                                                    {spec.key}
                                                </span>
                                                <span className="break-words text-sm text-[#39313e]">
                                                    {spec.value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="mt-4 text-xs leading-6 text-[#93899b]">
                                        Product information shown here is static demo content.
                                        Update the specifications with the verified details for
                                        your actual product.
                                    </p>
                                </div>
                            )}

                            {activeTab === "reviews" && (
                                <div>
                                    <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                                        <div>
                                            <h3 className="font-serif text-2xl text-[#30253a]">
                                                Customer reviews
                                            </h3>
                                            <div className="mt-3 flex items-center gap-3">
                                                <span className="text-4xl font-medium">
                                                    {averageRating.toFixed(1)}
                                                </span>
                                                <div>
                                                    <div className="flex gap-1 text-[#9a7b42]">
                                                        {Array.from({ length: 5 }).map((_, index) => (
                                                            <FiStar
                                                                key={index}
                                                                size={15}
                                                                fill={
                                                                    index < Math.round(averageRating)
                                                                        ? "currentColor"
                                                                        : "none"
                                                                }
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="mt-1 text-xs text-[#928898]">
                                                        Based on {reviews.length} demo reviews
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowReviewForm(!showReviewForm)}
                                            className="border border-[#7D45C2] px-5 py-3 text-xs font-medium uppercase tracking-wider text-[#7041a6] transition hover:bg-white"
                                        >
                                            {showReviewForm ? "Cancel" : "Write a review"}
                                        </button>
                                    </div>

                                    {showReviewForm && (
                                        <form
                                            onSubmit={submitReview}
                                            className="mt-7 space-y-4 border border-[#e7dfed] bg-white p-5 sm:p-7"
                                        >
                                            <h4 className="font-serif text-xl text-[#30253a]">
                                                Share your experience
                                            </h4>

                                            <div>
                                                <label className="mb-2 block text-xs font-medium">
                                                    Your rating
                                                </label>
                                                <div className="flex gap-2">
                                                    {Array.from({ length: 5 }).map((_, index) => {
                                                        const rating = index + 1;
                                                        return (
                                                            <button
                                                                type="button"
                                                                key={rating}
                                                                onClick={() => setForm({ ...form, rating })}
                                                                aria-label={`${rating} star rating`}
                                                                className="text-[#9a7b42]"
                                                            >
                                                                <FiStar
                                                                    size={22}
                                                                    fill={
                                                                        rating <= form.rating
                                                                            ? "currentColor"
                                                                            : "none"
                                                                    }
                                                                />
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <input
                                                    required
                                                    maxLength={80}
                                                    value={form.name}
                                                    onChange={(event) =>
                                                        setForm({ ...form, name: event.target.value })
                                                    }
                                                    placeholder="Your name"
                                                    className="border border-[#e7dfed] px-4 py-3 text-sm outline-none focus:border-[#7D45C2]"
                                                />
                                                <input
                                                    required
                                                    maxLength={120}
                                                    value={form.title}
                                                    onChange={(event) =>
                                                        setForm({ ...form, title: event.target.value })
                                                    }
                                                    placeholder="Review title"
                                                    className="border border-[#e7dfed] px-4 py-3 text-sm outline-none focus:border-[#7D45C2]"
                                                />
                                            </div>

                                            <textarea
                                                required
                                                minLength={5}
                                                maxLength={2000}
                                                rows={4}
                                                value={form.comment}
                                                onChange={(event) =>
                                                    setForm({ ...form, comment: event.target.value })
                                                }
                                                placeholder="Tell us about your experience..."
                                                className="w-full border border-[#e7dfed] px-4 py-3 text-sm outline-none focus:border-[#7D45C2]"
                                            />

                                            <button
                                                type="submit"
                                                className="bg-[#7D45C2] px-6 py-3 text-xs font-medium uppercase tracking-wider text-white hover:bg-[#6636a5]"
                                            >
                                                Submit review
                                            </button>
                                        </form>
                                    )}

                                    <div className="mt-8 divide-y divide-[#e7dfed]">
                                        {reviews.map((review) => (
                                            <article key={review.id} className="py-6 first:pt-0">
                                                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                                                    <div>
                                                        <div className="flex gap-1 text-[#9a7b42]">
                                                            {Array.from({ length: 5 }).map((_, index) => (
                                                                <FiStar
                                                                    key={index}
                                                                    size={13}
                                                                    fill={
                                                                        index < review.rating
                                                                            ? "currentColor"
                                                                            : "none"
                                                                    }
                                                                />
                                                            ))}
                                                        </div>
                                                        <h4 className="mt-2 text-sm font-semibold text-[#39313e]">
                                                            {review.title}
                                                        </h4>
                                                    </div>
                                                    <span className="text-xs text-[#a198a6]">
                                                        {review.date}
                                                    </span>
                                                </div>
                                                <p className="mt-3 text-sm leading-7 text-[#79717f]">
                                                    {review.comment}
                                                </p>
                                                <p className="mt-4 text-xs font-medium text-[#514658]">
                                                    {review.name}
                                                </p>
                                            </article>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
