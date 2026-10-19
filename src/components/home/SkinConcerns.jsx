
"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

const concerns = [
    {
        title: "Sun Tan",
        image: "/skin/11.png",
        description:
            "Prolonged sun exposure can leave skin looking darker, dull and uneven. Tan buildup affects your natural radiance, making the complexion appear tired, patchy and less radiant.",
        color: "#E8D4B7",
    },
    {
        title: "Dullness",
        image: "/skin/14.png",
        description:
            "Dull skin can make your complexion look tired, flat, and lacking in its natural radiance. It may leave your skin looking uneven and less refreshed, reducing its healthy, glowing appearance.",
        color: "#D8D1EE",
    },
    {
        title: "Post Acne Marks",
        image: "/skin/12.png",
        description:
            "Acne may fade, but the marks can stay behind. Dark spots and uneven texture left after breakouts can make skin look dull, uneven and less smooth.",
        color: "#E9C9B9",
    },
    {
        title: "Uneven Skin Tone",
        image: "/skin/13.png",
        description:
            "Uneven skin tone creates visible differences in complexion across the face. Dark patches, redness and pigmentation can make skin appear dull, inconsistent and less naturally radiant.",
        color: "#D5E1D0",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.13,
        },
    },
};

const cardVariants = {
    hidden: {
        opacity: 0,
        y: 35,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function SkinConcernsSection() {
    const sliderRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();

    const scroll = (direction) => {
        if (!sliderRef.current) return;

        sliderRef.current.scrollBy({
            left: direction * sliderRef.current.clientWidth * 0.72,
            behavior: shouldReduceMotion ? "instant" : "smooth",
        });
    };

    return (
        <section className="overflow-hidden bg-[#fffdfb] py-10 sm:py-14 lg:py-16">
            <div className="mx-auto max-w-[1600px]">

                {/* Heading */}
                <motion.div
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.4 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mb-8 flex items-end justify-between gap-5 px-5 sm:mb-10 sm:px-8 lg:px-12"
                >
                    <div>
                        <p className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em] text-[#7D45C2] sm:text-xs">
                            <span className="h-px w-7 bg-[#7D45C2]" />
                            Your skin, your story
                        </p>

                        <h2 className="text-[30px] flex gap-1 font-light leading-[1] tracking-[0.01em] text-[#252329] sm:text-4xl lg:text-[52px]">
                            Skin concerns, {" "}
                            <h2 className="text-[#7D45C2]">
                                meet thoughtful care.
                            </h2>
                        </h2>
                    </div>
                </motion.div>

                {/* Animated cards */}
                <motion.div
                    ref={sliderRef}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.12 }}
                    className="skin-concerns-slider flex gap-4 overflow-x-auto px-5 pb-3 sm:gap-5 sm:px-8 lg:gap-6 lg:px-12"
                >
                    {concerns.map((concern, index) => (
                        <motion.article
                            key={concern.title}
                            variants={cardVariants}
                            whileHover={
                                shouldReduceMotion
                                    ? undefined
                                    : { y: -5 }
                            }
                            className="group relative w-[78vw] max-w-[300px] shrink-0 overflow-hidden rounded-[16px] bg-[#f5f2ef] sm:w-[calc((100%-20px)/2)] sm:max-w-none lg:w-[calc((100%-72px)/4)]"
                        >
                            <div className="relative aspect-[0.88/1] overflow-hidden">

                                {/* Image zoom */}
                                <motion.div
                                    className="absolute inset-0"
                                    whileHover={
                                        shouldReduceMotion
                                            ? undefined
                                            : { scale: 1.06 }
                                    }
                                    transition={{
                                        duration: 0.7,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >
                                    <Image
                                        src={concern.image}
                                        alt={`Skincare concern: ${concern.title}`}
                                        fill
                                        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 45vw, 22vw"
                                        className="object-cover"
                                    />
                                </motion.div>

                                {/* Image overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-transparent transition-colors duration-500 group-hover:from-black/70" />

                                {/* Hover description and label */}
                                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">

                                    <motion.div
                                        initial={false}
                                        animate={{ y: 0 }}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <span
                                            className="inline-flex rounded-full px-4 py-2 text-xs font-medium text-[#29252d] shadow-sm sm:text-sm"
                                            style={{
                                                backgroundColor: concern.color,
                                            }}
                                        >
                                            {concern.title}
                                        </span>

                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 group-hover:rotate-45">
                                            <ArrowUpRight size={17} />
                                        </span>
                                    </motion.div>

                                    {/* Description reveals on hover */}
                                    <div
                                        className="grid transition-[grid-template-rows,opacity] duration-500 ease-out [grid-template-rows:0fr] opacity-0 group-hover:[grid-template-rows:1fr] group-hover:opacity-100 group-focus-within:[grid-template-rows:1fr] group-focus-within:opacity-100 max-sm:[grid-template-rows:1fr] max-sm:opacity-100"
                                    >
                                        <div className="overflow-hidden">
                                            <p className="pt-3 text-xs leading-[1.7] text-white/95 sm:text-sm">
                                                {concern.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </motion.div>

                {/* Mobile controls */}
                <div className="mt-5 flex items-center justify-between px-5 sm:hidden">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#89848f]">
                        Explore skin concerns
                    </span>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => scroll(-1)}
                            aria-label="Previous skin concerns"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9e6ed] text-[#7D45C2]"
                        >
                            <ArrowLeft size={15} />
                        </button>

                        <button
                            type="button"
                            onClick={() => scroll(1)}
                            aria-label="Next skin concerns"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeedfa] text-[#7D45C2]"
                        >
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .skin-concerns-slider {
                    scrollbar-width: none;
                    -ms-overflow-style: none;
                    scroll-snap-type: x mandatory;
                    -webkit-overflow-scrolling: touch;
                }

                .skin-concerns-slider::-webkit-scrollbar {
                    display: none;
                }

                .skin-concerns-slider > article {
                    scroll-snap-align: start;
                }

                @media (prefers-reduced-motion: reduce) {
                    .skin-concerns-slider *,
                    .skin-concerns-slider *::before,
                    .skin-concerns-slider *::after {
                        transition-duration: 0.01ms !important;
                        animation-duration: 0.01ms !important;
                    }
                }
            `}</style>
        </section>
    );
}


// "use client";

// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { ArrowUpRight } from "lucide-react";

// const concerns = [
//     {
//         id: 1,
//         title: "Sun Tan",
//         description:
//             "Prolonged sun exposure can leave skin looking darker, dull and uneven. Tan buildup affects your natural radiance, making the complexion appear tired, patchy and less radiant.",
//         image: "/skin/2.png",
//     },
//     {
//         id: 2,
//         title: "Dullness",
//         description:
//             "Dull skin can make your complexion look tired, flat, and lacking in its natural radiance. It may leave your skin looking uneven and less refreshed, reducing its healthy, glowing appearance.",
//         image: "/skin/dullness.webp",
//     },
//     {
//         id: 3,
//         title: "Post Acne Marks",
//         description:
//             "Acne may fade, but the marks can stay behind. Dark spots and uneven texture left after breakouts can make skin look dull, uneven and less smooth.",
//         image: "/skin/3.png",
//     },
//     {
//         id: 4,
//         title: "Uneven Skin Tone",
//         description:
//             "Uneven skin tone creates visible differences in complexion across the face. Dark patches, redness and pigmentation can make skin appear dull, inconsistent and less naturally radiant.",
//         image: "/skin/4.png",
//     },
// ];

// export default function SkinConcerns() {
//     const [activeIndex, setActiveIndex] = useState(0);
//     const [hoveredIndex, setHoveredIndex] = useState(null);

//     const activeConcern = concerns[activeIndex];

//     const handleMouseEnter = (index) => {
//         setActiveIndex(index);
//         setHoveredIndex(index);
//     };

//     const handleMouseLeave = () => {
//         setActiveIndex(0);
//         setHoveredIndex(null);
//     };

//     return (
//         <>
//             <div className="py-5 text-center border-t border-purple-100">
//                 <span className="mb-3 inline-block rounded-full bg-purple-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-purple-600">
//                     Skin concerns
//                 </span>

//                 <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
//                     What does your{" "}
//                     <span className="bg-gradient-to-r text-[#7D45C2] bg-clip-text">
//                         skin
//                     </span>{" "}
//                     need?
//                 </h2>

//                 <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
//                     Every skin has a story. Discover targeted care designed to bring out
//                     your healthiest, most radiant skin.
//                 </p>
//             </div>

//             <section
//                 className="
//                 relative
//                 h-[30vh]
//                 md:h-[90vh]
//                 min-h-[500px]
//                 w-full
//                 overflow-hidden
//                 bg-[#F7F2FC]
//             "
//                 onMouseLeave={handleMouseLeave}
//             >

//                 {/* ========================================= */}
//                 {/* BACKGROUND IMAGE */}
//                 {/* ========================================= */}

//                 <AnimatePresence mode="sync">
//                     <motion.div
//                         key={activeConcern.image}
//                         initial={{
//                             opacity: 0,
//                             scale: 1.04,
//                         }}
//                         animate={{
//                             opacity: 1,
//                             scale: 1,
//                         }}
//                         exit={{
//                             opacity: 0,
//                         }}
//                         transition={{
//                             opacity: {
//                                 duration: 0.55,
//                                 ease: "easeInOut",
//                             },
//                             scale: {
//                                 duration: 1,
//                                 ease: [0.22, 1, 0.36, 1],
//                             },
//                         }}
//                         className="absolute inset-0"
//                     >
//                         <img
//                             src={activeConcern.image}
//                             alt={activeConcern.title}
//                             className="
//                             h-full
//                             w-full
//                             object-cover
//                         "
//                         />
//                     </motion.div>
//                 </AnimatePresence>

//                 {/* ========================================= */}
//                 {/* SOFT DARK OVERLAY */}
//                 {/* ========================================= */}

//                 <div
//                     className="
//                     absolute
//                     inset-0
//                     bg-black/15
//                 "
//                 />

//                 {/* ========================================= */}
//                 {/* PURPLE GRADIENT */}
//                 {/* ========================================= */}

//                 <div
//                     className="
//                     absolute
//                     inset-0
//                     bg-gradient-to-t
//                     from-black/45
//                     via-transparent
//                     to-black/10
//                 "
//                 />

//                 {/* ========================================= */}
//                 {/* CARDS */}
//                 {/* ========================================= */}

//                 <div className="relative z-10 flex h-full w-full">

//                     {concerns.map((concern, index) => {
//                         const isHovered = hoveredIndex === index;

//                         return (
//                             <motion.div
//                                 key={concern.id}
//                                 onMouseEnter={() => handleMouseEnter(index)}
//                                 className="
//                                 relative
//                                 h-full
//                                 flex-1
//                                 cursor-pointer
//                                 overflow-hidden
//                                 border-r
//                                 border-white/20
//                                 last:border-r-0
//                             "
//                                 animate={{
//                                     flexGrow: isHovered ? 1.12 : 1,
//                                 }}
//                                 transition={{
//                                     duration: 0.55,
//                                     ease: [0.22, 1, 0.36, 1],
//                                 }}
//                             >

//                                 {/* ========================================= */}
//                                 {/* HOVER PURPLE PANEL */}
//                                 {/* ========================================= */}

//                                 <motion.div
//                                     initial={false}
//                                     animate={{
//                                         opacity: isHovered ? 1 : 0,
//                                     }}
//                                     transition={{
//                                         duration: 0.4,
//                                         ease: "easeOut",
//                                     }}
//                                     className="
//                                     absolute
//                                     inset-0
//                                     bg-[#7D45C2]/65
//                                     backdrop-blur-[2px]
//                                 "
//                                 />

//                                 {/* ========================================= */}
//                                 {/* CARD CONTENT */}
//                                 {/* ========================================= */}

//                                 <div
//                                     className="
//                                     relative
//                                     flex
//                                     h-full
//                                     flex-col
//                                     justify-between
//                                     p-2
//                                     md:p-8
//                                     lg:p-10
//                                 "
//                                 >

//                                     {/* NUMBER */}
//                                     <motion.div
//                                         animate={{
//                                             color: isHovered
//                                                 ? "#FFFFFF"
//                                                 : "#FFFFFF",
//                                             y: isHovered ? 0 : 0,
//                                         }}
//                                         className="
//                                         font-heading
//                                         text-4xl
//                                         font-medium
//                                         leading-none
//                                         md:text-5xl
//                                     "
//                                     >
//                                         {String(concern.id).padStart(2, "0")}
//                                     </motion.div>

//                                     {/* ========================================= */}
//                                     {/* BOTTOM */}
//                                     {/* ========================================= */}

//                                     <div className="pb-2">

//                                         {/* TITLE */}
//                                         <motion.h3
//                                             animate={{
//                                                 y: isHovered ? -5 : 0,
//                                             }}
//                                             transition={{
//                                                 duration: 0.4,
//                                                 ease: [0.22, 1, 0.36, 1],
//                                             }}
//                                             className="
//                                             max-w-[280px]
//                                             font-heading
//                                             text-xl
//                                             font-medium
//                                             uppercase
//                                             leading-tight
//                                             text-white
//                                             md:text-2xl
//                                             lg:text-[28px]
//                                         "
//                                         >
//                                             {concern.title}
//                                         </motion.h3>

//                                         {/* ================================= */}
//                                         {/* DESCRIPTION ONLY ON HOVER */}
//                                         {/* ================================= */}

//                                         <AnimatePresence initial={false}>
//                                             {isHovered && (
//                                                 <motion.div
//                                                     initial={{
//                                                         opacity: 0,
//                                                         height: 0,
//                                                         y: 20,
//                                                     }}
//                                                     animate={{
//                                                         opacity: 1,
//                                                         height: "auto",
//                                                         y: 0,
//                                                     }}
//                                                     exit={{
//                                                         opacity: 0,
//                                                         height: 0,
//                                                         y: 10,
//                                                     }}
//                                                     transition={{
//                                                         duration: 0.45,
//                                                         ease: [0.22, 1, 0.36, 1],
//                                                     }}
//                                                     className="overflow-hidden"
//                                                 >
//                                                     <p
//                                                         className="
//                                                         mt-5
//                                                         max-w-[340px]
//                                                         text-[13px]
//                                                         font-medium
//                                                         md:leading-7
//                                                         text-white/90
//                                                         md:text-base
//                                                     "
//                                                     >
//                                                         {concern.description}
//                                                     </p>
//                                                 </motion.div>
//                                             )}
//                                         </AnimatePresence>

//                                         {/* ================================= */}
//                                         {/* ARROW */}
//                                         {/* ================================= */}

//                                         <motion.div
//                                             animate={{
//                                                 x: isHovered ? 5 : 0,
//                                                 y: isHovered ? -3 : 0,
//                                             }}
//                                             transition={{
//                                                 duration: 0.35,
//                                             }}
//                                             className="
//                                             mt-6
//                                             flex
//                                             h-10
//                                             w-10
//                                             items-center
//                                             justify-start
//                                             text-white
//                                         "
//                                         >
//                                             <ArrowUpRight
//                                                 size={27}
//                                                 strokeWidth={1.5}
//                                             />
//                                         </motion.div>

//                                     </div>
//                                 </div>

//                             </motion.div>
//                         );
//                     })}

//                 </div>

//                 {/* ========================================= */}
//                 {/* SOFT PURPLE GLOW */}
//                 {/* ========================================= */}

//                 <div
//                     className="
//                     pointer-events-none
//                     absolute
//                     -bottom-32
//                     left-1/2
//                     z-20
//                     h-[300px]
//                     w-[500px]
//                     -translate-x-1/2
//                     rounded-full
//                     bg-[#D8B8F5]/20
//                     blur-3xl
//                 "
//                 />

//             </section>
//         </>
//     );
// }