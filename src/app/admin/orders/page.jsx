
"use client";

import React, {
    useCallback,
    useEffect,
    useState,
} from "react";
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
    CreditCard,
    Banknote,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const PAGE_SIZE = 10;

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10";

const orderStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
];

const paymentStatuses = [
    "pending",
    "paid",
    "failed",
    "refunded",
    "partially_refunded",
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

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function formatLabel(value) {
    return String(value || "unknown")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

function StatusBadge({ value }) {
    const colors = {
        pending:
            "bg-amber-50 text-amber-700",
        confirmed:
            "bg-blue-50 text-blue-700",
        processing:
            "bg-purple-50 text-purple-700",
        shipped:
            "bg-indigo-50 text-indigo-700",
        delivered:
            "bg-green-50 text-green-700",
        cancelled:
            "bg-red-50 text-red-700",
        returned:
            "bg-orange-50 text-orange-700",
        paid:
            "bg-green-50 text-green-700",
        failed:
            "bg-red-50 text-red-700",
        refunded:
            "bg-gray-100 text-gray-700",
        partially_refunded:
            "bg-orange-50 text-orange-700",
    };

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${colors[value] ||
                "bg-gray-100 text-gray-600"
                }`}
        >
            {formatLabel(value)}
        </span>
    );
}

function PaymentBadge({ method }) {
    const isCOD = method === "cod";

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold uppercase ${isCOD
                ? "bg-orange-50 text-orange-700"
                : "bg-purple-50 text-[#7D45C2]"
                }`}
        >
            {isCOD ? (
                <Banknote size={12} />
            ) : (
                <CreditCard size={12} />
            )}

            {isCOD ? "COD" : "Razorpay"}
        </span>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
    iconClass,
    subtitle,
}) {
    return (
        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                    {title}
                </p>

                <Icon
                    size={21}
                    className={
                        iconClass ||
                        "text-[#7D45C2]"
                    }
                />
            </div>

            <p className="mt-3 break-words text-2xl font-bold sm:text-3xl">
                {value}
            </p>

            {subtitle && (
                <p className="mt-2 text-xs text-gray-400">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);

    const [summary, setSummary] = useState({
        totalOrders: 0,
        codOrders: 0,
        prepaidOrders: 0,
        pendingCODAmount: 0,
        collectedRevenue: 0,
        cancelledOrders: 0,
    });

    const [pagination, setPagination] =
        useState({
            page: 1,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false,
        });

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] =
        useState("");

    const [orderStatus, setOrderStatus] =
        useState("all");

    const [paymentStatus, setPaymentStatus] =
        useState("all");

    const [paymentMethod, setPaymentMethod] =
        useState("all");

    const [page, setPage] = useState(1);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const [refreshKey, setRefreshKey] =
        useState(0);

    // Debounce search input.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // Reset pagination when filters change.
    useEffect(() => {
        setPage(1);
    }, [
        debouncedSearch,
        orderStatus,
        paymentStatus,
        paymentMethod,
    ]);

    const fetchOrders = useCallback(
        async (signal) => {
            setLoading(true);
            setError("");

            try {
                const params = {
                    page,
                    limit: PAGE_SIZE,
                };

                if (debouncedSearch) {
                    params.search = debouncedSearch;
                }

                if (orderStatus !== "all") {
                    // Matches Step 8 API.
                    params.status = orderStatus;
                }

                if (paymentStatus !== "all") {
                    params.paymentStatus =
                        paymentStatus;
                }

                if (paymentMethod !== "all") {
                    params.paymentMethod =
                        paymentMethod;
                }

                const { data } = await axios.get(
                    "/api/admin/orders",
                    {
                        params,
                        signal,
                    }
                );

                if (!data.success) {
                    throw new Error(
                        data.message ||
                        "Failed to load orders."
                    );
                }

                setOrders(
                    Array.isArray(data.orders)
                        ? data.orders
                        : []
                );

                setSummary(
                    data.summary || {}
                );

                setPagination(
                    data.pagination || {
                        page,
                        limit: PAGE_SIZE,
                        total: 0,
                        totalPages: 0,
                    }
                );
            } catch (err) {
                if (
                    axios.isCancel(err) ||
                    err.code === "ERR_CANCELED"
                ) {
                    return;
                }

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load orders."
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [
            page,
            debouncedSearch,
            orderStatus,
            paymentStatus,
            paymentMethod,
        ]
    );

    useEffect(() => {
        const controller =
            new AbortController();

        fetchOrders(controller.signal);

        return () => controller.abort();
    }, [fetchOrders, refreshKey]);

    const refreshOrders = () => {
        setNotice("");
        setRefreshKey((prev) => prev + 1);
    };

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setOrderStatus("all");
        setPaymentStatus("all");
        setPaymentMethod("all");
        setPage(1);
    };

    const totalPages = Math.max(
        1,
        Number(pagination.totalPages) || 1
    );

    const totalOrders = Number(
        pagination.total || 0
    );

    const startIndex =
        totalOrders === 0
            ? 0
            : (page - 1) * PAGE_SIZE + 1;

    const endIndex = Math.min(
        page * PAGE_SIZE,
        totalOrders
    );

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#7D45C2]">
                                SALES MANAGEMENT
                            </p>

                            <h1 className="mt-1 text-3xl font-bold tracking-tight">
                                Orders
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Manage COD and Razorpay
                                orders, payments, and
                                delivery progress.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={refreshOrders}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-200 bg-white px-4 py-3 text-sm font-semibold text-[#7D45C2] transition hover:bg-purple-50 disabled:opacity-50"
                        >
                            <RefreshCw
                                size={17}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />
                            Refresh orders
                        </button>
                    </header>

                    {notice && (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            <span>{notice}</span>

                            <button
                                onClick={() =>
                                    setNotice("")
                                }
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <span>{error}</span>

                            <button
                                onClick={() =>
                                    setError("")
                                }
                            >
                                <X size={17} />
                            </button>
                        </div>
                    )}

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        <StatCard
                            title="Total orders"
                            value={
                                summary.totalOrders || 0
                            }
                            icon={ShoppingBag}
                            subtitle="Placed orders"
                        />

                        <StatCard
                            title="COD orders"
                            value={
                                summary.codOrders || 0
                            }
                            icon={Banknote}
                            iconClass="text-orange-600"
                            subtitle="Cash on Delivery"
                        />

                        <StatCard
                            title="Prepaid orders"
                            value={
                                summary.prepaidOrders || 0
                            }
                            icon={CreditCard}
                            iconClass="text-blue-600"
                            subtitle="Razorpay payments"
                        />

                        <StatCard
                            title="Pending COD amount"
                            value={formatPrice(
                                summary.pendingCODAmount
                            )}
                            icon={Clock}
                            iconClass="text-amber-600"
                            subtitle="Awaiting payment collection"
                        />

                        <StatCard
                            title="Paid order value"
                            value={formatPrice(
                                summary.collectedRevenue
                            )}
                            icon={CheckCircle2}
                            iconClass="text-green-600"
                            subtitle="Orders currently marked paid"
                        />

                        <StatCard
                            title="Cancelled orders"
                            value={
                                summary.cancelledOrders || 0
                            }
                            icon={X}
                            iconClass="text-red-600"
                            subtitle="Cancelled orders"
                        />
                    </div>

                    {/* Orders Table */}
                    <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                        {/* Filters */}
                        <div className="border-b border-gray-100 p-4 sm:p-5">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_170px_160px_160px_auto]">
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search order, customer, email..."
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={orderStatus}
                                        onChange={(e) =>
                                            setOrderStatus(
                                                e.target.value
                                            )
                                        }
                                        className={`${inputClass} appearance-none pr-9`}
                                    >
                                        <option value="all">
                                            All order statuses
                                        </option>

                                        {orderStatuses.map(
                                            (status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {formatLabel(
                                                        status
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value
                                            )
                                        }
                                        className={`${inputClass} appearance-none pr-9`}
                                    >
                                        <option value="all">
                                            All methods
                                        </option>
                                        <option value="cod">
                                            COD
                                        </option>
                                        <option value="razorpay">
                                            Razorpay
                                        </option>
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
                                            setPaymentStatus(
                                                e.target.value
                                            )
                                        }
                                        className={`${inputClass} appearance-none pr-9`}
                                    >
                                        <option value="all">
                                            All payments
                                        </option>

                                        {paymentStatuses.map(
                                            (status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {formatLabel(
                                                        status
                                                    )}
                                                </option>
                                            )
                                        )}
                                    </select>

                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-translate-y-1/2 text-gray-400"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
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
                                    Try changing your search
                                    or filters.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Desktop Table */}
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[1050px] text-left">
                                        <thead className="bg-[#FAF8FD] text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-5 py-4">
                                                    Order
                                                </th>
                                                <th className="px-5 py-4">
                                                    Customer
                                                </th>
                                                <th className="px-5 py-4">
                                                    Items
                                                </th>
                                                <th className="px-5 py-4">
                                                    Total
                                                </th>
                                                <th className="px-5 py-4">
                                                    Payment
                                                </th>
                                                <th className="px-5 py-4">
                                                    Order status
                                                </th>
                                                <th className="px-5 py-4 text-right">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {orders.map(
                                                (order) => (
                                                    <tr
                                                        key={
                                                            order._id
                                                        }
                                                        className="transition hover:bg-purple-50/30"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-semibold">
                                                                {
                                                                    order.orderNumber
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400">
                                                                {formatDate(
                                                                    order.createdAt
                                                                )}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <p className="max-w-52 truncate text-sm font-semibold">
                                                                {order.customer
                                                                    ?.name ||
                                                                    order.shippingAddress
                                                                        ?.fullName ||
                                                                    "Customer"}
                                                            </p>

                                                            <p className="mt-1 max-w-52 truncate text-xs text-gray-500">
                                                                {order.customer
                                                                    ?.email ||
                                                                    order.customerEmail ||
                                                                    "—"}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {order.customer
                                                                    ?.mobile ||
                                                                    order.shippingAddress
                                                                        ?.mobile ||
                                                                    "—"}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-2">
                                                                {order.items?.[0]
                                                                    ?.image ? (
                                                                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                                                                        <Image
                                                                            src={
                                                                                order
                                                                                    .items[0]
                                                                                    .image
                                                                            }
                                                                            alt={
                                                                                order
                                                                                    .items[0]
                                                                                    .name ||
                                                                                "Product"
                                                                            }
                                                                            fill
                                                                            unoptimized
                                                                            sizes="44px"
                                                                            className="object-cover"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <Package
                                                                        size={
                                                                            28
                                                                        }
                                                                        className="text-gray-400"
                                                                    />
                                                                )}

                                                                <div>
                                                                    <p className="max-w-40 truncate text-sm font-medium">
                                                                        {order.items?.[0]
                                                                            ?.name ||
                                                                            "No item"}
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        {order.itemCount ??
                                                                            order.items
                                                                                ?.length ??
                                                                            0}{" "}
                                                                        item(s)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4 text-sm font-semibold">
                                                            {formatPrice(
                                                                order.totalAmount
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <StatusBadge
                                                                value={
                                                                    order.paymentStatus
                                                                }
                                                            />

                                                            <div className="mt-2">
                                                                <PaymentBadge
                                                                    method={
                                                                        order.paymentMethod
                                                                    }
                                                                />
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <StatusBadge
                                                                value={
                                                                    order.orderStatus
                                                                }
                                                            />
                                                        </td>

                                                        <td className="px-5 py-4 text-right">
                                                            <Link
                                                                href={`/admin/orders/${order._id}`}
                                                                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-3 py-2 text-sm font-medium text-[#7D45C2] transition hover:bg-purple-50"
                                                            >
                                                                <Eye
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                                View
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile Cards */}
                                <div className="divide-y divide-gray-100 md:hidden">
                                    {orders.map((order) => (
                                        <article
                                            key={order._id}
                                            className="space-y-4 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="break-all text-sm font-semibold">
                                                        {
                                                            order.orderNumber
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatDate(
                                                            order.createdAt
                                                        )}
                                                    </p>
                                                </div>

                                                <StatusBadge
                                                    value={
                                                        order.orderStatus
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    {order.customer
                                                        ?.name ||
                                                        order.shippingAddress
                                                            ?.fullName ||
                                                        "Customer"}
                                                </p>

                                                <p className="mt-1 break-all text-xs text-gray-500">
                                                    {order.customer
                                                        ?.email ||
                                                        order.customerEmail ||
                                                        "—"}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {order.customer
                                                        ?.mobile ||
                                                        order.shippingAddress
                                                            ?.mobile ||
                                                        "—"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {order.items?.[0]
                                                    ?.image ? (
                                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-50">
                                                        <Image
                                                            src={
                                                                order
                                                                    .items[0]
                                                                    .image
                                                            }
                                                            alt={
                                                                order
                                                                    .items[0]
                                                                    .name ||
                                                                "Product"
                                                            }
                                                            fill
                                                            unoptimized
                                                            sizes="56px"
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <Package
                                                        size={30}
                                                        className="text-gray-400"
                                                    />
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium">
                                                        {order.items?.[0]
                                                            ?.name ||
                                                            "No item"}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {order.itemCount ??
                                                            order.items
                                                                ?.length ??
                                                            0}{" "}
                                                        item(s)
                                                    </p>

                                                    <p className="mt-1 text-sm font-bold">
                                                        {formatPrice(
                                                            order.totalAmount
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <div className="space-y-2">
                                                    <StatusBadge
                                                        value={
                                                            order.paymentStatus
                                                        }
                                                    />

                                                    <div>
                                                        <PaymentBadge
                                                            method={
                                                                order.paymentMethod
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <Link
                                                    href={`/admin/orders/${order._id}`}
                                                    className="inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6937A8]"
                                                >
                                                    <Eye size={16} />
                                                    View order
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                {/* Server-side Pagination */}
                                <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <p className="text-sm text-gray-500">
                                        Showing {startIndex}–
                                        {endIndex} of{" "}
                                        {totalOrders} matching
                                        orders
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={
                                                page <= 1 ||
                                                loading
                                            }
                                            onClick={() =>
                                                setPage(
                                                    (prev) =>
                                                        Math.max(
                                                            1,
                                                            prev - 1
                                                        )
                                                )
                                            }
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40"
                                        >
                                            <ChevronLeft
                                                size={16}
                                            />
                                            Previous
                                        </button>

                                        <span className="px-2 text-sm text-gray-500">
                                            {page} /{" "}
                                            {totalPages}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                page >=
                                                totalPages ||
                                                loading
                                            }
                                            onClick={() =>
                                                setPage(
                                                    (prev) =>
                                                        prev + 1
                                                )
                                            }
                                            className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:opacity-40"
                                        >
                                            Next
                                            <ChevronRight
                                                size={16}
                                            />
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
