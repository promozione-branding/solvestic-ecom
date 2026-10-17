"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    Search,
    RefreshCw,
    ShoppingBag,
    Clock,
    CheckCircle2,
    ChevronDown,
    Eye,
    Package,
    X,
} from "lucide-react";

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-purple-500";

const orderStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
];

function formatPrice(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
    }).format(Number(value) || 0);
}

function formatDate(value) {
    if (!value) return "—";

    return new Date(value).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function StatusBadge({ value }) {
    const colors = {
        pending: "bg-amber-50 text-amber-700",
        confirmed: "bg-blue-50 text-blue-700",
        processing: "bg-purple-50 text-purple-700",
        shipped: "bg-indigo-50 text-indigo-700",
        delivered: "bg-green-50 text-green-700",
        cancelled: "bg-red-50 text-red-700",
        returned: "bg-orange-50 text-orange-700",
        paid: "bg-green-50 text-green-700",
        failed: "bg-red-50 text-red-700",
        refunded: "bg-gray-100 text-gray-700",
        partially_refunded: "bg-orange-50 text-orange-700",
    };

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${colors[value] || "bg-gray-100 text-gray-600"
                }`}
        >
            {(value || "unknown").replaceAll("_", " ")}
        </span>
    );
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        deliveredOrders: 0,
        paidRevenue: 0,
        filteredOrders: 0,
    });

    const [search, setSearch] = useState("");
    const [orderStatus, setOrderStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [page, setPage] = useState(1);

    const pageSize = 10;

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const params = {};

            if (search.trim()) params.search = search.trim();
            if (orderStatus) params.orderStatus = orderStatus;
            if (paymentStatus) params.paymentStatus = paymentStatus;

            const { data } = await axios.get("/api/admin/orders", {
                params,
            });

            setOrders(data.orders || []);
            setStats(data.stats || {});
            setPage(1);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load orders."
            );
        } finally {
            setLoading(false);
        }
    }, [search, orderStatus, paymentStatus]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const totalPages = Math.max(1, Math.ceil(orders.length / pageSize));
    const paginatedOrders = orders.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const clearFilters = () => {
        setSearch("");
        setOrderStatus("");
        setPaymentStatus("");
    };

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header>
                        <p className="text-sm font-medium text-[#7D45C2]">
                            SALES MANAGEMENT
                        </p>
                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Orders
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            View customer orders, payment information, and
                            delivery progress.
                        </p>
                    </header>

                    {notice && (
                        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            {notice}
                            <button onClick={() => setNotice("")}>
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                            <button onClick={() => setError("")}>
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    All orders
                                </p>
                                <ShoppingBag
                                    className="text-[#7D45C2]"
                                    size={21}
                                />
                            </div>
                            <p className="mt-3 text-3xl font-bold">
                                {stats.totalOrders ?? 0}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Pending orders
                                </p>
                                <Clock className="text-amber-600" size={21} />
                            </div>
                            <p className="mt-3 text-3xl font-bold">
                                {stats.pendingOrders ?? 0}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Delivered orders
                                </p>
                                <CheckCircle2
                                    className="text-green-600"
                                    size={21}
                                />
                            </div>
                            <p className="mt-3 text-3xl font-bold">
                                {stats.deliveredOrders ?? 0}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Paid revenue
                            </p>
                            <p className="mt-3 text-2xl font-bold">
                                {formatPrice(stats.paidRevenue)}
                            </p>
                            <p className="mt-1 text-xs text-gray-400">
                                Orders marked as paid
                            </p>
                        </div>
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-4 sm:p-5">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(200px,1fr)_200px_200px_auto_auto]">
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                    <input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder="Search order, customer, email..."
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={orderStatus}
                                        onChange={(e) =>
                                            setOrderStatus(e.target.value)
                                        }
                                        className={`${inputClass} appearance-none pr-9 capitalize`}
                                    >
                                        <option value="">All order statuses</option>
                                        {orderStatuses.map((status) => (
                                            <option key={status} value={status}>
                                                {status.replaceAll("_", " ")}
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
                                        value={paymentStatus}
                                        onChange={(e) =>
                                            setPaymentStatus(e.target.value)
                                        }
                                        className={`${inputClass} appearance-none pr-9`}
                                    >
                                        <option value="">All payments</option>
                                        {[
                                            "pending",
                                            "paid",
                                            "failed",
                                            "refunded",
                                            "partially_refunded",
                                        ].map((status) => (
                                            <option key={status} value={status}>
                                                {status.replaceAll("_", " ")}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={fetchOrders}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium hover:bg-gray-50"
                                >
                                    <RefreshCw
                                        size={16}
                                        className={loading ? "animate-spin" : ""}
                                    />
                                    Refresh
                                </button>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium hover:bg-gray-50"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
                                <RefreshCw
                                    size={20}
                                    className="animate-spin text-[#7D45C2]"
                                />
                                Loading orders...
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
                                <ShoppingBag
                                    size={32}
                                    className="text-[#7D45C2]"
                                />
                                <h2 className="mt-4 text-lg font-semibold">
                                    No orders found
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Try changing your search or filters.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[1000px] text-left">
                                        <thead className="bg-[#FAF8FD] text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-5 py-4">Order</th>
                                                <th className="px-5 py-4">Customer</th>
                                                <th className="px-5 py-4">Items</th>
                                                <th className="px-5 py-4">Total</th>
                                                <th className="px-5 py-4">Payment</th>
                                                <th className="px-5 py-4">Order status</th>
                                                <th className="px-5 py-4 text-right">Action</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedOrders.map((order) => (
                                                <tr
                                                    key={order._id}
                                                    className="transition hover:bg-purple-50/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-semibold">
                                                            {order.orderNumber}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {formatDate(order.createdAt)}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="max-w-52 truncate text-sm font-semibold">
                                                            {order.shippingAddress?.fullName || "Customer"}
                                                        </p>
                                                        <p className="mt-1 max-w-52 truncate text-xs text-gray-500">
                                                            {order.customerEmail || "—"}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {order.shippingAddress?.mobile || "—"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-2">
                                                            {order.items?.[0]?.image ? (
                                                                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                                                                    <Image
                                                                        src={order.items[0].image}
                                                                        alt={order.items[0].name || "Product"}
                                                                        fill
                                                                        unoptimized
                                                                        sizes="44px"
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                            ) : (
                                                                <Package
                                                                    size={28}
                                                                    className="text-gray-400"
                                                                />
                                                            )}
                                                            <div>
                                                                <p className="max-w-40 truncate text-sm font-medium">
                                                                    {order.items?.[0]?.name || "No item"}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    {order.items?.length || 0} product(s)
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm font-semibold">
                                                        {formatPrice(order.totalAmount)}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge value={order.paymentStatus} />
                                                        <p className="mt-1 text-xs uppercase text-gray-400">
                                                            {order.paymentMethod || "—"}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge value={order.orderStatus} />
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <Link
                                                            href={`/admin/orders/${order._id}`}
                                                            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-3 py-2 text-sm font-medium text-[#7D45C2] hover:bg-purple-50"
                                                        >
                                                            <Eye size={16} />
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-gray-100 md:hidden">
                                    {paginatedOrders.map((order) => (
                                        <article
                                            key={order._id}
                                            className="space-y-4 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="break-all text-sm font-semibold">
                                                        {order.orderNumber}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                                <StatusBadge value={order.orderStatus} />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {order.shippingAddress?.fullName || "Customer"}
                                                </p>
                                                <p className="mt-1 break-all text-xs text-gray-500">
                                                    {order.customerEmail || "—"}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {order.shippingAddress?.mobile || "—"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {order.items?.[0]?.image ? (
                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                                                        <Image
                                                            src={order.items[0].image}
                                                            alt={order.items[0].name || "Product"}
                                                            fill
                                                            unoptimized
                                                            sizes="56px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <Package size={30} className="text-gray-400" />
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {order.items?.[0]?.name || "No item"}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {order.items?.length || 0} product(s)
                                                    </p>
                                                    <p className="mt-1 text-sm font-bold">
                                                        {formatPrice(order.totalAmount)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">
                                                        Payment
                                                    </p>
                                                    <div className="mt-1">
                                                        <StatusBadge value={order.paymentStatus} />
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6937A8]"
                                                >
                                                    <Eye size={16} />
                                                    View order
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <p className="text-sm text-gray-500">
                                        Showing {(page - 1) * pageSize + 1}–
                                        {Math.min(page * pageSize, orders.length)}{" "}
                                        of {orders.length} matching orders
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