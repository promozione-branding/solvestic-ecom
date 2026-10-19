"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
    Sprout,
    ShieldCheck,
    Sparkles,
    Droplets,
    Leaf,
    Heart,
} from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";

const products = [
    {
        main: "Instant Radiance",
        name: "Rapid Pigment-Correcting Face Cleanser",
        image: "/products/5.png",
        tagline: "Make every wash a moment of care.",
        subtitle: "Natural beauty shines. Reveal your skin and refresh your routine.",
        benefits: [
            {
                title: "Efficient Cleaning",
                description: "Helps remove dirt, excess oil and impurities for a fresh, clean feel.",
                icon: Sprout,
                position: "top-left",
            },
            {
                title: "Illuminating",
                description: "Dimness and skin color irregularity can be helped with Niacinamide and Glycolic Acid.",
                icon: ShieldCheck,
                position: "top-right",
            },
            {
                title: "Nourishing and Soothing",
                description: "Smooth, comfortable, soft skin with D-Panthenol and Betaine.",
                icon: Sparkles,
                position: "bottom-left",
            },
            {
                title: "Designed to Refresh",
                description: "With a soft, creamy texture and easily rinsable, perfect to use daily for cleaning and preparing skin.",
                icon: Droplets,
                position: "bottom-right",
            },
        ],
    },
    {
        main: "Add Bounce To Your Glow",
        name: "Rapid Pigment Correcting Bouncy Moisturiser",
        image: "/products/7.webp",
        tagline: "Bouncy Moisturiser with 2% Niacinamide, Alpha Arbutin and Hyaluronic Acid",
        subtitle: "Long lasting hydration and a brighter, more even-looking complexion",
        benefits: [
            {
                title: "Deep Hydration",
                description: "Replenishes moisture to promote soft, supple-looking skin.",
                icon: Sprout,
                position: "top-left",
            },
            {
                title: "Brighten Up Dullness",
                description: "Reduces the appearance of dull skin and uneven skin tone.",
                icon: ShieldCheck,
                position: "top-right",
            },
            {
                title: "Barrier Care",
                description: "Helps the skin retain moisture by filling the gaps in the skin barrier with ceramides.",
                icon: Sparkles,
                position: "bottom-left",
            },
            {
                title: "Easy Breezy Care",
                description: "Bouncy gel formula absorbs quickly for lightweight hydration with no sticky feel.",
                icon: Droplets,
                position: "bottom-right",
            },
        ],
    },
];

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            ease: "easeOut",
        },
    },
};

const cardPositions = {
    "top-left": "lg:left-0 lg:top-[7%]",
    "top-right": "lg:right-0 lg:top-[7%]",
    "bottom-left": "lg:left-10 lg:bottom-[7%]",
    "bottom-right": "lg:right-10 lg:bottom-[7%]",
};

export default function ActivatorSection() {
    return (
        <section className="relative overflow-hidden bg-[#F7F2FC] px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15">
            {/* Background glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d2efd9]/60 blur-[100px]" />

            <div className="relative mx-auto max-w-[1350px]">
                <Swiper
                    modules={[Autoplay, Pagination]}
                    slidesPerView={1}
                    spaceBetween={30}
                    loop
                    autoplay={{
                        delay: 5000,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    pagination={{ clickable: true }}
                    className="product-benefits-swiper !pb-12"
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.name}>
                            {/* Heading */}
                            <motion.div
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.7 }}
                                className="relative z-10 mx-auto mb-10 max-w-5xl text-center"
                            >
                                <h2 className="text-3xl font-medium leading-[1] tracking-[-0.02em] text-[#24252a] sm:text-5xl lg:text-[45px]">
                                    {product.main}
                                    <span className="mt-2 block text-[#7D45C2]">
                                        {product.name}
                                    </span>
                                </h2>
                            </motion.div>

                            {/* Product and benefits */}
                            <div className="relative mx-auto max-w-[1120px]">
                                {/* Center product */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.88, y: 20 }}
                                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                    viewport={{ once: false }}
                                    transition={{ duration: 0.8 }}
                                    className="relative z-10 mx-auto flex h-[300px] w-full max-w-[340px] items-center justify-center sm:h-[390px] sm:max-w-[420px] lg:h-[460px] lg:max-w-[430px]"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.06, 1],
                                            opacity: [0.45, 0.7, 0.45],
                                        }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="absolute h-[230px] w-[230px] rounded-full bg-white/80 blur-3xl sm:h-[320px] sm:w-[320px]"
                                    />

                                    <motion.div
                                        animate={{ y: [0, -9, 0] }}
                                        transition={{
                                            duration: 4,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        }}
                                        className="relative h-full w-full"
                                    >
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 90vw, 430px"
                                            className="object-contain drop-shadow-[0_20px_25px_rgba(39,62,43,0.12)]"
                                        />
                                    </motion.div>
                                </motion.div>

                                {/* Four connecting SVG lines */}
                                <svg
                                    aria-hidden="true"
                                    className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible lg:block"
                                    viewBox="0 0 1120 460"
                                    fill="none"
                                    preserveAspectRatio="none"
                                >
                                    {[
                                        "M245 85 H350 Q375 85 375 110 V150 H445",
                                        "M875 85 H770 Q745 85 745 110 V150 H675",
                                        "M245 365 H350 Q375 365 375 340 V300 H445",
                                        "M875 365 H770 Q745 365 745 340 V300 H675",
                                    ].map((path, index) => (
                                        <motion.path
                                            key={path}
                                            d={path}
                                            stroke="#7D45C2"
                                            strokeWidth="1.2"
                                            initial={{ pathLength: 0 }}
                                            whileInView={{ pathLength: 1 }}
                                            viewport={{ once: false }}
                                            transition={{
                                                duration: 1,
                                                delay: index * 0.15,
                                            }}
                                        />
                                    ))}

                                    {[
                                        [445, 150],
                                        [675, 150],
                                        [445, 300],
                                        [675, 300],
                                    ].map(([cx, cy], index) => (
                                        <motion.circle
                                            key={index}
                                            cx={cx}
                                            cy={cy}
                                            r="4"
                                            fill="#7D45C2"
                                            initial={{ scale: 0, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            viewport={{ once: false }}
                                            transition={{ delay: 0.7 + index * 0.12 }}
                                        />
                                    ))}
                                </svg>

                                {/* Four benefit cards */}
                                <div className="relative z-20 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:absolute lg:inset-0 lg:block">
                                    {product.benefits.map((benefit, index) => {
                                        const Icon = benefit.icon;

                                        return (
                                            <motion.article
                                                key={benefit.position}
                                                variants={cardVariants}
                                                initial="hidden"
                                                whileInView="visible"
                                                viewport={{ once: false }}
                                                transition={{ delay: index * 0.12 }}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                className={`group rounded-2xl border border-white/80 bg-white/80 p-4 shadow-[0_8px_25px_rgba(77,117,85,0.06)] backdrop-blur-md transition-colors duration-300 hover:bg-white sm:p-5 lg:absolute lg:w-[300px] ${cardPositions[benefit.position]}`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <h3 className="text-base font-medium tracking-wide text-[#303831] sm:text-lg">
                                                        {benefit.title}
                                                    </h3>

                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eee9f4] text-[#7D45C2] transition-all duration-300 group-hover:rotate-12 group-hover:bg-[#7D45C2] group-hover:text-white">
                                                        <Icon size={17} strokeWidth={1.6} />
                                                    </span>
                                                </div>

                                                <p className="mt-2 text-xs font-light leading-[1.8] text-black sm:text-sm">
                                                    {benefit.description}
                                                </p>

                                                <div className="mt-4 h-[2px] w-8 rounded-full bg-[#7D45C2] transition-all duration-500 group-hover:w-16" />
                                            </motion.article>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Bottom statement */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false }}
                                transition={{ duration: 0.7, delay: 0.2 }}
                                className="relative z-10 mx-auto mt-9 max-w-lg text-center lg:mt-5"
                            >
                                <span className="mx-auto mb-3 block h-px w-12 bg-[#7D45C2]" />

                                <p className="text-xs font-light leading-6 text-[#7D45C2] sm:text-sm">
                                    {product.tagline}
                                    <span className="block">
                                        {product.subtitle}
                                    </span>
                                </p>
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            <style jsx global>{`
                .product-benefits-swiper .swiper-pagination {
                    bottom: 0 !important;
                }

                .product-benefits-swiper .swiper-pagination-bullet {
                    width: 7px;
                    height: 7px;
                    background: #7d45c2;
                    opacity: 0.35;
                    transition: all 0.3s ease;
                }

                .product-benefits-swiper .swiper-pagination-bullet-active {
                    width: 22px;
                    border-radius: 999px;
                    opacity: 1;
                }
            `}</style>
        </section>
    );
}