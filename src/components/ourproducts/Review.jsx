"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Star,
    ArrowUpRight,
    Quote,
    UserRound,
} from "lucide-react";

const reviews = [
    {
        name: "Priya Sharma",
        initials: "PS",
        date: "September 18, 2026",
        rating: 5,
        title: "A beautiful glow!",
        review:
            "I love how fresh and radiant my skin looks after using this. It feels lightweight and fits perfectly into my daily skincare routine.",
        color: "bg-[#eadcf8]",
    },
    {
        name: "Aarushi Mehta",
        initials: "AM",
        date: "September 12, 2026",
        rating: 5,
        title: "My new daily essential",
        review:
            "The texture feels lovely on my skin, and it gives me a nice, healthy-looking finish. I also love how it sits under makeup.",
        color: "bg-[#f4e2df]",
    },
    {
        name: "Kavya Verma",
        initials: "KV",
        date: "September 5, 2026",
        rating: 5,
        title: "Feels so refreshing",
        review:
            "A lovely addition to my routine. My skin feels hydrated, and I really enjoy the soft, radiant look it gives.",
        color: "bg-[#e2e9d9]",
    },
];

export default function ReviewsSection() {
    return (
        <section className="overflow-hidden bg-white border border-purple-200 px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15">
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 max-w-2xl"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7D45C2]">
                        Love from our community
                    </p>

                    <h2 className="text-3xl font-medium leading-tight tracking-[-0.015em] text-[#28222e] sm:text-5xl">
                        Real routines.
                        <span className="text-[#7D45C2]">
                            {" "}Radiant reviews.
                        </span>
                    </h2>

                    <p className="max-w-xl text-sm leading-7 text-[#716a78] sm:text-base">
                        Discover what customers are saying about their
                        Solvestic skincare experience.
                    </p>
                </motion.div>

                {/* REVIEWS + SUMMARY */}
                <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_0.8fr] lg:gap-16">
                    {/* LEFT: THREE REVIEWS */}
                    <div className="space-y-4">
                        {reviews.map((review, index) => (
                            <motion.article
                                key={review.initials}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: false, amount: 0.15 }}
                                transition={{
                                    duration: 0.55,
                                    delay: index * 0.12,
                                }}
                                className="rounded-2xl border border-[#eee7f4] bg-[#fcfaff] p-5 transition-colors duration-300 hover:border-[#7D45C2]/30 sm:p-7"
                            >
                                <div className="flex items-start gap-4">

                                    {/* AVATAR */}
                                    <div
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${review.color} text-sm font-semibold text-[#553276]`}
                                    >
                                        {review.initials}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div>
                                                <h3 className="text-sm tracking-wider font-semibold text-[#302936]">
                                                    {review.name}
                                                </h3>

                                                <p className="mt-1 text-xs text-[#98909e]">
                                                    {review.date}
                                                </p>
                                            </div>

                                            <div
                                                className="flex items-center gap-1"
                                                aria-label={`${review.rating} out of 5 stars`}
                                            >
                                                {Array.from({ length: review.rating, }).map((_, i) => (<Star
                                                    key={i}
                                                    className="h-3.5 w-3.5 fill-[#7D45C2] text-[#7D45C2]"
                                                />
                                                ))}
                                            </div>
                                        </div>

                                        <h4 className="mt-4 text-base font-semibold text-[#302936]">
                                            {review.title}
                                        </h4>

                                        <p className="mt-2 text-sm text-[#716a78]">
                                            {review.review}
                                        </p>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>

                    {/* RIGHT: REVIEW SUMMARY */}
                    <motion.aside
                        initial={{ opacity: 0, x: 25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 0.7 }}
                        className="lg:sticky lg:top-24"
                    >
                        <div className="rounded-[2rem] bg-[#f3eef8] p-6">

                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                                Customer reviews
                            </p>

                            <h3 className="text-3xl font-medium tracking-[-0.04em] text-[#28222e]">
                                What customers think
                            </h3>

                            {/* OVERALL RATING */}
                            <div className="mt-4 flex items-center gap-4 border-b border-[#7D45C2]/15 pb-4">
                                <div className="text-5xl font-medium tracking-tight text-[#28222e]">
                                    4.8
                                </div>

                                <div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className="h-4 w-4 fill-[#7D45C2] text-[#7D45C2]"
                                            />
                                        ))}
                                    </div>

                                    <p className="mt-1 text-xs text-[#716a78]">
                                        Based on customer reviews
                                    </p>
                                </div>
                            </div>

                            {/* STAR RATING BREAKDOWN */}
                            <div className="mt-6 space-y-3">
                                {[
                                    { stars: 5, count: 80, percentage: 80 },
                                    { stars: 4, count: 15, percentage: 15 },
                                    { stars: 3, count: 3, percentage: 3 },
                                    { stars: 2, count: 1, percentage: 1 },
                                    { stars: 1, count: 1, percentage: 1 },
                                    { stars: 0, count: 0, percentage: 0 },
                                ].map((rating) => (
                                    <div
                                        key={rating.stars}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="w-12 shrink-0 text-xs font-medium text-[#302936]">
                                            {rating.stars} {rating.stars === 1 ? "star" : "stars"}
                                        </span>

                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                                            <div
                                                className="h-full rounded-full bg-[#7D45C2] transition-all duration-700"
                                                style={{ width: `${rating.percentage}%` }}
                                            />
                                        </div>

                                        <span className="w-7 text-right text-xs text-[#89818f]">
                                            {rating.count}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="mt-8 space-y-3 border-t border-[#7D45C2]/15 pt-6">

                                <button
                                    type="button"
                                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#7D45C2] px-6 py-4 text-sm font-medium text-white transition-colors duration-300 hover:bg-[#6736a6]"
                                >
                                    <Star className="h-4 w-4" />
                                    Add a Review
                                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </button>

                                <a
                                    href="/reviews"
                                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#7D45C2]/25 bg-white px-6 py-4 text-sm font-medium text-[#7D45C2] transition-colors duration-300 hover:bg-[#7D45C2]/5"
                                >
                                    Read All Reviews
                                    <ArrowUpRight className="h-4 w-4" />
                                </a>
                            </div>

                            <p className="mt-4 text-center text-[10px] leading-5 text-[#89818f]">
                                Sample rating data. Replace with actual customer review statistics.
                            </p>
                        </div>
                    </motion.aside>
                </div>
            </div>
        </section>
    );
}