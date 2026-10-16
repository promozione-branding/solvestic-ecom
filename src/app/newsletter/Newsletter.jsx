"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { ArrowUpRight, CalendarDays, LoaderCircle } from "lucide-react";

export default function Newsletter() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const { data } = await axios.get("/api/user/blogs");
                setBlogs(data.blogs || []);
            } catch (error) {
                console.error("Failed to fetch blogs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    console.log(blogs)

    return (
        <section className="bg-[#F7F2FC] px-4 py-12 sm:px-6 lg:px-10 lg:py-15">
            <div className="mx-auto max-w-7xl">
                {/* Heading */}
                <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-[#7D45C2]">
                            The Solvestic Journal
                        </p>

                        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-[#24202B] sm:text-4xl lg:text-5xl">
                            Ideas, insights &{" "}
                            <span className="text-[#7D45C2]">inspiration.</span>
                        </h2>

                        {/* <p className="mt-4 max-w-xl text-sm leading-7 text-gray-600 sm:text-base">
                            Explore our latest articles, helpful guides, and
                            insights curated just for you.
                        </p> */}
                    </div>

                    {/* <Link
                        href="/blogs"
                        className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#7D45C2] transition hover:gap-3"
                    >
                        View all articles
                        <ArrowUpRight size={18} />
                    </Link> */}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex min-h-52 items-center justify-center">
                        <LoaderCircle
                            size={32}
                            className="animate-spin text-[#7D45C2]"
                        />
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="rounded-2xl border border-[#E8DDF5] bg-white px-5 py-16 text-center">
                        <h3 className="text-lg font-semibold text-[#24202B]">
                            Articles coming soon
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            We are working on something interesting. Check back soon!
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {blogs.map((blog) => (
                            <Link
                                key={blog._id}
                                href={`/newsletter/${blog.permalink}`}
                                className="group overflow-hidden rounded-2xl border border-[#E8DDF5] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7D45C2]/10"
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-[#F0E6FC]">
                                    {blog.image ? (
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            className="object-contain transition duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <span className="text-sm font-medium text-[#7D45C2]">
                                                Solvestic Journal
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
                                </div>

                                {/* Content */}
                                <div className="p-5">
                                    <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
                                        <CalendarDays
                                            size={14}
                                            className="text-[#7D45C2]"
                                        />
                                        <span>
                                            {blog.date
                                                ? new Date(blog.date).toLocaleDateString(
                                                    "en-IN",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                        year: "numeric",
                                                    }
                                                )
                                                : "Latest article"}
                                        </span>
                                    </div>

                                    <h3 className="line-clamp-2 text-xl font-semibold leading-snug text-[#24202B] transition group-hover:text-[#7D45C2]">
                                        {blog.title}
                                    </h3>

                                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#7D45C2]">
                                        Read article
                                        <ArrowUpRight
                                            size={17}
                                            className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}