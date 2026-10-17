"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    LoaderCircle,
    MessageSquare,
    Star,
    Video,
} from "lucide-react";

const PURPLE = "#7D45C2";
const LIMIT = 10;

function StarRating({ rating = 0, size = 17 }) {
    const value = Number(rating) || 0;

    return (
        <div
            className="flex items-center gap-1"
            aria-label={`${value.toFixed(1)} out of 5 stars`}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const fill = Math.min(
                    100,
                    Math.max(0, (value - star + 1) * 100)
                );

                return (
                    <span
                        key={star}
                        className="relative inline-flex shrink-0"
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

function formatDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export default function AllProductReviews({
    productId,
    productName,
    productSlug,
}) {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({
        averageRating: 0,
        totalReviews: 0,
        ratingBreakdown: {},
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await axios.get(
                `/api/user/reviews/${productId}`,
                {
                    params: { page, limit: LIMIT },
                }
            );

            setReviews(data.reviews || []);
            setSummary({
                averageRating: Number(data.summary?.averageRating || 0),
                totalReviews: Number(data.summary?.totalReviews || 0),
                ratingBreakdown: data.summary?.ratingBreakdown || {},
            });
            setTotalPages(Math.max(1, Number(data.pagination?.totalPages || 1)));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load reviews. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [productId, page]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-10 text-[#20172B] sm:px-6 lg:px-10 lg:py-16">
            <div className="mx-auto max-w-6xl">
                <Link
                    href={`/our-products/${productSlug}`}
                    className="mb-8 inline-flex items-center gap-2 text-sm text-[#7D45C2] transition hover:opacity-70"
                >
                    <ArrowLeft size={17} />
                    Back to {productName}
                </Link>

                <div className="mb-10">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#7D45C2]">
                        Customer feedback
                    </p>

                    <h1 className="text-3xl font-semibold sm:text-4xl">
                        Reviews for {productName}
                    </h1>

                    <p className="mt-3 text-sm text-[#6F647B]">
                        Honest feedback from customers about this product.
                    </p>
                </div>

                {!loading && !error && (
                    <section className="mb-10 grid gap-8 rounded-3xl border border-[#7D45C2]/10 bg-white p-6 sm:p-8 md:grid-cols-[220px_1fr]">
                        <div className="flex flex-col items-center justify-center border-b border-[#7D45C2]/10 pb-6 text-center md:border-b-0 md:border-r md:pb-0 md:pr-8">
                            <p className="text-5xl font-semibold">
                                {summary.averageRating.toFixed(1)}
                            </p>

                            <div className="my-3">
                                <StarRating
                                    rating={summary.averageRating}
                                    size={21}
                                />
                            </div>

                            <p className="text-sm text-[#6F647B]">
                                Based on {summary.totalReviews}{" "}
                                {summary.totalReviews === 1 ? "review" : "reviews"}
                            </p>
                        </div>

                        <div className="flex flex-col justify-center gap-3">
                            {[5, 4, 3, 2, 1].map((rating) => {
                                const count = Number(
                                    summary.ratingBreakdown?.[rating] || 0
                                );

                                const percentage =
                                    summary.totalReviews > 0
                                        ? (count / summary.totalReviews) * 100
                                        : 0;

                                return (
                                    <div
                                        key={rating}
                                        className="flex items-center gap-3 text-sm"
                                    >
                                        <span className="w-10 shrink-0">
                                            {rating} star
                                        </span>

                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#F0EAF6]">
                                            <div
                                                className="h-full rounded-full transition-all"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: PURPLE,
                                                }}
                                            />
                                        </div>

                                        <span className="w-8 text-right text-[#6F647B]">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">Customer reviews</h2>

                    <span className="text-sm text-[#6F647B]">
                        {summary.totalReviews} total
                    </span>
                </div>

                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <LoaderCircle
                            size={30}
                            className="animate-spin text-[#7D45C2]"
                        />
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                        <p className="text-sm text-red-600">{error}</p>
                        <button
                            onClick={fetchReviews}
                            className="mt-4 rounded-full bg-[#7D45C2] px-6 py-3 text-sm font-medium text-white"
                        >
                            Try again
                        </button>
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="rounded-3xl border border-[#7D45C2]/10 bg-white px-6 py-16 text-center">
                        <MessageSquare
                            size={34}
                            className="mx-auto mb-4 text-[#7D45C2]"
                        />
                        <h3 className="text-lg font-semibold">
                            No reviews yet
                        </h3>
                        <p className="mt-2 text-sm text-[#6F647B]">
                            Be the first to share your experience with this product.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {reviews.map((review, index) => {
                            const media = review.media || [];

                            return (
                                <motion.article
                                    key={review._id || `${review.userId?._id}-${index}`}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="rounded-3xl border border-[#7D45C2]/10 bg-white p-5 sm:p-7"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold">
                                                {review.userId?.name || "Customer"}
                                            </p>

                                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                                <StarRating
                                                    rating={review.rating}
                                                    size={15}
                                                />
                                                <span className="text-sm font-medium">
                                                    {Number(review.rating).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>

                                        <time className="text-xs text-[#8A7D96]">
                                            {formatDate(review.createdAt)}
                                        </time>
                                    </div>

                                    {review.title && (
                                        <h3 className="mt-5 font-semibold">
                                            {review.title}
                                        </h3>
                                    )}

                                    {review.review && (
                                        <p className="mt-2 whitespace-pre-line text-sm leading-7 text-[#6F647B]">
                                            {review.review}
                                        </p>
                                    )}

                                    {review.isVerifiedPurchase && (
                                        <p className="mt-3 text-xs font-medium text-green-700">
                                            Verified purchase
                                        </p>
                                    )}

                                    {media.length > 0 && (
                                        <div className="mt-5 flex flex-wrap gap-3">
                                            {media.map((item, mediaIndex) => (
                                                <div
                                                    key={item.key || item.url || mediaIndex}
                                                    className="relative h-24 w-24 overflow-hidden rounded-xl border border-[#7D45C2]/10 bg-[#F7F2FC] sm:h-28 sm:w-28"
                                                >
                                                    {item.type === "video" ? (
                                                        <video
                                                            src={item.url}
                                                            controls
                                                            preload="metadata"
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <a
                                                            href={item.url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            aria-label="Open review image"
                                                            className="block h-full w-full"
                                                        >
                                                            <img
                                                                src={item.url}
                                                                alt={`Review media ${mediaIndex + 1}`}
                                                                loading="lazy"
                                                                className="h-full w-full object-cover transition hover:scale-105"
                                                            />
                                                        </a>
                                                    )}

                                                    <span className="absolute bottom-1 right-1 rounded-md bg-black/60 p-1 text-white">
                                                        {item.type === "video" ? (
                                                            <Video size={13} />
                                                        ) : (
                                                            <ImageIcon size={13} />
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </motion.article>
                            );
                        })}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <button
                            disabled={page <= 1}
                            onClick={() => {
                                setPage((current) => Math.max(1, current - 1));
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="flex items-center gap-2 rounded-full border border-[#7D45C2]/20 bg-white px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <ChevronLeft size={17} />
                            Previous
                        </button>

                        <span className="text-sm text-[#6F647B]">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            disabled={page >= totalPages}
                            onClick={() => {
                                setPage((current) =>
                                    Math.min(totalPages, current + 1)
                                );
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="flex items-center gap-2 rounded-full border border-[#7D45C2]/20 bg-white px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                            <ChevronRight size={17} />
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
}