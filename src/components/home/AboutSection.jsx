
"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: "easeOut" },
    },
};

export default function AboutSection() {
    return (
        <section className="relative isolate overflow-hidden bg-[#fff8f3]">
            {/* Full-width background banner */}
            <div className="absolute inset-0 -z-20">
                <Image
                    src="/about.png"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover object-center"
                />
            </div>

            {/* Optional subtle overlay for text readability */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-[#fff8f3]/5 to-[#fff8f3]/20" />

            <div className="mx-auto max-w-[1800px] px-5 sm:px-8 lg:px-12">
                <div className="grid min-h-[480px] items-center sm:min-h-[560px] lg:min-h-[650px] lg:grid-cols-2">
                    <div aria-hidden="true" />

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={{
                            hidden: {},
                            visible: {
                                transition: { staggerChildren: 0.15 },
                            },
                        }}
                        className="mx-auto w-full max-w-[650px] py-14 sm:py-16 lg:py-20"
                    >
                        <motion.div variants={fadeUp}>
                            <span className="inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8d83c2] sm:text-xs">
                                <span className="h-px w-8 bg-[#a79dd4]" />
                                Our philosophy
                            </span>

                            <h2 className="mt-5 text-3xl font-light leading-[1.15] tracking-[-0.01em] text-[#27242b] sm:text-4xl lg:text-5xl xl:text-[58px]">
                                Skincare goes{" "}
                                <span className="text-[#9188c6]">
                                    Beyond
                                </span>{" "}
                                the surface.
                            </h2>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            className="relative mt-8 pl-5 sm:mt-10 sm:pl-7"
                        >
                            <span className="absolute -left-1 -top-7 font-serif text-6xl leading-none text-[#c7c0e0] sm:text-7xl">
                                “
                            </span>

                            <p className="max-w-xl text-base font-light leading-[1.8] text-[#34313a] sm:text-lg lg:text-[21px] lg:leading-[1.75]">
                                We believe skincare is more than what you see in
                                the mirror. It is connected to how you feel,
                                how you care for yourself, and how confidently
                                you show up every day.
                            </p>

                            <p className="mt-5 max-w-xl text-sm leading-7 text-[#77717d] sm:text-base">
                                Solvestic brings together thoughtful formulations
                                and intentional self-care to make your everyday
                                skincare ritual feel meaningful.
                            </p>

                            {/* <span className="absolute -right-1 -bottom-7 font-serif text-6xl leading-none text-[#c7c0e0] sm:text-7xl">
                                ”
                            </span> */}
                        </motion.div>

                        {/* Original logo */}
                        <motion.div
                            variants={fadeUp}
                            className="mt-9 sm:mt-12 flex justify-center"
                        >
                            <div className="relative h-[50px] w-[210px] sm:h-[70px] sm:w-[300px]">
                                <Image
                                    src="/logo/solvestic.png"
                                    alt="Solvestic"
                                    fill
                                    sizes="260px"
                                    className="object-cover object-center"
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
