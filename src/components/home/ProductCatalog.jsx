
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiShoppingCart, FiArrowUpRight } from "react-icons/fi";

const backgrounds = [
    { bg: "#FFF0E8", accent: "#EBC6AD" },
    { bg: "#FCEAF3", accent: "#D9A7C5" },
    { bg: "#EAF7EE", accent: "#A8D2B5" },
    { bg: "#EEF5FC", accent: "#B9CCEB" },
    { bg: "#F3EDFC", accent: "#C8B4E8" },
    { bg: "#FFF6DF", accent: "#E9D19A" },
];

const images = [
    { url: "/products/5.png", alt: "#EBC6AD" },
    { url: "/products/6.png", alt: "#D9A7C5" },
    { url: "/products/5.png", alt: "#A8D2B5" },
    { url: "/products/6.png", alt: "#B9CCEB" },
    { url: "/products/5.png", alt: "#C8B4E8" },
    { url: "/products/7.png", alt: "#E9D19A" },
];

const container = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.12 },
    },
};

const cardAnimation = {
    hidden: { opacity: 0, y: 22 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.55, ease: "easeOut" },
    },
};

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

function getProducts(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.products)) return data.products;
    if (Array.isArray(data?.data?.products)) return data.data.products;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

export default function ProductCatalog({ onAddToCart }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchProducts() {
            try {
                const response = await fetch("/api/admin/products", {
                    cache: "no-store",
                });

                if (!response.ok) {
                    throw new Error("Unable to fetch products");
                }

                const data = await response.json();

                if (!cancelled) {
                    setProducts(getProducts(data));
                }
            } catch (error) {
                console.error("Product catalog error:", error);

                if (!cancelled) setProducts([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchProducts();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="overflow-hidden border border-purple-100 bg-white px-4 py-10 sm:px-7 sm:py-12 lg:px-10 lg:py-15">
            <div className="mx-auto max-w-[1440px]">
                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.65 }}
                    className="mb-6 flex items-end justify-between gap-4"
                >
                    <div>
                        <h2 className="text-3xl font-medium leading-[1.05] tracking-[-0.02em] text-black sm:text-5xl lg:text-[58px]">
                            Find the perfect Solution
                            <span className="-mt-2 block text-[#7D45C2]">
                                for your goals
                            </span>
                        </h2>
                    </div>

                    <Link
                        href="/our-products"
                        className="mb-1 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#7D45C2] px-4 py-3 text-[11px] font-medium text-white transition hover:bg-[#6a33ad] sm:px-6"
                    >
                        Go to catalog
                        <FiArrowUpRight size={14} />
                    </Link>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-[240px] animate-pulse rounded-[15px] bg-[#F3EDFC] sm:h-[300px]"
                            />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="rounded-2xl bg-[#F7F2FC] px-5 py-12 text-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Products coming soon
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            We&apos;re preparing our collection for you.
                        </p>
                        <Link
                            href="/our-products"
                            className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7D45C2] px-5 py-3 text-sm font-medium text-white hover:bg-[#6a33ad]"
                        >
                            Explore Catalog
                            <FiArrowUpRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.12 }}
                        className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                    >
                        {products.map((product, index) => {
                            const id = product._id || product.id;
                            const price = getPrice(product);
                            const oldPrice = getOldPrice(product);
                            const colors = backgrounds[index % backgrounds.length];
                            const image = images[index % images.length];

                            return (
                                <motion.article
                                    key={id}
                                    variants={cardAnimation}
                                    whileHover={{ y: -5 }}
                                    className="group relative overflow-hidden rounded-[15px] sm:rounded-[18px]"
                                    style={{ backgroundColor: colors.bg }}
                                >
                                    <Link
                                        href={
                                            product.slug
                                                ? `/our-products/${product.slug}`
                                                : "/our-products"
                                        }
                                        aria-label={`View ${product.name || product.title || "product"}`}
                                        className="block"
                                    >
                                        <div className="relative z-10 px-3 pt-4 sm:px-4">
                                            <h3 className="line-clamp-2 text-xs font-medium tracking-widest text-[#252329] sm:text-base">
                                                {product.name || product.title || "Product"}
                                            </h3>
                                        </div>

                                        <div className="relative mx-auto h-[150px] w-full px-3 sm:h-[205px] sm:px-5 lg:h-[215px]">
                                            <motion.div
                                                className="relative h-full w-full"
                                                whileHover={{ scale: 1.07, rotate: -2 }}
                                                transition={{ duration: 0.4 }}
                                            >
                                                <Image
                                                    src={image.url}
                                                    alt={product.name || product.title || "Product"}
                                                    fill
                                                    sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 22vw"
                                                    className="object-contain p-2 drop-shadow-sm"
                                                />
                                            </motion.div>
                                        </div>
                                    </Link>

                                    <div className="relative z-10 flex items-center justify-between gap-2 px-3 pb-3 pt-1 sm:px-4">
                                        <div className="flex min-w-0 flex-wrap items-baseline gap-1.5">
                                            <span className="text-xs font-semibold text-black sm:text-base">
                                                {formatPrice(price)}
                                            </span>

                                            {oldPrice > price && (
                                                <span className="text-[9px] text-[#858085] line-through sm:text-sm">
                                                    {formatPrice(oldPrice)}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            aria-label={`Add ${product.name || product.title || "product"} to cart`}
                                            onClick={() => onAddToCart?.(product)}
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#29232F] transition duration-300 hover:scale-110 hover:bg-black hover:text-white sm:h-10 sm:w-10"
                                            style={{ backgroundColor: colors.accent }}
                                        >
                                            <FiShoppingCart size={15} />
                                        </button>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
