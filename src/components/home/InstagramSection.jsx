
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

const INSTAGRAM_URL = "https://www.instagram.com/solvesticcare";

const instagramPosts = [
    {
        id: 1,
        image: "/about2.jpg",
        alt: "Solvestic skincare lifestyle",
        layout: "stack",
    },
    {
        id: 2,
        image: "/about1.jpg",
        alt: "Solvestic skincare routine",
        layout: "tall",
    },
    {
        id: 3,
        image: "/IMG_2581.jpg.jpg",
        alt: "Solvestic beauty products",
        layout: "stack",
    },
    {
        id: 4,
        image: "/about.jpg",
        alt: "Solvestic everyday essentials",
        layout: "tall",
    },
    {
        id: 5,
        image: "/IMG_2583.jpg.jpg",
        alt: "Solvestic self-care",
        layout: "stack",
    },
    {
        id: 6,
        image: "/instagram/6.jpg",
        alt: "Solvestic glowing skin",
        layout: "tall",
    },
    {
        id: 7,
        image: "/instagram/7.jpg",
        alt: "Solvestic skincare collection",
        layout: "stack",
    },
    {
        id: 8,
        image: "/IMG_2585.jpg.jpg",
        alt: "Solvestic lip care",
    },
    {
        id: 9,
        image: "/IMG_2586.jpg.jpg",
        alt: "Solvestic product collection",
    },
    {
        id: 10,
        image: "/IMG_2587.jpg.jpg",
        alt: "Solvestic skincare moments",
    },
    {
        id: 11,
        image: "/instagram/11.jpg",
        alt: "Solvestic beauty inspiration",
    },
];

function InstagramCard({ post, index, className = "" }) {
    return (
        <motion.a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{
                duration: 0.5,
                delay: Math.min(index * 0.06, 0.4),
            }}
            className={`group relative block min-h-0 overflow-hidden rounded-[14px] bg-[#F7F2FC] ${className}`}
        >
            <Image
                src={post.image}
                alt={post.alt}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 15vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/25" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#7D45C2] shadow-lg">
                    <FaInstagram size={22} />
                </div>
            </div>

            <div className="absolute bottom-3 right-3 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight size={20} className="text-white" />
            </div>
        </motion.a>
    );
}

export default function InstagramSection() {
    const columns = [
        [instagramPosts[0], instagramPosts[7]],
        [instagramPosts[1]],
        [instagramPosts[2], instagramPosts[8]],
        [instagramPosts[3]],
        [instagramPosts[4], instagramPosts[9]],
        // [instagramPosts[5]],
        // [instagramPosts[6], instagramPosts[10]],
    ];

    return (
        <section className="w-full overflow-hidden bg-white py-10 border-y border-purple-200">
            <div className="mb-5 px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <FaInstagram size={16} className="text-[#7D45C2]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7D45C2]">
                            Join Our Community
                        </span>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-black md:text-5xl">
                        Follow Us On Instagram
                    </h2>


                    <p className="mt-3 text-sm text-gray-600 md:text-lg">
                        Your daily dose of glow, beauty & self-care.{" "}
                        <a
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#7D45C2] hover:underline"
                        >
                            @solvestic
                        </a>
                    </p>

                </motion.div>
            </div>

            {/* Desktop: seven-column editorial gallery */}
            <div className="hidden w-full grid-cols-5 gap-[5px] px-[10px] lg:grid">
                {columns.map((column, columnIndex) => (
                    <div
                        key={columnIndex}
                        className="flex h-[520px] min-w-0 flex-col gap-[5px] xl:h-[600px]"
                    >
                        {column.map((post, postIndex) => (
                            <InstagramCard
                                key={post.id}
                                post={post}
                                index={columnIndex + postIndex}
                                className={
                                    column.length === 1
                                        ? "h-full"
                                        : "flex-1"
                                }
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Tablet and mobile masonry-style gallery */}
            <div className="grid grid-cols-2 gap-2 px-3 sm:grid-cols-3 md:grid-cols-4 lg:hidden">
                {instagramPosts.map((post, index) => (
                    <InstagramCard
                        key={post.id}
                        post={post}
                        index={index}
                        className={`${index % 5 === 1
                            ? "aspect-[3/5]"
                            : "aspect-[4/5]"
                            }`}
                    />
                ))}
            </div>

            <div className="mt-8 flex justify-center px-4">
                <a
                    href={INSTAGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-3 rounded-full border border-[#7D45C2] px-7 py-3.5 text-sm font-semibold text-[#7D45C2] transition-all duration-300 hover:bg-[#7D45C2] hover:text-white"
                >
                    <FaInstagram size={18} />
                    Follow Us On Instagram
                    <ArrowUpRight
                        size={17}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                </a>
            </div>
        </section>
    );
}
