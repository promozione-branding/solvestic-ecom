
"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
    FlaskConical,
    Sparkles,
    HeartHandshake,
    ArrowUpRight,
    ShieldCheck,
    Users,
} from "lucide-react";

const benefits = [
    {
        icon: FlaskConical,
        title: "Thoughtful Formulations",
        description:
            "Skincare made with carefully selected ingredients and purposeful formulations.",
    },
    {
        icon: Sparkles,
        title: "Care You Can See",
        description:
            "A consistent skincare ritual designed to support healthy-looking, radiant skin.",
    },
    {
        icon: HeartHandshake,
        title: "Care That Feels Personal",
        description:
            "Thoughtful skincare essentials to help you build a routine that works for you.",
    },
];

const containerVariants = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.16 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut" },
    },
};

export default function WhyChooseUs() {
    return (
        <section className="relative isolate overflow-hidden bg-[#f4f0ff] px-4 py-10 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
            {/* Background atmosphere */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#eeeaff] via-[#faf7f5] to-[#e9e5fa]" />
            <div className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-[#7D45C2]/30 blur-[100px]" />

            <div className="relative mx-auto max-w-[1500px]">
                {/* Heading and CTA */}
                <div className="relative z-20 flex items-end justify-between gap-5">
                    <motion.div
                        initial={{ opacity: 0, x: -25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7D45C2] sm:text-xs">
                            The Solvestic difference
                        </p>

                        <h2 className="max-w-md text-3xl font-medium leading-[1.08] tracking-[-0.02em] text-[#27232d] sm:text-4xl lg:text-5xl">
                            Why Choose {" "}
                            <span className="text-[#7D45C2]">
                                Solvestic?
                            </span>
                        </h2>
                    </motion.div>

                    <motion.a
                        href="/shop"
                        initial={{ opacity: 0, y: -12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        // whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        className="mt-1 inline-flex shrink-0 items-center gap-2 rounded-full bg-[#7D45C2] px-4 py-3 text-[10px] font-medium text-white transition hover:bg-[#705dae] sm:px-6 sm:text-xs"
                    >
                        Explore skincare
                        <ArrowUpRight size={14} />
                    </motion.a>
                </div>

                {/* Main visual */}
                <div className="relative mt-5 min-h-[450px] overflow-hidden rounded-[26px] sm:mt-8 sm:min-h-[530px] lg:min-h-[600px]">
                    {/* Product background image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 1.06 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        className="absolute inset-0"
                    >
                        <Image
                            src="/Smiling Skincare Portrait Cutout (1).png"
                            alt="Solvestic skincare product in a premium lavender setting"
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 1500px"
                            className="object-contain object- sm:object-center"
                        />
                    </motion.div>

                    {/* Keep text readable over the background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-[#514479]/15" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#a69bd5]/15 via-transparent to-white/10" />

                    {/* Floating formulation card */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.7, delay: 0.3 }}
                        animate={{ y: [0, -6, 0] }}
                        className="absolute left-4 top-[17%] hidden w-[190px] rounded-2xl border border-white/60 bg-white/65 p-4 shadow-lg backdrop-blur-xl sm:block lg:left-8 lg:w-[220px]"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-medium text-[#393340]">
                                Ingredient-first care
                            </span>
                            <FlaskConical size={16} className="text-[#7D45C2]" />
                        </div>

                        <div className="mt-4 flex items-end gap-1.5">
                            {[24, 35, 29, 44, 37, 53, 46, 62, 50, 70, 57, 76].map(
                                (height, index) => (
                                    <motion.span
                                        key={index}
                                        initial={{ height: 4, opacity: 0.4 }}
                                        whileInView={{ height, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.45,
                                            delay: 0.35 + index * 0.04,
                                        }}
                                        className="w-full rounded-t-sm bg-[#7D45C2]"
                                    />
                                )
                            )}
                        </div>

                        <p className="mt-3 text-[10px] leading-5 text-[#6d6675]">
                            Thoughtful ingredients. Everyday rituals.
                        </p>
                    </motion.div>

                    {/* Floating trust card */}
                    <motion.div
                        initial={{ opacity: 0, x: 25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{ duration: 0.7, delay: 0.45 }}
                        animate={{ y: [0, 5, 0] }}
                        className="absolute right-4 top-[22%] hidden items-center gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-lg backdrop-blur-xl sm:flex lg:right-8"
                    >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eee9fb] text-[#7D45C2]">
                            <Users size={19} strokeWidth={1.6} />
                        </span>

                        <div>
                            <p className="text-xs font-semibold text-[#7D45C2]">
                                Your skin, your ritual
                            </p>
                            <p className="mt-1 text-[10px] text-black">
                                Made for everyday care
                            </p>
                        </div>
                    </motion.div>

                    {/* Bottom benefit cards */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false, amount: 0.2 }}
                        className="absolute inset-x-3 bottom-3 z-10 grid grid-cols-1 gap-2 sm:inset-x-4 sm:bottom-4 sm:grid-cols-3 sm:gap-3 lg:inset-x-5 lg:bottom-5 lg:gap-4"
                    >
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;

                            return (
                                <motion.article
                                    key={benefit.title}
                                    variants={fadeUp}
                                    whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.88)" }}
                                    className="group rounded-2xl border border-white/90 bg-white/65 p-3 shadow-lg backdrop-blur-xl transition-colors duration-300 sm:p-4 lg:p-5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee9fb] text-[#7D45C2] transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
                                            <Icon size={20} strokeWidth={1.6} />
                                        </span>

                                        <h3 className="text-xs font-medium text-[#7D45C2] sm:text-lg tracking-wide">
                                            {benefit.title}
                                        </h3>
                                    </div>

                                    <p className="mt-2 text-[11px] leading-[1.7] text-black sm:text-xs sm:leading-5">
                                        {benefit.description}
                                    </p>
                                </motion.article>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
