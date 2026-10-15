"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { addToWishlist } from "@/lib/wishlist-storage";

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=500&q=85";

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(price) || 0);

const getList = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
};

const getProductCategory = (product) => {
    const category = product.category || product.categoryId;

    if (category && typeof category === "object") {
        return {
            id: String(category._id || category.id || ""),
            name: category.name || category.title || "",
        };
    }

    return {
        id: String(category || ""),
        name: product.categoryName || "",
    };
};

const getProductImage = (product) => {
    const images = Array.isArray(product.images) ? product.images : [];

    return (
        product.imageUrl ||
        product.thumbnail ||
        product.image ||
        images[0]?.url ||
        images[0]?.imageUrl ||
        (typeof images[0] === "string" ? images[0] : "") ||
        DEFAULT_IMAGE
    );
};

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.08 },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: "easeOut" },
    },
};

export default function BestSellersSection({ onAddToCart }) {
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [wishlist, setWishlist] = useState([]);
    const [addedProduct, setAddedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        const fetchData = async () => {
            try {
                setLoading(true);
                setError("");

                const params = { limit: 1000 };

                const [categoryResponse, productResponse] =
                    await Promise.all([
                        axios.get("/api/admin/categories"),
                        axios.get("/api/admin/products", { params }),
                    ]);

                const categoryData = getList(
                    categoryResponse.data,
                    "categories"
                );

                const productData = getList(
                    productResponse.data,
                    "products"
                );

                if (cancelled) return;

                setCategories(categoryData);

                setProducts(
                    productData.map((product) => {
                        const category = getProductCategory(product);

                        const price = Number(
                            product.sellingPrice ??
                            product.salePrice ??
                            product.discountPrice ??
                            product.price ??
                            0
                        );

                        const oldPrice = Number(
                            product.originalPrice ??
                            product.compareAtPrice ??
                            product.mrp ??
                            product.regularPrice ??
                            price
                        );

                        return {
                            ...product,
                            id: String(product._id || product.id),
                            name:
                                product.name ||
                                product.title ||
                                "Untitled Product",
                            categoryId: category.id,
                            categoryName: category.name,
                            price,
                            oldPrice,
                            image: getProductImage(product),
                            rating: Number(product.rating || 0),
                            reviews: Number(
                                product.reviews ||
                                product.reviewCount ||
                                0
                            ),
                        };
                    })
                );
            } catch (err) {
                console.error("Failed to load categories/products:", err);

                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        "Unable to load products. Please try again."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchData();

        return () => {
            cancelled = true;
        };
    }, []);

    const allCategories = useMemo(
        () => [
            {
                _id: "all",
                name: "All Products",
                image: DEFAULT_IMAGE,
            },
            ...categories,
        ],
        [categories]
    );

    const filteredProducts = useMemo(() => {
        if (activeCategory === "all") return products;

        const selectedCategory = categories.find(
            (category) =>
                String(category._id || category.id) === activeCategory
        );

        if (!selectedCategory) return [];

        const selectedId = String(
            selectedCategory._id || selectedCategory.id
        );

        const selectedName = selectedCategory.name || selectedCategory.title;

        return products.filter((product) => {
            return (
                product.categoryId === selectedId ||
                product.categoryName === selectedName
            );
        });
    }, [products, categories, activeCategory]);

    const [wishlistIds, setWishlistIds] = useState([]);

    useEffect(() => {
        try {
            const saved = JSON.parse(
                localStorage.getItem("solvestic_wishlist") || "[]"
            );

            setWishlistIds(
                saved.map((item) =>
                    String(item._id || item.id || item.productId || item)
                )
            );
        } catch {
            setWishlistIds([]);
        }
    }, []);

    const toggleWishlist = (product) => {
        const id = String(product._id || product.id);
        const key = "solvestic_wishlist";

        try {
            const saved = JSON.parse(localStorage.getItem(key) || "[]");

            const exists = saved.some(
                (item) =>
                    String(item._id || item.id || item.productId || item) === id
            );

            const updated = exists
                ? saved.filter(
                    (item) =>
                        String(item._id || item.id || item.productId || item) !== id
                )
                : [...saved, product];

            localStorage.setItem(key, JSON.stringify(updated));
            setWishlistIds(
                updated.map((item) =>
                    String(item._id || item.id || item.productId || item)
                )
            );
        } catch (error) {
            console.error("Unable to update wishlist:", error);
        }
    };

    const addToCart = (product) => {
        setAddedProduct(product.id);
        onAddToCart?.(product);
    };

    console.log(filteredProducts)

    return (
        <section className="overflow-hidden bg-[#fbfaf8] py-10 text-[#252329] sm:py-12 lg:py-15">
            <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
                {/* Categories */}
                <div className="mb-8">
                    <div className="flex gap-5 overflow-x-auto overflow-y-hidden py-3 sm:justify-center sm:gap-8 lg:gap-10">
                        {allCategories.map((category, index) => {
                            const categoryId =
                                category._id === "all"
                                    ? "all"
                                    : String(category._id || category.id);

                            const active = activeCategory === categoryId;

                            const image =
                                category.imageUrl ||
                                category.image ||
                                category.thumbnail ||
                                DEFAULT_IMAGE;

                            return (
                                <motion.button
                                    key={categoryId}
                                    type="button"
                                    onClick={() => {
                                        setActiveCategory(categoryId);
                                        setAddedProduct(null);
                                    }}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.04 }}
                                    whileHover={{ y: -4 }}
                                    className="group flex min-w-[86px] shrink-0 flex-col items-center gap-3 outline-none"
                                    aria-pressed={active}
                                >
                                    <span
                                        className={`relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-full border-2 bg-white p-1 transition-all duration-300 sm:h-[92px] sm:w-[92px] ${active
                                            ? "border-[#918ac6] shadow-[0_6px_25px_rgba(145,138,198,0.2)]"
                                            : "border-transparent group-hover:border-[#dcd5ed]"
                                            }`}
                                    >
                                        <img
                                            src={image}
                                            alt={category.name || category.title}
                                            className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </span>

                                    <span
                                        className={`whitespace-nowrap text-[11px] sm:text-sm ${active
                                            ? "font-semibold text-[#837ab7]"
                                            : "text-[#55515b] group-hover:text-[#837ab7]"
                                            }`}
                                    >
                                        {category.name ||
                                            category.title ||
                                            "Category"}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Product count */}
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-xl font-semibold sm:text-2xl">
                        {activeCategory === "all"
                            ? "All Products"
                            : categories.find(
                                (category) =>
                                    String(category._id || category.id) ===
                                    activeCategory
                            )?.name || "Products"}
                    </h2>

                    <span className="text-xs text-[#85808a]">
                        {filteredProducts.length} products
                    </span>
                </div>

                {/* Products */}
                {loading ? (
                    <div className="py-16 text-center text-sm text-[#85808a]">
                        Loading categories and products...
                    </div>
                ) : error ? (
                    <div className="rounded-3xl border border-dashed border-[#ded8eb] bg-white px-5 py-12 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-full bg-[#918ac6] px-6 py-3 text-xs font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategory}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: 10 }}
                            className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
                        >
                            {filteredProducts.map((product) => {
                                const isWishlisted = wishlistIds.includes(
                                    String(product._id || product.id)
                                );
                                const isAdded = addedProduct === product.id;
                                const discount =
                                    product.oldPrice > product.price &&
                                        product.oldPrice > 0
                                        ? Math.round(
                                            ((product.oldPrice -
                                                product.price) /
                                                product.oldPrice) *
                                            100
                                        )
                                        : 0;

                                return (
                                    <motion.article
                                        key={product.id}
                                        variants={cardVariants}
                                        layout
                                        className="group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#eeeaf0] bg-white transition-shadow duration-500 hover:shadow-[0_18px_55px_rgba(44,35,65,0.09)]"
                                    >
                                        <div className="relative m-2.5 overflow-hidden rounded-[16px] bg-[#eeebf8] sm:m-3">
                                            <div className="relative aspect-[4/4.15] overflow-hidden">
                                                <motion.img
                                                    src={product.image}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                                                />

                                                {product.categoryName && (
                                                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold tracking-[0.12em] text-[#625b85] backdrop-blur-md">
                                                        {product.categoryName}
                                                    </span>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => toggleWishlist(product)}
                                                    aria-label={
                                                        isWishlisted
                                                            ? "Remove from wishlist"
                                                            : "Add to wishlist"
                                                    }
                                                    aria-pressed={isWishlisted}
                                                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all ${isWishlisted
                                                        ? "bg-[#918ac6] text-white"
                                                        : "bg-white/90 text-[#514c59] hover:bg-[#918ac6] hover:text-white"
                                                        }`}
                                                >
                                                    <Heart
                                                        size={17}
                                                        fill={isWishlisted ? "currentColor" : "none"}
                                                    />
                                                </button>

                                                {discount > 0 && (
                                                    <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#514b63] backdrop-blur-md">
                                                        {discount}% OFF
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-1 flex-col px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                <h3 className="text-base font-semibold text-[#29252f] transition-colors group-hover:text-[#8179b7] sm:text-xl">
                                                    {product.name}
                                                </h3>

                                                {product.rating > 0 && (
                                                    <span className="flex shrink-0 items-center gap-1 text-sm text-[#4e4955]">
                                                        <Star
                                                            size={13}
                                                            fill="#e5bd53"
                                                            stroke="#e5bd53"
                                                        />
                                                        {product.rating}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex mt-auto flex-wrap items-center gap-2">
                                                <span className="text-lg font-bold text-[#29252f]">
                                                    {formatPrice(product.variants[0].price)}
                                                </span>

                                                {product.variants[0].oldPrice >
                                                    product.variants[0].price && (
                                                        <>
                                                            <span className="text-xs text-[#aaa5af] line-through">
                                                                {formatPrice(
                                                                    product.variants[0].oldPrice
                                                                )}
                                                            </span>

                                                            <span className="ml-auto rounded-md bg-[#f2f0bd] px-2 py-1 text-[9px] font-bold text-[#625b32]">
                                                                SAVE{" "}
                                                                {formatPrice(
                                                                    product.variants[0].oldPrice -
                                                                    product.variants[0].price
                                                                )}
                                                            </span>
                                                        </>
                                                    )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => addToCart(product)}
                                                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all ${isAdded
                                                    ? "bg-[#dcebd7] text-[#3d653a]"
                                                    : "bg-[#918ac6] text-white hover:bg-[#7770ad]"
                                                    }`}
                                            >
                                                <ShoppingBag size={15} />
                                                {isAdded
                                                    ? "Added to Cart"
                                                    : "Add to Cart"}
                                            </button>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                ) : (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#ded8eb] bg-white px-5 text-center">
                        <ShoppingBag
                            size={34}
                            className="mb-4 text-[#918ac6]"
                        />

                        <h3 className="text-xl font-semibold text-[#302d35]">
                            Coming Soon
                        </h3>

                        <p className="mt-2 max-w-md text-sm text-[#88828d]">
                            {activeCategory === "all"
                                ? "Our products are on their way. Please check back soon."
                                : "No products are available in this category yet. New products are coming soon."}
                        </p>

                        {activeCategory !== "all" && (
                            <button
                                type="button"
                                onClick={() => setActiveCategory("all")}
                                className="mt-5 rounded-full bg-[#918ac6] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#7770ad]"
                            >
                                View All Products
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
