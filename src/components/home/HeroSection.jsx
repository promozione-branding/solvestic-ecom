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
        id: 2,
        image: "/banner/1.png",
        imageMobile: "/banner/2.png",
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
                        <div className="relative h-[480px] w-full overflow-hidden sm:h-[500px] lg:h-[min(650px,calc(60vh-100px))] lg:min-h-[400px] xl:h-[600px]">
                            {/* Desktop / Tablet Image */}
                            <Image
                                src={banner.image}
                                alt={banner.alt}
                                fill
                                priority={banner.id === 2}
                                sizes="100vw"
                                className="hidden object-cover object-center md:block"
                            />

                            {/* Mobile Image */}
                            <Image
                                src={banner.imageMobile}
                                alt={banner.alt}
                                fill
                                priority={banner.id === 2}
                                sizes="100vw"
                                className="block object-cover object-center md:hidden"
                            />
                            <div className="absolute inset-0 z-[2] flex md:justify-start justify-center md:items-center items-end md:mb:0 mb-10">
                                <div className="mx-auto w-full max-w-7xl px-6 xl:px-10">
                                    <div className="max-w-xl flex md:justify-start justify-center md:items-center items-end">
                                        <Link
                                            href="/our-products"
                                            className="group/btn md:mt-50 inline-flex items-center gap-3 rounded-full bg-pink-400 px-7 py-4 text-sm font-medium text-white shadow-lg shadow-[#7D45C2]/20 transition-all duration-300 hover:-translate-y-1 hover:bg-pink-500 hover:shadow-xl hover:shadow-[#7D45C2]/30 sm:px-9"
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