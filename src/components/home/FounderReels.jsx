"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";

import "swiper/css";

const FOUNDER_REELS = [
    {
        id: 1,
        episode: "EPISODE 01",
        title: "Founder Diary Ep. 1",
        description:
            "The beginning of the Solvestic journey. Come behind the scenes with our founder.",
        instagram: "https://www.instagram.com/reel/DdTbdCDzcG1/",
        reelId: "DdTbdCDzcG1",
        comingSoon: false,
    },
    {
        id: 2,
        episode: "EPISODE 02",
        title: "Founder Diary Ep. 2",
        description:
            "The journey continues. Our founder shares insights and experiences from the early days of Solvestic.",
        instagram: "https://www.instagram.com/reel/Dd6bz5cToQd/",
        reelId: "Dd6bz5cToQd",
        comingSoon: false,
    },
    {
        id: 3,
        episode: "EPISODE 03",
        title: "Founder Diary Ep. 3",
        description: "We’re building this for the skin concerns we actually see around us — pigmentation, tanning, dullness, dryness.",
        instagram: "https://www.instagram.com/reel/DeHMP6Rz6LQ/",
        reelId: "DeHMP6Rz6LQ",
        comingSoon: false,
    },
    // {
    //     id: 4,
    //     episode: "EPISODE 03",
    //     title: "Founder Diary Ep. 3",
    //     description: "Coming Soon",
    //     instagram: "",
    //     reelId: "",
    //     comingSoon: true,
    // },
];

export default function FounderReels() {
    return (
        <section className="w-full overflow-hidden bg-white py-10 sm:py-12 lg:py-15">
            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">

                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="mb-10 text-center"
                >
                    <p className="mb-3 text-[10px] tracking-[0.3em] text-[#7D45C2] sm:text-xs">
                        BEHIND THE BRAND
                    </p>

                    <h2
                        className="
                            font-serif
                            text-[42px]
                            leading-[0.95]
                            tracking-[-0.03em]
                            text-[#7D45C2]
                            sm:text-[58px]
                            lg:text-[76px]
                        "
                    >
                        FOUNDER DIARY
                    </h2>
                </motion.div>
            </div>

            <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
                <Swiper
                    modules={[Autoplay]}
                    autoplay={{
                        delay: 3500,
                        disableOnInteraction: false,
                        pauseOnMouseEnter: true,
                    }}

                    slidesPerView={1}
                    spaceBetween={20}
                    breakpoints={{
                        768: {
                            slidesPerView: 3,
                        },
                    }}
                    className="!overflow-visible"
                >
                    {FOUNDER_REELS.map((reel, index) => (
                        <SwiperSlide key={reel.id}>
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 60,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    once: true,
                                    amount: 0.15,
                                }}
                                transition={{
                                    duration: 0.8,
                                    delay: index * 0.15,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                <ReelCard reel={reel} />
                            </motion.div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

        </section>
    );
}


/* =========================================================
   REEL CARD
========================================================= */

function ReelCard({ reel }) {
    return (
        <article className="group">

            {/* Video / Instagram Embed */}
            <div
                className="
                    relative
                    aspect-[10/12]
                    overflow-hidden
                    rounded-[22px]
                    bg-[#e9e1dc]
                    sm:rounded-[28px]
                "
            >
                {reel.comingSoon ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#F7F2FC]">
                        <div className="text-center">
                            <p className="mb-3 text-[9px] tracking-[0.3em] text-[#7D45C2]">
                                COMING SOON
                            </p>

                            <h3 className="font-serif text-3xl text-[#7D45C2]">
                                Stay Tuned
                            </h3>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Instagram Reel */}
                        <iframe
                            src={`https://www.instagram.com/reel/${reel.reelId}/embed/`}
                            className="
                                absolute
                                inset-0
                                w-full left-1/2 top-1/2 h-[500px] lg:h-[500px] xl:h-[630px] -translate-x-1/2 -translate-y-1/2
                            "
                            frameBorder="0"
                            scrolling="no"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                        />
                    </>
                )}

                {/* Episode Badge */}
                <div className="pointer-events-none absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
                    <span
                        className="
                            rounded-full
                            bg-white/90
                            px-4
                            py-2
                            text-[9px]
                            font-semibold
                            tracking-[0.2em]
                            text-[#7D45C2]
                            shadow-sm
                            backdrop-blur-md
                            sm:text-[10px]
                        "
                    >
                        {reel.episode}
                    </span>
                </div>
            </div>

            {/* Text */}
            <div className="mt-5 flex items-start justify-between gap-4 px-1">
                <div>
                    <h3 className="font-serif text-2xl text-[#7D45C2] sm:text-3xl">
                        {reel.title}
                    </h3>

                    <p className="mt- max-w-md text-xs leading-5 text-black sm:text-sm">
                        {reel.description}
                    </p>
                </div>

                {!reel.comingSoon && (
                    <a
                        href={reel.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#7D45C2]/20
                            text-[#7D45C2]
                            transition
                            duration-300
                            hover:bg-[#7D45C2]
                            hover:text-white
                            sm:h-12
                            sm:w-12
                        "
                    >
                        <ArrowUpRight size={18} />
                    </a>
                )}
            </div>
        </article>
    );
}