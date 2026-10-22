
"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";
import Link from "next/link";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from "recharts";

import {
    Package,
    ShoppingCart,
    MessageSquareText,
    ArrowUpRight,
    Plus,
    Users,
    IndianRupee,
    RefreshCw,
    Wallet,
    AlertCircle,
    ArrowRight,
    Banknote,
    CreditCard,
    Clock3,
    Truck,
    CheckCircle2,
    XCircle,
    TrendingUp,
    CalendarDays,
} from "lucide-react";

const PRIMARY = "#7D45C2";

const PERIOD_OPTIONS = [
    { label: "Today", value: "today" },
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 30 Days", value: "30days" },
    { label: "Last 90 Days", value: "90days" },
    { label: "All Time", value: "all" },
];

const STATUS_COLORS = {
    pending: "#F59E0B",
    confirmed: "#3B82F6",
    processing: "#7D45C2",
    shipped: "#6366F1",
    delivered: "#22C55E",
    cancelled: "#EF4444",
    returned: "#F97316",
};

const SHIPMENT_LABELS = {
    not_created: "Not Created",
    pending: "Pending",
    created: "Created",
    pickup_scheduled: "Pickup Scheduled",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    rto: "Return to Origin",
    lost: "Lost",
    failed: "Failed",
};

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(
        Number(value) || 0
    );

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value) || 0);

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatLabel(value) {
    return String(value || "unknown")
        .replaceAll("_", " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

function StatCard({
    title,
    value,
    description,
    icon: Icon,
    href,
    color,
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-[#E9DFF5] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-100 sm:p-6"
        >
            <div className="mb-5 flex items-center justify-between">
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}
                >
                    <Icon size={22} />
                </div>

                <ArrowUpRight
                    size={19}
                    className="text-gray-300 transition group-hover:text-[#7D45C2]"
                />
            </div>

            <p className="text-sm font-medium text-gray-500">
                {title}
            </p>

            <h3 className="mt-2 break-words text-2xl font-bold text-[#24202B] sm:text-3xl">
                {value}
            </h3>

            <p className="mt-2 text-xs text-gray-400">
                {description}
            </p>
        </Link>
    );
}

function SectionCard({
    title,
    subtitle,
    children,
    action,
}) {
    return (
        <div className="min-w-0 rounded-2xl border border-[#E9DFF5] bg-white p-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-semibold text-[#24202B]">
                        {title}
                    </h3>

                    {subtitle && (
                        <p className="mt-1 text-xs text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>

                {action}
            </div>

            {children}
        </div>
    );
}

function EmptyState({
    message = "No data available yet",
}) {
    return (
        <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F2FC]">
                <Package
                    size={22}
                    className="text-[#7D45C2]"
                />
            </div>

            <p className="text-sm text-gray-400">
                {message}
            </p>
        </div>
    );
}

function StatusBadge({ status }) {
    const normalized = String(
        status || "pending"
    ).toLowerCase();

    const styles = {
        delivered:
            "bg-green-50 text-green-700",
        paid:
            "bg-green-50 text-green-700",
        shipped:
            "bg-blue-50 text-blue-700",
        processing:
            "bg-purple-50 text-purple-700",
        confirmed:
            "bg-purple-50 text-purple-700",
        pending:
            "bg-amber-50 text-amber-700",
        created:
            "bg-amber-50 text-amber-700",
        cancelled:
            "bg-red-50 text-red-600",
        returned:
            "bg-orange-50 text-orange-700",
        failed:
            "bg-red-50 text-red-600",
        refunded:
            "bg-gray-100 text-gray-700",
        partially_refunded:
            "bg-orange-50 text-orange-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${styles[normalized] ||
                "bg-gray-100 text-gray-600"
                }`}
        >
            {formatLabel(normalized)}
        </span>
    );
}

function ProgressRow({
    label,
    count,
    total,
    color,
}) {
    const percentage =
        total > 0
            ? (Number(count || 0) / total) * 100
            : 0;

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{
                            backgroundColor: color,
                        }}
                    />

                    <span className="truncate text-sm text-gray-600">
                        {label}
                    </span>
                </div>

                <span className="text-sm font-semibold text-[#24202B]">
                    {formatNumber(count)}
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[#F7F2FC]">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        backgroundColor: color,
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}

const quickLinks = [
    {
        title: "Add Product",
        description: "Manage your store products",
        href: "/admin/products",
        icon: Package,
    },
    {
        title: "Manage Categories",
        description: "Organize product categories",
        href: "/admin/categories",
        icon: Plus,
    },
    {
        title: "View Orders",
        description: "Manage COD and prepaid orders",
        href: "/admin/orders",
        icon: ShoppingCart,
    },
    {
        title: "Manage Inquiries",
        description: "View customer inquiries",
        href: "/admin/inquiry",
        icon: MessageSquareText,
    },
];

export default function AdminDashboard() {
    const [period, setPeriod] =
        useState("30days");

    const [dashboard, setDashboard] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const fetchDashboard = useCallback(
        async (
            showRefresh = false,
            signal
        ) => {
            try {
                if (showRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const { data } = await axios.get(
                    "/api/admin/dashboard",
                    {
                        params: { period },
                        signal,
                    }
                );

                if (!data.success) {
                    throw new Error(
                        data.message ||
                        "Unable to fetch dashboard."
                    );
                }

                setDashboard(data);
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
                    "Failed to load dashboard."
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        },
        [period]
    );

    useEffect(() => {
        const controller =
            new AbortController();

        fetchDashboard(
            false,
            controller.signal
        );

        return () => controller.abort();
    }, [fetchDashboard]);

    const stats = dashboard?.stats || {};

    const orderStatuses =
        dashboard?.orderStatuses || {};

    const paymentStatuses =
        dashboard?.paymentStatuses || {};

    const shipmentStatuses =
        dashboard?.shipmentStatuses || {};

    const recentOrders =
        dashboard?.recentOrders || [];

    const totalOrders =
        Number(stats.totalOrders) || 0;

    const totalShipmentOrders =
        Object.values(shipmentStatuses).reduce(
            (sum, value) =>
                sum + Number(value || 0),
            0
        );

    const statCards = [
        {
            title: "Paid Order Value",
            value: formatCurrency(
                stats.collectedRevenue
            ),
            description:
                "Orders currently marked paid",
            icon: IndianRupee,
            href: "/admin/orders",
            color:
                "bg-purple-100 text-[#7D45C2]",
        },
        {
            title: "Total Orders",
            value: formatNumber(
                stats.totalOrders
            ),
            description:
                "Placed orders in selected period",
            icon: ShoppingCart,
            href: "/admin/orders",
            color:
                "bg-blue-100 text-blue-600",
        },
        {
            title: "COD Orders",
            value: formatNumber(
                stats.codOrders
            ),
            description:
                "Cash on Delivery orders",
            icon: Banknote,
            href: "/admin/orders",
            color:
                "bg-orange-100 text-orange-600",
        },
        {
            title: "Prepaid Orders",
            value: formatNumber(
                stats.prepaidOrders
            ),
            description:
                "Razorpay paid orders",
            icon: CreditCard,
            href: "/admin/orders",
            color:
                "bg-indigo-100 text-indigo-600",
        },
        {
            title: "Pending COD Amount",
            value: formatCurrency(
                stats.pendingCODAmount
            ),
            description:
                "COD payment collection pending",
            icon: Clock3,
            href: "/admin/orders",
            color:
                "bg-amber-100 text-amber-600",
        },
        {
            title: "COD Collected",
            value: formatCurrency(
                stats.codCollectedAmount
            ),
            description:
                "COD orders marked paid",
            icon: Wallet,
            href: "/admin/orders",
            color:
                "bg-emerald-100 text-emerald-600",
        },
        {
            title: "Total Products",
            value: formatNumber(
                stats.totalProducts
            ),
            description:
                "Products in your store",
            icon: Package,
            href: "/admin/products",
            color:
                "bg-pink-100 text-pink-600",
        },
        {
            title: "Total Customers",
            value: formatNumber(
                stats.totalCustomers
            ),
            description:
                "Registered customers",
            icon: Users,
            href: "/admin/users",
            color:
                "bg-teal-100 text-teal-600",
        },
        {
            title: "Average Order Value",
            value: formatCurrency(
                stats.averageOrderValue
            ),
            description:
                "Average placed order amount",
            icon: TrendingUp,
            href: "/admin/orders",
            color:
                "bg-violet-100 text-violet-600",
        },
        {
            title: "Active Shipments",
            value: formatNumber(
                stats.activeShipments
            ),
            description:
                "Shipments currently in progress",
            icon: Truck,
            href: "/admin/orders",
            color:
                "bg-sky-100 text-sky-600",
        },
        {
            title: "Delivered Orders",
            value: formatNumber(
                stats.deliveredOrders
            ),
            description:
                "Successfully delivered orders",
            icon: CheckCircle2,
            href: "/admin/orders",
            color:
                "bg-green-100 text-green-600",
        },
        {
            title: "Cancelled Orders",
            value: formatNumber(
                stats.cancelledOrders
            ),
            description:
                "Cancelled orders in period",
            icon: XCircle,
            href: "/admin/orders",
            color:
                "bg-red-100 text-red-600",
        },
    ];

    const orderStatusEntries = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned",
    ];

    const shipmentStatusEntries = [
        "not_created",
        "pending",
        "created",
        "pickup_scheduled",
        "picked_up",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "rto",
        "lost",
        "failed",
    ];

    const salesChart = dashboard?.salesChart || [];

    const revenueChartData = salesChart.map((item) => ({
        label: item.label,
        prepaidRevenue: Number(item.prepaidRevenue || 0),
        codRevenue: Number(item.codRevenue || 0),
    }));

    const ordersChartData = salesChart.map((item) => ({
        label: item.label,
        codOrders: Number(item.codOrders || 0),
        prepaidOrders: Number(item.prepaidOrders || 0),
    }));

    const orderPieData = Object.entries(orderStatuses)
        .filter(([, count]) => Number(count) > 0)
        .map(([name, value]) => ({
            name: formatLabel(name),
            value: Number(value),
            color: STATUS_COLORS[name] || "#94A3B8",
        }));

    const paymentPieData = [
        {
            name: "Prepaid Paid",
            value: Number(stats.prepaidRevenue || 0),
            color: "#7D45C2",
        },
        {
            name: "COD Collected",
            value: Number(stats.codCollectedAmount || 0),
            color: "#22C55E",
        },
        {
            name: "COD Pending",
            value: Number(stats.pendingCODAmount || 0),
            color: "#F59E0B",
        },
    ].filter((item) => item.value > 0);

    return (
        <div className="min-h-screen bg-[#F7F2FC]">
            <Sidebar />

            <main className="min-h-screen min-w-0 pt-16 lg:ml-[270px] lg:pt-0">
                <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 sm:py-8 lg:px-9 lg:py-10">
                    {/* Header */}
                    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-medium text-[#7D45C2]">
                                Welcome to Solvestic
                            </p>

                            <h1 className="text-3xl font-bold tracking-wide text-[#24202B] sm:text-4xl">
                                Admin Dashboard
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Monitor store performance,
                                COD collections, payments,
                                and shipments.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    fetchDashboard(true)
                                }
                                disabled={
                                    loading ||
                                    refreshing
                                }
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E9DFF5] bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-purple-50 disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />
                                Refresh
                            </button>

                            <Link
                                href="/admin/products"
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#7D45C2] px-5 text-sm font-semibold text-white transition hover:bg-[#6935AA]"
                            >
                                <Plus size={18} />
                                Add Product
                            </Link>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="flex items-center gap-2 text-sm text-red-600">
                                <AlertCircle size={18} />
                                {error}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    fetchDashboard(true)
                                }
                                className="text-sm font-semibold text-red-700 underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {loading && !dashboard ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({
                                length: 12,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="h-44 animate-pulse rounded-2xl bg-white"
                                />
                            ))}
                        </div>
                    ) : !dashboard ? (
                        <EmptyState message="Dashboard data is unavailable" />
                    ) : (
                        <>
                            {/* Period Filter */}
                            <section className="mb-7">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#24202B]">
                                            Store Overview
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Orders are filtered
                                            by their creation
                                            date.
                                        </p>
                                    </div>

                                    <div className="relative">
                                        <CalendarDays
                                            size={17}
                                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7D45C2]"
                                        />

                                        <select
                                            value={period}
                                            onChange={(e) =>
                                                setPeriod(
                                                    e.target.value
                                                )
                                            }
                                            className="rounded-xl border border-[#E9DFF5] bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#7D45C2]"
                                        >
                                            {PERIOD_OPTIONS.map(
                                                (option) => (
                                                    <option
                                                        key={
                                                            option.value
                                                        }
                                                        value={
                                                            option.value
                                                        }
                                                    >
                                                        {
                                                            option.label
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Statistics */}
                            <section>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {statCards.map(
                                        (stat) => (
                                            <StatCard
                                                key={
                                                    stat.title
                                                }
                                                {...stat}
                                            />
                                        )
                                    )}
                                </div>
                            </section>

                            {/* Payment Summary */}
                            <section className="mt-9 grid grid-cols-1 gap-5 lg:grid-cols-3">
                                <SectionCard
                                    title="Payment Overview"
                                    subtitle="Paid and pending payment status"
                                >
                                    <div className="space-y-5">
                                        <div className="rounded-xl bg-[#F7F2FC] p-4">
                                            <p className="text-sm text-gray-500">
                                                Prepaid paid value
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-[#7D45C2]">
                                                {formatCurrency(
                                                    stats.prepaidRevenue
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-green-50 p-4">
                                            <p className="text-sm text-gray-500">
                                                COD collected
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-green-700">
                                                {formatCurrency(
                                                    stats.codCollectedAmount
                                                )}
                                            </p>
                                        </div>

                                        <div className="rounded-xl bg-amber-50 p-4">
                                            <p className="text-sm text-gray-500">
                                                COD outstanding
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-amber-700">
                                                {formatCurrency(
                                                    stats.pendingCODAmount
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </SectionCard>

                                <SectionCard
                                    title="Payment Status"
                                    subtitle="Orders by payment status"
                                >
                                    <div className="space-y-5">
                                        {[
                                            "pending",
                                            "paid",
                                            "failed",
                                            "refunded",
                                            "partially_refunded",
                                        ].map((status) => (
                                            <ProgressRow
                                                key={status}
                                                label={formatLabel(
                                                    status
                                                )}
                                                count={
                                                    paymentStatuses[
                                                    status
                                                    ] || 0
                                                }
                                                total={
                                                    totalOrders
                                                }
                                                color={
                                                    status ===
                                                        "paid"
                                                        ? "#22C55E"
                                                        : status ===
                                                            "pending"
                                                            ? "#F59E0B"
                                                            : "#94A3B8"
                                                }
                                            />
                                        ))}
                                    </div>
                                </SectionCard>

                                <SectionCard
                                    title="Order Distribution"
                                    subtitle="Orders by fulfillment status"
                                >
                                    <div className="space-y-5">
                                        {orderStatusEntries.map(
                                            (status) => (
                                                <ProgressRow
                                                    key={status}
                                                    label={formatLabel(
                                                        status
                                                    )}
                                                    count={
                                                        orderStatuses[
                                                        status
                                                        ] || 0
                                                    }
                                                    total={
                                                        totalOrders
                                                    }
                                                    color={
                                                        STATUS_COLORS[
                                                        status
                                                        ]
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </SectionCard>
                            </section>

                            {/* Analytics Graphs */}
                            <section className="mt-9 space-y-5">
                                <div>
                                    <h2 className="text-xl font-semibold text-[#24202B]">
                                        Sales Analytics
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Revenue, orders, payment collection and
                                        fulfillment performance
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                    {/* Revenue Trend */}
                                    <SectionCard
                                        title="Revenue Trend"
                                        subtitle="Prepaid and collected COD revenue in INR"
                                        action={
                                            <TrendingUp
                                                size={20}
                                                className="text-[#7D45C2]"
                                            />
                                        }
                                    >
                                        {revenueChartData.length > 0 ? (
                                            <div className="h-[320px] w-full">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <AreaChart
                                                        data={revenueChartData}
                                                        margin={{
                                                            top: 15,
                                                            right: 10,
                                                            left: -10,
                                                            bottom: 0,
                                                        }}
                                                    >
                                                        <defs>
                                                            <linearGradient
                                                                id="prepaidGradient"
                                                                x1="0"
                                                                y1="0"
                                                                x2="0"
                                                                y2="1"
                                                            >
                                                                <stop
                                                                    offset="0%"
                                                                    stopColor="#7D45C2"
                                                                    stopOpacity={0.25}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor="#7D45C2"
                                                                    stopOpacity={0}
                                                                />
                                                            </linearGradient>

                                                            <linearGradient
                                                                id="codGradient"
                                                                x1="0"
                                                                y1="0"
                                                                x2="0"
                                                                y2="1"
                                                            >
                                                                <stop
                                                                    offset="0%"
                                                                    stopColor="#22C55E"
                                                                    stopOpacity={0.2}
                                                                />
                                                                <stop
                                                                    offset="95%"
                                                                    stopColor="#22C55E"
                                                                    stopOpacity={0}
                                                                />
                                                            </linearGradient>
                                                        </defs>

                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            vertical={false}
                                                            stroke="#F0EAF6"
                                                        />

                                                        <XAxis
                                                            dataKey="label"
                                                            tick={{
                                                                fontSize: 11,
                                                                fill: "#9CA3AF",
                                                            }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            minTickGap={20}
                                                        />

                                                        <YAxis
                                                            tick={{
                                                                fontSize: 11,
                                                                fill: "#9CA3AF",
                                                            }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            tickFormatter={(value) =>
                                                                value >= 1000
                                                                    ? `${(value / 1000).toFixed(0)}k`
                                                                    : value
                                                            }
                                                        />

                                                        <Tooltip
                                                            formatter={(value, name) => [
                                                                formatCurrency(value),
                                                                name,
                                                            ]}
                                                        />

                                                        <Legend />

                                                        <Area
                                                            type="monotone"
                                                            dataKey="prepaidRevenue"
                                                            name="Prepaid"
                                                            stroke="#7D45C2"
                                                            strokeWidth={3}
                                                            fill="url(#prepaidGradient)"
                                                        />

                                                        <Area
                                                            type="monotone"
                                                            dataKey="codRevenue"
                                                            name="COD Collected"
                                                            stroke="#22C55E"
                                                            strokeWidth={3}
                                                            fill="url(#codGradient)"
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <EmptyState message="Revenue trend data is not available" />
                                        )}
                                    </SectionCard>

                                    {/* Orders Trend */}
                                    <SectionCard
                                        title="Orders Trend"
                                        subtitle="COD and Razorpay orders over time"
                                        action={
                                            <ShoppingCart
                                                size={20}
                                                className="text-[#7D45C2]"
                                            />
                                        }
                                    >
                                        {ordersChartData.length > 0 ? (
                                            <div className="h-[320px] w-full">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <BarChart
                                                        data={ordersChartData}
                                                        margin={{
                                                            top: 15,
                                                            right: 10,
                                                            left: -15,
                                                            bottom: 0,
                                                        }}
                                                    >
                                                        <CartesianGrid
                                                            strokeDasharray="3 3"
                                                            vertical={false}
                                                            stroke="#F0EAF6"
                                                        />

                                                        <XAxis
                                                            dataKey="label"
                                                            tick={{
                                                                fontSize: 11,
                                                                fill: "#9CA3AF",
                                                            }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            minTickGap={20}
                                                        />

                                                        <YAxis
                                                            allowDecimals={false}
                                                            tick={{
                                                                fontSize: 11,
                                                                fill: "#9CA3AF",
                                                            }}
                                                            tickLine={false}
                                                            axisLine={false}
                                                        />

                                                        <Tooltip />
                                                        <Legend />

                                                        <Bar
                                                            dataKey="prepaidOrders"
                                                            name="Razorpay"
                                                            fill="#7D45C2"
                                                            radius={[5, 5, 0, 0]}
                                                            maxBarSize={28}
                                                        />

                                                        <Bar
                                                            dataKey="codOrders"
                                                            name="COD"
                                                            fill="#F59E0B"
                                                            radius={[5, 5, 0, 0]}
                                                            maxBarSize={28}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <EmptyState message="Order trend data is not available" />
                                        )}
                                    </SectionCard>

                                    {/* Order Status Donut */}
                                    <SectionCard
                                        title="Order Status Distribution"
                                        subtitle="Distribution of placed orders"
                                    >
                                        {orderPieData.length > 0 ? (
                                            <div className="h-[320px] w-full">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <PieChart>
                                                        <Pie
                                                            data={orderPieData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="45%"
                                                            innerRadius={65}
                                                            outerRadius={100}
                                                            paddingAngle={3}
                                                            stroke="none"
                                                        >
                                                            {orderPieData.map(
                                                                (item) => (
                                                                    <Cell
                                                                        key={item.name}
                                                                        fill={item.color}
                                                                    />
                                                                )
                                                            )}
                                                        </Pie>

                                                        <Tooltip />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <EmptyState message="No order status data available" />
                                        )}
                                    </SectionCard>

                                    {/* Payment Collection Donut */}
                                    <SectionCard
                                        title="Payment Collection"
                                        subtitle="Paid order value and outstanding COD"
                                    >
                                        {paymentPieData.length > 0 ? (
                                            <div className="h-[320px] w-full">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <PieChart>
                                                        <Pie
                                                            data={paymentPieData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            cx="50%"
                                                            cy="45%"
                                                            innerRadius={65}
                                                            outerRadius={100}
                                                            paddingAngle={3}
                                                            stroke="none"
                                                        >
                                                            {paymentPieData.map(
                                                                (item) => (
                                                                    <Cell
                                                                        key={item.name}
                                                                        fill={item.color}
                                                                    />
                                                                )
                                                            )}
                                                        </Pie>

                                                        <Tooltip
                                                            formatter={(value) =>
                                                                formatCurrency(value)
                                                            }
                                                        />

                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <EmptyState message="No payment collection data available" />
                                        )}
                                    </SectionCard>
                                </div>
                            </section>

                            {/* Shiprocket */}
                            <section className="mt-9">
                                <SectionCard
                                    title="Shiprocket Shipment Overview"
                                    subtitle="Shipment progress for placed orders"
                                    action={
                                        <Truck
                                            size={21}
                                            className="text-[#7D45C2]"
                                        />
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                                        {shipmentStatusEntries.map(
                                            (status) => (
                                                <ProgressRow
                                                    key={status}
                                                    label={
                                                        SHIPMENT_LABELS[
                                                        status
                                                        ]
                                                    }
                                                    count={
                                                        shipmentStatuses[
                                                        status
                                                        ] || 0
                                                    }
                                                    total={
                                                        totalShipmentOrders
                                                    }
                                                    color={
                                                        status ===
                                                            "delivered"
                                                            ? "#22C55E"
                                                            : status ===
                                                                "failed"
                                                                ? "#EF4444"
                                                                : status ===
                                                                    "not_created"
                                                                    ? "#94A3B8"
                                                                    : PRIMARY
                                                    }
                                                />
                                            )
                                        )}
                                    </div>
                                </SectionCard>
                            </section>

                            {/* Recent Orders */}
                            <section className="mt-9">
                                <SectionCard
                                    title="Recent Orders"
                                    subtitle="Latest customer purchases"
                                    action={
                                        <Link
                                            href="/admin/orders"
                                            className="flex items-center gap-1 text-sm font-medium text-[#7D45C2]"
                                        >
                                            View All
                                            <ArrowRight
                                                size={15}
                                            />
                                        </Link>
                                    }
                                >
                                    {recentOrders.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full min-w-[850px] text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 text-xs uppercase text-gray-400">
                                                        <th className="pb-4 font-medium">
                                                            Order
                                                        </th>
                                                        <th className="pb-4 font-medium">
                                                            Customer
                                                        </th>
                                                        <th className="pb-4 font-medium">
                                                            Amount
                                                        </th>
                                                        <th className="pb-4 font-medium">
                                                            Payment
                                                        </th>
                                                        <th className="pb-4 font-medium">
                                                            Status
                                                        </th>
                                                        <th className="pb-4 font-medium">
                                                            Date
                                                        </th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {recentOrders.map(
                                                        (order) => (
                                                            <tr
                                                                key={
                                                                    order._id
                                                                }
                                                                className="border-b border-gray-50 last:border-0"
                                                            >
                                                                <td className="py-4">
                                                                    <Link
                                                                        href={`/admin/orders/${order._id}`}
                                                                        className="text-sm font-semibold text-[#7D45C2] hover:underline"
                                                                    >
                                                                        {
                                                                            order.orderNumber
                                                                        }
                                                                    </Link>
                                                                </td>

                                                                <td className="py-4">
                                                                    <p className="text-sm font-medium text-gray-700">
                                                                        {
                                                                            order.customerName
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-gray-400">
                                                                        {
                                                                            order.customerEmail
                                                                        }
                                                                    </p>
                                                                </td>

                                                                <td className="py-4 text-sm font-semibold text-gray-800">
                                                                    {formatCurrency(
                                                                        order.totalAmount
                                                                    )}
                                                                </td>

                                                                <td className="py-4">
                                                                    <p className="mb-1 text-xs font-semibold uppercase text-gray-500">
                                                                        {
                                                                            order.paymentMethod
                                                                        }
                                                                    </p>

                                                                    <StatusBadge
                                                                        status={
                                                                            order.paymentStatus
                                                                        }
                                                                    />
                                                                </td>

                                                                <td className="py-4">
                                                                    <StatusBadge
                                                                        status={
                                                                            order.orderStatus
                                                                        }
                                                                    />
                                                                </td>

                                                                <td className="py-4 text-xs text-gray-400">
                                                                    {formatDate(
                                                                        order.createdAt
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        )
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <EmptyState message="No recent orders found" />
                                    )}
                                </SectionCard>
                            </section>

                            {/* Quick Actions */}
                            <section className="mt-9">
                                <div className="mb-4">
                                    <h2 className="text-xl font-semibold text-[#24202B]">
                                        Quick Actions
                                    </h2>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Jump directly to the
                                        section you need.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {quickLinks.map(
                                        (item) => {
                                            const Icon =
                                                item.icon;

                                            return (
                                                <Link
                                                    key={
                                                        item.title
                                                    }
                                                    href={
                                                        item.href
                                                    }
                                                    className="group flex items-center gap-4 rounded-2xl border border-[#E9DFF5] bg-white p-5 transition hover:border-[#D5BCEF] hover:shadow-lg hover:shadow-purple-100 sm:p-6"
                                                >
                                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F7F2FC] text-[#7D45C2] transition group-hover:bg-[#7D45C2] group-hover:text-white">
                                                        <Icon
                                                            size={
                                                                22
                                                            }
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-base font-semibold text-[#24202B]">
                                                            {
                                                                item.title
                                                            }
                                                        </h3>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {
                                                                item.description
                                                            }
                                                        </p>
                                                    </div>

                                                    <ArrowUpRight
                                                        size={19}
                                                        className="shrink-0 text-gray-400 transition group-hover:text-[#7D45C2]"
                                                    />
                                                </Link>
                                            );
                                        }
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
