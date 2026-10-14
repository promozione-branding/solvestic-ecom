
"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    Check,
    Heart,
    ShoppingBag,
    Star,
    Sparkles,
    SlidersHorizontal,
} from "lucide-react";

const categories = [
    {
        name: "All Products",
        image:
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=300&q=85",
    },
    {
        name: "Sunscreen",
        image:
            "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=300&q=85",
    },
    {
        name: "Signature Range",
        image:
            "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=300&q=85",
    },
    {
        name: "Skin Care",
        image:
            "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=300&q=85",
    },
    {
        name: "Bath & Body",
        image:
            "https://images.unsplash.com/photo-1600428853876-fb5a850b444f?auto=format&fit=crop&w=300&q=85",
    },
    {
        name: "Lip Care",
        image:
            "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=300&q=85",
    },
];

const products = [
    {
        id: 1,
        name: "Bath & Body Gift Set",
        category: "Bath & Body",
        price: 712,
        oldPrice: 950,
        rating: 4.9,
        reviews: 128,
        badge: "BESTSELLER",
        description: "A little luxury for your everyday ritual.",
        image: "/products/1.png",
        bg: "#eeebf8",
        type: "best",
    },
    {
        id: 2,
        name: "10 Min De-Stress Kit",
        category: "Skin Care",
        price: 999,
        oldPrice: 1300,
        rating: 4.9,
        reviews: 96,
        badge: "MOST LOVED",
        description: "Your little reset after a long day.",
        image: "/products/2.png",
        bg: "#e4f1f1",
        type: "best",
    },
    {
        id: 3,
        name: "Lips Don't Lie Lip Duo",
        category: "Lip Care",
        price: 799,
        oldPrice: 1100,
        rating: 5.0,
        reviews: 84,
        badge: "LIP ESSENTIALS",
        description: "Soft lips. Beautiful colour. All day.",
        image: "/products/3.png",
        bg: "#f8e8ee",
        type: "best",
    },
    {
        id: 4,
        name: "Calming Gel Pen",
        category: "Skin Care",
        price: 600,
        oldPrice: 800,
        rating: 4.9,
        reviews: 73,
        badge: "DAILY FAVOURITE",
        description: "A refreshing boost for tired skin.",
        image: "/products/4.png",
        bg: "#e9eaf9",
        type: "best",
    },
    {
        id: 5,
        name: "Hydra Crème 30ML",
        category: "Skin Care",
        price: 600,
        oldPrice: 800,
        rating: 4.8,
        reviews: 115,
        badge: "HYDRATION HERO",
        description: "Deep hydration for a dewy finish.",
        image: "/products/1.png",
        bg: "#e9e9fb",
        type: "best",
    },
    {
        id: 6,
        name: "Daily Glow Sunscreen",
        category: "Sunscreen",
        price: 699,
        oldPrice: 899,
        rating: 4.9,
        reviews: 42,
        badge: "JUST DROPPED",
        description: "Lightweight daily sun protection.",
        image: "/products/2.png",
        bg: "#f5eddb",
        type: "new",
    },
    {
        id: 7,
        name: "Signature Skin Serum",
        category: "Signature Range",
        price: 1099,
        oldPrice: 1399,
        rating: 5.0,
        reviews: 31,
        badge: "NEW ARRIVAL",
        description: "Your glow, elevated with every drop.",
        image: "/products/3.png",
        bg: "#e8e8f6",
        type: "new",
    },
    {
        id: 8,
        name: "Velvet Lip Treatment",
        category: "Lip Care",
        price: 499,
        oldPrice: 650,
        rating: 4.8,
        reviews: 24,
        badge: "NEW ARRIVAL",
        description: "Comforting care for softer lips.",
        image: "/products/4.png",
        bg: "#f8e5e9",
        type: "new",
    },
];

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);

const getDiscount = (price, oldPrice) =>
    Math.round(((oldPrice - price) / oldPrice) * 100);

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.09,
        },
    },
};

const cardVariants = {
    hidden: { opacity: 0, y: 28 },
    viewport: { once: false, amount: 0.3 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: "easeOut" },
    },
};

export default function BestSellersSection({ onAddToCart }) {
    const [activeTab, setActiveTab] = useState("best");
    const [activeCategory, setActiveCategory] = useState("All Products");
    const [wishlist, setWishlist] = useState([]);
    const [cart, setCart] = useState([]);
    const [addedProduct, setAddedProduct] = useState(null);

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesTab = product.type === activeTab;
            const matchesCategory =
                activeCategory === "All Products" ||
                product.category === activeCategory;

            return matchesTab && matchesCategory;
        });
    }, [activeTab, activeCategory]);

    const toggleWishlist = (id) => {
        setWishlist((prev) =>
            prev.includes(id)
                ? prev.filter((item) => item !== id)
                : [...prev, id]
        );
    };

    const addToCart = (product) => {
        setCart((prev) => [...prev, product.id]);
        setAddedProduct(product.id);
        onAddToCart?.(product);
    };

    const changeTab = (tab) => {
        setActiveTab(tab);
        setActiveCategory("All Products");
        setAddedProduct(null);
    };

    return (
        <section className="overflow-hidden bg-[#fbfaf8] py-10 text-[#252329] sm:py-12 lg:py-15">
            <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
                {/* Section heading */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.65 }}
                    className="mb-5 text-center"
                >
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#dcd5ed] bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a83be] sm:text-xs">
                        <Sparkles size={14} />
                        Your skincare ritual
                    </div>

                    <h2 className="text-3xl font-medium tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                        A little love for{" "}
                        <span className="font-serif italic text-[#918ac6]">
                            your skin.
                        </span>
                    </h2>
                </motion.div> */}

                {/* Categories */}
                <div className="mb-5">
                    <div className="flex gap-5 overflow-x-auto py-3 sm:justify-center sm:gap-8 lg:gap-10 overflow-y-hidden">
                        {categories.map((category, index) => {
                            const active = activeCategory === category.name;

                            return (
                                <motion.button
                                    key={category.name}
                                    type="button"
                                    onClick={() => setActiveCategory(category.name)}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: false }}
                                    transition={{ delay: index * 0.07 }}
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
                                            src={category.image}
                                            alt={category.name}
                                            className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {active && (
                                            <span className="absolute inset-0 rounded-full border-2 border-white/70" />
                                        )}
                                    </span>

                                    <span
                                        className={`whitespace-nowrap text-[11px] transition-colors sm:text-sm ${active
                                            ? "font-semibold text-[#837ab7]"
                                            : "text-[#55515b] group-hover:text-[#837ab7]"
                                            }`}
                                    >
                                        {category.name}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Tabs and product count */}
                <div className="mb-5 flex flex-col items-center justify-between gap-5 sm:flex-row">
                    <div className="inline-flex rounded-full border border-[#dcd6ef] bg-white p-1.5 shadow-sm">
                        <button
                            type="button"
                            onClick={() => changeTab("best")}
                            className={`rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 sm:px-8 ${activeTab === "best"
                                ? "bg-[#918ac6] text-white shadow-md"
                                : "text-[#686371] hover:text-[#918ac6]"
                                }`}
                        >
                            Best Sellers
                        </button>

                        <button
                            type="button"
                            onClick={() => changeTab("new")}
                            className={`rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 sm:px-8 ${activeTab === "new"
                                ? "bg-[#918ac6] text-white shadow-md"
                                : "text-[#686371] hover:text-[#918ac6]"
                                }`}
                        >
                            New Launch
                        </button>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#85808a]">
                        <SlidersHorizontal size={15} />
                        <span>
                            Showing{" "}
                            <span className="font-semibold text-[#302d35]">
                                {filteredProducts.length}
                            </span>{" "}
                            products
                        </span>
                    </div>
                </div>

                {/* Products */}
                <AnimatePresence mode="wait">
                    {filteredProducts.length > 0 ? (
                        <motion.div
                            key={`${activeTab}-${activeCategory}`}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: 10 }}
                            className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
                        >
                            {filteredProducts.slice(0, 4).map((product) => {
                                const isWishlisted = wishlist.includes(product.id);
                                const isAdded = addedProduct === product.id;

                                return (
                                    <motion.article
                                        key={product.id}
                                        variants={cardVariants}
                                        layout
                                        className="group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#eeeaf0] bg-white transition-shadow duration-500 hover:shadow-[0_18px_55px_rgba(44,35,65,0.09)]"
                                    >
                                        {/* Product image */}
                                        <div
                                            className="relative m-2.5 overflow-hidden rounded-[16px] sm:m-3"
                                            style={{ backgroundColor: product.bg }}
                                        >
                                            <div className="relative aspect-[4/4.15] overflow-hidden">
                                                <motion.img
                                                    src={product.image}
                                                    alt={product.name}
                                                    loading="lazy"
                                                    className="h-full w-full object-cover mix-blend-multiply transition-transform duration-700 ease-out group-hover:scale-105"
                                                />

                                                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold tracking-[0.12em] text-[#625b85] backdrop-blur-md">
                                                    {product.category}
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => toggleWishlist(product.id)}
                                                    aria-label={
                                                        isWishlisted
                                                            ? "Remove from wishlist"
                                                            : "Add to wishlist"
                                                    }
                                                    aria-pressed={isWishlisted}
                                                    className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 ${isWishlisted
                                                        ? "bg-[#918ac6] text-white"
                                                        : "bg-white/90 text-[#514c59] hover:bg-[#918ac6] hover:text-white"
                                                        }`}
                                                >
                                                    <Heart
                                                        size={17}
                                                        fill={isWishlisted ? "currentColor" : "none"}
                                                    />
                                                </button>

                                                <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold text-[#514b63] backdrop-blur-md">
                                                    {getDiscount(product.price, product.oldPrice)}% OFF
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product details */}
                                        <div className="flex flex-1 flex-col px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
                                            <div className="mb-2 flex items-center justify-between gap-2">
                                                <h3 className="text-base font-semibold tracking-[0.01em] text-[#29252f] transition-colors group-hover:text-[#8179b7] sm:text-xl">
                                                    {product.name}
                                                </h3>

                                                <span className="flex shrink-0 items-center gap-1 text-sm text-[#4e4955]">
                                                    <Star
                                                        size={13}
                                                        fill="#e5bd53"
                                                        stroke="#e5bd53"
                                                    />
                                                    {product.rating}
                                                    <span className="text-[#aaa5af]">
                                                        ({product.reviews})
                                                    </span>
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-lg font-bold tracking-tight text-[#29252f]">
                                                    {formatPrice(product.price)}
                                                </span>

                                                <span className="text-xs text-[#aaa5af] line-through">
                                                    {formatPrice(product.oldPrice)}
                                                </span>

                                                <span className="ml-auto rounded-md bg-[#f2f0bd] px-2 py-1 text-[9px] font-bold text-[#625b32]">
                                                    SAVE {formatPrice(product.oldPrice - product.price)}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => addToCart(product)}
                                                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${isAdded
                                                    ? "bg-[#dcebd7] text-[#3d653a]"
                                                    : "bg-[#918ac6] text-white hover:bg-[#7770ad] hover:shadow-[0_8px_20px_rgba(145,138,198,0.25)]"
                                                    }`}
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check size={16} />
                                                        Added to Cart
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingBag size={15} />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.article>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex min-h-[240px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#ded8eb] bg-white px-5 text-center"
                        >
                            <ShoppingBag size={30} className="mb-3 text-[#918ac6]" />
                            <h3 className="text-lg font-semibold">More goodness is coming</h3>
                            <p className="mt-2 text-sm text-[#88828d]">
                                No products in this category yet. Explore our other
                                collections.
                            </p>
                            <button
                                type="button"
                                onClick={() => setActiveCategory("All Products")}
                                className="mt-5 rounded-full bg-[#918ac6] px-6 py-3 text-xs font-semibold text-white"
                            >
                                View all products
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
