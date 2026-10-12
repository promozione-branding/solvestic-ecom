
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiShoppingCart, FiArrowUpRight } from "react-icons/fi";
import Link from "next/link";

const products = [
    {
        id: 1,
        name: "Undereye Corrector",
        price: 49.99,
        oldPrice: 69.59,
        image: "/products/5.png",
        bg: "#FFF0E8",
        accent: "#EBC6AD",
        href: "/products/undereye-corrector",
    },
    {
        id: 2,
        name: "Exfoliation Gel",
        price: 49.99,
        oldPrice: 69.59,
        image: "/products/6.png",
        bg: "#FCEAF3",
        accent: "#D9A7C5",
        href: "/products/exfoliation-gel",
    },
    {
        id: 3,
        name: "Activator Shampoo",
        price: 49.99,
        oldPrice: 69.59,
        image: "/products/5.png",
        bg: "#EAF7EE",
        accent: "#A8D2B5",
        href: "/products/activator-shampoo",
    },
    {
        id: 4,
        name: "Pheromone Spray",
        price: 49.99,
        oldPrice: 69.59,
        image: "/products/6.png",
        bg: "#EEF5FC",
        accent: "#B9CCEB",
        href: "/products/pheromone-spray",
    },
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

export default function ProductCatalog({ onAddToCart }) {
    return (
        <section className="overflow-hidden bg-white border border-purple-100 px-4 py-10 sm:px-7 sm:py-12 lg:px-10 lg:py-15">
            <div className="mx-auto max-w-[1440px]">
                {/* Section heading */}
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
                        href="/products"
                        className="mb-1 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#7D45C2] px-4 py-3 text-[11px] font-medium text-white transition hover:bg-[#6a33ad] sm:px-6"
                    >
                        Go to catalog
                        <FiArrowUpRight size={14} />
                    </Link>
                </motion.div>

                {/* Four product cards */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.12 }}
                    className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                >
                    {products.map((product) => (
                        <motion.article
                            key={product.id}
                            variants={cardAnimation}
                            whileHover={{ y: -5 }}
                            className="group relative overflow-hidden rounded-[15px] sm:rounded-[18px]"
                            style={{ backgroundColor: product.bg }}
                        >
                            <Link
                                href={product.href}
                                aria-label={`View ${product.name}`}
                                className="block"
                            >
                                {/* Product name */}
                                <div className="relative z-10 px-3 pt-4 sm:px-4">
                                    <h3 className="text-xs font-medium tracking-widest text-[#252329] sm:text-base">
                                        {product.name}
                                    </h3>
                                </div>

                                {/* Product image */}
                                <div className="relative mx-auto h-[150px] w-full px-3 sm:h-[205px] sm:px-5 lg:h-[215px]">
                                    <motion.div
                                        className="relative h-full w-full"
                                        whileHover={{ scale: 1.07, rotate: -2 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 22vw"
                                            className="object-contain p-2 drop-shadow-sm"
                                        />
                                    </motion.div>
                                </div>
                            </Link>

                            {/* Price and cart */}
                            <div className="relative z-10 flex items-center justify-between gap-2 px-3 pb-3 pt-1 sm:px-4">
                                <div className="flex flex-wrap items-baseline gap-1">
                                    <span className="text-xs font-semibold text-black sm:text-base">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    <span className="text-[9px] text-[#858085] line-through sm:text-sm">
                                        ${product.oldPrice.toFixed(2)}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    aria-label={`Add ${product.name} to cart`}
                                    onClick={() => onAddToCart?.(product)}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#29232F] transition duration-300 hover:scale-110 hover:bg-black hover:text-white sm:h-10 sm:w-10"
                                    style={{ backgroundColor: product.accent }}
                                >
                                    <FiShoppingCart size={15} />
                                </button>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
