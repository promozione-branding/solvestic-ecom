"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
    FiShoppingCart,
    FiHeart,
    FiSearch,
    FiX,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import {
    addToGuestCart,
} from "@/lib/cart-storage";
import toast from "react-hot-toast";

const WISHLIST_KEY = "solvestic_wishlist";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(price) || 0);

const getList = (response, key) => {
    const data = response?.data;

    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data?.[key])) return data.data[key];
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;

    return [];
};

const getId = (item) =>
    String(item?._id || item?.id || item?.productId || "");

const getCategoryName = (product) => {
    const category = product?.categoryId || product?.category;

    if (typeof category === "string") return category;
    return category?.name || category?.title || "Uncategorized";
};

const getImage = (product) => {
    const firstImage = product?.images?.[0];

    return (
        (typeof firstImage === "string" ? firstImage : firstImage?.url) ||
        product?.imageUrl ||
        product?.thumbnail ||
        product?.image ||
        "/placeholder.png"
    );
};

const getDefaultVariant = (product) => {
    const variants = Array.isArray(product?.variants)
        ? product.variants
        : [];

    return variants[0] || null;
};

const getPrice = (product) => {
    const variant = getDefaultVariant(product);

    return Number(
        variant?.price ??
        product?.sellingPrice ??
        product?.salePrice ??
        product?.discountPrice ??
        product?.price ??
        0
    );
};

const getOldPrice = (product) => {
    const variant = getDefaultVariant(product);

    return Number(
        variant?.oldPrice ??
        variant?.mrp ??
        product?.originalPrice ??
        product?.compareAtPrice ??
        product?.mrp ??
        product?.regularPrice ??
        0
    );
};

const getProductHref = (product) =>
    product?.slug
        ? `/our-products/${product.slug}`
        : "/our-products";

export default function Products() {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [category, setCategory] = useState("All Products");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("featured");

    const [wishlist, setWishlist] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [addingId, setAddingId] = useState("");
    const [notice, setNotice] = useState("");
    const [showFilters, setShowFilters] = useState(false);

    // Fetch products and categories from the backend.
    useEffect(() => {
        let active = true;

        const loadData = async () => {
            setLoading(true);
            setError("");

            try {
                const [productsResponse, categoriesResponse] =
                    await Promise.all([
                        axios.get("/api/admin/products", {
                            params: { limit: 1000 },
                        }),
                        axios.get("/api/admin/categories"),
                    ]);

                if (!active) return;

                const fetchedProducts = getList(
                    productsResponse,
                    "products"
                );

                const fetchedCategories = getList(
                    categoriesResponse,
                    "categories"
                );

                setProducts(fetchedProducts);
                setCategories(fetchedCategories);
            } catch (err) {
                console.error("Failed to load products:", err);

                if (active) {
                    setError(
                        "We couldn't load products. Please try again."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        loadData();

        return () => {
            active = false;
        };
    }, []);

    // Load saved wishlist and determine whether the customer is logged in.
    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem(WISHLIST_KEY) || "[]"
            );

            setWishlist(
                Array.isArray(saved)
                    ? saved.map(getId).filter(Boolean)
                    : []
            );
        } catch {
            setWishlist([]);
        }
    }, []);


    const categoryNames = useMemo(() => {
        const names = categories
            .map((item) => item?.name || item?.title)
            .filter(Boolean);

        // Also include categories found on products in case a category
        // was not returned by the categories API.
        products.forEach((product) => {
            const name = getCategoryName(product);

            if (name && name !== "Uncategorized") {
                names.push(name);
            }
        });

        return [
            "All Products",
            ...Array.from(new Set(names)).sort((a, b) =>
                a.localeCompare(b)
            ),
        ];
    }, [categories, products]);

    const filteredProducts = useMemo(() => {
        let result = products.filter((product) => {
            const productCategory = getCategoryName(product);

            const matchesCategory =
                category === "All Products" ||
                productCategory.toLowerCase() === category.toLowerCase();

            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                [
                    product?.name,
                    product?.title,
                    product?.slug,
                    productCategory,
                    product?.shortDescription,
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value).toLowerCase().includes(searchText)
                    );

            return matchesCategory && matchesSearch;
        });

        if (sort === "price-low") {
            result = [...result].sort(
                (a, b) => getPrice(a) - getPrice(b)
            );
        } else if (sort === "price-high") {
            result = [...result].sort(
                (a, b) => getPrice(b) - getPrice(a)
            );
        } else if (sort === "newest") {
            result = [...result].sort(
                (a, b) =>
                    new Date(b.createdAt || 0).getTime() -
                    new Date(a.createdAt || 0).getTime()
            );
        }

        return result;
    }, [products, category, search, sort]);

    const toggleWishlist = useCallback((product) => {
        const productId = getId(product);

        if (!productId) return;

        try {
            const saved = JSON.parse(
                localStorage.getItem(WISHLIST_KEY) || "[]"
            );

            const items = Array.isArray(saved) ? saved : [];

            const exists = items.some(
                (item) => getId(item) === productId
            );

            const updated = exists
                ? items.filter((item) => getId(item) !== productId)
                : [...items, product];

            localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));

            setWishlist(updated.map(getId).filter(Boolean));

            setNotice(
                exists
                    ? "Removed from wishlist"
                    : "Added to wishlist"
            );

            window.dispatchEvent(
                new CustomEvent("solvestic-wishlist-updated")
            );
        } catch (err) {
            console.error("Wishlist update failed:", err);
            setNotice("Unable to update wishlist");
        }
    }, []);

    const addToCart = useCallback(
        async (product) => {
            const productId = getId(product);
            const variant = getDefaultVariant(product);

            if (!productId) {
                toast.error("Product information is missing.");
                return;
            }

            if (!variant) {
                toast.error("This product has no available variants.");
                return;
            }

            const variantName = String(
                variant.size || variant.name || ""
            ).trim();

            if (!variantName) {
                toast.error("This product has an invalid variant.");
                return;
            }

            setAddingId(productId);
            setNotice("");

            try {
                if (isAuthenticated) {
                    const response = await axios.post("/api/user/cart", {
                        productId,
                        quantity: 1,
                        variant: variantName,
                    });

                    if (!response.data?.success) {
                        throw new Error(
                            response.data?.message ||
                            "Unable to add product to cart."
                        );
                    }
                    toast.success(
                        `${product.name || product.title} added to cart.`
                    );
                } else {
                    const result = addToGuestCart(productId, 1, variant);

                    if (result?.success === false) {
                        throw new Error(
                            result.message || "Unable to add product to cart."
                        );
                    }
                }

                window.dispatchEvent(
                    new Event("solvestic-cart-updated")
                );

            } catch (error) {
                console.error("Add to cart failed:", error);

                toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Unable to add product to cart."
                );
            } finally {
                setAddingId("");
            }
        },
        [isAuthenticated]
    );

    const clearFilters = () => {
        setCategory("All Products");
        setSearch("");
        setSort("featured");
    };

    return (
        <main className="min-h-screen bg-[#fffdfb] text-[#28232f]">
            <section className="mx-auto max-w-[1600px] px-4 py-10 sm:px-8 sm:py-14 lg:px-12">
                {/* Toolbar */}
                <div className="mb-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-[#7D45C2]">
                            Find your favourites
                        </p>

                        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                            All Products
                        </h1>

                        {!loading && (
                            <p className="mt-2 text-sm text-[#85808a]">
                                {filteredProducts.length} products found
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="flex h-11 items-center gap-2 rounded-full border border-[#e9e3ef] bg-white px-4 sm:w-[260px]">
                            <FiSearch
                                className="shrink-0 text-[#8b7ab9]"
                                size={17}
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search products..."
                                aria-label="Search products"
                                className="w-full bg-transparent text-sm outline-none placeholder:text-[#aaa3b0]"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                    className="text-[#88808e]"
                                >
                                    <FiX size={16} />
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowFilters((value) => !value)}
                            className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#e9e3ef] bg-white px-5 text-sm transition hover:border-[#a99bd0]"
                        >
                            Categories
                        </button>

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
                <div
                    className={`mb-5 flex gap-2 overflow-x-auto pb-2 ${showFilters ? "" : "max-sm:hidden"
                        }`}
                >
                    {categoryNames.map((item) => (
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

                {/* Loading state */}
                {loading && (
                    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div
                                key={index}
                                className="animate-pulse overflow-hidden rounded-[16px] border border-[#f0eaf3] bg-white sm:rounded-[20px]"
                            >
                                <div className="aspect-square bg-[#f0ebfa]" />
                                <div className="space-y-3 p-3 sm:p-4">
                                    <div className="h-3 w-1/3 rounded bg-[#eee9f8]" />
                                    <div className="h-4 w-4/5 rounded bg-[#eee9f8]" />
                                    <div className="h-4 w-1/2 rounded bg-[#eee9f8]" />
                                    <div className="h-10 rounded-full bg-[#eee9f8]" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error state */}
                {!loading && error && (
                    <div className="py-20 text-center">
                        <p className="text-sm text-red-600">{error}</p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-5 rounded-full bg-[#7D45C2] px-5 py-3 text-xs font-medium text-white"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Product grid */}
                {!loading && !error && (
                    <motion.div
                        layout
                        className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => {
                                const productId = getId(product);
                                const price = getPrice(product);
                                const oldPrice = getOldPrice(product);
                                const isWishlisted =
                                    wishlist.includes(productId);

                                return (
                                    <motion.article
                                        layout
                                        key={productId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.96 }}
                                        transition={{ duration: 0.35 }}
                                        className="group relative overflow-hidden rounded-[16px] border border-[#f0eaf3] bg-white transition-shadow duration-300 hover:shadow-[0_12px_35px_rgba(75,55,100,0.09)] sm:rounded-[20px]"
                                    >
                                        {/* Product image */}
                                        <div className="relative overflow-hidden bg-[#f3effa]">
                                            <Link
                                                href={getProductHref(product)}
                                                aria-label={`View ${product.name || product.title}`}
                                                className="relative block aspect-square"
                                            >
                                                <Image
                                                    src={getImage(product)}
                                                    alt={product.name || product.title || "Product"}
                                                    fill
                                                    unoptimized
                                                    sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 23vw"
                                                    className="object- transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </Link>

                                            {product.badge && (
                                                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-medium text-[#7D45C2] shadow-sm sm:left-3 sm:top-3 sm:text-[10px]">
                                                    {product.badge}
                                                </span>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleWishlist(product)
                                                }
                                                aria-label={
                                                    isWishlisted
                                                        ? "Remove from wishlist"
                                                        : "Add to wishlist"
                                                }
                                                aria-pressed={isWishlisted}
                                                className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-sm backdrop-blur transition sm:right-3 sm:top-3 ${isWishlisted
                                                    ? "bg-[#7D45C2] text-white"
                                                    : "bg-white/90 text-[#7D45C2] hover:bg-[#7D45C2] hover:text-white"
                                                    }`}
                                            >
                                                <FiHeart
                                                    size={17}
                                                    className={
                                                        isWishlisted
                                                            ? "fill-current"
                                                            : ""
                                                    }
                                                />
                                            </button>
                                        </div>

                                        {/* Product details */}
                                        <div className="p-3 sm:p-4">
                                            <p className="mb-1 text-[9px] uppercase tracking-[0.15em] text-[#7D45C2] sm:text-[10px]">
                                                {getCategoryName(product)}
                                            </p>

                                            <Link href={getProductHref(product)}>
                                                <h2 className="line-clamp-2 text-xs font-medium leading-5 text-[#302b35] transition-colors hover:text-[#7D45C2] sm:text-base">
                                                    {product.name || product.title}
                                                </h2>
                                            </Link>

                                            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <span className="text-sm font-semibold text-[#28232f] sm:text-base">
                                                    {formatPrice(price)}
                                                </span>

                                                {oldPrice > price && (
                                                    <>
                                                        <span className="text-[10px] text-[#aaa2af] line-through sm:text-xs">
                                                            {formatPrice(oldPrice)}
                                                        </span>

                                                        <span className="text-[9px] font-medium text-[#7D45C2] sm:text-[10px]">
                                                            {Math.round(
                                                                ((oldPrice - price) /
                                                                    oldPrice) *
                                                                100
                                                            )}
                                                            % OFF
                                                        </span>
                                                    </>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                disabled={addingId === productId}
                                                onClick={() => addToCart(product)}
                                                aria-label={`Add ${product.name || product.title} to cart`}
                                                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#eee9f8] text-[#7D45C2] transition-all duration-300 hover:bg-[#7D45C2] hover:text-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:h-11"
                                            >
                                                <FiShoppingCart size={17} />

                                                <span className="text-xs font-medium">
                                                    {addingId === productId
                                                        ? "Adding..."
                                                        : "Add to Cart"}
                                                </span>
                                            </button>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Empty state */}
                {!loading &&
                    !error &&
                    filteredProducts.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f0ebfa] text-[#7D45C2]">
                                <FiSearch size={22} />
                            </div>

                            <h3 className="mt-5 text-lg font-medium">
                                {products.length === 0
                                    ? "Products coming soon"
                                    : "No products found"}
                            </h3>

                            <p className="mt-2 text-sm text-[#85808a]">
                                {products.length === 0
                                    ? "We're preparing our collection. Please check back soon."
                                    : "Try another search or choose a different category."}
                            </p>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="mt-5 rounded-full bg-[#7D45C2] px-5 py-3 text-xs font-medium text-white"
                            >
                                View all products
                            </button>
                        </div>
                    )}
            </section>
        </main>
    );
}