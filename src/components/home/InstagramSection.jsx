
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
        image: "/ig/1.png",
        alt: "Solvestic skincare lifestyle",
    },
    {
        id: 2,
        image: "/ig/2.png",
        alt: "Solvestic skincare routine",
    },
    {
        id: 3,
        image: "/ig/3.png",
        alt: "Solvestic beauty products",
    },
    {
        id: 4,
        image: "/ig/5.png",
        alt: "Solvestic everyday essentials",
    },
    {
        id: 5,
        image: "/ig/4.png",
        alt: "Solvestic self-care",
    },
    {
        id: 6,
        image: "/ig/6.png",
        alt: "Solvestic lip care",
    },
    {
        id: 7,
        image: "/ig/7.png",
        alt: "Solvestic product collection",
    },
    {
        id: 8,
        image: "/ig/8.png",
        alt: "Solvestic skincare moments",
    },
];


function InstagramCard({
    post,
    index = 0,
    className = "",
    masonry = false,
}) {
    return (
        <motion.a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{
                duration: 0.5,
                delay: Math.min(index * 0.05, 0.3),
            }}
            className={`group relative block overflow-hidden rounded-[12px] bg-[#F7F2FC] ${masonry ? "mb-2 break-inside-avoid" : "min-h-0"
                } ${className}`}
        >
            {masonry ? (
                <Image
                    src={post.image}
                    alt={post.alt}
                    width={600}
                    height={800}
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="block h-auto w-full transition-transform duration-700 group-hover:scale-110"
                />
            ) : (
                <Image
                    src={post.image}
                    alt={post.alt}
                    fill
                    sizes="20vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
            )}

            <div className="absolute inset-0 bg-black/0 transition-all duration-300 group-hover:bg-black/25" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#7D45C2] shadow-lg">
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
    // 5 desktop columns using exactly 8 images
    const columns = [
        [instagramPosts[0], instagramPosts[5]],
        [instagramPosts[1]],
        [instagramPosts[2], instagramPosts[6]],
        [instagramPosts[3]],
        [instagramPosts[4], instagramPosts[7]],
    ];

    return (
        <section className="w-full overflow-hidden border-y border-purple-200 bg-white py-10 md:py-14">

            {/* Heading */}
            <div className="mb-6 px-4 text-center md:mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="mb-3 flex items-center justify-center gap-2">
                        <FaInstagram
                            size={16}
                            className="text-[#7D45C2]"
                        />

                        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#7D45C2]">
                            Join Our Community
                        </span>
                    </div>

                    <h2 className="text-3xl font-semibold tracking-tight text-black md:text-5xl">
                        Follow Us On Instagram
                    </h2>

                    <p className="mt-3 text-sm text-gray-600 md:text-lg">
                        Your daily dose of glow, beauty &amp; self-care.{" "}
                        <a
                            href={INSTAGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#7D45C2] hover:underline"
                        >
                            @solvesticcare
                        </a>
                    </p>
                </motion.div>
            </div>

            {/* Desktop: 5-column editorial gallery */}
            <div className="hidden w-full grid-cols-5 gap-[5px] px-[10px] lg:grid">
                {columns.map((column, columnIndex) => (
                    <div
                        key={columnIndex}
                        className="flex h-[480px] min-w-0 flex-col gap-[5px] xl:h-[600px]"
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


            {/* Tablet and Mobile Masonry Grid */}
            <div className="columns-1 gap-2 px-2 sm:columns-3 sm:gap-3 sm:px-3 md:columns-4 lg:hidden">
                {instagramPosts.map((post, index) => (
                    <InstagramCard
                        key={post.id}
                        post={post}
                        index={index}
                        masonry
                    />
                ))}
            </div>



            {/* Follow button */}
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
