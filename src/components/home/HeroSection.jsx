"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import {
    Autoplay,
    EffectFade,
    Navigation,
    Pagination,
} from "swiper/modules";
import { ArrowLeft, ArrowRight } from "lucide-react";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const banners = [
    {
        id: 1,
        image: "/banner/2.png",
        alt: "Solvestic lavender skincare collection",
        href: "/our-products",
    },
    {
        id: 2,
        image: "/banner/1.png",
        alt: "Solvestic premium body care collection",
        href: "/our-products",
    },
];

const heading = "For the Skin, Smart Generation.";

export default function HeroSection() {
    const [typedText, setTypedText] = useState("");

    useEffect(() => {
        let index = 0;

        const timer = setInterval(() => {
            index++;

            setTypedText(heading.slice(0, index));

            if (index >= heading.length) {
                clearInterval(timer);
            }
        }, 85);

        return () => clearInterval(timer);
    }, []);

    return (
        <section
            aria-label="Featured collections"
            className="group relative w-full overflow-hidden bg-[#F7F2FC]"
        >
            <Swiper
                modules={[
                    Autoplay,
                    EffectFade,
                    Navigation,
                    Pagination,
                ]}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                loop
                speed={900}
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: true,
                }}
                navigation={{
                    prevEl: ".hero-prev",
                    nextEl: ".hero-next",
                }}
                pagination={{
                    clickable: true,
                    el: ".hero-pagination",
                }}
                className="solvestic-hero-swiper"
            >
                {banners.map((banner) => (
                    <SwiperSlide key={banner.id}>
                        <div className="relative h-[480px] w-full overflow-hidden sm:h-[540px] lg:h-[min(650px,calc(90vh-100px))] lg:min-h-[440px] xl:h-[600px]">
                            <Image
                                src={banner.image}
                                alt={banner.alt}
                                fill
                                priority={banner.id === 1}
                                sizes="100vw"
                                className="object-cover object-center"
                            />

                            {/* LEFT CONTENT OVERLAY */}
                            {/* <div className="absolute inset-0 bg-gradient-to-r from-[#F7F2FC]/25 via-[#F7F2FC]/10 to-transparent sm:via-[#F7F2FC]/10 lg:via-[#F7F2FC]/15" /> */}

                            <div className="absolute inset-0 z-[2] flex items-center">
                                <div className="mx-auto w-full max-w-7xl px-6 xl:px-10">
                                    <div className="max-w-xl">
                                        <span className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#7D45C2] sm:text-sm">
                                            <span className="h-px w-8 bg-[#7D45C2]" />
                                            Discover Solvestic
                                        </span>

                                        <h1 className="text-4xl font-semibold leading-[1] tracking-tight text-[#20152B] sm:text-5xl lg:text-6xl">
                                            {typedText}
                                        </h1>

                                        <p className="mt-2 max-w-md text-sm leading-7 text-[#4b2f67] sm:text-base sm:leading-8">
                                            Elevate your everyday routine with
                                            thoughtfully crafted beauty and
                                            body care essentials designed to
                                            make every moment feel special.
                                        </p>

                                        <Link
                                            href="/our-products"
                                            className="group/btn mt-8 inline-flex items-center gap-3 rounded-full bg-[#7D45C2] px-7 py-4 text-sm font-medium text-white shadow-lg shadow-[#7D45C2]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-[#6635A5] hover:shadow-xl hover:shadow-[#7D45C2]/30 sm:px-9"
                                        >
                                            Explore Collection

                                            <ArrowRight
                                                size={18}
                                                className="transition-transform duration-300 group-hover/btn:translate-x-1"
                                            />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* PREVIOUS */}
            <button
                type="button"
                aria-label="Previous banner"
                className="hero-prev absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/30 text-[#20152B] backdrop-blur-md transition-all duration-300 hover:border-[#7D45C2] hover:bg-[#7D45C2] hover:text-white sm:left-6 sm:h-12 sm:w-12 lg:left-8"
            >
                <ArrowLeft size={20} strokeWidth={1.5} />
            </button>

            {/* NEXT */}
            <button
                type="button"
                aria-label="Next banner"
                className="hero-next absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white/30 text-[#20152B] backdrop-blur-md transition-all duration-300 hover:border-[#7D45C2] hover:bg-[#7D45C2] hover:text-white sm:right-6 sm:h-12 sm:w-12 lg:right-8"
            >
                <ArrowRight size={20} strokeWidth={1.5} />
            </button>

            {/* PAGINATION */}
            <div className="hero-pagination absolute bottom-5 left-0 z-10 flex w-full items-center justify-center gap-2 sm:bottom-7" />

            <style jsx global>{`
                .solvestic-hero-swiper .swiper-slide {
                    overflow: hidden;
                }

                .solvestic-hero-swiper .swiper-slide img {
                    transition: transform 6s ease;
                }

                .solvestic-hero-swiper .swiper-slide-active img {
                    transform: scale(1.035);
                }

                .typing-cursor {
                    animation: solvesticBlink 0.8s steps(2, start) infinite;
                }

                @keyframes solvesticBlink {
                    to {
                        visibility: hidden;
                    }
                }

                .hero-pagination .swiper-pagination-bullet {
                    width: 8px;
                    height: 8px;
                    margin: 0 !important;
                    border-radius: 999px;
                    background: #7d45c2;
                    opacity: 0.45;
                    transition: all 0.3s ease;
                }

                .hero-pagination .swiper-pagination-bullet-active {
                    width: 26px;
                    background: #7d45c2;
                    opacity: 1;
                }

                .hero-prev.swiper-button-disabled,
                .hero-next.swiper-button-disabled {
                    opacity: 0.5;
                }

                @media (prefers-reduced-motion: reduce) {
                    .typing-cursor {
                        animation: none;
                    }

                    .solvestic-hero-swiper .swiper-slide img {
                        transition: none;
                    }
                }
            `}</style>
        </section>
    );
}