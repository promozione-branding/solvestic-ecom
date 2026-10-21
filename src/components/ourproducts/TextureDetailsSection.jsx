
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
    motion,
    AnimatePresence,
    useReducedMotion,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const productDetails = {
    "rapid-pigment-correcting-face-cleanser": {
        image: "/texture1.jpeg",
        imageAlt: "Solvestic face cleanser creamy gel texture",
        details: [
            {
                id: "01",
                eyebrow: "THE FORMULA",
                title: "Texture",
                subtitle: "A creamy, gentle cleanse.",
                description:
                    "A silky, cushion-like gel texture that glides effortlessly across the skin for a gentle and comfortable cleansing experience.",
                points: [
                    "Creamy gel consistency",
                    "Gentle on the skin",
                    "Smooth, lightweight feel",
                ],
                marker: { top: "28%", left: "43.5%" },
                imageLabel: "Texture",
            },
            {
                id: "02",
                eyebrow: "THE INGREDIENTS",
                title: "Brightening Actives",
                subtitle: "Your glow, thoughtfully formulated.",
                description:
                    "A targeted blend of brightening ingredients designed to support a more even-looking complexion and a naturally radiant appearance.",
                points: [
                    "Niacinamide",
                    "Glycolic Acid",
                    "Licorice Root Extract",
                    "Mulberry Extract",
                ],
                marker: { top: "30%", left: "60%" },
                imageLabel: "Brightening",
            },
            {
                id: "03",
                eyebrow: "DAILY HYDRATION",
                title: "Hydrating Blend",
                subtitle: "Comfort meets hydration.",
                description:
                    "A moisture-supporting blend that helps leave skin feeling soft, supple, and comfortable after cleansing.",
                points: [
                    "D-Panthenol",
                    "Betaine",
                    "Trehalose",
                ],
                marker: { top: "69%", left: "34%" },
                imageLabel: "Hydration",
            },
            {
                id: "04",
                eyebrow: "YOUR SKIN, YOUR WAY",
                title: "Suitable For",
                subtitle: "Made for your everyday ritual.",
                description:
                    "Designed to complement a simple, consistent skincare routine. Choose the formula that suits your individual skin needs.",
                points: [
                    "Daily skincare routine",
                    "Gentle cleansing ritual",
                    "All skin types*",
                ],
                marker: { top: "70%", left: "64%" },
                imageLabel: "Skin compatibility",
            },
        ],
    },

    "rapid-pigment-correcting-bouncy-moisturiser": {
        // Replace this path with your moisturiser texture image.
        image: "/texture2.jpeg",
        imageAlt: "Solvestic bouncy gel moisturiser texture",
        details: [
            {
                id: "01",
                eyebrow: "THE FORMULA",
                title: "Bouncy Gel Texture",
                subtitle: "Light as air. Full of hydration.",
                description:
                    "A lightweight, bouncy gel moisturiser designed to melt effortlessly into the skin. Its refreshing texture absorbs easily, leaving skin feeling soft, smooth, supple and comfortably moisturised without a heavy or greasy finish.",
                points: [
                    "Lightweight, bouncy gel consistency",
                    "Absorbs easily without a greasy feel",
                    "Leaves skin soft, smooth and supple",
                    "Comfortable for everyday moisturising",
                ],
                marker: { top: "23%", left: "42%" },
                imageLabel: "Bouncy Gel Texture",
            },
            {
                id: "02",
                eyebrow: "THE BRIGHTENING COMPLEX",
                title: "Brightening Actives",
                subtitle: "A brighter look, beautifully balanced.",
                description:
                    "A targeted combination of 2% Niacinamide, 0.5% N-Acetyl Glucosamine (NAG) and Alpha Arbutin helps improve the appearance of uneven skin tone, pigmentation and dullness for a more radiant-looking complexion.",
                points: [
                    "2% Niacinamide — supports even-looking skin tone",
                    "0.5% NAG — helps smooth skin's appearance",
                    "Alpha Arbutin — targets the look of uneven pigmentation",
                    "Supports a healthier, balanced-looking complexion",
                ],
                marker: { top: "28%", left: "57%" },
                imageLabel: "Brightening Complex",
            },
            {
                id: "03",
                eyebrow: "DEEP HYDRATION",
                title: "Hydration & Barrier",
                subtitle: "Moisture that feels like comfort.",
                description:
                    "A multi-molecular Hyaluronic Acid complex works alongside moisture-supporting humectants to replenish hydration. Ceramides help support the skin barrier, while Madecassoside helps soothe and comfort dry or stressed skin.",
                points: [
                    "Multi-molecular Hyaluronic Acid Complex",
                    "Ceramides 1, 2, 3, 4 and 6 II",
                    "Madecassoside for skin comfort",
                    "Helps maintain long-lasting hydration",
                    "Supports a healthy-looking skin barrier",
                ],
                marker: { top: "67%", left: "36%" },
                imageLabel: "Hydration & Barrier",
            },
            {
                id: "04",
                eyebrow: "THE SOLVESTIC WAY",
                title: "Your Daily Ritual",
                subtitle: "A little bounce, morning and night.",
                description:
                    "Apply an adequate amount evenly over a clean, dry face and neck. Gently massage until fully absorbed. Use morning and evening as part of your daily skincare routine, and always follow with a broad-spectrum sunscreen during the day.",
                points: [
                    "Apply after cleansing, morning and evening",
                    "Massage gently into the face and neck",
                    "Use a generous layer for extra comfort",
                    "Follow with sunscreen during the day",
                    "50 ml / 1.69 fl. oz.",
                ],
                marker: { top: "71%", left: "64%" },
                imageLabel: "Daily Moisturising",
            },
        ],
    },
};

export default function TextureDetailsSection({ slug }) {
    const sectionRef = useRef(null);
    const imageRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const reduceMotion = useReducedMotion();

    const product = productDetails[slug];
    const details = product?.details || [];

    useEffect(() => {
        setActiveIndex(0);
    }, [slug]);

    useEffect(() => {
        if (!product) return;

        const section = sectionRef.current;
        const image = imageRef.current;

        if (!section || !image) return;

        const ctx = gsap.context(() => {
            const panels = gsap.utils.toArray(
                ".texture-detail-panel"
            );

            if (!reduceMotion) {
                gsap.fromTo(
                    image,
                    {
                        opacity: 0,
                        scale: 0.94,
                        y: 35,
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: section,
                            start: "top 80%",
                            once: true,
                        },
                    }
                );
            }

            panels.forEach((panel, index) => {
                ScrollTrigger.create({
                    trigger: panel,
                    start: "top center",
                    end: "bottom center",
                    onEnter: () => setActiveIndex(index),
                    onEnterBack: () => setActiveIndex(index),
                });
            });

            ScrollTrigger.refresh();
        }, section);

        return () => ctx.revert();
    }, [slug, reduceMotion, product]);

    if (!product) return null;

    const safeIndex = Math.min(
        activeIndex,
        details.length - 1
    );

    const activeDetail = details[safeIndex];

    return (
        <section
            ref={sectionRef}
            className="texture-section relative overflow-clip bg-[#FCFAFF] text-[#1d1a24]"
        >
            <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-16 lg:py-15">

                {/* SECTION HEADING */}
                <motion.div
                    initial={
                        reduceMotion
                            ? false
                            : { opacity: 0, y: 25 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{
                        once: true,
                        amount: 0.5,
                    }}
                    transition={{
                        duration: 0.7,
                        ease: "easeOut",
                    }}
                    className="mb-5 max-w-2xl"
                >
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7D45C2]">
                        Inside the formula
                    </span>

                    <h2 className="mt-2 text-4xl font-light tracking-[-0.01em] sm:text-5xl lg:text-7xl">
                        Science meets{" "}
                        <span className="block text-[#7D45C2]">
                            self-care.
                        </span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">

                    {/* LEFT STICKY IMAGE */}
                    <div className="relative lg:self-stretch">
                        <div className="relative lg:sticky lg:top-24">

                            <div
                                ref={imageRef}
                                className="relative mx-auto aspect-square w-full max-w-[570px] overflow-hidden rounded-[28px] bg-[#F0ECFA] sm:rounded-[36px]"
                            >
                                <Image
                                    key={slug}
                                    src={product.image}
                                    alt={product.imageAlt}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-cover"
                                />

                                {/* SOFT GRADIENT */}
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#B9ACD6]/15 via-transparent to-white/10" />

                                {/* ACTIVE MARKER */}
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={`${slug}-${activeDetail.id}`}
                                        initial={
                                            reduceMotion
                                                ? false
                                                : {
                                                    opacity: 0,
                                                    scale: 0.75,
                                                }
                                        }
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 0.8,
                                        }}
                                        transition={{
                                            duration: 0.35,
                                        }}
                                        className="absolute z-10"
                                        style={{
                                            top: activeDetail.marker.top,
                                            left: activeDetail.marker.left,
                                        }}
                                    >
                                        <span className="relative flex size-4 items-center justify-center">
                                            <span
                                                className={`absolute size-4 rounded-full bg-[#7D45C2]/80 ${reduceMotion ? "" : "animate-ping"
                                                    }`}
                                            />
                                            <span className="relative size-2.5 rounded-full border-2 border-white bg-[#7D45C2] shadow-lg" />
                                        </span>
                                    </motion.div>
                                </AnimatePresence>

                                {/* IMAGE CAPTION */}
                                <div className="absolute bottom-5 left-5 right-5 sm:bottom-2 sm:left-7 sm:right-7">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={`${slug}-${activeDetail.id}-caption`}
                                            initial={
                                                reduceMotion
                                                    ? false
                                                    : {
                                                        opacity: 0,
                                                        y: 12,
                                                    }
                                            }
                                            animate={{
                                                opacity: 1,
                                                y: 0,
                                            }}
                                            exit={{
                                                opacity: 0,
                                                y: -8,
                                            }}
                                            transition={{
                                                duration: 0.35,
                                            }}
                                            className="w-fit rounded-2xl border border-white/50 bg-white/75 p-4 shadow-sm backdrop-blur-xl"
                                        >
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-[#7D45C2]">
                                                Now exploring
                                            </p>

                                            <h3 className="mt-1 text-xl font-medium tracking-tight">
                                                {activeDetail.imageLabel}
                                            </h3>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* PROGRESS INDICATORS */}
                            <div className="mx-auto mt-4 flex max-w-[570px] items-center gap-2">
                                {details.map((detail, index) => (
                                    <div
                                        key={detail.id}
                                        className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#E7E1F0]"
                                    >
                                        <motion.div
                                            className="h-full rounded-full bg-[#7D45C2]"
                                            initial={false}
                                            animate={{
                                                width:
                                                    index <= safeIndex
                                                        ? "100%"
                                                        : "0%",
                                            }}
                                            transition={{
                                                duration: reduceMotion ? 0 : 0.45,
                                                ease: "easeInOut",
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SCROLL DETAILS */}
                    <div className="relative">
                        {details.map((detail, index) => {
                            const isActive = safeIndex === index;

                            return (
                                <article
                                    key={`${slug}-${detail.id}`}
                                    className="texture-detail-panel flex min-h-[70vh] flex-col justify-center border-b border-[#E9E3F1] py-14 first:pt-4 last:border-b-0 lg:min-h-[78vh] lg:py-16"
                                >
                                    <motion.div
                                        animate={{
                                            opacity: isActive ? 1 : 0.38,
                                            x: isActive ? 0 : 12,
                                        }}
                                        transition={{
                                            duration: reduceMotion ? 0 : 0.45,
                                            ease: "easeOut",
                                        }}
                                    >
                                        {/* NUMBER + EYEBROW */}
                                        <div className="mb-8 flex items-center gap-4">
                                            <span
                                                className={`flex size-11 items-center justify-center rounded-full text-xs transition-colors duration-300 ${isActive
                                                    ? "bg-[#7D45C2] text-white"
                                                    : "bg-[#EEE9F5] text-[#7D45C2]"
                                                    }`}
                                            >
                                                {detail.id}
                                            </span>

                                            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-[#7D45C2] sm:text-xs">
                                                {detail.eyebrow}
                                            </span>
                                        </div>

                                        {/* TITLE */}
                                        <h3 className="max-w-xl text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                                            {detail.title}
                                        </h3>

                                        {/* SUBTITLE */}
                                        <p className="mt-4 text-lg text-[#7D45C2] sm:text-xl">
                                            {detail.subtitle}
                                        </p>

                                        {/* DESCRIPTION */}
                                        <p className="mt-6 max-w-lg text-sm leading-8 text-[#777080] sm:text-base">
                                            {detail.description}
                                        </p>

                                        {/* POINTS */}
                                        <ul className="mt-8 space-y-4">
                                            {detail.points.map(
                                                (point, pointIndex) => (
                                                    <motion.li
                                                        key={point}
                                                        initial={false}
                                                        animate={{
                                                            opacity: isActive ? 1 : 0.65,
                                                            x: isActive ? 0 : 6,
                                                        }}
                                                        transition={{
                                                            duration: reduceMotion ? 0 : 0.35,
                                                            delay:
                                                                isActive && !reduceMotion
                                                                    ? pointIndex * 0.07
                                                                    : 0,
                                                        }}
                                                        className="flex items-start gap-3 text-sm text-[#494352] sm:text-base"
                                                    >
                                                        <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#7D45C2]" />
                                                        <span>{point}</span>
                                                    </motion.li>
                                                )
                                            )}
                                        </ul>

                                        {/* SECTION COUNT */}
                                        <div className="mt-10 flex items-center gap-3">
                                            <span className="h-px w-12 bg-[#7D45C2]" />

                                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7D45C2]">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0"
                                                )}{" "}
                                                /{" "}
                                                {String(details.length).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </span>
                                        </div>
                                    </motion.div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
