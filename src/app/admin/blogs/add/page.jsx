"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { ArrowLeft, ImagePlus, LoaderCircle, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import "jodit/es2021/jodit.min.css";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function AddBlogPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    const [form, setForm] = useState({
        title: "",
        date: new Date().toISOString().slice(0, 10),
        permalink: "",
        content: "",
        metaTitle: "",
        metaDescription: "",
    });

    const change = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "title"
                ? {
                    permalink: value.toLowerCase().trim()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/^-|-$/g, ""),
                }
                : {}),
        }));
    };

    const chooseImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be under 5 MB");
            return;
        }

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = async (e) => {
        e.preventDefault();

        if (!form.title.trim() || !form.date || !form.permalink.trim() || !form.content.trim()) {
            toast.error("Please complete all required fields");
            return;
        }

        try {
            setLoading(true);
            const payload = new FormData();

            Object.entries(form).forEach(([key, value]) => {
                payload.append(key, value);
            });

            if (image) payload.append("image", image);

            await axios.post("/api/admin/blogs", payload);
            toast.success("Blog created successfully");
            router.push("/admin/blogs");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create blog");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="px-4 py-7 sm:px-6 lg:ml-72 lg:px-10">
                <div className="mx-auto max-w-5xl">
                    <button
                        type="button"
                        onClick={() => router.push("/admin/blogs")}
                        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#7D45C2]"
                    >
                        <ArrowLeft size={18} /> Back to Blogs
                    </button>

                    <h1 className="text-3xl font-bold">Add Blog</h1>
                    <p className="mt-2 text-sm text-gray-500">Create an article for your website.</p>

                    <form onSubmit={submit} className="mt-7 space-y-6">
                        <section className="space-y-5 rounded-2xl border border-[#E8DDF5] bg-white p-5 sm:p-7">
                            <h2 className="text-lg font-bold">Blog Information</h2>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">Title *</label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={change}
                                    required
                                    placeholder="Enter blog title"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#7D45C2]"
                                />
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold">Date *</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
                                        onChange={change}
                                        required
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#7D45C2]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-semibold">Permalink *</label>
                                    <input
                                        name="permalink"
                                        value={form.permalink}
                                        onChange={change}
                                        required
                                        placeholder="blog-permalink"
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#7D45C2]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">Content *</label>
                                <JoditEditor
                                    value={form.content}
                                    config={{
                                        readonly: false,
                                        height: 450,
                                        placeholder: "Write your blog content...",
                                        toolbarAdaptive: false,
                                        buttons: [
                                            "bold", "italic", "underline", "|",
                                            "ul", "ol", "|",
                                            "font", "fontsize", "brush", "paragraph", "|",
                                            "image", "link", "table", "|",
                                            "align", "undo", "redo", "|",
                                            "hr", "eraser", "source",
                                        ],
                                    }}
                                    onBlur={(content) =>
                                        setForm((prev) => ({ ...prev, content }))
                                    }
                                />
                            </div>
                        </section>

                        <section className="rounded-2xl border border-[#E8DDF5] bg-white p-5 sm:p-7">
                            <h2 className="text-lg font-bold">Featured Image</h2>
                            <p className="mt-1 text-sm text-gray-500">Optional · PNG, JPG or WEBP · Maximum 5 MB</p>

                            <label className="mt-4 flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#DCC9F0] bg-[#FBF9FE] p-4 hover:border-[#7D45C2]">
                                {preview ? (
                                    <img src={preview} alt="Blog preview" className="max-h-64 max-w-full object-contain" />
                                ) : (
                                    <>
                                        <ImagePlus size={32} className="text-[#7D45C2]" />
                                        <span className="mt-3 text-sm font-semibold">Click to upload image</span>
                                    </>
                                )}
                                <input type="file" accept="image/*" onChange={chooseImage} className="hidden" />
                            </label>
                        </section>

                        <section className="space-y-5 rounded-2xl border border-[#E8DDF5] bg-white p-5 sm:p-7">
                            <h2 className="text-lg font-bold">SEO Settings</h2>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">Meta Title</label>
                                <input
                                    name="metaTitle"
                                    value={form.metaTitle}
                                    onChange={change}
                                    maxLength={70}
                                    placeholder="SEO title"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#7D45C2]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold">Meta Description</label>
                                <textarea
                                    name="metaDescription"
                                    value={form.metaDescription}
                                    onChange={change}
                                    maxLength={160}
                                    rows={3}
                                    placeholder="Short search engine description"
                                    className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#7D45C2]"
                                />
                            </div>
                        </section>

                        <div className="flex justify-end gap-3 pb-8">
                            <button
                                type="button"
                                onClick={() => router.push("/admin/blogs")}
                                className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6935AD] disabled:opacity-60"
                            >
                                {loading
                                    ? <LoaderCircle size={18} className="animate-spin" />
                                    : <Save size={18} />}
                                {loading ? "Saving..." : "Create Blog"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}