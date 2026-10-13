
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    AnimatePresence,
    motion,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import {
    Search,
    Heart,
    UserRound,
    ShoppingBag,
    Menu,
    X,
    ArrowRight,
    Headphones,
} from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";

const categories = [
    { name: "Shop All", href: "/our-products" },
    { name: "Fragrance", href: "/our-products?category=fragrance" },
    { name: "Body Care", href: "/our-products?category=body-care" },
    { name: "Gift Sets", href: "/our-products?category=gift-sets" },
    { name: "Our Story", href: "/about-us" },
];

const BRAND = {
    purple: "#7D45C2",
    lavender: "#F7F2FC",
    dark: "#24202B",
};

// ============================================================
// ANNOUNCEMENT MARQUEE
// ============================================================

const ANNOUNCEMENTS = [
    "COMPLIMENTARY SHIPPING ON ORDERS OVER ₹2,000",
    "DERMATOLOGICALLY TESTED",
    "SULPHATE & PARABEN FREE",
    "CRUELTY-FREE BEAUTY",
    "YOUR BEAUTY, YOUR RITUAL",
];

function AnnouncementMarquee() {
    return (
        <div
            className="solvestic-marquee w-full overflow-hidden whitespace-nowrap"
            aria-label={ANNOUNCEMENTS.join(". ")}
        >
            <div className="solvestic-marquee-track flex w-max">
                {[0, 1].map((group) => (
                    <div
                        key={group}
                        className="flex shrink-0 items-center"
                        aria-hidden={group === 1 ? "true" : undefined}
                    >
                        {ANNOUNCEMENTS.map((item, index) => (
                            <React.Fragment key={`${group}-${index}`}>
                                <span className="px-5 text-[9px] font-medium tracking-[0.16em] sm:px-7 sm:text-[10px]">
                                    {item}
                                </span>

                                <span
                                    className="text-white/60"
                                    aria-hidden="true"
                                >
                                    ✦
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// NAVBAR
// ============================================================

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();

    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const searchInputRef = useRef(null);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        setScrolled(latest > 20);
    });

    // Close open menus when navigating to another page.
    useEffect(() => {
        setSearchOpen(false);
        setMobileMenuOpen(false);
    }, [pathname]);

    // Automatically focus the search field when opened.
    useEffect(() => {
        if (!searchOpen) return;

        const timer = window.setTimeout(() => {
            searchInputRef.current?.focus();
        }, 150);

        return () => window.clearTimeout(timer);
    }, [searchOpen]);

    // Keyboard shortcuts.
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setSearchOpen(false);
                setMobileMenuOpen(false);
            }

            const activeTag = document.activeElement?.tagName;

            const isTyping =
                ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag) ||
                document.activeElement?.isContentEditable;

            if (event.key === "/" && !isTyping) {
                event.preventDefault();
                setSearchOpen(true);
                setMobileMenuOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Hide the public navbar on admin routes.
    if (pathname.startsWith("/admin")) return null;

    // Product search.
    const handleSearch = (event) => {
        event.preventDefault();

        const query = searchQuery.trim();

        if (!query) {
            searchInputRef.current?.focus();
            return;
        }

        setSearchOpen(false);
        setMobileMenuOpen(false);

        router.push(`/search?q=${encodeURIComponent(query)}`);
    };

    const closeMenus = () => {
        setMobileMenuOpen(false);
        setSearchOpen(false);
    };

    return (
        <motion.header
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                duration: 0.55,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={`sticky top-0 z-50 bg-white text-[#24202B] transition-shadow duration-300 ${
                scrolled
                    ? "shadow-[0_8px_30px_rgba(36,32,43,0.09)]"
                    : ""
            }`}
        >
            <style>{`
                .solvestic-marquee-track {
                    animation: solvesticMarquee 32s linear infinite;
                    will-change: transform;
                }

                .solvestic-marquee:hover .solvestic-marquee-track {
                    animation-play-state: paused;
                }

                @keyframes solvesticMarquee {
                    from {
                        transform: translateX(0);
                    }

                    to {
                        transform: translateX(-50%);
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .solvestic-marquee-track {
                        animation: none;
                        will-change: auto;
                    }
                }
            `}</style>

            {/* ================================================== */}
            {/* TOP BAR WITH MOVING ANNOUNCEMENTS */}
            {/* ================================================== */}

            <div className="hidden border-b border-white/15 bg-[#7D45C2] text-white sm:block">
                <div className="mx-auto flex h-10 max-w-[1600px] items-center justify-between gap-5 px-6 lg:px-10">

                    {/* LEFT: SOCIAL ICONS */}

                    <div className="flex shrink-0 items-center gap-4">
                        <span className="mr-1 text-[9px] font-medium tracking-[0.2em] text-white/75">
                            FOLLOW OUR JOURNEY
                        </span>

                        <motion.a
                            whileHover={{ y: -2, scale: 1.08 }}
                            href="https://www.instagram.com/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Instagram"
                            className="transition-colors hover:text-[#F7F2FC]"
                        >
                            <FaInstagram size={14} />
                        </motion.a>

                        <motion.a
                            whileHover={{ y: -2, scale: 1.08 }}
                            href="https://www.facebook.com/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Facebook"
                            className="transition-colors hover:text-[#F7F2FC]"
                        >
                            <FaFacebook size={14} />
                        </motion.a>
                    </div>

                    {/* CENTER: SCROLLING ANNOUNCEMENTS */}

                    <div className="min-w-0 flex-1 overflow-hidden">
                        <AnnouncementMarquee />
                    </div>

                    {/* RIGHT: HELP AND SUPPORT */}

                    <Link
                        href="/contact"
                        className="flex shrink-0 items-center gap-2 text-[9px] font-medium tracking-[0.14em] text-white/85 transition-colors hover:text-[#F7F2FC]"
                    >
                        <Headphones size={13} />
                        HELP & SUPPORT
                    </Link>
                </div>
            </div>

            {/* ================================================== */}
            {/* MAIN NAVBAR */}
            {/* ================================================== */}

            <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
                <div className="relative flex h-[76px] items-center justify-between gap-3 overflow-hidden md:h-[92px]">

                    {/* MOBILE MENU BUTTON */}

                    <button
                        type="button"
                        onClick={() => {
                            setMobileMenuOpen((open) => !open);
                            setSearchOpen(false);
                        }}
                        aria-label={
                            mobileMenuOpen ? "Close menu" : "Open menu"
                        }
                        aria-expanded={mobileMenuOpen}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-[#F7F2FC] hover:text-[#7D45C2] md:hidden"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={mobileMenuOpen ? "close" : "menu"}
                                initial={{ opacity: 0, rotate: -45 }}
                                animate={{ opacity: 1, rotate: 0 }}
                                exit={{ opacity: 0, rotate: 45 }}
                                transition={{ duration: 0.15 }}
                                className="flex"
                            >
                                {mobileMenuOpen ? (
                                    <X size={22} />
                                ) : (
                                    <Menu size={22} />
                                )}
                            </motion.span>
                        </AnimatePresence>
                    </button>

                    {/* LOGO */}

                    <Link
                        href="/"
                        aria-label="Solvestic home"
                        onClick={closeMenus}
                        className="flex shrink-0 items-center"
                    >
                        <Image
                            src="/logo/logo.gif"
                            alt="Solvestic"
                            width={180}
                            height={64}
                            priority
                            className="h-auto w-[112px] object-contain sm:w-[145px] md:w-[165px]"
                        />
                    </Link>

                    {/* DESKTOP NAVIGATION */}

                    <nav
                        aria-label="Main navigation"
                        className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 lg:flex xl:gap-10"
                    >
                        {categories.map((category) => {
                            const isActive =
                                category.href === "/our-products"
                                    ? pathname === "/our-products"
                                    : category.href === "/about-us"
                                      ? pathname === "/about-us"
                                      : false;

                            return (
                                <Link
                                    key={category.name}
                                    href={category.href}
                                    className={`group relative whitespace-nowrap py-3 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors xl:text-[11px] ${
                                        isActive
                                            ? "text-[#7D45C2]"
                                            : "text-[#24202B] hover:text-[#7D45C2]"
                                    }`}
                                >
                                    {category.name}

                                    <motion.span
                                        className="absolute bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-[#7D45C2]"
                                        initial={false}
                                        animate={{
                                            scaleX: isActive ? 1 : 0,
                                        }}
                                        whileHover={{ scaleX: 1 }}
                                        transition={{ duration: 0.25 }}
                                    />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* ACTION ICONS */}

                    <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1.5 md:gap-2">

                        {/* SEARCH */}

                        <motion.button
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={() => {
                                setSearchOpen((open) => !open);
                                setMobileMenuOpen(false);
                            }}
                            aria-label="Search products"
                            aria-expanded={searchOpen}
                            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors sm:h-11 sm:w-11 ${
                                searchOpen
                                    ? "bg-[#F7F2FC] text-[#7D45C2]"
                                    : "hover:bg-[#F7F2FC] hover:text-[#7D45C2]"
                            }`}
                        >
                            <Search size={20} strokeWidth={1.7} />
                        </motion.button>

                        {/* WISHLIST */}

                        <Link
                            href="/wishlist"
                            aria-label="Wishlist"
                            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F7F2FC] hover:text-[#7D45C2] sm:h-11 sm:w-11"
                        >
                            <Heart size={20} strokeWidth={1.7} />
                        </Link>

                        {/* ACCOUNT */}

                        <Link
                            href="/account"
                            aria-label="My account"
                            className="hidden h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F7F2FC] hover:text-[#7D45C2] sm:flex sm:h-11 sm:w-11"
                        >
                            <UserRound size={20} strokeWidth={1.7} />
                        </Link>

                        {/* CART */}

                        <Link
                            href="/cart"
                            aria-label="Shopping cart"
                            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F7F2FC] hover:text-[#7D45C2] sm:h-11 sm:w-11"
                        >
                            <ShoppingBag size={20} strokeWidth={1.7} />

                            <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#7D45C2] px-1 text-[9px] font-bold text-white ring-2 ring-white">
                                0
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* ================================================== */}
            {/* MOBILE NAVIGATION */}
            {/* ================================================== */}

            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close navigation menu"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 top-[116px] z-40 cursor-default bg-[#24202B]/35 md:hidden"
                        />

                        <motion.nav
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            aria-label="Mobile navigation"
                            className="absolute left-0 right-0 top-full z-50 overflow-hidden border-t border-[#F0EAF7] bg-white shadow-xl md:hidden"
                        >
                            <div className="px-5 pb-5 pt-2">
                                {categories.map((category, index) => (
                                    <motion.div
                                        key={category.name}
                                        initial={{ x: -12, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{
                                            delay: index * 0.045,
                                        }}
                                    >
                                        <Link
                                            href={category.href}
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="group flex items-center justify-between border-b border-[#F0EAF7] py-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#24202B] transition-colors hover:text-[#7D45C2]"
                                        >
                                            {category.name}

                                            <ArrowRight
                                                size={16}
                                                className="text-[#7D45C2] transition-transform group-hover:translate-x-1"
                                            />
                                        </Link>
                                    </motion.div>
                                ))}

                                <div className="mt-5 flex items-center justify-between gap-3">
                                    <Link
                                        href="/account"
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                        className="flex items-center gap-2 text-sm text-[#24202B]/75 transition-colors hover:text-[#7D45C2]"
                                    >
                                        <UserRound size={17} />
                                        My Account
                                    </Link>

                                    <Link
                                        href="/contact"
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                        className="flex items-center gap-2 text-sm text-[#24202B]/75 transition-colors hover:text-[#7D45C2]"
                                    >
                                        <Headphones size={17} />
                                        Contact Us
                                    </Link>
                                </div>

                                <div className="mt-5 rounded-xl bg-[#F7F2FC] px-4 py-3">
                                    <p className="text-[10px] font-semibold tracking-[0.15em] text-[#7D45C2]">
                                        A LITTLE SOMETHING SPECIAL
                                    </p>

                                    <p className="mt-1 text-xs text-[#24202B]/75">
                                        Complimentary shipping on orders over
                                        ₹2,000.
                                    </p>
                                </div>
                            </div>
                        </motion.nav>
                    </>
                )}
            </AnimatePresence>

            {/* ================================================== */}
            {/* SEARCH POPUP */}
            {/* ================================================== */}

            <AnimatePresence>
                {searchOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close search"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSearchOpen(false)}
                            className="fixed inset-0 z-40 cursor-default bg-[#24202B]/35 backdrop-blur-[2px]"
                        />

                        <motion.div
                            initial={{
                                opacity: 0,
                                y: -18,
                                scale: 0.99,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                y: -12,
                                scale: 0.99,
                            }}
                            transition={{
                                duration: 0.3,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                            className="absolute left-0 right-0 top-full z-50 border-t border-[#F0EAF7] bg-white shadow-[0_24px_60px_rgba(36,32,43,0.12)]"
                        >
                            <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8 sm:py-12">
                                <div className="mb-5 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-[0.22em] text-[#7D45C2]">
                                            FIND YOUR FAVOURITE
                                        </p>

                                        <h2 className="mt-2 text-xl font-medium tracking-tight text-[#24202B] sm:text-2xl">
                                            What are you looking for?
                                        </h2>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearchOpen(false)
                                        }
                                        aria-label="Close search"
                                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E8DDF4] transition-colors hover:border-[#7D45C2] hover:bg-[#F7F2FC] hover:text-[#7D45C2]"
                                    >
                                        <X size={19} />
                                    </button>
                                </div>

                                <form
                                    onSubmit={handleSearch}
                                    className="group flex items-center gap-2 border-b-2 border-[#E8DDF4] py-3 transition-colors focus-within:border-[#7D45C2] sm:gap-3"
                                >
                                    <Search
                                        size={22}
                                        className="shrink-0 text-[#24202B]/40 transition-colors group-focus-within:text-[#7D45C2]"
                                    />

                                    <input
                                        ref={searchInputRef}
                                        type="search"
                                        value={searchQuery}
                                        onChange={(event) =>
                                            setSearchQuery(event.target.value)
                                        }
                                        placeholder="Search products, collections..."
                                        aria-label="Search products"
                                        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-[#24202B] outline-none placeholder:text-[#24202B]/40 sm:text-lg"
                                    />

                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery("");
                                                searchInputRef.current?.focus();
                                            }}
                                            aria-label="Clear search"
                                            className="rounded-full p-2 text-[#24202B]/45 transition-colors hover:bg-[#F7F2FC] hover:text-[#7D45C2]"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}

                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.96 }}
                                        className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#7D45C2] px-3 text-[10px] font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#6937A8] sm:h-11 sm:gap-2 sm:px-6 sm:text-xs"
                                    >
                                        Search
                                        <ArrowRight size={15} />
                                    </motion.button>
                                </form>

                                <p className="mt-4 text-xs text-[#24202B]/45">
                                    Press Esc to close search.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
