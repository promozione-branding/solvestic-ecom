
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
    Star,
    X,
    ImagePlus,
    Video,
    Trash2,
    LoaderCircle,
    Upload,
} from "lucide-react";

const MAX_IMAGES = 5;
const MAX_VIDEO_SIZE = 25 * 1024 * 1024;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
];

const ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime",
];

function StarRatingInput({ rating, setRating, disabled }) {
    const [hoverRating, setHoverRating] = useState(0);
    const displayedRating = hoverRating || rating;

    return (
        <div>
            <label className="text-sm font-semibold text-[#30253D]">
                Your rating
            </label>

            <div
                className="mt-3 flex flex-wrap items-center gap-2"
                onMouseLeave={() => setHoverRating(0)}
            >
                {[1, 2, 3, 4, 5].map((value) => {
                    const fill = Math.max(
                        0,
                        Math.min(1, displayedRating - value + 1)
                    );

                    return (
                        <div
                            key={value}
                            className="relative h-[30px] w-[30px]"
                        >
                            <Star
                                size={30}
                                className="absolute inset-0 text-[#d8cfdf]"
                            />

                            <div
                                className="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
                                style={{ width: `${fill * 100}%` }}
                            >
                                <Star
                                    size={30}
                                    className="max-w-none fill-[#7D45C2] text-[#7D45C2]"
                                />
                            </div>

                            <button
                                type="button"
                                disabled={disabled}
                                aria-label={`Rate ${value - 0.5} out of 5 stars`}
                                aria-pressed={rating === value - 0.5}
                                onMouseEnter={() =>
                                    setHoverRating(value - 0.5)
                                }
                                onFocus={() =>
                                    setHoverRating(value - 0.5)
                                }
                                onBlur={() => setHoverRating(0)}
                                onClick={() =>
                                    setRating(value - 0.5)
                                }
                                className="absolute inset-y-0 left-0 z-10 w-1/2 cursor-pointer rounded-l disabled:cursor-not-allowed"
                            />

                            <button
                                type="button"
                                disabled={disabled}
                                aria-label={`Rate ${value} out of 5 stars`}
                                aria-pressed={rating === value}
                                onMouseEnter={() =>
                                    setHoverRating(value)
                                }
                                onFocus={() => setHoverRating(value)}
                                onBlur={() => setHoverRating(0)}
                                onClick={() => setRating(value)}
                                className="absolute inset-y-0 right-0 z-10 w-1/2 cursor-pointer rounded-r disabled:cursor-not-allowed"
                            />
                        </div>
                    );
                })}

                <span className="ml-2 text-sm text-[#716a78]">
                    {rating
                        ? `${rating.toFixed(1)} out of 5`
                        : "Select a rating"}
                </span>
            </div>
        </div>
    );
}

export default function ProductReviewForm({
    productId,
    open,
    onClose,
    onSuccess,
}) {
    const router = useRouter();
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const imageUrlsRef = useRef([]);

    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState("");
    const [review, setReview] = useState("");
    const [images, setImages] = useState([]);
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Prevent the page behind the modal from scrolling.
    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        const previousOverscroll =
            document.body.style.overscrollBehavior;

        document.body.style.overflow = "hidden";
        document.body.style.overscrollBehavior = "none";

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.overscrollBehavior =
                previousOverscroll;
        };
    }, [open]);

    // Create preview URLs only when selected files change.
    useEffect(() => {
        const urls = [
            ...images.map((file) => URL.createObjectURL(file)),
            ...(video ? [URL.createObjectURL(video)] : []),
        ];

        imageUrlsRef.current = urls;

        return () => {
            urls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [images, video]);

    function resetForm() {
        setRating(0);
        setTitle("");
        setReview("");
        setImages([]);
        setVideo(null);
        setError("");

        if (imageInputRef.current) {
            imageInputRef.current.value = "";
        }

        if (videoInputRef.current) {
            videoInputRef.current.value = "";
        }
    }

    function closeForm() {
        if (loading) return;

        resetForm();
        onClose?.();
    }

    function handleImages(event) {
        const selectedFiles = Array.from(event.target.files || []);
        event.target.value = "";

        setError("");

        const validFiles = [];

        for (const file of selectedFiles) {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                setError(
                    "Only JPG, PNG, WebP, and AVIF images are allowed."
                );
                continue;
            }

            if (file.size === 0 || file.size > MAX_IMAGE_SIZE) {
                setError(
                    "Each image must be greater than 0 bytes and no larger than 5 MB."
                );
                continue;
            }

            validFiles.push(file);
        }

        setImages((previous) => {
            const remaining = MAX_IMAGES - previous.length;
            const accepted = validFiles.slice(0, remaining);

            if (validFiles.length > remaining) {
                setError("You can upload a maximum of 5 images.");
            }

            return [...previous, ...accepted];
        });
    }

    function handleVideo(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        setError("");

        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            setError("Upload an MP4, WebM, or MOV video.");
            return;
        }

        if (file.size === 0 || file.size > MAX_VIDEO_SIZE) {
            setError("The video must be greater than 0 bytes and no larger than 25 MB.");
            return;
        }

        setVideo(file);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (!productId) {
            setError("Product information is missing.");
            return;
        }

        if (
            rating < 0.5 ||
            rating > 5 ||
            !Number.isInteger(rating * 2)
        ) {
            setError(
                "Please select a rating in half-star increments."
            );
            return;
        }

        if (!title.trim() || !review.trim()) {
            setError(
                "Please enter your review title and description."
            );
            return;
        }

        if (title.trim().length > 150) {
            setError("The review title cannot exceed 150 characters.");
            return;
        }

        if (review.trim().length > 3000) {
            setError("The review cannot exceed 3000 characters.");
            return;
        }

        const formData = new FormData();

        formData.append("productId", productId);
        formData.append("rating", String(rating));
        formData.append("title", title.trim());
        formData.append("review", review.trim());

        images.forEach((file) => {
            formData.append("media", file);
        });

        if (video) {
            formData.append("media", video);
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                "/api/user/reviews",
                formData,
                { withCredentials: true }
            );

            onSuccess?.(data.review);

            resetForm();
            onClose?.();
        } catch (err) {
            if (err.response?.status === 401) {
                onClose?.();

                router.push(
                    `/login?redirect=${encodeURIComponent(
                        window.location.pathname
                    )}`
                );

                return;
            }

            setError(
                err.response?.data?.message ||
                "Unable to submit your review. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <AnimatePresence>
            <motion.div
                key="review-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                        closeForm();
                    }
                }}
                className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto overscroll-contain bg-black/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
            >
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="review-form-title"
                    onMouseDown={(event) => event.stopPropagation()}
                    className="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl shrink-0 overflow-y-auto overscroll-contain rounded-3xl bg-white shadow-2xl sm:max-h-[calc(100dvh-3rem)]"
                >
                    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#eee7f4] bg-white px-5 py-4 sm:px-7">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                                Your experience
                            </p>

                            <h2
                                id="review-form-title"
                                className="mt-1 text-xl font-semibold text-[#30253D] sm:text-2xl"
                            >
                                Write a review
                            </h2>
                        </div>

                        <button
                            type="button"
                            onClick={closeForm}
                            disabled={loading}
                            aria-label="Close review form"
                            className="rounded-full border border-[#eee7f4] p-2 text-[#716a78] transition hover:bg-[#F7F2FC] disabled:opacity-50"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 p-5 sm:p-7"
                    >
                        <StarRatingInput
                            rating={rating}
                            setRating={setRating}
                            disabled={loading}
                        />

                        <div>
                            <label
                                htmlFor="review-title"
                                className="mb-2 block text-sm font-semibold text-[#30253D]"
                            >
                                Review title
                            </label>

                            <input
                                id="review-title"
                                value={title}
                                onChange={(event) =>
                                    setTitle(event.target.value)
                                }
                                maxLength={150}
                                required
                                disabled={loading}
                                placeholder="What did you love about it?"
                                className="w-full rounded-xl border border-[#e8dff0] px-4 py-3 text-sm text-[#30253D] outline-none transition placeholder:text-[#a49aa9] focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10 disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <label
                                    htmlFor="review-description"
                                    className="text-sm font-semibold text-[#30253D]"
                                >
                                    Your review
                                </label>

                                <span className="text-xs text-[#98909e]">
                                    {review.length}/3000
                                </span>
                            </div>

                            <textarea
                                id="review-description"
                                value={review}
                                onChange={(event) =>
                                    setReview(event.target.value)
                                }
                                maxLength={3000}
                                required
                                disabled={loading}
                                rows={4}
                                placeholder="Share your experience with this product..."
                                className="w-full resize-y rounded-xl border border-[#e8dff0] px-4 py-3 text-sm leading-6 text-[#30253D] outline-none transition placeholder:text-[#a49aa9] focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10 disabled:opacity-60"
                            />
                        </div>

                        <div>
                            <div className="mb-3">
                                <h3 className="text-sm font-semibold text-[#30253D]">
                                    Add photos and video
                                </h3>

                                <p className="mt-1 text-xs leading-5 text-[#89818f]">
                                    Up to 5 images and 1 video. Images up
                                    to 5 MB each; video up to 25 MB.
                                </p>
                            </div>

                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/avif"
                                multiple
                                hidden
                                onChange={handleImages}
                            />

                            <input
                                ref={videoInputRef}
                                type="file"
                                accept="video/mp4,video/webm,video/quicktime"
                                hidden
                                onChange={handleVideo}
                            />

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {images.map((file, index) => (
                                    <div
                                        key={`${file.name}-${file.size}-${index}`}
                                        className="relative aspect-square overflow-hidden rounded-xl border border-[#eee7f4] bg-[#F7F2FC]"
                                    >
                                        <img
                                            src={imageUrlsRef.current[index]}
                                            alt={`Review photo ${index + 1}`}
                                            className="h-full w-full object-cover"
                                        />

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() =>
                                                setImages((previous) =>
                                                    previous.filter(
                                                        (_, i) => i !== index
                                                    )
                                                )
                                            }
                                            aria-label="Remove image"
                                            className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow disabled:opacity-50"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}

                                {video && (
                                    <div className="relative aspect-square overflow-hidden rounded-xl border border-[#eee7f4] bg-black">
                                        <video
                                            src={
                                                imageUrlsRef.current[images.length]
                                            }
                                            controls
                                            playsInline
                                            preload="metadata"
                                            className="h-full w-full object-contain"
                                        />

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => setVideo(null)}
                                            aria-label="Remove video"
                                            className="absolute right-2 top-2 rounded-full bg-white p-2 text-red-600 shadow disabled:opacity-50"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                )}

                                {images.length < MAX_IMAGES && (
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() =>
                                            imageInputRef.current?.click()
                                        }
                                        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#cdb7e2] bg-[#F7F2FC] text-[#7D45C2] transition hover:border-[#7D45C2] hover:bg-[#f0e7fa] disabled:opacity-50"
                                    >
                                        <ImagePlus size={25} />
                                        <span className="text-xs font-medium">
                                            Add photos
                                        </span>
                                        <span className="text-[10px] text-[#89818f]">
                                            {images.length}/{MAX_IMAGES}
                                        </span>
                                    </button>
                                )}

                                {!video && (
                                    <button
                                        type="button"
                                        disabled={loading}
                                        onClick={() =>
                                            videoInputRef.current?.click()
                                        }
                                        className="flex aspect-square flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#cdb7e2] bg-[#F7F2FC] text-[#7D45C2] transition hover:border-[#7D45C2] hover:bg-[#f0e7fa] disabled:opacity-50"
                                    >
                                        <Video size={25} />
                                        <span className="text-xs font-medium">
                                            Add video
                                        </span>
                                        <span className="text-[10px] text-[#89818f]">
                                            Optional
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
                            >
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#7D45C2] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#6736a6] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <LoaderCircle
                                        size={18}
                                        className="animate-spin"
                                    />
                                    Submitting review...
                                </>
                            ) : (
                                <>
                                    <Upload size={17} />
                                    Submit review
                                </>
                            )}
                        </button>

                        <p className="text-center text-xs leading-5 text-[#89818f]">
                            Your review will be visible after approval.
                        </p>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
