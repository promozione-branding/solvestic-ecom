"use client";

import React from "react";
import {
    motion,
    useScroll,
    useTransform,
} from "framer-motion";
import { Building2, Clock3, MapPin, Phone, Mail } from "lucide-react";
import {
    FaInstagram,
    FaFacebookF,
    FaYoutube,
    FaLinkedinIn,
    FaSnapchatGhost,
} from "react-icons/fa";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const socials = [
    {
        name: "Instagram",
        icon: FaInstagram,
        href: "https://www.instagram.com/solvesticcare",
    },
    {
        name: "Facebook",
        icon: FaFacebookF,
        href: "https://www.facebook.com/profile.php?id=61592286175717",
    },
    {
        name: "Youtube",
        icon: FaYoutube,
        href: "https://www.youtube.com/@solvesticcare",
    },
    {
        name: "LinkedIn",
        icon: FaLinkedinIn,
        href: "https://www.linkedin.com/in/solvesticwellness",
    },
    {
        name: "Snapchat",
        icon: FaSnapchatGhost,
        href: "https://www.snapchat.com/@solvestic",
    },
];

export default function Footer() {
    const { scrollYProgress } = useScroll();

    /*
     * Logo starts zoomed out.
     * When the footer enters the viewport,
     * it smoothly scales up.
     */
    const logoScale = useTransform(
        scrollYProgress,
        [0.72, 0.82, 0.92],
        [0.72, 0.92, 1.08]
    );

    const logoY = useTransform(
        scrollYProgress,
        [0.22, 0.99],
        [70, 0]
    );

    const logoOpacity = useTransform(
        scrollYProgress,
        [0.68, 0.78],
        [0.45, 1]
    );

    return (
        <footer className="relative overflow-hidden bg-white">

            {/* ================================================= */}
            {/* LOGO ZOOM SECTION */}
            {/* ================================================= */}

            <section className="relative flex h-[15vh] md:h-[30vh] md:min-h-[400px] items-center justify-center overflow-hidden">

                {/* SOFT BACKGROUND GLOW */}
                {/* <div
                    className="
                        pointer-events-none
                        absolute
                        left-1/2
                        top-1/2
                        h-[70vw]
                        w-[70vw]
                        max-h-[900px]
                        max-w-[900px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-white
                        blur-3xl
                    "
                /> */}

                {/* LOGO */}
                <motion.div
                    style={{
                        scale: logoScale,
                        y: logoY,
                        // opacity: logoOpacity,
                    }}
                    className="
                        relative
                        z-10
                        flex
                        w-[90%]
                        max-w-[1500px]
                        items-center
                        justify-center
                        bg-white
                        px-8
                        md:px-14
                        lg:px-20
                    "
                >
                    <img
                        src="/solve.png"
                        alt="Solvestic"
                        className="
                            h-auto
                            w-[70%]
                            object-contain
                        "
                    />
                </motion.div>

            </section>

            {/* ================================================= */}
            {/* FOOTER CONTENT */}
            {/* ================================================= */}

            <section
                className="
                    border-t
                    border-black/20
                    bg-[#b773c5] text-white
                "
            >

                <div className="mx-auto max-w-[1600px]">

                    <div
                        className="
                            grid
                            grid-cols-1
                            lg:grid-cols-[1.6fr_0.8fr_0.8fr_1fr]
                        "
                    >

                        {/* ===================================== */}
                        {/* NEWSLETTER */}
                        {/* ===================================== */}

                        <div
                            className="
                                border-b
                                border-black/20
                                p-4
                                md:p-10
                                lg:border-b-0
                                lg:border-r
                                lg:p-12
                                xl:p-14
                            "
                        >

                            <p
                                className="
                                    max-w-lg
                                    text-base
                                    leading-8
                                    text-white
                                    md:text-xl
                                "
                            >
                                For the skin- smart generation.
                            </p>

                            <p
                                className="
                                    mt-5
                                    max-w-xl
                                    text-sm
                                    md:leading-7
                                    text-white
                                    md:text-base
                                "
                            >
                                Glaze your inbox with skincare tips,
                                thoughtful rituals and exclusive content
                                from Solvestic.
                            </p>

                            {/* EMAIL FORM */}
                            <form
                                onSubmit={(e) => e.preventDefault()}
                                className="
                                    mt-7
                                    flex
                                    max-w-[560px]
                                    overflow-hidden
                                    rounded-2xl
                                    bg-white
                                "
                            >

                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    className="
                                        min-w-0
                                        flex-1
                                        bg-transparent
                                        px-5
                                        py-4
                                        text-sm
                                        text-black
                                        outline-none
                                        placeholder:text-[#563477]/50
                                        md:text-base
                                    "
                                />

                                <button
                                    type="submit"
                                    className="
                                        border-l
                                        border-[#2D1557]/15
                                        px-5
                                        text-sm
                                        font-semibold
                                        uppercase
                                        tracking-wide
                                        text-[#2D1557]
                                        transition-colors
                                        duration-300
                                        hover:bg-[#7D45C2]
                                        hover:text-white
                                        md:px-7
                                    "
                                >
                                    Subscribe
                                </button>

                            </form>

                            <p
                                className="
                                    mt-4
                                    text-xs
                                    leading-5
                                    text-white
                                "
                            >
                                By signing up, you agree to our Privacy
                                Policy.
                            </p>

                        </div>

                        {/* ===================================== */}
                        {/* NAVIGATE */}
                        {/* ===================================== */}

                        <div
                            className="
                                border-b
                                border-black/20
                                p-4
                                md:p-10
                                lg:border-b-0
                                lg:border-r
                                lg:p-12
                            "
                        >

                            <h3
                                className="
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    text-white
                                "
                            >
                                Navigate
                            </h3>

                            <nav className="mt-3 md:mt-7 flex flex-col gap-3 md:gap-5">

                                {[
                                    { name: "Home", href: "/" },
                                    { name: "About Us", href: "/about" },
                                    { name: "Our Story", href: "/about#our-story" },
                                    // { name: "Our Philosophy", href: "/our-philosophy" },
                                ].map((item, idx) => (
                                    <a
                                        key={idx}
                                        href={item.href}
                                        className="
                                            group
                                            flex
                                            items-center
                                            gap-2
                                            text-base
                                            text-white/80
                                            transition-colors
                                            duration-300
                                            hover:text-white
                                        "
                                    >
                                        {item.name}

                                        <ArrowUpRight
                                            size={16}
                                            className="
                                                opacity-0
                                                transition-all mt-2
                                                duration-300
                                                group-hover:translate-x-1
                                                group-hover:-translate-y-1
                                                group-hover:opacity-100
                                            "
                                        />
                                    </a>
                                ))}

                            </nav>

                        </div>

                        {/* ===================================== */}
                        {/* SOCIAL */}
                        {/* ===================================== */}

                        <div
                            className="
                                border-b
                                border-black/20
                                p-4
                                md:p-10
                                lg:border-b-0
                                lg:border-r
                                lg:p-12
                            "
                        >

                            <h3
                                className="
                                    text-sm
                                    font-bold
                                    uppercase
                                    tracking-[0.15em]
                                    text-white
                                "
                            >
                                Social
                            </h3>

                            <div className="mt-3 md:mt-7 flex flex-col gap-3 md:gap-5">

                                {socials.map((social) => {
                                    const Icon = social.icon;

                                    return (
                                        <a
                                            key={social.name}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="
                                                group
                                                flex
                                                items-center
                                                gap-3
                                                text-base
                                                text-white/80
                                                transition-colors
                                                duration-300
                                                hover:text-white
                                            "
                                        >

                                            <Icon
                                                size={17}
                                                className="
                                                    transition-transform
                                                    duration-300
                                                    group-hover:scale-110
                                                "
                                            />

                                            <span>
                                                {social.name}
                                            </span>

                                        </a>
                                    );
                                })}

                            </div>

                        </div>

                        {/* ===================================== */}
                        {/* OFFICIAL / SUPPORT */}
                        {/* ===================================== */}
                        <div className="p-4 md:p-10 lg:p-12">

                            <div className="space-y-7">

                                {/* Address & Support */}
                                <div className="space-y-8">

                                    {/* Address */}
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="
                flex h-11 w-11 shrink-0 items-center justify-center
                rounded-full bg-white/10 text-white
                ring-1 ring-white/10
            "
                                        >
                                            <MapPin size={20} strokeWidth={1.8} />
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/90">
                                                Office Address
                                            </p>
                                            <p className="mt-1 text-base font-semibold md:leading-relaxed text-white">
                                                Solvestic Wellness Private Limited
                                            </p>

                                            <p className="mt-2 max-w-md text-sm md:leading-7 text-white">
                                                Office No. 1001, Pearl Best Heights-2,
                                                <br />
                                                Plot-C9, NSP, Pitampura,
                                                <br />
                                                Delhi – 110034
                                            </p>
                                        </div>
                                    </div>

                                    {/* Support */}
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="
            flex h-11 w-11 shrink-0 items-center justify-center
            rounded-full bg-white/10 text-white
            ring-1 ring-white/10
        "
                                        >
                                            <Clock3 size={20} strokeWidth={1.8} />
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/90">
                                                Support
                                            </p>

                                            <p className="mt-1 text-sm leading-7 text-white">
                                                We're here Monday – Saturday
                                                <br />
                                                <span className="text-white/75">
                                                    11:00 AM – 6:15 PM
                                                </span>
                                            </p>

                                            <p className="mt-1 text-sm leading-7 text-white">
                                                Drop us a note anytime.
                                            </p>

                                            {/* ── PHONE ── */}
                                            <a
                                                href="tel:+919220788799"
                                                className="
                mt-3 flex items-center gap-2
                text-sm text-white/90
                transition-colors duration-300
                hover:text-white
            "
                                            >
                                                <Phone size={14} strokeWidth={1.8} className="shrink-0" />
                                                +91 9220788799
                                            </a>

                                            {/* ── EMAIL ── */}
                                            <a
                                                href="mailto:care@solvestic.com"
                                                className="
                mt-2 flex items-center gap-2
                text-sm text-white/90
                transition-colors duration-300
                hover:text-white
            "
                                            >
                                                <Mail size={14} strokeWidth={1.8} className="shrink-0" />
                                                care@solvestic.com
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </section>

            {/* ================================================= */}
            {/* BOTTOM BAR */}
            {/* ================================================= */}

            <div className="border-t border-black/20 bg-[#b773c5]">

                <div
                    className="
                        mx-auto
                        flex
                        max-w-[1600px]
                        flex-col
                        justify-between
                        gap-3
                        px-8
                        py-5
                        text-xs
                        text-[#2D1557]/60
                        md:flex-row
                        md:px-12
                    "
                >

                    <p>
                        © {new Date().getFullYear()} Solvestic. All rights reserved.
                    </p>

                    <p>
                        Thoughtfully made for your skin.
                    </p>

                </div>

            </div>

        </footer>
    );
}