
"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import {
    ArrowLeft,
    ArrowRight,
    Play,
    Pause,
    Volume2,
    VolumeX,
    ShoppingBag,
    Star,
} from "lucide-react";

import "swiper/css";
import "swiper/css/free-mode";

const reviews = [
    {
        id: 1,
        name: "Hydra-Protect Sun Mist",
        price: 674,
        oldPrice: 899,
        rating: 5,
        video: "/videos/review-1.mp4",
        poster: "/demo.png",
        productImage: "/products/1.png",
        caption: "Everyday sun protection",
        category: "SUN CARE",
    },
    {
        id: 2,
        name: "Hydra-Crème 100H Water Lock",
        price: 900,
        oldPrice: 1200,
        rating: 5,
        video: "/videos/review-2.mp4",
        poster: "/demo.png",
        productImage: "/products/2.png",
        caption: "Water moisturiser",
        category: "SKIN CARE",
    },
    {
        id: 3,
        name: "24H Hydration Sunscreen",
        price: 449,
        oldPrice: 599,
        rating: 5,
        video: "/videos/review-3.mp4",
        poster: "/demo.png",
        productImage: "/products/1.png",
        caption: "Made for my skin",
        category: "SUN CARE",
    },
    {
        id: 4,
        name: "Calming Gel Pen",
        price: 600,
        oldPrice: 800,
        rating: 5,
        video: "/videos/review-4.mp4",
        poster: "/demo.png",
        productImage: "/products/2.png",
        caption: "My skin feels different",
        category: "SKIN CARE",
    },
    {
        id: 5,
        name: "Pigmentation Repair Lip Balm",
        price: 337,
        oldPrice: 450,
        rating: 5,
        video: "/videos/review-5.mp4",
        poster: "/demo.png",
        productImage: "/products/1.png",
        caption: "A little lip care love",
        category: "LIP CARE",
    },
];

const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(price);

function ReviewCard({ review, index }) {
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [muted, setMuted] = useState(true);
    const [videoError, setVideoError] = useState(false);

    const togglePlay = async () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            try {
                await video.play();
                setPlaying(true);
            } catch {
                setPlaying(false);
            }
        } else {
            video.pause();
            setPlaying(false);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setMuted(video.muted);
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.12 }}
            transition={{
                duration: 0.55,
                delay: (index % 4) * 0.08,
                ease: "easeOut",
            }}
            whileHover={{ y: -5 }}
            className="group h-full overflow-hidden rounded-[18px] border border-[#eeebf4] bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
        >
            {/* Portrait video */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e9e6ef]">
                {!videoError ? (
                    <video
                        ref={videoRef}
                        src={review.video}
                        poster={review.poster}
                        muted={muted}
                        playsInline
                        preload="none"
                        loop
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        onEnded={() => setPlaying(false)}
                        onError={() => setVideoError(true)}
                        onClick={togglePlay}
                        className="absolute inset-0 h-full w-full cursor-pointer object-cover"
                        aria-label={`Customer video review for ${review.name}`}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#eeebf4] px-5 text-center text-sm text-[#77718b]">
                        Add the video file for this testimonial.
                    </div>
                )}

                {/* Subtle video gradient */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

                {/* Category label */}
                <div className="absolute left-3 top-3 rounded-full border border-white/40 bg-black/20 px-3 py-1.5 text-[9px] font-semibold tracking-[0.16em] text-white backdrop-blur-md">
                    {review.category}
                </div>

                {/* Play / pause */}
                <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={playing ? "Pause testimonial" : "Play testimonial"}
                    className={`absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/25 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white/40 ${playing
                        ? "opacity-0 group-hover:opacity-100"
                        : "opacity-100"
                        }`}
                >
                    {playing ? (
                        <Pause size={22} fill="currentColor" />
                    ) : (
                        <Play size={22} fill="currentColor" className="ml-1" />
                    )}
                </button>

                {/* Mute toggle */}
                <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={muted ? "Unmute video" : "Mute video"}
                    className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-md transition hover:bg-black/50"
                >
                    {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>

                {/* Caption overlay */}
                {/* <div className="pointer-events-none absolute bottom-5 left-4 right-4">
                    <p className="max-w-[260px] text-xl font-semibold leading-tight tracking-tight text-white drop-shadow-md sm:text-2xl">
                        {review.caption}
                    </p>
                </div> */}

                {/* Product thumbnail */}
                <div className="absolute bottom-3 left-3 flex h-[66px] w-[66px] items-center justify-center overflow-hidden rounded-xl border-2 border-white bg-white shadow-lg transition-transform duration-300 group-hover:scale-105">
                    <img
                        src={review.productImage}
                        alt={review.name}
                        loading="lazy"
                        className="h-full w-full object-contain"
                    />
                </div>
            </div>

            {/* Product information */}
            <div className="flex min-h-[148px] flex-col bg-[#918bc5] p-4 text-white sm:p-4">
                <h3 className="line-clamp-2 tracking-[0.01em] text-base font-semibold leading-5 sm:text-lg">
                    {review.name}
                </h3>

                <div className="mt-1 flex items-center gap-1.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                        <Star
                            key={i}
                            size={14}
                            fill="#fff2a8"
                            stroke="#fff2a8"
                        />
                    ))}
                    <span className="ml-1 text-sm text-white/80">
                        Verified customer
                    </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">
                        {formatPrice(review.price)}
                    </span>

                    <span className="text-xs text-white/65 line-through">
                        {formatPrice(review.oldPrice)}
                    </span>

                    <span className="ml-auto rounded-md bg-[#fff2a8] px-2 py-1 text-[9px] font-bold text-[#49432a]">
                        {Math.round(
                            ((review.oldPrice - review.price) / review.oldPrice) * 100
                        )}
                        % OFF
                    </span>
                </div>

                <a
                    href={`/shop/${review.name
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "")}`}
                    className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/10 px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 hover:bg-white hover:text-[#7770ae]"
                >
                    <ShoppingBag size={13} />
                    Shop this product
                    <ArrowRight size={13} />
                </a>
            </div>
        </motion.article>
    );
}

export default function VideoTestimonials() {
    const swiperRef = useRef(null);

    return (
        <section className="overflow-hidden bg-white py-10 sm:py-12 lg:py-15">
            <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.65 }}
                    className="mb-2 flex flex-col items-center text-center"
                >
                    <h2 className="text-2xl font-light tracking-[0.02em] text-[#252329] sm:text-3xl lg:text-4xl">
                        REAL PEOPLE. <span className="text-[#7D45C2]">REAL RESULTS.</span>
                    </h2>
                </motion.div>

                {/* Carousel controls */}
                <div className="mb-5 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => swiperRef.current?.slidePrev()}
                        aria-label="Previous testimonials"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e1ed] bg-white text-[#7770ae] transition hover:border-[#918bc5] hover:bg-[#918bc5] hover:text-white"
                    >
                        <ArrowLeft size={17} />
                    </button>

                    <button
                        type="button"
                        onClick={() => swiperRef.current?.slideNext()}
                        aria-label="Next testimonials"
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e6e1ed] bg-white text-[#7770ae] transition hover:border-[#918bc5] hover:bg-[#918bc5] hover:text-white"
                    >
                        <ArrowRight size={17} />
                    </button>
                </div>

                {/* Swiper */}
                <Swiper
                    modules={[Autoplay, FreeMode]}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    slidesPerView={1.35}
                    spaceBetween={12}
                    speed={700}
                    grabCursor
                    watchOverflow
                    freeMode={{
                        enabled: true,
                        momentum: true,
                        momentumRatio: 0.7,
                    }}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}
                    breakpoints={{
                        480: {
                            slidesPerView: 1.8,
                            spaceBetween: 14,
                        },
                        640: {
                            slidesPerView: 2.3,
                            spaceBetween: 16,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 16,
                        },
                        1024: {
                            slidesPerView: 3.5,
                            spaceBetween: 18,
                        },
                        1280: {
                            slidesPerView: 4.15,
                            spaceBetween: 18,
                        },
                        1600: {
                            slidesPerView: 4.7,
                            spaceBetween: 20,
                        },
                    }}
                    className="!overflow-visible"
                >
                    {reviews.map((review, index) => (
                        <SwiperSlide key={review.id} className="!h-auto">
                            <ReviewCard review={review} index={index} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}
