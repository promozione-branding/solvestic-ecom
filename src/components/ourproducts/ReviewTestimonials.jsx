
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Star, Quote, Sparkles } from "lucide-react";

const formatInitials = (name = "Customer") => {
    const words = name.trim().split(/\s+/).filter(Boolean);

    return words
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() || "")
        .join("") || "C";
};

const reviewColors = [
    "bg-[#EDE5F8]",
    "bg-[#F7E9E8]",
    "bg-[#E7EEE5]",
];

export default function ReviewTestimonials() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const fetchReviews = async () => {
            setLoading(true);
            setHasError(false);

            try {
                const { data: productsData } = await axios.get(
                    "/api/admin/products"
                );

                const products = Array.isArray(productsData.products)
                    ? productsData.products
                    : productsData.products
                        ? [productsData.products]
                        : [];

                const activeProducts = products.filter(
                    (product) =>
                        (!product.status || product.status === "active") &&
                        (product._id || product.id)
                );

                const results = await Promise.allSettled(
                    activeProducts.map(async (product) => {
                        const productId = String(
                            product._id || product.id
                        );

                        const { data } = await axios.get(
                            `/api/user/reviews/${productId}`,
                            {
                                params: {
                                    page: 1,
                                    limit: 10,
                                },
                            }
                        );

                        const productReviews = Array.isArray(data.reviews)
                            ? data.reviews
                            : [];

                        return productReviews.map((review) => ({
                            ...review,
                            productName:
                                review.productName ||
                                product.name ||
                                "Solvestic Product",
                        }));
                    })
                );

                const allReviews = results
                    .filter((result) => result.status === "fulfilled")
                    .flatMap((result) => result.value)
                    .sort(
                        (a, b) =>
                            new Date(b.createdAt || 0).getTime() -
                            new Date(a.createdAt || 0).getTime()
                    )
                    .slice(0, 6);

                if (!cancelled) {
                    setReviews(allReviews);
                    setHasError(
                        results.length > 0 &&
                        results.every(
                            (result) => result.status === "rejected"
                        )
                    );
                }
            } catch (error) {
                console.error("Failed to fetch product reviews:", error);

                if (!cancelled) {
                    setHasError(true);
                    setReviews([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchReviews();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <section className="relative overflow-hidden bg-[#F7F2FC] py-10 sm:py-12 lg:py-15">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D8B8F5]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#E8D7F8]/40 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
                >
                    <div className="mb-4 flex items-center justify-center gap-2">
                        <span className="h-px w-8 bg-[#7D45C2]" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7D45C2] sm:text-xs">
                            Your Skin, Your Story
                        </span>

                        <span className="h-px w-8 bg-[#7D45C2]" />
                    </div>

                    <h2 className="font-heading text-3xl font-medium leading-tight tracking-tight text-[#2D1557] sm:text-4xl lg:text-5xl">
                        A Little Love
                        <br className="sm:hidden" />{" "}
                        <span className="text-[#7D45C2]">
                            Goes a Long Way.
                        </span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#777080] sm:text-base">
                        Discover real customer reviews and experiences with
                        Solvestic skincare essentials.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="h-72 animate-pulse rounded-2xl bg-white/80"
                            />
                        ))}
                    </div>
                ) : hasError ? (
                    <p className="py-12 text-center text-sm text-[#777080]">
                        Reviews are temporarily unavailable. Please try again
                        later.
                    </p>
                ) : reviews.length === 0 ? (
                    <div className="py-12 text-center">
                        <Sparkles
                            className="mx-auto mb-4 text-[#7D45C2]"
                            size={28}
                        />

                        <h3 className="text-lg font-semibold text-[#2D1557]">
                            Your experience could be featured here
                        </h3>

                        <p className="mt-2 text-sm text-[#777080]">
                            Customer reviews will appear here once approved.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                        {reviews.map((review, index) => {
                            const customerName =
                                review.customerName ||
                                review.user?.name ||
                                review.userName ||
                                "Verified Customer";

                            const rating = Math.min(
                                5,
                                Math.max(0, Number(review.rating) || 0)
                            );

                            return (
                                <motion.article
                                    key={review._id || review.id || index}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{
                                        duration: 0.5,
                                        delay: (index % 3) * 0.12,
                                    }}
                                    className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_8px_30px_rgba(61,30,91,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(61,30,91,0.10)] sm:p-6 lg:p-7"
                                >
                                    <div className="mb-5 flex items-start justify-between">
                                        <div
                                            className="flex items-center gap-1"
                                            aria-label={`${rating} out of 5 stars`}
                                        >
                                            {Array.from({ length: 5 }).map(
                                                (_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={15}
                                                        fill={
                                                            i < rating
                                                                ? "#D9A441"
                                                                : "none"
                                                        }
                                                        stroke={
                                                            i < rating
                                                                ? "#D9A441"
                                                                : "#CFC5D8"
                                                        }
                                                    />
                                                )
                                            )}
                                        </div>

                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E7FA] text-[#7D45C2] transition-transform duration-300 group-hover:rotate-6">
                                            <Quote size={19} />
                                        </div>
                                    </div>

                                    {review.title && (
                                        <h3 className="mb-2 text-base font-semibold text-[#382451]">
                                            {review.title}
                                        </h3>
                                    )}

                                    <p className="flex-1 whitespace-pre-line break-words text-sm leading-7 text-[#61596D] sm:text-[15px]">
                                        “{review.review}”
                                    </p>

                                    {Array.isArray(review.media) &&
                                        review.media.some(
                                            (media) =>
                                                media.type === "image" &&
                                                media.url
                                        ) && (
                                            <div className="mt-4 flex gap-2 overflow-x-auto">
                                                {review.media
                                                    .filter(
                                                        (media) =>
                                                            media.type ===
                                                            "image" &&
                                                            media.url
                                                    )
                                                    .slice(0, 3)
                                                    .map((media, i) => (
                                                        <img
                                                            key={
                                                                media.key ||
                                                                media.url ||
                                                                i
                                                            }
                                                            src={media.url}
                                                            alt="Customer review"
                                                            loading="lazy"
                                                            className="h-16 w-16 shrink-0 rounded-lg object-cover"
                                                        />
                                                    ))}
                                            </div>
                                        )}

                                    <div className="mt-5 border-t border-[#EEE7F5] pt-4">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Sparkles
                                                size={14}
                                                className="shrink-0 text-[#7D45C2]"
                                            />

                                            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7D45C2]">
                                                Product experience
                                            </span>
                                        </div>

                                        <p className="mb-5 break-words text-sm font-medium leading-5 text-[#382451]">
                                            {review.productName}
                                        </p>

                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${reviewColors[
                                                    index %
                                                    reviewColors.length
                                                ]
                                                    } text-xs font-semibold text-[#5B3B79]`}
                                            >
                                                {formatInitials(customerName)}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate text-sm font-semibold text-[#2D1557]">
                                                    {customerName}
                                                </h3>

                                                <p className="mt-1 text-xs text-[#8B8295]">
                                                    {review.isVerifiedPurchase
                                                        ? "Verified purchase"
                                                        : "Customer review"}
                                                </p>
                                            </div>

                                            <div className="ml-auto shrink-0 rounded-full bg-[#F2EBF9] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#7D45C2]">
                                                {rating}.0 / 5
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
