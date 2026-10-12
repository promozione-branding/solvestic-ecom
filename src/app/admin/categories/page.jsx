"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    X,
    ImagePlus,
    LoaderCircle,
    FolderOpen,
    RefreshCw,
} from "lucide-react";

const initialForm = {
    name: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    description: "",
    image: null,
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState("");
    const [form, setForm] = useState(initialForm);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const generateSlug = (value) =>
        value
            .toLowerCase()
            .trim()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await axios.get("/api/admin/categories");
            setCategories(data.categories || []);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load categories."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (!image) return;

        const objectUrl = URL.createObjectURL(image);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [image]);

    const openCreate = () => {
        setEditingId("");
        setForm(initialForm);
        setImage(null);
        setPreview("");
        setError("");
        setNotice("");
        setModalOpen(true);
    };

    const openEdit = (category) => {
        setEditingId(category._id);
        setForm({
            name: category.name || "",
            slug: category.slug || generateSlug(category.name || ""),
            metaTitle: category.metaTitle || "",
            metaDescription: category.metaDescription || "",
            description: category.description || "",
            image: null,
        });
        setImage(null);
        setPreview(category.imageUrl || "");
        setError("");
        setNotice("");
        setModalOpen(true);
    };

    const closeModal = () => {
        if (saving) return;

        setModalOpen(false);
        setEditingId("");
        setForm(initialForm);
        setImage(null);
        setPreview("");
        setError("");
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif",
        ];

        if (!allowedTypes.includes(file.type)) {
            setError("Choose a JPG, PNG, WEBP, or AVIF image.");
            e.target.value = "";
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be 5 MB or less.");
            e.target.value = "";
            return;
        }

        setError("");
        setImage(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setNotice("");

        if (!editingId && !image) {
            setError("Please select a category image.");
            return;
        }

        const formData = new FormData();

        formData.append("name", form.name.trim());
        formData.append("metaTitle", form.metaTitle.trim());
        formData.append(
            "metaDescription",
            form.metaDescription.trim()
        );
        formData.append("description", form.description.trim());
        formData.append("slug", form.slug);
        if (image) {
            formData.append("image", image);
        }

        setSaving(true);

        try {
            const response = editingId
                ? await axios.put(
                    `/api/admin/categories/${editingId}`,
                    formData
                )
                : await axios.post(
                    "/api/admin/categories",
                    formData
                );

            setNotice(response.data.message || "Category saved.");
            setModalOpen(false);
            setEditingId("");
            setForm(initialForm);
            setImage(null);
            setPreview("");

            await fetchCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not save the category."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (category) => {
        const confirmed = window.confirm(
            `Delete "${category.name}"? Its category image will also be removed from R2 if cleanup succeeds.`
        );

        if (!confirmed) return;

        setDeletingId(category._id);
        setError("");
        setNotice("");

        try {
            const { data } = await axios.delete(
                `/api/admin/categories/${category._id}`
            );

            setNotice(data.message || "Category deleted.");
            await fetchCategories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to delete the category."
            );
        } finally {
            setDeletingId("");
        }
    };

    const filteredCategories = categories.filter((category) => {
        const term = search.trim().toLowerCase();

        return (
            category.name?.toLowerCase().includes(term) ||
            category.metaTitle?.toLowerCase().includes(term) ||
            category.metaDescription?.toLowerCase().includes(term)
        );
    });

    const inputClass =
        "w-full rounded-xl border border-[#e8e1ef] bg-white px-4 py-3 text-sm text-[#292333] outline-none transition placeholder:text-gray-400 focus:border-[#7D45C2] focus:ring-4 focus:ring-[#7D45C2]/10";

    return (
        <div className="min-h-screen bg-[#F7F2FC]">
            <Sidebar />

            <main className="min-h-screen pt-16 lg:ml-[270px] lg:pt-0">
                <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10">
                    {/* Page heading */}
                    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-medium text-[#7D45C2]">
                                Store management
                            </p>

                            <h1 className="text-3xl tracking-wide text-[#24202B] sm:text-4xl">
                                Categories
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Organize your products and manage category SEO.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-[#7D45C2] px-5 text-sm font-semibold text-white shadow-lg shadow-[#7D45C2]/15 transition hover:bg-[#6935AA] sm:self-auto"
                        >
                            <Plus size={18} />
                            Add Category
                        </button>
                    </div>

                    {/* Notifications */}
                    {notice && (
                        <div
                            role="status"
                            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
                        >
                            <span>{notice}</span>
                            <button
                                type="button"
                                onClick={() => setNotice("")}
                                aria-label="Dismiss notification"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {error && !modalOpen && (
                        <div
                            role="alert"
                            className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                        >
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => setError("")}
                                aria-label="Dismiss error"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {/* Table container */}
                    <section className="overflow-hidden rounded-2xl border border-[#e9dff5] bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-[#f0e9f7] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div>
                                <h2 className="text-lg tracking-wide text-[#24202B]">
                                    All Categories
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    {categories.length}{" "}
                                    {categories.length === 1
                                        ? "category"
                                        : "categories"}{" "}
                                    total
                                </p>
                            </div>

                            <div className="flex w-full gap-2 sm:w-auto">
                                <div className="relative min-w-0 flex-1 sm:w-72 sm:flex-none">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search categories..."
                                        aria-label="Search categories"
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={fetchCategories}
                                    disabled={loading}
                                    aria-label="Refresh categories"
                                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e8e1ef] text-gray-500 transition hover:bg-[#F7F2FC] hover:text-[#7D45C2] disabled:opacity-50"
                                >
                                    <RefreshCw
                                        size={17}
                                        className={
                                            loading ? "animate-spin" : ""
                                        }
                                    />
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-gray-500">
                                <LoaderCircle
                                    size={28}
                                    className="animate-spin text-[#7D45C2]"
                                />
                                <p className="text-sm">
                                    Loading categories...
                                </p>
                            </div>
                        ) : filteredCategories.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F2FC] text-[#7D45C2]">
                                    <FolderOpen size={26} />
                                </div>

                                <h3 className="text-lg text-[#292333]">
                                    {search
                                        ? "No matching categories"
                                        : "No categories yet"}
                                </h3>

                                <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                                    {search
                                        ? "Try another search term."
                                        : "Create your first category to organize your products."}
                                </p>

                                {!search && (
                                    <button
                                        type="button"
                                        onClick={openCreate}
                                        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6935AA]"
                                    >
                                        <Plus size={17} />
                                        Create Category
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Mobile cards */}
                                <div className="divide-y divide-[#f0e9f7] md:hidden">
                                    {filteredCategories.map((category) => (
                                        <article
                                            key={category._id}
                                            className="flex gap-3 p-4"
                                        >
                                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#eee6f6] bg-[#F7F2FC]">
                                                {category.imageUrl ? (
                                                    <Image
                                                        src={category.imageUrl}
                                                        alt={category.name}
                                                        fill
                                                        sizes="80px"
                                                        unoptimized
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full items-center justify-center text-[#7D45C2]">
                                                        <ImagePlus size={22} />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <h3 className="break-words text-sm font-semibold text-[#292333]">
                                                    {category.name}
                                                </h3>

                                                <p className="mt-1 break-words text-xs text-gray-500">
                                                    {category.metaTitle ||
                                                        "No meta title"}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {category.createdAt
                                                        ? new Date(
                                                            category.createdAt
                                                        ).toLocaleDateString()
                                                        : "—"}
                                                </p>

                                                <div className="mt-3 flex gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(category)
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#e8e1ef] px-3 py-2 text-xs font-medium text-[#7D45C2] hover:bg-[#F7F2FC]"
                                                    >
                                                        <Pencil size={14} />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={
                                                            deletingId ===
                                                            category._id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                category
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                                                    >
                                                        {deletingId ===
                                                            category._id ? (
                                                            <LoaderCircle
                                                                size={14}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {/* Desktop table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[760px] text-left">
                                        <thead className="bg-[#FBF9FD]">
                                            <tr className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                                <th className="px-5 py-4">
                                                    Category
                                                </th>
                                                <th className="px-5 py-4">
                                                    Meta Title
                                                </th>
                                                <th className="px-5 py-4">
                                                    Created
                                                </th>
                                                <th className="px-5 py-4 text-right">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-[#f0e9f7]">
                                            {filteredCategories.map(
                                                (category) => (
                                                    <tr
                                                        key={category._id}
                                                        className="transition hover:bg-[#FDFCFE]"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#eee6f6] bg-[#F7F2FC]">
                                                                    {category.imageUrl ? (
                                                                        <Image
                                                                            src={
                                                                                category.imageUrl
                                                                            }
                                                                            alt={
                                                                                category.name
                                                                            }
                                                                            fill
                                                                            sizes="48px"
                                                                            unoptimized
                                                                            className="object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-full items-center justify-center text-[#7D45C2]">
                                                                            <ImagePlus
                                                                                size={
                                                                                    19
                                                                                }
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="max-w-xs break-words text-sm font-semibold text-[#292333]">
                                                                        {
                                                                            category.name
                                                                        }
                                                                    </p>
                                                                    <p className="mt-1 max-w-xs truncate text-xs text-gray-400">
                                                                        {category.metaDescription ||
                                                                            "No meta description"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="max-w-xs px-5 py-4">
                                                            <p className="truncate text-sm text-gray-600">
                                                                {category.metaTitle ||
                                                                    "—"}
                                                            </p>
                                                        </td>

                                                        <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-500">
                                                            {category.createdAt
                                                                ? new Date(
                                                                    category.createdAt
                                                                ).toLocaleDateString()
                                                                : "—"}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEdit(
                                                                            category
                                                                        )
                                                                    }
                                                                    aria-label={`Edit ${category.name}`}
                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e8e1ef] text-[#7D45C2] transition hover:bg-[#F7F2FC]"
                                                                >
                                                                    <Pencil
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    disabled={
                                                                        deletingId ===
                                                                        category._id
                                                                    }
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            category
                                                                        )
                                                                    }
                                                                    aria-label={`Delete ${category.name}`}
                                                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                                                >
                                                                    {deletingId ===
                                                                        category._id ? (
                                                                        <LoaderCircle
                                                                            size={
                                                                                16
                                                                            }
                                                                            className="animate-spin"
                                                                        />
                                                                    ) : (
                                                                        <Trash2
                                                                            size={
                                                                                16
                                                                            }
                                                                        />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>

            {/* Create / Edit modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) closeModal();
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="category-modal-title"
                        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
                    >
                        <div className="flex shrink-0 items-center justify-between border-b border-[#f0e9f7] px-5 py-4 sm:px-7">
                            <div>
                                <h2
                                    id="category-modal-title"
                                    className="text-xl tracking-wide text-[#292333]"
                                >
                                    {editingId
                                        ? "Edit Category"
                                        : "Create Category"}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    Add category details and SEO information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                aria-label="Close modal"
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-[#F7F2FC] disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
                                {error && (
                                    <p
                                        role="alert"
                                        className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
                                    >
                                        {error}
                                    </p>
                                )}

                                {/* Image upload */}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-[#41384D]">
                                        Category Image{" "}
                                        {!editingId && (
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        )}
                                    </label>

                                    <label className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#d9c7eb] bg-[#FBF9FD] p-4 transition hover:border-[#7D45C2]">
                                        {preview ? (
                                            <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-lg">
                                                <Image
                                                    src={preview}
                                                    alt="Category preview"
                                                    fill
                                                    unoptimized
                                                    sizes="(max-width: 640px) 90vw, 384px"
                                                    className="object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center py-5 text-center">
                                                <ImagePlus
                                                    size={30}
                                                    className="mb-3 text-[#7D45C2]"
                                                />
                                                <span className="text-sm font-medium text-[#41384D]">
                                                    Click to upload an image
                                                </span>
                                            </div>
                                        )}

                                        <span className="mt-3 text-center text-xs text-gray-500">
                                            JPG, PNG, WEBP or AVIF · Max 5 MB
                                            {editingId
                                                ? " · Leave unchanged to keep current image"
                                                : ""}
                                        </span>

                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/avif"
                                            onChange={handleImageChange}
                                            className="sr-only"
                                        />
                                    </label>
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Category Name *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.name}
                                        required
                                        onChange={(e) => {
                                            const name = e.target.value;

                                            setForm((prev) => ({
                                                ...prev,
                                                name,
                                                slug: generateSlug(name),
                                            }));
                                        }}
                                        placeholder="Enter category name"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Category Slug *
                                    </label>

                                    <input
                                        type="text"
                                        value={form.slug}
                                        required
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                slug: generateSlug(e.target.value),
                                            }))
                                        }
                                        placeholder="e.g. facewash"
                                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-purple-500"
                                    />

                                    <p className="text-xs text-gray-500">
                                        URL-friendly identifier, e.g. facewash.
                                    </p>
                                </div>

                                {/* SEO */}
                                <div className="rounded-xl border border-[#eee6f6] bg-[#FBF9FD] p-4 sm:p-5">
                                    <h3 className="mb-4 text-sm font-semibold text-[#292333]">
                                        SEO Settings
                                    </h3>

                                    <div className="space-y-4">
                                        <div>
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <label
                                                    htmlFor="meta-title"
                                                    className="text-sm font-medium text-[#41384D]"
                                                >
                                                    Meta Title
                                                </label>
                                                <span className="text-xs text-gray-400">
                                                    {form.metaTitle.length}/200
                                                </span>
                                            </div>

                                            <input
                                                id="meta-title"
                                                name="metaTitle"
                                                value={form.metaTitle}
                                                onChange={handleChange}
                                                maxLength={200}
                                                placeholder="SEO title for search engines"
                                                className={inputClass}
                                            />
                                        </div>

                                        <div>
                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                <label
                                                    htmlFor="meta-description"
                                                    className="text-sm font-medium text-[#41384D]"
                                                >
                                                    Meta Description
                                                </label>
                                                <span className="text-xs text-gray-400">
                                                    {form.metaDescription.length}/320
                                                </span>
                                            </div>

                                            <textarea
                                                id="meta-description"
                                                name="metaDescription"
                                                value={form.metaDescription}
                                                onChange={handleChange}
                                                maxLength={320}
                                                rows={3}
                                                placeholder="Brief description for search results"
                                                className={`${inputClass} resize-y`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label
                                        htmlFor="category-description"
                                        className="mb-2 block text-sm font-medium text-[#41384D]"
                                    >
                                        Description
                                    </label>

                                    <textarea
                                        id="category-description"
                                        name="description"
                                        value={form.description}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Describe this category..."
                                        className={`${inputClass} resize-y`}
                                    />
                                </div>
                            </div>

                            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-[#f0e9f7] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="min-h-11 rounded-xl border border-[#e8e1ef] px-5 text-sm font-semibold text-gray-600 transition hover:bg-[#F7F2FC] disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-6 text-sm font-semibold text-white transition hover:bg-[#6935AA] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {saving && (
                                        <LoaderCircle
                                            size={17}
                                            className="animate-spin"
                                        />
                                    )}
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Save Changes"
                                            : "Create Category"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}
        </div>
    );
}