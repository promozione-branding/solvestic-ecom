
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

export default function Footer() {
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

            {/* Main Footer */}
            <div className="mx-auto max-w-[1600px] px-5 pb-7 pt-8 sm:px-8 sm:pt-10 lg:px-12">
                <div className="grid gap-10 border-b border-[#e8e0ef] pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:gap-12">
                    {/* Brand */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false }}
                        variants={fadeUp}
                    >
                        <Link href="/" className="inline-flex">
                            <div className="relative h-12 w-62">
                                <Image
                                    src="/logo/solvestic.png"
                                    alt="Solvestic skincare"
                                    fill
                                    sizes="192px"
                                    className="object-cover object-left"
                                />
                            </div>
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-[#77717f]">
                            Thoughtful skincare for your everyday ritual.
                            Discover formulations designed to make self-care
                            feel simple, considered and meaningful.
                        </p>

                        <div className="mt-5 flex gap-3">
                            <a
                                href="https://www.instagram.com/solvesticcare"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="flex h-10 w-10 items-center justify-center text-[#7D45C2] rounded-full border border-[#7D45C2] bg-white transition hover:bg-[#7D45C2] hover:text-white"
                            >
                                <FaInstagram size={18} />
                            </a>
                            <a
                                href="https://www.youtube.com/@solvesticcare"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="YouTube"
                                className="flex h-10 w-10 items-center justify-center text-[#7D45C2] rounded-full border border-[#7D45C2] bg-white transition hover:bg-[#7D45C2] hover:text-white"
                            >
                                <FaYoutube size={18} />
                            </a>
                        </div>
                    </motion.div>

                    {/* Explore */}
                    <FooterColumn
                        title="Explore"
                        links={[
                            { label: "Home", href: "/" },
                            { label: "Shop All", href: "/our-products" },
                            { label: "About Us", href: "/about-us" },
                            { label: "Contact", href: "/contact-us" },
                            { label: "Newsletter", href: "/newsletter" },
                        ]}
                    />

                    {/* Customer care */}
                    <FooterColumn
                        title="Customer Care"
                        links={[
                            { label: "Privacy Policy", href: "/privacy-policy" },
                            { label: "Shipping Policy", href: "/shipping-policy" },
                            { label: "Terms & Conditions", href: "/terms-and-conditions" },
                            { label: "Returns & Refunds", href: "/return-policy" },
                            { label: "Track Your Order", href: "/track-order" },
                        ]}
                    />

                    {/* Newsletter */}
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false }}
                        variants={fadeUp}
                    >
                        <h3 className="text-lg font-semibold">Office Address</h3>
                        <p className="mt-1 text-base font-semibold text-[#57565a]">
                            Solvestic Wellness Private Limited
                        </p>
                        <p className="mt-1 text-sm text-[#57565a]">
                            We're here Monday – Saturday
                        </p>
                        <p className="mt-2 text-sm leading- text-[#57565a]">
                            11:00 AM – 6:15 PM
                        </p>
                        <p className="mt-2 text-sm leading- text-[#57565a]">
                            Office No. 1001, Pearl Best Heights-2, <br />
                            Plot-C9, NSP, Pitampura, <br />
                            Delhi – 110034
                        </p>




                        <a
                            href="tel:919220788799"
                            className="mt-4 flex items-center gap-2 break-all text-sm text-[#5a575e] transition hover:text-[#7D45C2]"
                        >
                            <PhoneCall size={16} />
                            +91 9220788799
                        </a>
                        <a
                            href="mailto:care@solvestic.com"
                            className="mt-4 flex items-center gap-2 break-all text-sm text-[#5a575e] transition hover:text-[#7D45C2]"
                        >
                            <Mail size={16} />
                            care@solvestic.com
                        </a>
                    </motion.div>
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col items-center justify-between gap-3 pt-4 text-center text-xs text-[#5b595d] sm:flex-row sm:text-left">
                    <p>
                        © {new Date().getFullYear()} Solvestic. All rights reserved.
                    </p>

                    <div className="flex flex-wrap justify-center gap-5">
                        <Link
                            href="/privacy-policy"
                            className="transition hover:text-[#6e5aa8]"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/terms-and-conditions"
                            className="transition hover:text-[#6e5aa8]"
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
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