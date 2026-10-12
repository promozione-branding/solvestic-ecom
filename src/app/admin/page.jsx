"use client";

import Link from "next/link";
import Sidebar from "@/components/admin/Sidebar";
import {
    Package,
    ShoppingCart,
    MessageSquareText,
    Newspaper,
    ArrowUpRight,
    Plus,
} from "lucide-react";

const stats = [
    {
        title: "Total Products",
        value: "0",
        description: "Products in your store",
        icon: Package,
        href: "/admin/products",
        color: "bg-purple-100 text-[#7D45C2]",
    },
    {
        title: "Total Orders",
        value: "0",
        description: "Orders received",
        icon: ShoppingCart,
        href: "/admin/order",
        color: "bg-blue-100 text-blue-600",
    },
    {
        title: "Total Inquiries",
        value: "0",
        description: "Customer inquiries",
        icon: MessageSquareText,
        href: "/admin/inquiry",
        color: "bg-amber-100 text-amber-600",
    },
    {
        title: "Published Blogs",
        value: "0",
        description: "Articles published",
        icon: Newspaper,
        href: "/admin/blogs",
        color: "bg-emerald-100 text-emerald-600",
    },
];

const quickLinks = [
    {
        title: "Add Product",
        description: "Add a new product to your store.",
        href: "/admin/products",
        icon: Package,
    },
    {
        title: "Manage Categories",
        description: "Organize your product categories.",
        href: "/admin/categories",
        icon: Plus,
    },
    {
        title: "View Orders",
        description: "Review and manage customer orders.",
        href: "/admin/order",
        icon: ShoppingCart,
    },
    {
        title: "Manage Inquiries",
        description: "Check customer questions and requests.",
        href: "/admin/inquiry",
        icon: MessageSquareText,
    },
];

export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-[#F7F2FC]">
            <Sidebar />

            {/* Main content */}
            <main className="min-h-screen pt-16 lg:ml-[270px] lg:pt-0">
                <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10">
                    {/* Header */}
                    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-medium text-[#7D45C2]">
                                Welcome to Solvestic
                            </p>

                            <h1 className="text-3xl tracking-wide text-[#24202B] sm:text-4xl">
                                Admin Dashboard
                            </h1>

                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                Manage your store, products, orders, and
                                customer inquiries.
                            </p>
                        </div>

                        <Link
                            href="/admin/products"
                            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#7D45C2] px-5 text-sm font-semibold text-white! shadow-lg shadow-[#7D45C2]/15 transition hover:bg-[#6935AA] sm:self-auto"
                        >
                            <Plus size={18} />
                            Add Product
                        </Link>
                    </div>

                    {/* Statistics */}
                    <section>
                        <div className="mb-4">
                            <h2 className="text-xl tracking-wide text-[#24202B]">
                                Store Overview
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;

                                return (
                                    <Link
                                        key={stat.title}
                                        href={stat.href}
                                        className="group rounded-2xl border border-[#e9dff5] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-[#7D45C2]/5 sm:p-6"
                                    >
                                        <div className="mb-5 flex items-center justify-between">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}
                                            >
                                                <Icon size={22} />
                                            </div>

                                            <ArrowUpRight
                                                size={19}
                                                className="text-gray-300 transition group-hover:text-[#7D45C2]"
                                            />
                                        </div>

                                        <p className="text-sm text-gray-500">
                                            {stat.title}
                                        </p>

                                        <p className="mt-2 text-3xl font-semibold text-[#24202B]">
                                            {stat.value}
                                        </p>

                                        <p className="mt-2 text-xs text-gray-400">
                                            {stat.description}
                                        </p>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Quick actions */}
                    <section className="mt-9">
                        <div className="mb-4">
                            <h2 className="text-xl tracking-wide text-[#24202B]">
                                Quick Actions
                            </h2>

                            <p className="mt-1 text-sm text-gray-500">
                                Jump directly to the section you need.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {quickLinks.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="group flex items-center gap-4 rounded-2xl border border-[#e9dff5] bg-white p-5 transition hover:border-[#d5bceF] hover:shadow-lg hover:shadow-[#7D45C2]/5 sm:p-6"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F7F2FC] text-[#7D45C2] transition group-hover:bg-[#7D45C2] group-hover:text-white">
                                            <Icon size={22} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-base font-semibold text-[#24202B]">
                                                {item.title}
                                            </h3>

                                            <p className="mt-1 text-sm leading-5 text-gray-500">
                                                {item.description}
                                            </p>
                                        </div>

                                        <ArrowUpRight
                                            size={19}
                                            className="shrink-0 text-gray-400 transition group-hover:text-[#7D45C2]"
                                        />
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}