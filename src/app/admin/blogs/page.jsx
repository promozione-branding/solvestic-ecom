"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import {
    Plus, Search, Pencil, Trash2, LoaderCircle, FileText,
    CalendarDays, RefreshCw, Eye
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function BlogsPage() {
    const router = useRouter();
    const [blogs, setBlogs] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState("");

    const fetchBlogs = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await axios.get("/api/admin/blogs");
            setBlogs(Array.isArray(data) ? data : data.blogs || data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load blogs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    const deleteBlog = async (id) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;

        try {
            setDeleting(id);
            await axios.delete(`/api/admin/blogs/${id}`);
            setBlogs((prev) => prev.filter((blog) => blog._id !== id));
            toast.success("Blog deleted successfully");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to delete blog");
        } finally {
            setDeleting("");
        }
    };

    const filteredBlogs = blogs.filter((blog) =>
        `${blog.title || ""} ${blog.permalink || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="px-4 py-7 sm:px-6 lg:ml-72 lg:px-10">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#7D45C2]">
                                Content Management
                            </p>
                            <h1 className="text-3xl font-bold">Blogs</h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Manage your articles and SEO content.
                            </p>
                        </div>

                        <button
                            onClick={() => router.push("/admin/blogs/add")}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6935AD]"
                        >
                            <Plus size={18} />
                            Add Blog
                        </button>
                    </div>

                    <div className="mb-6 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#E8DDF5] bg-white p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Total Blogs</p>
                                    <p className="mt-2 text-3xl font-bold">{blogs.length}</p>
                                </div>
                                <div className="rounded-xl bg-[#F0E6FC] p-3 text-[#7D45C2]">
                                    <FileText size={23} />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-[#E8DDF5] bg-white p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500">Search Results</p>
                                    <p className="mt-2 text-3xl font-bold">{filteredBlogs.length}</p>
                                </div>
                                <div className="rounded-xl bg-[#F0E6FC] p-3 text-[#7D45C2]">
                                    <Search size={23} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-[#E8DDF5] bg-white shadow-sm">
                        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <h2 className="font-bold">All Articles</h2>

                            <div className="flex gap-2">
                                <div className="relative flex-1 sm:w-72">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search blogs..."
                                        className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#7D45C2]"
                                    />
                                </div>
                                <button
                                    onClick={fetchBlogs}
                                    title="Refresh blogs"
                                    className="rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-60 items-center justify-center">
                                <LoaderCircle className="animate-spin text-[#7D45C2]" size={30} />
                            </div>
                        ) : filteredBlogs.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                                <FileText size={35} className="text-[#B99BDD]" />
                                <h3 className="mt-4 font-bold">No blogs found</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add a blog or try another search.
                                </p>
                                <button
                                    onClick={() => router.push("/admin/blogs/add")}
                                    className="mt-4 text-sm font-semibold text-[#7D45C2]"
                                >
                                    + Create your first blog
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-[#FBF9FE] text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-5 py-4">Blog</th>
                                                <th className="px-5 py-4">Permalink</th>
                                                <th className="px-5 py-4">Date</th>
                                                <th className="px-5 py-4 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredBlogs.map((blog) => (
                                                <tr key={blog._id} className="transition hover:bg-[#FCFAFF]">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F0E6FC]">
                                                                {blog.image ? (
                                                                    <img
                                                                        src={blog.image}
                                                                        alt={blog.title}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="flex h-full items-center justify-center text-[#7D45C2]">
                                                                        <FileText size={22} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <p className="max-w-xs font-semibold">{blog.title}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-gray-500">
                                                        <span className="block max-w-48 truncate">
                                                            /blogs/{blog.permalink}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-5 py-4 text-gray-500">
                                                        {blog.date
                                                            ? new Date(blog.date).toLocaleDateString("en-IN")
                                                            : "—"}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => router.push(`/admin/blogs/edit/${blog._id}`)}
                                                                title="Edit blog"
                                                                className="rounded-lg border border-[#E8DDF5] p-2 text-[#7D45C2] hover:bg-[#F5EDFD]"
                                                            >
                                                                <Pencil size={17} />
                                                            </button>
                                                            <button
                                                                onClick={() => deleteBlog(blog._id)}
                                                                disabled={deleting === blog._id}
                                                                title="Delete blog"
                                                                className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50 disabled:opacity-50"
                                                            >
                                                                {deleting === blog._id
                                                                    ? <LoaderCircle size={17} className="animate-spin" />
                                                                    : <Trash2 size={17} />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="space-y-3 p-4 md:hidden">
                                    {filteredBlogs.map((blog) => (
                                        <div key={blog._id} className="rounded-xl border border-gray-100 p-3">
                                            <div className="flex gap-3">
                                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#F0E6FC]">
                                                    {blog.image ? (
                                                        <img src={blog.image} alt={blog.title} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="flex h-full items-center justify-center text-[#7D45C2]">
                                                            <FileText size={22} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="break-words font-semibold">{blog.title}</p>
                                                    <p className="mt-1 truncate text-xs text-gray-500">/blogs/{blog.permalink}</p>
                                                    <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                                                        <CalendarDays size={13} />
                                                        {blog.date ? new Date(blog.date).toLocaleDateString("en-IN") : "—"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 pt-3">
                                                <button
                                                    onClick={() => router.push(`/admin/blogs/edit/${blog._id}`)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-[#F0E6FC] px-3 py-2 text-xs font-semibold text-[#7D45C2]"
                                                >
                                                    <Pencil size={14} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteBlog(blog._id)}
                                                    disabled={deleting === blog._id}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-500"
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}