
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    Sprout,
    ShieldCheck,
    Sparkles,
    Droplets,
} from "lucide-react";

const benefits = [
    {
        title: "Strengthen Roots",
        description:
            "Strengthens hair follicles for lasting resilience.",
        icon: Sprout,
        position: "top-left",
    },
    {
        title: "Reduce Hair Fall",
        description:
            "Helps minimize shedding while supporting scalp health.",
        icon: ShieldCheck,
        position: "top-right",
    },
    {
        title: "Stimulate Growth",
        description:
            "Supports healthy-looking hair with botanical care.",
        icon: Sparkles,
        position: "bottom-left",
    },
    {
        title: "Enhance Volume",
        description:
            "Helps hair look fuller, bouncier, and energized.",
        icon: Droplets,
        position: "bottom-right",
    },
];

const cardPositions = {
    "top-left": "lg:left-0 lg:top-[8%]",
    "top-right": "lg:right-0 lg:top-[8%]",
    "bottom-left": "lg:left-[3%] lg:bottom-[9%]",
    "bottom-right": "lg:right-[3%] lg:bottom-[9%]",
};

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: "easeOut" },
    },
};

export default function ActivatorSection() {
    return (
        <section className="relative overflow-hidden bg-[#F7F2FC] px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15">
            {/* Subtle decorative glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d2efd9]/60 blur-[100px]" />

            <div className="relative mx-auto max-w-[1350px]">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="relative z-10 mx-auto mb-10 max-w-3xl text-center"
                >

                    <h2 className="text-3xl font-medium leading-[1.12] tracking-[-0.02em] text-[#24252a] sm:text-5xl lg:text-[60px]">
                        Boost Your Confidence with
                        <span className="-mt-2 block text-[#7D45C2]">
                            Activator Shampoo
                        </span>
                    </h2>
                </motion.div>

                {/* Product and benefits */}
                <div className="relative mx-auto max-w-[1120px]">
                    {/* Center product */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{
                            duration: 0.9,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="relative z-10 mx-auto flex h-[300px] w-full max-w-[340px] items-center justify-center sm:h-[390px] sm:max-w-[420px] lg:h-[460px] lg:max-w-[430px]"
                    >
                        {/* Floating glow behind product */}
                        <motion.div
                            animate={{
                                scale: [1, 1.06, 1],
                                opacity: [0.45, 0.7, 0.45],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="absolute h-[230px] w-[230px] rounded-full bg-white/80 blur-3xl sm:h-[320px] sm:w-[320px]"
                        />

                        <motion.div
                            animate={{ y: [0, -9, 0] }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="relative h-full w-full"
                        >
                            <Image
                                src="/products/5.png"
                                alt="Activator Shampoo product"
                                fill
                                priority
                                sizes="(max-width: 640px) 90vw, 430px"
                                className="object-contain drop-shadow-[0_20px_25px_rgba(39,62,43,0.12)]"
                            />
                        </motion.div>
                    </motion.div>

                    {/* Connecting lines on desktop */}
                    <svg
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible lg:block"
                        viewBox="0 0 1120 460"
                        fill="none"
                        preserveAspectRatio="none"
                    >
                        <motion.path
                            d="M 245 115 H 365 Q 390 115 390 140 V 175 H 445"
                            stroke="#7D45C2"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                        />
                        <motion.path
                            d="M 875 115 H 755 Q 730 115 730 140 V 175 H 675"
                            stroke="#7D45C2"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.35 }}
                        />
                        <motion.path
                            d="M 270 355 H 375 Q 400 355 400 330 V 295 H 445"
                            stroke="#7D45C2"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                        />
                        <motion.path
                            d="M 850 355 H 745 Q 720 355 720 330 V 295 H 675"
                            stroke="#7D45C2"
                            strokeWidth="1"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, delay: 0.65 }}
                        />

                        {[
                            [445, 175],
                            [675, 175],
                            [445, 295],
                            [675, 295],
                        ].map(([cx, cy], index) => (
                            <motion.circle
                                key={index}
                                cx={cx}
                                cy={cy}
                                r="4"
                                fill="#7D45C2"
                                initial={{ scale: 0, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7 + index * 0.12 }}
                            />
                        ))}
                    </svg>

                    {/* Benefit cards */}
                    <div className="relative z-20 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:absolute lg:inset-0 lg:block">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;

                            return (
                                <motion.article
                                    key={benefit.title}
                                    variants={cardVariants}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, amount: 0.25 }}
                                    transition={{ delay: index * 0.12 }}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className={`group rounded-2xl border border-white/80 bg-white/70 p-4 shadow-[0_8px_25px_rgba(77,117,85,0.06)] backdrop-blur-md transition-colors duration-300 hover:bg-white sm:p-5 lg:absolute lg:w-[245px] ${cardPositions[benefit.position]}`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="text-base font-medium tracking-wider text-[#303831] sm:text-lg">
                                            {benefit.title}
                                        </h3>

                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eee9f4] text-[#7D45C2] transition-transform duration-300 group-hover:rotate-12 group-hover:text-white group-hover:bg-[#7D45C2]">
                                            <Icon size={17} strokeWidth={1.6} />
                                        </span>
                                    </div>

                                    <p className="mt-2 max-w-[210px] text-xs font-light leading-[1.8] text-black sm:text-sm">
                                        {benefit.description}
                                    </p>

                                    <div className="mt-4 h-[2px] w-8 rounded-full bg-[#7D45C2] transition-all duration-500 group-hover:w-16" />
                                </motion.article>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom statement */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative z-10 mx-auto mt-9 max-w-lg text-center lg:mt-5"
                >
                    <span className="mx-auto mb-3 block h-px w-12 bg-[#7D45C2]" />

                    <p className="text-xs font-light leading- text-[#7D45C2] sm:text-sm">
                        Make every wash a moment of care.
                        <span className="block text-[#7D45C2]">
                            Your hair-care ritual, thoughtfully reimagined.
                        </span>
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
