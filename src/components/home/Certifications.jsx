
"use client";

import React from "react";
import { motion } from "framer-motion";

const certifications = [
    {
        title: "ISO",
        image: "/icons/8.png",
    },
    {
        title: "GMP",
        image: "/icons/9.png",
    },
    {
        title: "FDA",
        image: "/icons/10.png",
    },
    {
        title: "DERMATOLOGICALLY TESTED",
        image: "/icons/13.png",
    },
    {
        title: "CRUELTY FREE",
        image: "/icons/11.png",
    },
    {
        title: "SULPHATE & PARABEN FREE",
        image: "/icons/12.png",
    },
];

export default function Certifications() {
    return (
        <section className="relative overflow-hidden bg-[#F7F2FC] py-6 md:py-8">
            {/* DECORATIVE BLURS */}
            <div
                className="
                    pointer-events-none absolute -right-40 -top-40
                    h-[350px] w-[350px] rounded-full
                    bg-[#D8B8F5]/30 blur-3xl
                "
            />

            <div
                className="
                    pointer-events-none absolute -bottom-40 -left-40
                    h-[300px] w-[300px] rounded-full
                    bg-[#E8D7F8]/50 blur-3xl
                "
            />

            {/* MAIN CONTAINER */}
            <div className="relative z-10 mx-auto max-w-[1350] px-4">
                {/* HEADER */}
                <div className="mb-5">
                    {/* SMALL LABEL */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="mb-3 flex items-center gap-3"
                    >
                        <span className="h-px w-8 bg-[#7D45C2]" />

                        <span
                            className="
                                text-[10px] font-semibold uppercase
                                tracking-[0.25em] text-[#7D45C2]
                            "
                        >
                            Our Standards
                        </span>
                    </motion.div>

                    {/* HEADING */}
                    <motion.h2
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="
                            font-heading text-3xl uppercase
                            leading-[0.95] tracking-[-0.03em]
                            text-[#2D1557]
                            sm:text-4xl md:text-5xl
                        "
                    >
                        Certified{" "}
                        <span className="text-[#7D45C2]">
                            With Care.
                        </span>
                    </motion.h2>
                </div>

                {/* CERTIFICATION GRID */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6 lg:gap-4">
                    {certifications.map((certificate, index) => (
                        <motion.div
                            key={certificate.title}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.45,
                                delay: index * 0.06,
                            }}
                            className="
                                group relative flex min-w-0 flex-col
                                items-center justify-center overflow-hidden
                                rounded-xl border border-white
                                bg-white/60 px-1.5 py-3
                                shadow-[0_8px_24px_rgba(60,20,100,0.05)]
                                backdrop-blur-xl transition-all duration-300
                                hover:-translate-y-1
                                hover:shadow-[0_12px_30px_rgba(60,20,100,0.12)]
                                sm:px-2 sm:py-4
                                lg:rounded-2xl lg:px-2 lg:py-4
                            "
                        >
                            {/* CARD GLOW */}
                            <div
                                className="
                                    pointer-events-none absolute -right-10
                                    -top-10 h-20 w-20 rounded-full
                                    bg-[#D8B8F5]/30 blur-2xl
                                    transition-colors duration-300
                                    group-hover:bg-[#D8B8F5]/60
                                "
                            />

                            {/* ICON */}
                            <div
                                className="
                                    relative flex h-10 w-full items-center
                                    justify-center sm:h-12 lg:h-14
                                "
                            >
                                <img
                                    src={certificate.image}
                                    alt={certificate.title}
                                    loading="lazy"
                                    className="
                                        h-full w-full object-contain
                                        transition-transform duration-300
                                        group-hover:scale-105
                                    "
                                />
                            </div>

                            {/* DIVIDER */}
                            <div className="relative my-2 h-px w-full bg-[#7D45C2]/10" />

                            {/* TITLE */}
                            <h3
                                className="
                                    relative w-full break-words text-center flex justify-center items-center
                                    text-center text-[12px] font-semibold
                                    uppercase
                             text-[#2D1557]
                                    sm:text-[15px]
                                "
                            >
                                {certificate.title}
                            </h3>
                        </motion.div>
                    ))}
                </div>

                {/* FOOTER LABEL */}
                <div className="mt-4 flex items-center gap-3">
                    <span className="h-px w-8 bg-[#7D45C2]" />

                    <span
                        className="
                            text-[10px] font-semibold uppercase
                            tracking-[0.2em] text-[#7D45C2]
                        "
                    >
                        Quality First
                    </span>
                </div>
            </div>
        </section>
    );
}
