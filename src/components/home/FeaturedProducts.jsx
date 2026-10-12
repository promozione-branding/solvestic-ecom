
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Droplets, Sun } from "lucide-react";

const products = [
    {
        id: 1,
        category: "Daily essentials",
        title: "Pigment Correcting\nFace Cleanser",
        description:
            "A refreshing cleansing ritual for skin that looks clearer, smoother and more radiant.",
        image: "/Lavender Cleanser on Creamy Waves (1).png",
        thumbnail: "/Lavender Cleanser on Creamy Waves (1).png",
        background: "#FCE9E2",
        icon: Sparkles,
        layout: "large",
        href: "/products/pigment-correcting-face-cleanser",
    },
    {
        id: 2,
        category: "Hydration",
        title: "Hydra-Crème\n100H",
        description:
            "Discover a comforting hydration ritual for soft, supple-looking skin.",
        image: "/Lavender Solvestic Skincare Still Life (1) (1).png",
        thumbnail: "/Lavender Solvestic Skincare Still Life (1) (1).png",
        background: "#F0EBFA",
        icon: Droplets,
        layout: "small",
        href: "/products/hydra-creme",
    },
];

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: "easeOut" },
    },
};

export default function FeaturedProducts() {
    return (
        <section className="overflow-hidden bg-white px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15 border border-purple-100">
            <div className="mx-auto max-w-[1440px]">

                {/* Hero heading */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.3 }}
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.15 } },
                    }}
                    className="mx-auto mb-8 max-w-3xl text-center"
                >
                    <motion.div
                        variants={fadeUp}
                        className="mb-1 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
                    >
                        <h2 className="text-3xl font-medium tracking-[-0.02em] text-[#222027] sm:text-5xl">
                            Your Daily Skincare
                        </h2>

                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#DCD7F4] text-[#7D45C2]">
                            <Sparkles size={18} />
                        </span>

                        <h2 className="text-3xl font-medium tracking-[-0.02em] text-[#222027] sm:text-5xl">
                            Essentials
                        </h2>
                    </motion.div>

                    <motion.h3
                        variants={fadeUp}
                        className="text-2xl font-light tracking-[-0.02em] text-[#7D45C2] sm:text-4xl lg:text-5xl"
                    >
                        Gentle care.{" "}
                        <span className="text-[#7D45C2]">Visible results.</span>
                    </motion.h3>
                </motion.div>

                {/* Featured product grid */}
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.12 }}
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.16 } },
                    }}
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
                        {/* Large product card */}
                        <motion.article
                            variants={fadeUp}
                            whileHover={{ y: -4 }}
                            className="group relative min-h-[390px] overflow-hidden rounded-[18px] sm:min-h-[420px] lg:col-span-5"
                        >
                            {/* Full background image */}
                            <Image
                                src="/Lavender Cleanser Creamwave Studio (1).png"
                                alt="Solvestic pigment correcting face cleanser"
                                fill
                                priority
                                sizes="(max-width: 640px) 100vw, 42vw"
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Soft overlay for readable content */}
                            {/* <div className="absolute inset-0 bg-gradient-to-r from-[#FCE9E2]/95 via-[#FCE9E2]/75 to-transparent" /> */}

                            {/* Card content */}
                            <div className="relative z-10 flex min-h-[390px] items-center p-5 sm:min-h-[420px] sm:p-7">
                                <div className="max-w-[60%]">
                                    <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.13em] text-[#7D45C2]">
                                        <Sparkles size={13} />
                                        Daily essentials
                                    </span>

                                    <h4 className="whitespace-pre-line text-2xl font-medium leading-tight tracking-tight text-[#28232b] sm:text-3xl">
                                        Pigment Correcting{"\n"}Face Cleanser
                                    </h4>

                                    <p className="mt-3 text-xs leading-6 text-[#69616b] sm:text-sm">
                                        A refreshing cleansing ritual for skin that looks clearer,
                                        smoother and more radiant.
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-2">
                                        <Link
                                            href="/products/pigment-correcting-face-cleanser"
                                            className="rounded-full bg-black px-4 py-3 text-xs font-medium text-white transition hover:bg-[#7D45C2]"
                                        >
                                            Get Started
                                        </Link>

                                        <Link
                                            href="/products/pigment-correcting-face-cleanser"
                                            className="rounded-full bg-white px-4 py-3 text-xs font-medium text-[#332c35] transition hover:bg-[#f5efff]"
                                        >
                                            Learn More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.article>

                        {/* Compact product card */}
                        <motion.article
                            variants={fadeUp}
                            whileHover={{ y: -4 }}
                            className="group relative min-h-[390px] overflow-hidden rounded-[18px] sm:min-h-[420px] lg:col-span-3"
                        >
                            <Image
                                src="/Lavender Solvestic Skincare Still Life (1) (1).png"
                                alt="Solvestic hydrating skincare"
                                fill
                                sizes="(max-width: 640px) 100vw, 25vw"
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#F0EBFA]/25 via-[#F0EBFA]/15 to-[#F0EBFA]/5" />

                            <div className="relative z-10 flex min-h-[390px] flex-col p-5 sm:min-h-[420px] sm:p-6">
                                <div className="flex items-center justify-between">
                                    <span className="rounded-full bg-white/85 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-[#7D45C2]">
                                        Hydration
                                    </span>
                                    <Droplets size={19} className="text-[#7D45C2]" />
                                </div>

                                <div className="mt-auto">
                                    <h4 className="whitespace-pre-line text-2xl font-medium leading-tight text-[#28232b]">
                                        Hydra-Crème 100H
                                    </h4>

                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Link
                                            href="/products/hydra-creme"
                                            className="rounded-full bg-black px-4 py-3 text-xs font-medium text-white transition hover:bg-[#7D45C2]"
                                        >
                                            Get Started
                                        </Link>

                                        <Link
                                            href="/products/hydra-creme"
                                            className="rounded-full bg-white px-4 py-3 text-xs font-medium text-[#332c35] transition hover:bg-[#e4dcf8]"
                                        >
                                            Learn More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.article>

                        {/* Lifestyle image card */}
                        <motion.article
                            variants={fadeUp}
                            whileHover={{ y: -4 }}
                            className="group relative min-h-[390px] overflow-hidden rounded-[18px] bg-[#D8DFF0] sm:col-span-2 sm:min-h-[420px] lg:col-span-4"
                        >
                            <Image
                                src="/Radiant Skincare Glow with Lavender Moisturizer (1).png"
                                alt="Skincare as part of an everyday self-care ritual"
                                fill
                                sizes="(max-width: 1024px) 100vw, 35vw"
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />

                            <div className="absolute left-5 top-5">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-[10px] font-medium text-[#332c35]">
                                    <Sun size={14} className="text-[#7D45C2]" />
                                    Everyday self-care
                                </span>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                                <h4 className="max-w-sm text-3xl font-medium leading-tight tracking-[-0.02em] text-white sm:text-4xl">
                                    Confidence starts with skincare.
                                </h4>

                                <p className="max-w-sm text-sm leading-6 text-white/85">
                                    Make space for yourself, one skincare ritual at a time.
                                </p>

                                <Link
                                    href="/products"
                                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-medium text-[#29232f] transition hover:bg-[#e8e1fb]"
                                >
                                    Explore the collection
                                    <ArrowUpRight size={15} />
                                </Link>
                            </div>
                        </motion.article>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
