"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
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
    FiX,
} from "react-icons/fi";
import { AnimatePresence, motion, } from "framer-motion";
import { addToGuestCart } from "@/lib/cart-storage";
import { Check, ChevronLeft, ChevronRight, Heart, Minus, Plus, ShoppingBag, Star, MapPin, LoaderCircle, } from "lucide-react";
import TextureDetailsSection from "@/components/ourproducts/TextureDetailsSection";
import ReviewsSection from "@/components/ourproducts/Review";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const WISHLIST_KEY = "solvestic_wishlist";

const getProductImages = (product) => {
    const images = (product?.images || [])
        .map((image) =>
            typeof image === "string" ? image : image?.url
        )
        .filter(Boolean);

    if (images.length) return images;

    const fallback = product?.imageUrl || product?.thumbnail || product?.image;

    return fallback ? [fallback] : ["/placeholder.png"];
};

const getProductId = (product) =>
    String(product?._id || product?.id || "");

const getVariantPrice = (variant) =>
    Number(variant?.price ?? 0);

const getVariantOldPrice = (variant) =>
    Number(variant?.oldPrice ?? variant?.mrp ?? variant?.price ?? 0);

const getVariantName = (variant) => String(variant?.size || variant?.name || "");

export default function ProductPage({ initialProduct, slug }) {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const router = useRouter();
    const product = initialProduct;
    const productId = getProductId(product);
    const images = useMemo(() => getProductImages(product), [product]);
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("description");
    const [wishlist, setWishlist] = useState(false);
    const [adding, setAdding] = useState(false);
    const [notice, setNotice] = useState("");
    const [routineOptions, setRoutineOptions] = useState({});
    const [addingRoutine, setAddingRoutine] = useState(false);
    const [selectedRoutine, setSelectedRoutine] = useState([]);
    const [pincode, setPincode] = useState("");
    const [checkingPincode, setCheckingPincode] = useState(false);
    const [pincodeResult, setPincodeResult] = useState(null);

    const [allProducts, setAllProducts] = useState([]);
    useEffect(() => {
        const fetchProducts = async () => {
            const params = {};
            try {
                const { data } = await axios.get("/api/admin/products", { params });
                console.log(data);
                const products = Array.isArray(data.products)
                    ? data.products : data.products ? [data.products] : [];

                setAllProducts(products);
            } catch (error) {
                console.error("Failed to fetch related products:", error);
            }
        };

        fetchProducts();
    }, []);

    const currentProductId = String(product?._id || product?.id || "");

    const getCategoryId = (item) => String(
        item?.categoryId?._id ||
        item?.categoryId?.id ||
        item?.categoryId ||
        item?.category?._id ||
        item?.category?.id ||
        item?.category ||
        "");

    const activeProducts = allProducts.filter((item) =>
        String(item?._id || item?.id || "") !== currentProductId &&
        (!item?.status || item.status === "active"));

    const currentCategoryId = getCategoryId(product);

    const relatedProducts = currentCategoryId ? activeProducts.filter(
        (item) => getCategoryId(item) === currentCategoryId) : [];

    const routineProducts = [
        ...relatedProducts,
        ...activeProducts.filter(
            (item) => !relatedProducts.some(
                (related) =>
                    String(related._id || related.id) ===
                    String(item._id || item.id)
            )
        ),
    ].slice(0, 2).map((item) => {
        const variants = Array.isArray(item.variants)
            ? item.variants
            : [];

        const firstImage = item.images?.[0];

        return {
            id: String(item._id || item.id),
            name: item.name || "Product",
            description:
                item.shortDescription ||
                item.description ||
                "Discover this product.",
            price: Number(
                variants[0]?.price ?? item.price ?? item.salePrice ?? 0
            ),
            image:
                (typeof firstImage === "string"
                    ? firstImage
                    : firstImage?.url) ||
                item.imageUrl ||
                item.thumbnail ||
                item.image ||
                "/placeholder.png",
            options: variants
                .map((variant) => variant.size || variant.name)
                .filter(Boolean),
        };
    });

    const selectedRoutineTotal = routineProducts
        .filter((item) => selectedRoutine.includes(item.id))
        .reduce((total, item) => total + item.price, 0);

    const variant = variants[selectedVariant] || variants[0] || null;
    const price = variant ? getVariantPrice(variant) : 0;
    const oldPrice = variant ? getVariantOldPrice(variant) : 0;
    const discount = oldPrice > price && oldPrice > 0 ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;

    const shortDescription = product?.shortDescription || product?.description || "";

    useEffect(() => {
        // setSelectedImage(0);
        setSelectedVariant(0);
        setQuantity(1);
        setActiveTab("description");
        setNotice("");
    }, [slug]);

    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem(WISHLIST_KEY) || "[]"
            );

            setWishlist(
                Array.isArray(saved) &&
                saved.some((item) => getProductId(item) === productId)
            );
        } catch {
            setWishlist(false);
        }
    }, [productId]);

    const toggleWishlist = () => {
        try {
            const saved = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
            const items = Array.isArray(saved) ? saved : [];
            const exists = items.some((item) => getProductId(item) === productId);
            const updated = exists ? items.filter((item) => getProductId(item) !== productId) : [...items, product];
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
            setWishlist(!exists);
            window.dispatchEvent(new CustomEvent("solvestic-wishlist-updated"));
            setNotice(exists ? "Removed from wishlist" : "Added to wishlist");
        } catch (error) {
            console.error("Wishlist update failed:", error);
            setNotice("Unable to update wishlist");
        }
    };

    const handleAddToCart = async (goToCart = false) => {
        if (!productId || !variant) {
            toast.error("This product currently has no available variants.");
            return;
        }

        const variantName = getVariantName(variant);

        if (!variantName) {
            toast.error("Please select a valid product variant.");
            return;
        }

        setAdding(true);
        setNotice("");

        try {
            if (isAuthenticated) {
                const response = await axios.post("/api/user/cart", {
                    productId,
                    quantity,
                    variant: variantName,
                });

                if (!response.data?.success) {
                    throw new Error(
                        response.data?.message || "Unable to add product to cart."
                    );
                }
                toast.success(`${product.name} (${variantName}) added to cart.`);
            } else {
                const result = addToGuestCart(productId, quantity, variant);

                if (result?.success === false) {
                    throw new Error(
                        result.message || "Unable to add product to cart."
                    );
                }
            }

            window.dispatchEvent(new Event("solvestic-cart-updated"));

            if (goToCart) {
                router.push("/cart");
                return;
            }
            setNotice(`${product.name} (${variantName}) added to cart.`);
        } catch (error) {
            console.error("Add to cart failed:", error);

            setNotice(
                error?.response?.data?.message ||
                error?.message ||
                "Unable to add product to cart."
            );
        } finally {
            setAdding(false);
        }
    };

    const [galleryIndex, setGalleryIndex] = useState(0);
    const [variantIndex, setVariantIndex] = useState(0);
    const productImages = (product?.images?.map((image) =>
        typeof image === "string" ? image : image?.url).filter(Boolean) || []);

    const galleryImages = productImages.length ? productImages
        : [product?.imageUrl || product?.thumbnail || "/placeholder.png"];

    const activeVariant = variants[variantIndex] || variants[0];
    const formatPrice = (value) => new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

    const currentImage = galleryImages[galleryIndex] || galleryImages[0];
    const description = product?.shortDescription || product?.description || "Discover the details of this product.";

    const checkPincode = async (event) => {
        event.preventDefault();

        const code = pincode.trim();

        if (!/^[1-9][0-9]{5}$/.test(code)) {
            setPincodeResult({
                success: false,
                message: "Enter a valid 6-digit PIN code.",
            });
            return;
        }

        setCheckingPincode(true);
        setPincodeResult(null);

        try {
            const { data } = await axios.get("/api/user/shipping/check-pincode",
                { params: { pincode: code }, }
            );

            setPincodeResult(data);
        } catch (error) {
            setPincodeResult({
                success: false,
                message:
                    error.response?.data?.message ||
                    "Unable to check delivery. Please try again.",
            });
        } finally {
            setCheckingPincode(false);
        }
    };

    const changeImage = (index) => {
        setGalleryIndex((index + galleryImages.length) % galleryImages.length);
    };

    if (!product) return null;
    console.log(product)
    return (
        <main className="min-h-screen bg-[#fffdfb] text-[#28232f]">
            <div className="mx-auto max-w-[1440px] px-5 pb-5 pt-6 sm:px-8 lg:px-12">
                <nav className="flex flex-wrap items-center gap-2 text-xs text-[#996bd2]">
                    <Link href="/" className="hover:text-[#7D45C2]">
                        Home
                    </Link>
                    <FiChevronRight size={12} />
                    <Link
                        href="/our-products"
                        className="hover:text-[#7D45C2]"
                    >
                        Shop
                    </Link>
                    <FiChevronRight size={12} />
                    <span className="text-[#26352a]">
                        {product.name}
                    </span>
                </nav>
            </div>

            <section id="product"
                className="grid grid-cols-1 gap-6 px-3 pb-12 pt-4 sm:px-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-8 lg:px-6"
            >
                {/* STICKY PRODUCT GALLERY */}
                <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="relative lg:sticky lg:top-24 lg:self-start"
                >
                    <div className="relative h-[480px] overflow-hidden rounded-2xl bg-[#f3f0f6] sm:h-[600px] lg:h-[calc(100vh-120px)] lg:min-h-[560px] lg:max-h-[850px]">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={currentImage}
                                src={currentImage}
                                alt={product?.name || "Product image"}
                                initial={{ opacity: 0, scale: 1.025 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.35 }}
                                draggable={false}
                                onError={(event) => {
                                    event.currentTarget.style.visibility = "hidden";
                                }}
                                className="absolute z-10 inset-0 h-full w-full object-contain"
                            />
                        </AnimatePresence>

                        {/* Soft background */}
                        <div className="pointer-events-none absolute inset-0 -z-0 bg-gradient-to-br from-[#eee7f5] to-[#f8f6fa]" />

                        {/* Image thumbnails */}
                        {galleryImages.length > 1 && (
                            <div className="absolute bottom-5 left-4 top-5 z-10 flex flex-col justify-center gap-3 sm:left-5">
                                {galleryImages.map((image, index) => (
                                    <motion.button
                                        key={`${image}-${index}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => changeImage(index)}
                                        aria-label={`View image ${index + 1}`}
                                        className={`h-12 w-12 overflow-hidden rounded-xl border bg-white/70 transition sm:h-16 sm:w-16 ${galleryIndex === index
                                            ? "border-[#7D45C2] p-0.5 shadow-md"
                                            : "border-white/70 opacity-75 hover:opacity-100"
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt=""
                                            className="h-full w-full rounded-[9px] object-cover"
                                        />
                                    </motion.button>
                                ))}
                            </div>
                        )}

                        {/* Gallery navigation */}
                        {galleryImages.length > 1 && (
                            <div className="absolute bottom-5 right-5 z-10 flex gap-2">
                                <button
                                    onClick={() => changeImage(galleryIndex - 1)}
                                    aria-label="Previous image"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/75 backdrop-blur transition hover:bg-white"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <button
                                    onClick={() => changeImage(galleryIndex + 1)}
                                    aria-label="Next image"
                                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/75 backdrop-blur transition hover:bg-white"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        )}

                        {/* Image counter */}
                        <div className="absolute right-5 top-5 z-10 rounded-full border border-white/70 bg-white/75 px-3 py-1.5 text-[10px] tracking-widest text-[#51465f] backdrop-blur">
                            {String(galleryIndex + 1).padStart(2, "0")} /{" "}
                            {String(galleryImages.length).padStart(2, "0")}
                        </div>
                    </div>
                </motion.div>

                {/* PRODUCT INFORMATION — NORMAL PAGE SCROLL */}
                <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.65, delay: 0.1 }}
                    className="flex min-w-0 flex-col rounded-2xl bg-[#faf9fb] px-5 py-7 sm:px-8 sm:py-9 lg:px-9 lg:py-8 xl:px-11"
                >
                    {/* Product title and wishlist */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#7D45C2]">
                                {typeof product?.categoryId === "object"
                                    ? product.categoryId?.name
                                    : typeof product?.category === "object"
                                        ? product.category?.name
                                        : product?.category || "SOLVESTIC"}
                            </p>

                            <h1 className="break-words text-[40px] font-bold leading-[1] tracking-[-0.015em] text-[#28222e]">
                                {product?.name}
                            </h1>
                        </div>

                        <button
                            onClick={toggleWishlist}
                            aria-label="Toggle wishlist"
                            className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#e8e1ee] transition hover:border-[#7D45C2] hover:bg-[#f0e8f8]"
                        >
                            <Heart
                                size={20}
                                strokeWidth={1.5}
                                fill={wishlist ? "#7D45C2" : "none"}
                                color={wishlist ? "#7D45C2" : "#51465f"}
                            />
                        </button>
                    </div>

                    <div className="flex justify-between items-center gap-2 mt-2">
                        {/* Price */}
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-2xl font-medium tracking-tight text-[#28222e]">
                                {formatPrice(activeVariant?.price)}
                            </span>

                            {Number(activeVariant?.oldPrice) > Number(activeVariant?.price) && (
                                <>
                                    <span className="text-sm text-[#9a929e] line-through">
                                        {formatPrice(activeVariant.oldPrice)}
                                    </span>

                                    <span className="rounded-full bg-[#eee5f7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#7D45C2]">
                                        {Math.round(
                                            ((Number(activeVariant.oldPrice) -
                                                Number(activeVariant.price)) /
                                                Number(activeVariant.oldPrice)) *
                                            100
                                        )}
                                        % off
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Static review rating */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5 text-[#7D45C2]">
                                {[1, 2, 3, 4,].map((star) => (
                                    <Star
                                        key={star}
                                        size={14}
                                        fill="currentColor"
                                        strokeWidth={1}
                                    />
                                ))}
                                <Star
                                    size={14}
                                    fill="currentColor"
                                    className="text-gray-300"
                                    strokeWidth={1}
                                />
                            </div>
                            <span className="text-xs text-[#716a78]">
                                (20)
                            </span>
                        </div>
                    </div>

                    {/* Short description */}
                    <p className="mt-4 text-[14px] leading-7 text-[#716a78] sm:text-[15px]">
                        {description}
                    </p>

                    <div className="mt-5 rounded-2xl border border-[#e8e1ee] bg-white p-4 sm:p-5">
                        <div className="flex items-center gap-2">
                            <MapPin size={19} className="text-[#7D45C2]" />
                            <h3 className="text-sm font-semibold text-[#302936]">
                                Check delivery availability
                            </h3>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-[#89818f]">
                            Enter your PIN code to check delivery availability at your location.
                        </p>

                        <form
                            onSubmit={checkPincode}
                            className="mt-4 flex flex-col gap-2 sm:flex-row"
                        >
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="postal-code"
                                maxLength={6}
                                value={pincode}
                                onChange={(event) => {
                                    setPincode(
                                        event.target.value.replace(/\D/g, "").slice(0, 6)
                                    );
                                    setPincodeResult(null);
                                }}
                                placeholder="Enter 6-digit PIN code"
                                aria-label="Delivery PIN code"
                                className="min-w-0 flex-1 rounded-xl border border-[#e4dce9] bg-[#fffdfb] px-4 py-3 text-sm text-[#302936] outline-none transition placeholder:text-[#aaa1b1] focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10"
                            />

                            <button
                                type="submit"
                                disabled={checkingPincode || pincode.length !== 6}
                                className="flex min-h-[46px] items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#6936aa] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {checkingPincode && (
                                    <LoaderCircle size={16} className="animate-spin" />
                                )}
                                {checkingPincode ? "Checking..." : "Check"}
                            </button>
                        </form>

                        {pincodeResult && (
                            <div
                                role="status"
                                className={`mt-3 rounded-xl px-3 py-3 text-sm ${pincodeResult.serviceable
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-600"
                                    }`}
                            >
                                <div className="flex items-start gap-2">
                                    {pincodeResult.serviceable ? (
                                        <Check size={17} className="mt-0.5 shrink-0" />
                                    ) : (
                                        <FiX size={17} className="mt-0.5 shrink-0" />
                                    )}

                                    <div>
                                        <p>{pincodeResult.message}</p>

                                        {pincodeResult.serviceable &&
                                            pincodeResult.estimatedDelivery && (
                                                <p className="mt-1 text-xs">
                                                    Estimated delivery:{" "}
                                                    {pincodeResult.estimatedDelivery}
                                                </p>
                                            )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Product variants */}
                    {variants.length > 0 && (
                        <div className="mt-5 border-t border-[#e8e1ee] pt-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <span className="text-sm font-medium text-[#302936]">
                                    Choose your option
                                </span>

                                <span className="text-xs text-[#89818f]">
                                    {activeVariant?.size || activeVariant?.name || "Standard"}
                                </span>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {variants.map((variant, index) => (
                                    <button
                                        key={`${variant.size || variant.name || "variant"}-${index}`}
                                        onClick={() => setVariantIndex(index)}
                                        className={`min-w-20 rounded-xl border px-4 py-3 text-left transition ${variantIndex === index
                                            ? "border-[#7D45C2] bg-[#f1e9f9] text-[#6f36b0]"
                                            : "border-[#e4dce9] bg-white text-[#51465f] hover:border-[#bda0da]"
                                            }`}
                                    >
                                        <span className="block text-sm font-medium">
                                            {variant.size || variant.name || `Option ${index + 1}`}
                                        </span>
                                        <span className="mt-1 block text-xs">
                                            {formatPrice(variant.price)}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div className="mt-5 flex items-center justify-between border-t border-[#e8e1ee] pt-2">
                        <span className="text-sm font-medium text-[#302936]">
                            Quantity
                        </span>

                        <div className="flex h-11 items-center rounded-full border border-[#ded5e5] bg-white">
                            <button
                                onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                                aria-label="Decrease quantity"
                                className="flex h-full w-10 items-center justify-center text-[#51465f] transition hover:text-[#7D45C2]"
                            >
                                <Minus size={14} />
                            </button>

                            <span className="w-6 text-center text-sm tabular-nums">
                                {quantity}
                            </span>

                            <button
                                onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                                aria-label="Increase quantity"
                                className="flex h-full w-10 items-center justify-center text-[#51465f] transition hover:text-[#7D45C2]"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-between items-center gap-2 mt-4">
                        {/* Buy Now */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={adding}
                            onClick={() => handleAddToCart(true)}
                            className="flex min-h-[54px] w-full items-center justify-center rounded-full border border-[#7D45C2] bg-white px-6 text-sm font-medium text-[#7D45C2] transition hover:bg-[#f3ebfb] disabled:opacity-60"
                        >
                            <span>Buy now</span>
                            {/* <span>
                                {formatPrice(Number(activeVariant?.price || 0) * quantity)}
                            </span> */}
                        </motion.button>

                        {/* Add to cart */}
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            disabled={adding}
                            onClick={() => handleAddToCart(false)}
                            className="flex min-h-[54px] w-full items-center justify-center rounded-full bg-[#7D45C2] px-6 text-sm font-medium text-white transition-colors hover:bg-[#6936aa] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <span className="flex items-center gap-2">
                                <ShoppingBag size={17} strokeWidth={1.6} />
                                {adding ? "Adding to cart..." : "Add to cart"}
                            </span>

                            {/* <span>{formatPrice(Number(activeVariant?.price || 0) * quantity)}</span> */}
                        </motion.button>
                    </div>

                    {notice && (
                        <p className="mt-3 text-center text-sm text-[#7D45C2]">
                            {notice}
                        </p>
                    )}

                    {/* COMPLETE YOUR ROUTINE */}
                    <section className="mt-5 rounded-2xl bg-[#f3f0f6] p-5">
                        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight text-[#5e5a56] sm:text-2xl">
                                    COMPLETE YOUR ROUTINE
                                </h2>
                            </div>

                            <span className="text-xs text-[#77716c]">
                                {selectedRoutine.length} selected
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {routineProducts.map((item) => {
                                const isSelected = selectedRoutine.includes(item.id);

                                return (
                                    <div
                                        key={item.id}
                                        className={`min-w-0 relative items-center rounded-2xl overflow-hidden bg-white transition ${isSelected
                                            ? "ring-1 ring-[#7D45C2]/40" : ""}`}
                                    >
                                        {/* Product image */}
                                        <div className="flex h-48 shrink-0 items-center justify-center overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                                onError={(event) => {
                                                    event.currentTarget.onerror = null;
                                                    event.currentTarget.src = "/placeholder.png";
                                                }}
                                            />
                                        </div>

                                        {/* Product information */}
                                        <div className="flex min-w-0 flex-1 flex-col self-stretch py-2 px-2">
                                            <h3 className="line-clamp-1 text-center text-sm font-bold text-[#69645e] sm:text-base">
                                                {item.name}
                                            </h3>

                                            <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
                                                <span className="text-sm font-bold text-[#69645e]">
                                                    {formatPrice(item.price)}
                                                </span>

                                                {item.options.length > 0 && (
                                                    <select
                                                        aria-label={`Select ${item.name} option`}
                                                        value={routineOptions[item.id] || item.options[0]}
                                                        onChange={(event) =>
                                                            setRoutineOptions((previous) => ({
                                                                ...previous,
                                                                [item.id]: event.target.value,
                                                            }))
                                                        }
                                                        className="max-w-[125px] cursor-pointer border-b border-[#8e8881] bg-transparent pb-1 text-right text-xs text-[#69645e] outline-none"
                                                    >
                                                        {item.options.map((option) => (
                                                            <option key={option} value={option} className="">
                                                                {option}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        </div>

                                        {/* Select product */}
                                        <button type="button" role="checkbox" aria-checked={isSelected} aria-label={`${isSelected ? "Remove" : "Add"} ${item.name}`}
                                            onClick={() =>
                                                setSelectedRoutine((previous) =>
                                                    isSelected
                                                        ? previous.filter((id) => id !== item.id)
                                                        : [...previous, item.id]
                                                )
                                            }
                                            className={`mb-auto absolute top-2 right-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition ${isSelected
                                                ? "border-[#7D45C2] bg-[#7D45C2] text-white"
                                                : "border-[#827b73] bg-white"
                                                }`}
                                        >
                                            {isSelected && <Check size={16} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Routine total and action */}
                        <div className="mt-4 flex flex-col gap-4 border-t border-[#d8d5d1] pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs text-[#77716c]">
                                    Selected routine products
                                </p>
                                <p className="mt-1 text-xl font-semibold text-[#5e5a56]">
                                    {formatPrice(selectedRoutineTotal)}
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={selectedRoutine.length === 0 || addingRoutine}
                                onClick={async () => {
                                    const selected = routineProducts.filter((item) =>
                                        selectedRoutine.includes(item.id)
                                    );

                                    if (!selected.length) {
                                        toast.error("Please select at least one product.");
                                        return;
                                    }

                                    const loadingToast = toast.loading("Adding routine to cart...");
                                    setAddingRoutine(true);

                                    try {
                                        for (const item of selected) {
                                            const option =
                                                routineOptions[item.id] ||
                                                item.options?.[0] ||
                                                "";

                                            await axios.post("/api/user/cart", {
                                                productId: item.id,
                                                quantity: 1,
                                                variant: option,
                                            });
                                        }

                                        window.dispatchEvent(new Event("solvestic-cart-updated"));

                                        toast.success("Routine added to cart successfully!", {
                                            id: loadingToast,
                                        });

                                        router.push("/cart");
                                    } catch (error) {
                                        console.error("Add routine to cart error:", error);

                                        toast.error(
                                            error.response?.data?.message ||
                                            "Unable to add routine to cart.",
                                            { id: loadingToast }
                                        );
                                    } finally {
                                        setAddingRoutine(false);
                                    }
                                }}
                                className="flex min-h-[52px] items-center justify-between gap-8 rounded-full bg-[#7D45C2] px-6 text-sm font-medium text-white transition hover:bg-[#6936aa] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>
                                    {addingRoutine ? "Adding routine..." : "Add routine to cart"}
                                </span>
                                <span>{formatPrice(selectedRoutineTotal)}</span>
                            </button>
                        </div>
                    </section>

                    <p className="mt-4 text-center text-[10px] tracking-wide text-[#92899b]">
                        Thoughtfully made. Beautifully simple.
                    </p>
                </motion.aside>
            </section>

            {/* PRODUCT SPECIFICATIONS */}
            <section className="overflow-hidden bg-gradient-to-br from-[#eee7f5] to-[#f8f6fa] px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
                <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

                    {/* Specifications — animated */}
                    <motion.div
                        initial={{ opacity: 0, x: -35 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className="order-2 lg:order-1"
                    >
                        <p className="text-xs mb-2 font-semibold uppercase tracking-[0.1em] text-[#7D45C2]">
                            The details
                        </p>

                        <h2 className="max-w-xl text-4xl font-medium leading- tracking-[-0.015em] text-[#28222e] sm:text-[40px]">
                            Everything you need to know.
                        </h2>

                        <p className="mt-2 max-w-lg text-sm text-[#716a78] sm:text-base">
                            Explore the details that make{" "}
                            <span className="font-medium text-[#302936]">
                                {product?.name}
                            </span>{" "}
                            part of your routine.
                        </p>

                        <div className="mt-8 border-t border-[#e6dfea]">
                            {Array.isArray(product?.specifications) && product.specifications.length > 0 ? (
                                product.specifications.map((specification, index) => (
                                    <motion.div
                                        key={`${specification.key || specification.name || "spec"}-${index}`}
                                        initial={{ opacity: 0, y: 12 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: false, amount: 0.3 }}
                                        transition={{
                                            duration: 0.45,
                                            delay: index * 0.08,
                                        }}
                                        className="grid grid-cols-[0.8fr_1.2fr] gap-4 border-b border-[#e6dfea] py-6 sm:gap-8"
                                    >
                                        <h3 className="text-sm font-medium tracking-wider text-[#7D45C2] sm:text-lg">
                                            {specification.key ||
                                                specification.name ||
                                                `Detail ${index + 1}`}
                                        </h3>

                                        <p className="whitespace-pre-line text-sm leading-6 text-[#625b69] sm:text-base">
                                            {specification.value ?? "—"}
                                        </p>
                                    </motion.div>
                                ))
                            ) : (
                                <p className="border-b border-[#e6dfea] py-6 text-sm text-[#89818f]">
                                    Product specifications will be available soon.
                                </p>
                            )}
                        </div>
                    </motion.div>

                    {/* Product image — animated */}
                    <motion.div
                        initial={{ opacity: 0, x: 35, scale: 0.97 }}
                        whileInView={{ opacity: 1, x: 0, scale: 1 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="order-1 lg:order-2"
                    >
                        <div className="group relative aspect-[4/4] max-h-[720px] overflow-hidden rounded-2xl bg-[#f0eaf6]">
                            <motion.img
                                src={product.images[2].url || currentImage}
                                alt={`${product?.name || "Product"} specifications`}
                                whileHover={{ scale: 1.045 }}
                                transition={{ duration: 0.7, ease: "easeOut" }}
                                className="h-full w-full object-contain"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* LONG DESCRIPTION */}
            {product?.longDescription && (
                <section className="bg-white px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-2">

                        {/* Sticky image — left */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.15 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="lg:sticky lg:top-24"
                        >
                            <div className="group relative h-[420px] overflow-hidden rounded-2xl bg-[#fff] sm:h-[560px] lg:h-[calc(100vh-120px)] lg:min-h-[520px] lg:max-h-[780px]">
                                <motion.img
                                    src={product.images[1].url || currentImage}
                                    alt={`${product?.name || "Product"} details`}
                                    whileHover={{ scale: 1.035 }}
                                    transition={{ duration: 0.7, ease: "easeOut" }}
                                    className="h-full w-full object-contain"
                                />

                                {/* <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" /> */}

                                {/* <div className="absolute bottom-6 left-6 right-6 text-white sm:bottom-8 sm:left-8">
                                    <p className="text-xs font-medium uppercase tracking-[0.22em]">
                                        Discover Solvestic
                                    </p>

                                    <h2 className="mt-3 text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
                                        {product?.name}
                                    </h2>
                                </div> */}
                            </div>
                        </motion.div>

                        {/* Long description — right */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.1 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className="min-w-0 py-2 sm:py-5 lg:py-8"
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7D45C2]">
                                The complete story
                            </p>

                            <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.04em] text-[#28222e] sm:text-4xl lg:text-5xl">
                                Made for your routine.
                            </h2>

                            <div
                                className="product-long-description mt-8 text-[15px] leading-8 text-[#625b69] sm:text-base"
                                dangerouslySetInnerHTML={{
                                    __html: product.longDescription,
                                }}
                            />
                        </motion.div>
                    </div>

                    {/* Jodit content styling */}
                    <style jsx global>{`
            .product-long-description {
                overflow-wrap: anywhere;
            }

            .product-long-description h1,
            .product-long-description h2,
            .product-long-description h3,
            .product-long-description h4 {
                margin-top: 2rem;
                margin-bottom: 1rem;
                color: #302936;
                font-weight: 600;
                line-height: 1.3;
            }

            .product-long-description h1 {
                font-size: 2rem;
            }

            .product-long-description h2 {
                font-size: 1.65rem;
            }

            .product-long-description h3,
            .product-long-description h4 {
                font-size: 1.25rem;
            }

            .product-long-description p {
                margin-top: 1rem;
                margin-bottom: 1rem;
            }

            .product-long-description ul,
            .product-long-description ol {
                margin: 1.25rem 0;
                padding-left: 1.5rem;
            }

            .product-long-description ul {
                list-style: disc;
            }

            .product-long-description ol {
                list-style: decimal;
            }

            .product-long-description li {
                margin: 0.5rem 0;
                padding-left: 0.25rem;
            }

            .product-long-description a {
                color: #7d45c2;
                text-decoration: underline;
                text-underline-offset: 3px;
            }

            .product-long-description img {
                max-width: 100%;
                height: auto;
                margin: 1.5rem 0;
                border-radius: 0.75rem;
            }

            .product-long-description blockquote {
                margin: 1.5rem 0;
                padding-left: 1rem;
                border-left: 3px solid #7d45c2;
                color: #716a78;
            }

            .product-long-description table {
                display: block;
                max-width: 100%;
                overflow-x: auto;
                border-collapse: collapse;
            }

            .product-long-description th,
            .product-long-description td {
                padding: 0.75rem;
                border: 1px solid #e6dfea;
                text-align: left;
            }
        `}</style>
                </section>
            )}

            {/* PRODUCT RESULTS / BENEFITS */}
            {/* <section className="overflow-hidden bg-gradient-to-br from-[#eee7f5] to-[#f8f6fa] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15">
                <div className="mx-auto max-w-7xl">
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 0.7 }}
                        >
                            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7D45C2]">
                                The Solvestic difference
                            </p>

                            <h2 className="max-w-xl text-3xl font-medium leading-tight tracking-[-0.015em] text-[#28222e] sm:text-5xl">
                                Good skin days,
                                <span className="text-[#7D45C2]"> backed by confidence.</span>
                            </h2>

                            <div className="mt-8 space-y-6">
                                {[
                                    {
                                        percentage: 96,
                                        title: "SKIN LOOKS NATURALLY RADIANT",
                                        detail: "A fresh, healthy-looking glow.",
                                    },
                                    {
                                        percentage: 94,
                                        title: "PREPS SKIN FOR MAKEUP AND SKINCARE",
                                        detail: "A smoother-feeling base for your routine.",
                                    },
                                    {
                                        percentage: 91,
                                        title: "SKIN LOOKS GLOWY, ILLUMINATED & HYDRATED",
                                        detail: "Skin that looks luminous and refreshed.",
                                    },
                                ].map((item, index) => (
                                    <motion.div
                                        key={item.percentage}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.55,
                                            delay: index * 0.12,
                                        }}
                                        className="border-b border-[#7D45C2]/15 pb-5 last:border-0"
                                    >
                                        <div className="flex items-center gap-5 sm:gap-6">
                                            <div className="flex shrink-0 items-baseline text-[#7D45C2]">
                                                <span className="text-4xl font-medium leading-none tracking-[-0.06em] sm:text-5xl">
                                                    {item.percentage}
                                                </span>
                                                <span className="text-xl font-light ml-1">%</span>
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="text-xs font-semibold leading-5 tracking-[0.08em] text-[#302936] sm:text-sm">
                                                    {item.title}
                                                </h3>

                                                <p className="mt-1 text-xs leading-5 text-[#89818f] sm:text-sm">
                                                    {item.detail}
                                                </p>

                                                <div className="mt-3 h-1 overflow-hidden rounded-full bg-[#e5d9f0]">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{
                                                            width: `${item.percentage}%`,
                                                        }}
                                                        viewport={{ once: true }}
                                                        transition={{
                                                            duration: 1,
                                                            delay: index * 0.12 + 0.2,
                                                            ease: "easeOut",
                                                        }}
                                                        className="h-full rounded-full bg-[#7D45C2]"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <p className="mt-4 text-xs leading-5 text-[#89818f]">
                                Illustrative placeholder statistics. Replace with verified
                                product study results before publishing.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30, scale: 0.97 }}
                            whileInView={{ opacity: 1, x: 0, scale: 1 }}
                            viewport={{ once: false, amount: 0.2 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="relative mx-auto w-full max-w-xl"
                        >
                            <div className="relative aspect-[4/4] overflow-hidden rounded-[2rem] bg-[#e8dcef] sm:rounded-[2.5rem]">
                                <img
                                    src="/Radiant Skincare Glow with Lavender Moisturizer (1).png"
                                    alt="Solvestic skincare product and radiant skin"
                                    className="h-full w-full object-cover"
                                />

                                <div className="absolute inset-0 bg-gradient-to-t from-[#241331]/30 via-transparent to-transparent" />
                            </div>

                            <div className="pointer-events-none absolute -right-3 -top-3 -z-10 h-32 w-32 rounded-full bg-[#7D45C2]/15 blur-2xl sm:-right-6 sm:-top-6 sm:h-48 sm:w-48" />
                        </motion.div>
                    </div>
                </div>
            </section> */}

            <TextureDetailsSection slug={product.slug} />

            <ReviewsSection slug={slug} productId={product._id.toString()} user={user} />
        </main>
    );
}