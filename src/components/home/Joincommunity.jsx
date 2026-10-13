
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowUpRight,
    Mail,
    MapPin,
    ArrowRight,
    PhoneCall,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";

const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: "easeOut" },
    },
};

export default function Joincommunity() {
    const pathname = usePathname();

    if (pathname?.startsWith("/admin")) return null;

    return (
        <footer className="overflow-hidden bg-[#faf7fc] text-[#28232f]">
            {/* Community Banner */}
            <section className="">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.15 }}
                    variants={fadeUp}
                    className="relative mx-auto min-h-[340px] max-w-[1600px] overflow-hidden bg-[#e9ddf5] sm:min-h-[390px] lg:min-h-[420px]"
                >
                    {/* Background image */}
                    <Image
                        src="/footer.png"
                        alt="Solvestic moisturizer on a lavender studio background"
                        fill
                        sizes="100vw"
                        priority={false}
                        className="object-cover object-center"
                    />

                    {/* Soft overlay for text readability */}
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-[#f8efff]/35 via-transparent to-transparent" /> */}

                    <div className="relative z-10 grid min-h-[340px] items-center gap-6 px-5 py-8 sm:min-h-[390px] sm:px-9 lg:min-h-[420px] lg:grid-cols-[1fr_auto_1fr] lg:gap-8 lg:px-10">
                        {/* Main message */}
                        <motion.div
                            variants={fadeUp}
                            className="order-first mx-auto max-w-[560px] text-center lg:order-none"
                        >
                            <div className="relative mx-auto mb-5 h-10 w-40 sm:h-12 sm:w-62">
                                <Image
                                    src="/logo/solvestic.png"
                                    alt="Solvestic"
                                    fill
                                    sizes="192px"
                                    className="object-cover"
                                />
                            </div>

                            <p className="text-3xl font-semibold leading-tight tracking-tight text-[#6352a0] sm:text-4xl lg:text-5xl">
                                Join the Community
                            </p>

                            <div className="mx-auto mt-1 mb-4 h-[2px] w-20 rounded-full bg-[#b7a3dc]" />

                            <p className="mx-auto max-w-[490px] text-sm leading-6 text-[#37303f] sm:text-base sm:leading-7">
                                Be the first to know about new launches,
                                exclusive discounts and community giveaways.
                            </p>

                            <div className="flex mt-5 justify-center items-center gap-4">
                                <div className="p-1 rounded-2xl overflow-hidden">
                                    <Image
                                        src={"/Instagram-QR.png"}
                                        alt="Logo"
                                        className="object-cover h-30 w-full"
                                        width={100}
                                        height={100}
                                    />
                                </div>

                                <div className="p-1 rounded-2xl overflow-hidden">
                                    <Image
                                        src={"/youtube-qr.png"}
                                        alt="Logo"
                                        className="object-cover h-30 w-full"
                                        width={100}
                                        height={100}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            
        </footer>
    );
}

function FooterColumn({ title, links }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
        >
            <h3 className="text-lg font-semibold">{title}</h3>

            <ul className="mt-2 space-y-3">
                {links.map((link) => (
                    <li key={link.label}>
                        <Link
                            href={link.href}
                            className="inline-flex items-center gap-1 text-sm text-[#403f41] transition hover:translate-x-1 hover:text-[#7D45C2]"
                        >
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
}