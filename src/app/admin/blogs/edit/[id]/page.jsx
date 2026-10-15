"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { ArrowLeft, ImagePlus, LoaderCircle, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import "jodit/es2021/jodit.min.css";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

export default function EditBlogPage() {
    const { id } = useParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");

    const [form, setForm] = useState({
        title: "",
        date: "",
        permalink: "",
        content: "",
        metaTitle: "",
        metaDescription: "",
    });

    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        const fetchBlog = async () => {
            try {
                const { data } = await axios.get(`/api/admin/blogs/${id}`);
                const blog = data.blog || data;

                if (cancelled) return;

                setForm({
                    title: blog.title || "",
                    date: blog.date ? new Date(blog.date).toISOString().slice(0, 10) : "",
                    permalink: blog.permalink || "",
                    content: blog.content || "",
                    metaTitle: blog.metaTitle || "",
                    metaDescription: blog.metaDescription || "",
                });

                setPreview(blog.image || "");
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to load blog");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchBlog();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const change = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const chooseImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image");
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
            setSaving(true);

            const payload = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                payload.append(key, value);
            });

            if (image) payload.append("image", image);

            await axios.put(`/api/admin/blogs/${id}`, payload);

            toast.success("Blog updated successfully");
            router.push("/admin/blogs");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update blog");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F2FC]">
                <Sidebar />
                <main className="flex min-h-screen items-center justify-center lg:ml-72">
                    <LoaderCircle className="animate-spin text-[#7D45C2]" size={32} />
                </main>
            </div>
        );
    }

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

                    <h1 className="text-3xl font-bold">Edit Blog</h1>
                    <p className="mt-2 text-sm text-gray-500">Update your article and SEO details.</p>

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
                            <p className="mt-1 text-sm text-gray-500">
                                Choose a new image to replace the current one. Leave unchanged to keep the existing image.
                            </p>

                            <label className="mt-4 flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#DCC9F0] bg-[#FBF9FE] p-4 hover:border-[#7D45C2]">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Blog preview"
                                        className="max-h-64 max-w-full object-contain"
                                    />
                                ) : (
                                    <>
                                        <ImagePlus size={32} className="text-[#7D45C2]" />
                                        <span className="mt-3 text-sm font-semibold">Upload blog image</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={chooseImage}
                                    className="hidden"
                                />
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
                                disabled={saving}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6935AD] disabled:opacity-60"
                            >
                                {saving
                                    ? <LoaderCircle size={18} className="animate-spin" />
                                    : <Save size={18} />}
                                {saving ? "Updating..." : "Update Blog"}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}