
"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    Package,
    ChevronDown,
    ExternalLink,
    X,
} from "lucide-react";

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-500";

const buttonClass =
    "inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6937A8] disabled:cursor-not-allowed disabled:opacity-60";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState("");
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [page, setPage] = useState(1);

    const pageSize = 10;

    const fetchCategories = useCallback(async () => {
        try {
            const { data } = await axios.get("/api/admin/categories");
            setCategories(data.categories || []);
        } catch (err) {
            console.error("Fetch categories error:", err);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {};

            if (search.trim()) params.search = search.trim();
            if (categoryId) params.categoryId = categoryId;
            if (status) params.status = status;

            const { data } = await axios.get("/api/admin/products", {
                params,
            });

            setProducts(data.products || []);
            setPage(1);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load products."
            );
        } finally {
            setLoading(false);
        }
    }, [search, categoryId, status]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleDelete = async (product) => {
        const confirmed = window.confirm(
            `Delete "${product.name}"? This will also remove its product images.`
        );

        if (!confirmed) return;

        setDeletingId(product._id);
        setNotice("");
        setError("");

        try {
            const { data } = await axios.delete(
                `/api/admin/products/${product._id}`
            );

            setNotice(data.message || "Product deleted successfully.");
            await fetchProducts();
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to delete product."
            );
        } finally {
            setDeletingId("");
        }
    };

    const formatPrice = (value) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2,
        }).format(Number(value) || 0);

    const getCategoryName = (product) => {
        if (product.categoryId && typeof product.categoryId === "object") {
            return product.categoryId.name || "Uncategorized";
        }

        return (
            categories.find(
                (category) => category._id === product.categoryId
            )?.name || "Uncategorized"
        );
    };

    const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
    const paginatedProducts = products.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#7D45C2]">
                                CATALOG MANAGEMENT
                            </p>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight">
                                Products
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Manage products, bottle sizes, prices and images.
                            </p>
                        </div>

                        <Link href="/admin/products/add" className={buttonClass}>
                            <Plus size={18} />
                            Add Product
                        </Link>
                    </header>

                    {notice && (
                        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            <span className="flex-1">{notice}</span>
                            <button
                                type="button"
                                onClick={() => setNotice("")}
                                aria-label="Dismiss notice"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <span className="flex-1">{error}</span>
                            <button
                                type="button"
                                onClick={() => setError("")}
                                aria-label="Dismiss error"
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Total products
                                </p>
                                <Package className="text-[#7D45C2]" size={21} />
                            </div>
                            <p className="mt-3 text-3xl font-bold">
                                {products.length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Active products
                            </p>
                            <p className="mt-3 text-3xl font-bold text-green-600">
                                {products.filter((p) => p.status === "active").length}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Inactive products
                            </p>
                            <p className="mt-3 text-3xl font-bold text-gray-500">
                                {products.filter((p) => p.status === "inactive").length}
                            </p>
                        </div>
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-4 sm:p-5">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px_auto]">
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search products or slugs..."
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={categoryId}
                                        onChange={(e) =>
                                            setCategoryId(e.target.value)
                                        }
                                        className={`${inputClass} appearance-none pr-10`}
                                    >
                                        <option value="">All categories</option>
                                        {categories.map((category) => (
                                            <option
                                                key={category._id}
                                                value={category._id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className={`${inputClass} appearance-none pr-10`}
                                    >
                                        <option value="">All statuses</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={fetchProducts}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
                                >
                                    <RefreshCw size={16} />
                                    Refresh
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
                                <RefreshCw
                                    size={20}
                                    className="animate-spin text-[#7D45C2]"
                                />
                                Loading products...
                            </div>
                        ) : products.length === 0 ? (
                            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#7D45C2]">
                                    <Package size={26} />
                                </div>
                                <h2 className="mt-4 text-lg font-semibold">
                                    No products found
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add a product or change your search filters.
                                </p>
                                <Link
                                    href="/admin/products/add"
                                    className={`${buttonClass} mt-5`}
                                >
                                    <Plus size={17} />
                                    Add your first product
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[900px] text-left">
                                        <thead className="bg-[#FAF8FD] text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-5 py-4 font-semibold">
                                                    Product
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Category
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Bottle pricing
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Status
                                                </th>
                                                <th className="px-5 py-4 text-right font-semibold">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedProducts.map((product) => (
                                                <tr
                                                    key={product._id}
                                                    className="transition hover:bg-purple-50/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                                                {product.images?.[0]?.url ? (
                                                                    <Image
                                                                        src={product.images[0].url}
                                                                        alt={product.name}
                                                                        fill
                                                                        unoptimized
                                                                        sizes="56px"
                                                                        className="object-cover"
                                                                    />
                                                                ) : (
                                                                    <Package className="m-auto h-full w-full p-4 text-gray-400" />
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="max-w-64 truncate text-sm font-semibold">
                                                                    {product.name}
                                                                </p>
                                                                <p className="mt-1 max-w-64 truncate text-xs text-gray-400">
                                                                    /{product.slug}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-gray-600">
                                                        {getCategoryName(product)}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="space-y-2">
                                                            {(product.variants || []).map((variant) => (
                                                                <div
                                                                    key={variant.size}
                                                                    className="flex items-center gap-2 text-xs"
                                                                >
                                                                    <span className="w-10 rounded-md bg-purple-50 px-2 py-1 text-center font-semibold text-[#7D45C2]">
                                                                        {variant.size}
                                                                    </span>
                                                                    <span className="font-semibold text-gray-900">
                                                                        {formatPrice(variant.price)}
                                                                    </span>
                                                                    {Number(variant.oldPrice) > Number(variant.price) && (
                                                                        <span className="text-gray-400 line-through">
                                                                            {formatPrice(variant.oldPrice)}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${product.status === "active"
                                                                    ? "bg-green-50 text-green-700"
                                                                    : "bg-gray-100 text-gray-600"
                                                                }`}
                                                        >
                                                            {product.status}
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex justify-end gap-2">
                                                            <Link
                                                                href={`/admin/products/edit/${product._id}`}
                                                                title="Edit product"
                                                                aria-label={`Edit ${product.name}`}
                                                                className="rounded-lg border border-gray-200 p-2.5 transition hover:border-purple-300 hover:bg-purple-50 hover:text-[#7D45C2]"
                                                            >
                                                                <Pencil size={16} />
                                                            </Link>

                                                            {product.videoUrl && (
                                                                <a
                                                                    href={product.videoUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    title="Open product video"
                                                                    className="rounded-lg border border-gray-200 p-2.5 transition hover:bg-gray-50"
                                                                >
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            )}

                                                            <button
                                                                type="button"
                                                                disabled={deletingId === product._id}
                                                                onClick={() => handleDelete(product)}
                                                                title="Delete product"
                                                                aria-label={`Delete ${product.name}`}
                                                                className="rounded-lg border border-red-100 p-2.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                                                            >
                                                                {deletingId === product._id ? (
                                                                    <RefreshCw size={16} className="animate-spin" />
                                                                ) : (
                                                                    <Trash2 size={16} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-gray-100 md:hidden">
                                    {paginatedProducts.map((product) => (
                                        <article key={product._id} className="p-4">
                                            <div className="flex gap-3">
                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                                    {product.images?.[0]?.url ? (
                                                        <Image
                                                            src={product.images[0].url}
                                                            alt={product.name}
                                                            fill
                                                            unoptimized
                                                            sizes="80px"
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <Package className="h-full w-full p-6 text-gray-400" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-sm font-semibold">
                                                        {product.name}
                                                    </h3>
                                                    <p className="mt-1 truncate text-xs text-gray-500">
                                                        {getCategoryName(product)}
                                                    </p>
                                                    <span
                                                        className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${product.status === "active"
                                                                ? "bg-green-50 text-green-700"
                                                                : "bg-gray-100 text-gray-600"
                                                            }`}
                                                    >
                                                        {product.status}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-2">
                                                {(product.variants || []).map((variant) => (
                                                    <div
                                                        key={variant.size}
                                                        className="rounded-xl bg-[#FAF8FD] p-3"
                                                    >
                                                        <p className="text-xs text-gray-500">
                                                            {variant.size}
                                                        </p>
                                                        <p className="mt-1 text-sm font-semibold">
                                                            {formatPrice(variant.price)}
                                                        </p>
                                                        {Number(variant.oldPrice) > Number(variant.price) && (
                                                            <p className="mt-1 text-xs text-gray-400 line-through">
                                                                {formatPrice(variant.oldPrice)}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-4 flex gap-2">
                                                <Link
                                                    href={`/admin/products/edit/${product._id}`}
                                                    className={`${buttonClass} flex-1`}
                                                >
                                                    <Pencil size={15} />
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    disabled={deletingId === product._id}
                                                    onClick={() => handleDelete(product)}
                                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-medium text-red-600 disabled:opacity-50"
                                                >
                                                    <Trash2 size={15} />
                                                    Delete
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <p className="text-sm text-gray-500">
                                        Showing{" "}
                                        {(page - 1) * pageSize + 1}–
                                        {Math.min(page * pageSize, products.length)}{" "}
                                        of {products.length} products
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => p - 1)}
                                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-40"
                                        >
                                            Previous
                                        </button>
                                        <span className="px-2 text-sm text-gray-500">
                                            {page} / {totalPages}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={page >= totalPages}
                                            onClick={() => setPage((p) => p + 1)}
                                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-40"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}
