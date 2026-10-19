
"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import axios from "axios";
import {
    Star,
    ArrowUpRight,
    Quote,
    UserRound,
    LoaderCircle,
    Image as ImageIcon,
    Video,
} from "lucide-react";

import ProductReviewForm from "./ProductReviewForm";
import Link from "next/link";

const PURPLE = "#7D45C2";

function formatDate(date) {
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date));
}

function getInitials(name = "Customer") {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
}

function StarRating({ rating = 0, size = 15 }) {
    return (
        <div
            className="flex items-center gap-1"
            aria-label={`${Number(rating).toFixed(1)} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = Math.min(
                    100,
                    Math.max(0, (Number(rating) - star + 1) * 100)
                );

                return (
                    <span
                        key={star}
                        className="relative inline-flex"
                        style={{ width: size, height: size }}
                    >
                        <Star
                            size={size}
                            className="absolute inset-0 text-[#ded4e8]"
                        />

                        <span
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: `${fill}%` }}
                        >
                            <Star
                                size={size}
                                className="max-w-none fill-[#7D45C2] text-[#7D45C2]"
                            />
                        </span>
                    </span>
                );
            })}
        </div>
    );
}

export default function ReviewsSection({ productId, user, slug }) {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        },
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [reviewOpen, setReviewOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchReviews = useCallback(async (requestedPage = 1) => {
        if (!productId) {
            setReviews([]);
            setSummary({
                averageRating: 0,
                totalReviews: 0,
                ratingBreakdown: {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                },
            });
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("");

        try {
            const { data } = await axios.get(`/api/user/reviews/${productId}`, {
                params: { page: requestedPage, limit: 10, },
            });
            console.log(data)
            setReviews((previous) => requestedPage === 1 ? data.reviews : [...previous, ...data.reviews]);
            setSummary(data.summary);
            setPage(requestedPage);
            setHasMore(data.pagination.hasMore);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load reviews right now."
            );
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews(1);
    }, [fetchReviews]);

    const { averageRating, totalReviews, ratingBreakdown } = summary;

    return (
        <section className="overflow-hidden border border-purple-200 bg-white px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15">
            <div className="mx-auto max-w-7xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 max-w-3xl"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7D45C2]">
                        Love from our community
                    </p>

                    <h2 className="mt-1 text-3xl flex gap-1 font-medium leading-tight tracking-[-0.015em] text-[#28222e] sm:text-5xl">
                        Real routines. {" "}
                        <h2 className="text-[#7D45C2]">
                            Radiant reviews.
                        </h2>
                    </h2>

                    <p className="mt-1 max-w-xl text-sm leading-7 text-[#716a78] sm:text-base">
                        Discover what customers are saying about their
                        Solvestic skincare experience.
                    </p>
                </motion.div>

                <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_0.8fr] lg:gap-16">
                    <div className="space-y-4">
                        {loading && reviews.length === 0 && (
                            <div className="flex justify-center py-16">
                                <LoaderCircle className="h-8 w-8 animate-spin text-[#7D45C2]" />
                            </div>
                        )}

                        {!loading && error && reviews.length === 0 && (
                            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
                                <p>{error}</p>

                                <button
                                    type="button"
                                    onClick={() => fetchReviews(1)}
                                    className="mt-3 font-semibold underline"
                                >
                                    Try again
                                </button>
                            </div>
                        )}

                        {!loading && !error && reviews.length === 0 && (
                            <div className="rounded-2xl border border-[#eee7f4] bg-[#fcfaff] px-5 py-12 text-center">
                                <Star
                                    className="mx-auto text-[#7D45C2]"
                                    size={34}
                                />

                                <h3 className="mt-4 text-lg font-semibold text-[#30253D]">
                                    Be the first to review
                                </h3>

                                <p className="mt-2 text-sm text-[#716a78]">
                                    Share your experience with this product.
                                </p>

                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!user) {
                                            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                                            return;
                                        }

                                        setReviewOpen(true);
                                    }}
                                    className="mt-5 rounded-full bg-[#7D45C2] px-6 py-3 text-sm font-medium text-white hover:bg-[#6736a6]"
                                >
                                    Write the first review
                                </button>
                            </div>
                        )}

                        {reviews.map((item, index) => (
                            <motion.article
                                key={item._id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{
                                    duration: 0.45,
                                    delay: Math.min(index % 5, 4) * 0.08,
                                }}
                                className="rounded-2xl border border-[#eee7f4] bg-[#fcfaff] p-5 transition-colors hover:border-[#7D45C2]/30 sm:p-7"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eadcf8] text-sm font-semibold text-[#553276]">
                                        {getInitials(item.customerName)}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <h3 className="text-sm font-semibold tracking-wide text-[#302936]">
                                                    {item.customerName}
                                                </h3>

                                                <p className="mt-1 text-xs text-[#98909e]">
                                                    {formatDate(item.createdAt)}
                                                </p>
                                            </div>

                                            <StarRating
                                                rating={item.rating}
                                            />
                                        </div>

                                        <h4 className="mt-4 text-base font-semibold text-[#302936]">
                                            {item.title}
                                        </h4>

                                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#716a78]">
                                            {item.review}
                                        </p>

                                        {item.isVerifiedPurchase && (
                                            <span className="mt-3 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-[#6736a6]">
                                                Verified purchase
                                            </span>
                                        )}

                                        {item.media?.length > 0 && (
                                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                                {item.media.map((media) => (
                                                    <div
                                                        key={media._id || media.key}
                                                        className="overflow-hidden rounded-xl border border-[#eee7f4] bg-white"
                                                    >
                                                        {media.type === "video" ? (
                                                            <video
                                                                src={media.url}
                                                                controls
                                                                playsInline
                                                                preload="metadata"
                                                                className="aspect-square w-full object-contain"
                                                            />
                                                        ) : (
                                                            <a
                                                                href={media.url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="block"
                                                                aria-label="View review image"
                                                            >
                                                                <Image
                                                                    src={media.url}
                                                                    alt={`Photo from ${item.customerName}'s review`}
                                                                    width={500}
                                                                    height={500}
                                                                    unoptimized
                                                                    className="aspect-square w-full object-cover transition duration-300 hover:scale-105"
                                                                />
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.article>
                        ))}

                        {hasMore && (
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => fetchReviews(page + 1)}
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-[#7D45C2]/25 px-6 py-4 text-sm font-medium text-[#7D45C2] transition hover:bg-[#7D45C2]/5 disabled:opacity-50"
                            >
                                {loading && (
                                    <LoaderCircle
                                        size={17}
                                        className="animate-spin"
                                    />
                                )}
                                Load more reviews
                            </button>
                        )}

                        {error && reviews.length > 0 && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="lg:sticky lg:top-24"
                    >
                        <div className="rounded-[2rem] bg-[#f3eef8] p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                                Customer reviews
                            </p>

                            <h3 className="mt-2 text-3xl font-medium tracking-[-0.04em] text-[#28222e]">
                                What customers think
                            </h3>

                            <div className="mt-5 flex items-center gap-4 border-b border-[#7D45C2]/15 pb-5">
                                <div className="text-5xl font-medium tracking-tight text-[#28222e]">
                                    {averageRating.toFixed(1)}
                                </div>

                                <div>
                                    <StarRating
                                        rating={Math.round(averageRating)}
                                        size={16}
                                    />

                                    <p className="mt-2 text-xs text-[#716a78]">
                                        {totalReviews}{" "}
                                        {totalReviews === 1
                                            ? "review"
                                            : "reviews"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {[5, 4, 3, 2, 1].map((stars) => {
                                    const count = ratingBreakdown[stars] || 0;
                                    const percentage = totalReviews
                                        ? (count / totalReviews) * 100
                                        : 0;

                                    return (
                                        <div
                                            key={stars}
                                            className="flex items-center gap-3"
                                        >
                                            <span className="w-12 shrink-0 text-xs font-medium text-[#302936]">
                                                {stars} star
                                            </span>

                                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                                                <div
                                                    className="h-full rounded-full bg-[#7D45C2] transition-all duration-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                />
                                            </div>

                                            <span className="w-7 text-right text-xs text-[#89818f]">
                                                {count}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 space-y-3 border-t border-[#7D45C2]/15 pt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!user) {
                                            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                                            return;
                                        }

                                        setReviewOpen(true);
                                    }}
                                    className="group flex w-full items-center justify-center gap-2 rounded-full bg-[#7D45C2] px-6 py-4 text-sm font-medium text-white transition hover:bg-[#6736a6]"
                                >
                                    <Star size={17} />
                                    Add a Review
                                    <ArrowUpRight
                                        size={17}
                                        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    />
                                </button>

                                <Link
                                    href={`${slug}/reviews`}
                                    className="flex w-full items-center justify-center gap-2 rounded-full border border-[#7D45C2]/25 bg-white px-6 py-4 text-sm font-medium text-[#7D45C2] transition hover:bg-[#7D45C2]/5"
                                >
                                    Read All Reviews
                                    <ArrowUpRight size={17} />
                                </Link>
                            </div>

                            <p className="mt-4 text-center text-[10px] leading-5 text-[#89818f]">
                                Showing approved customer reviews.
                            </p>
                        </div>
                    </motion.aside>
                </div>
            </div>

            <ProductReviewForm
                productId={productId}
                open={reviewOpen}
                onClose={() => setReviewOpen(false)}
                onSuccess={() => {
                    // Submitted reviews remain pending until approved.
                    // Refresh the public reviews to keep displayed data current.
                    fetchReviews(1);
                }}
            />
        </section>
    );
}
