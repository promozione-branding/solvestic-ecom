
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import {
    UserRound,
    Package,
    MapPin,
    Heart,
    Settings,
    LogOut,
    ChevronRight,
    ShoppingBag,
    Mail,
    Phone,
    CalendarDays,
    ShieldCheck,
    Loader2,
    ArrowRight,
    CircleUserRound,
} from "lucide-react";
import Link from "next/link";
import { clearUser, setUser, setAuthLoading } from "@/redux/authSlice";

const PURPLE = "#7D45C2";

const menuItems = [
    { label: "My Profile", icon: UserRound, id: "profile" },
    { label: "My Orders", icon: Package, id: "orders" },
    { label: "Saved Addresses", icon: MapPin, id: "addresses" },
    { label: "Wishlist", icon: Heart, id: "wishlist" },
    { label: "Account Settings", icon: Settings, id: "settings" },
];

export default function Account() {
    const router = useRouter();
    const dispatch = useDispatch();

    const { user, isAuthenticated, isLoading } = useSelector(
        (state) => state.auth
    );

    const [activeTab, setActiveTab] = useState("profile");
    const [loggingOut, setLoggingOut] = useState(false);

    // Restore the logged-in user after a page refresh.
    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            if (isAuthenticated && user) return;

            dispatch(setAuthLoading(true));

            try {
                const { data } = await axios.get("/api/user/me", {
                    withCredentials: true,
                });

                if (!cancelled && data.success && data.user) {
                    dispatch(setUser(data.user));
                } else if (!cancelled) {
                    dispatch(clearUser());
                    router.replace("/account/login");
                }
            } catch {
                if (!cancelled) {
                    dispatch(clearUser());
                    router.replace("/account/login");
                }
            }
        };

        loadUser();

        return () => {
            cancelled = true;
        };
    }, [dispatch, isAuthenticated, user, router]);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await axios.post(
                "/api/user/logout",
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            dispatch(clearUser());
            router.replace("/account/login");
            router.refresh();
        }
    };

    if (isLoading || (!isAuthenticated && !user)) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#F7F2FC]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2
                        className="h-9 w-9 animate-spin"
                        style={{ color: PURPLE }}
                    />
                    <p className="text-sm text-gray-500">
                        Loading your account...
                    </p>
                </div>
            </div>
        );
    }

    const displayName = user?.name || "Customer";
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
        })
        : "Valued member";

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-7xl">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="transition hover:text-[#7D45C2]">
                        Home
                    </Link>
                    <ChevronRight size={15} />
                    <span className="font-medium text-gray-900">My Account</span>
                </div>

                {/* Welcome section */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative mb-8 overflow-hidden rounded-3xl bg-[#7D45C2] p-6 text-white sm:p-9"
                >
                    <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
                    <div className="pointer-events-none absolute -bottom-28 right-40 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-medium text-white/75">
                                YOUR SOLVESTIC ACCOUNT
                            </p>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Hello, {displayName.split(" ")[0]}!
                            </h1>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                                Welcome to your personal space. Manage your
                                profile, track your orders, and keep everything
                                you need in one place.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-bold text-[#7D45C2]">
                                {initials || "S"}
                            </div>
                            <div>
                                <p className="font-semibold">{displayName}</p>
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-white/75">
                                    <ShieldCheck size={14} />
                                    Registered customer
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Main dashboard */}
                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    {/* Sidebar */}
                    <aside className="overflow-hidden rounded-3xl border border-[#E9DDF5] bg-white p-3 shadow-sm">
                        <div className="border-b border-gray-100 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                                Dashboard
                            </p>
                        </div>

                        <nav className="space-y-1 py-3">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveTab(item.id)}
                                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${active
                                                ? "bg-[#F1E8FA] text-[#7D45C2]"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-[#7D45C2]"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon size={19} />
                                            {item.label}
                                        </span>
                                        <ChevronRight size={16} />
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="border-t border-gray-100 p-2 pt-4">
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                            >
                                {loggingOut ? (
                                    <Loader2 size={19} className="animate-spin" />
                                ) : (
                                    <LogOut size={19} />
                                )}
                                {loggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </div>
                    </aside>

                    {/* Content */}
                    <section className="min-w-0">
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-8"
                            >
                                <div className="mb-8 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                            Personal Information
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Your registered account details.
                                        </p>
                                    </div>
                                    <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2] sm:flex">
                                        <CircleUserRound size={25} />
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <InfoCard
                                        icon={UserRound}
                                        label="Full Name"
                                        value={user?.name}
                                    />
                                    <InfoCard
                                        icon={Mail}
                                        label="Email Address"
                                        value={user?.email}
                                    />
                                    <InfoCard
                                        icon={Phone}
                                        label="Mobile Number"
                                        value={user?.mobile}
                                    />
                                    <InfoCard
                                        icon={CalendarDays}
                                        label="Member Since"
                                        value={memberSince}
                                    />
                                </div>

                                <div className="mt-8 rounded-2xl bg-[#F7F2FC] p-5">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck
                                            className="mt-0.5 shrink-0 text-[#7D45C2]"
                                            size={21}
                                        />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                Account security
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                Keep your contact details up to
                                                date so you can receive important
                                                order and account notifications.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setActiveTab("settings")}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA]"
                                >
                                    Account Settings
                                    <ArrowRight size={17} />
                                </button>
                            </motion.div>
                        )}

                        {activeTab === "orders" && (
                            <EmptyState
                                icon={Package}
                                title="Your orders will appear here"
                                description="Once you place an order, you can track its status and view your order history here."
                                buttonText="Explore Products"
                                href="/our-products"
                            />
                        )}

                        {activeTab === "addresses" && (
                            <EmptyState
                                icon={MapPin}
                                title="No saved addresses yet"
                                description="Your saved delivery addresses will appear here when address management is connected."
                                buttonText="Continue Shopping"
                                href="/our-products"
                            />
                        )}

                        {activeTab === "wishlist" && (
                            <EmptyState
                                icon={Heart}
                                title="Your wishlist"
                                description="Keep your favourite products together and find them easily when you're ready to shop."
                                buttonText="Explore Products"
                                href="/our-products"
                            />
                        )}

                        {activeTab === "settings" && (
                            <div className="rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-8">
                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                    Account Settings
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Manage your account security and session.
                                </p>

                                <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Sign out of your account
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            You can sign in again whenever you
                                            want.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                                    >
                                        <LogOut size={17} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Shopping banner */}
                <div className="mt-8 flex flex-col justify-between gap-5 rounded-3xl border border-[#E9DDF5] bg-white p-6 sm:flex-row sm:items-center sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2]">
                            <ShoppingBag size={23} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">
                                Looking for something special?
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Explore our collection and find your next favourite.
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/our-products"
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA]"
                    >
                        Shop Now
                        <ArrowRight size={17} />
                    </Link>
                </div>
            </div>
        </main>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-[#DCC8F0]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1E8FA] text-[#7D45C2]">
                <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                    {label}
                </p>
                <p className="mt-2 break-words text-sm font-semibold text-gray-900">
                    {value || "Not provided"}
                </p>
            </div>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description, buttonText, href }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#E9DDF5] bg-white px-6 py-12 text-center shadow-sm"
        >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2]">
                <Icon size={30} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">
                {description}
            </p>
            <Link
                href={href}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA]"
            >
                {buttonText}
                <ArrowRight size={17} />
            </Link>
        </motion.div>
    );
}
