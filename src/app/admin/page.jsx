
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    Package,
    ShoppingCart,
    MessageSquareText,
    Newspaper,
    ArrowUpRight,
    Plus,
    Users,
    IndianRupee,
    Star,
    TrendingUp,
    RefreshCw,
    Wallet,
    AlertCircle,
    ArrowRight,
} from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
} from "recharts";

const PRIMARY = "#7D45C2";

const COLORS = [
    "#7D45C2",
    "#B388EB",
    "#F5A623",
    "#22C55E",
    "#EF4444",
    "#60A5FA",
    "#94A3B8",
];

const PERIOD_OPTIONS = [
    { label: "Last 7 Days", value: "7days" },
    { label: "Last 30 Days", value: "30days" },
    { label: "Last 12 Months", value: "12months" },
];

const formatNumber = (value) =>
    new Intl.NumberFormat("en-IN").format(Number(value || 0));

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

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

            <h3 className="mt-2 text-2xl font-bold text-[#24202B] sm:text-3xl">
                {value}
            </h3>

            <p className="mt-2 text-xs text-gray-400">
                {description}
            </p>
        </Link>
    );
}

function SectionCard({ title, subtitle, children, action }) {
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

function EmptyState({ message = "No data available yet" }) {
    return (
        <div className="flex min-h-[240px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F7F2FC]">
                <Package size={22} className="text-[#7D45C2]" />
            </div>

            <p className="text-sm text-gray-400">{message}</p>
        </div>
    );
}

function CustomTooltip({ active, payload, label, currency = false }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-xl">
            <p className="mb-2 text-xs font-medium text-gray-500">
                {label}
            </p>

            {payload.map((item, index) => (
                <p
                    key={index}
                    className="text-sm font-semibold"
                    style={{ color: item.color || PRIMARY }}
                >
                    {item.name}:{" "}
                    {currency
                        ? formatCurrency(item.value)
                        : formatNumber(item.value)}
                </p>
            ))}
        </div>
    );
}

function StatusBadge({ status }) {
    const normalized = String(status || "pending").toLowerCase();

    const styles = {
        delivered: "bg-green-50 text-green-700",
        completed: "bg-green-50 text-green-700",
        paid: "bg-green-50 text-green-700",
        shipped: "bg-blue-50 text-blue-700",
        processing: "bg-purple-50 text-purple-700",
        confirmed: "bg-purple-50 text-purple-700",
        pending: "bg-amber-50 text-amber-700",
        created: "bg-amber-50 text-amber-700",
        cancelled: "bg-red-50 text-red-600",
        canceled: "bg-red-50 text-red-600",
        failed: "bg-red-50 text-red-600",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[normalized] || "bg-gray-100 text-gray-600"
                }`}
        >
            {normalized.replaceAll("_", " ")}
        </span>
    );
}

const quickLinks = [
    {
        title: "Add Product",
        description: "Add products to your store",
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
        description: "Manage customer orders",
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
    const [period, setPeriod] = useState("30days");
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchDashboard = useCallback(
        async (showRefresh = false, signal) => {
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
                        data.message || "Unable to fetch dashboard"
                    );
                }

                setDashboard(data);
            } catch (err) {
                if (
                    err.code === "ERR_CANCELED" ||
                    err.name === "CanceledError"
                ) {
                    return;
                }

                console.error("Dashboard fetch error:", err);

                setError(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load dashboard"
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
        const controller = new AbortController();

        fetchDashboard(false, controller.signal);

        return () => controller.abort();
    }, [fetchDashboard]);

    const stats = dashboard?.stats || {};
    const salesChart = dashboard?.salesChart || [];
    const orderStatuses = dashboard?.orderStatuses || [];
    const recentOrders = dashboard?.recentOrders || [];
    const topProducts = dashboard?.topProducts || [];
    console.log(recentOrders)
    const totalStatusOrders = orderStatuses.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
    );

    const hasSales = salesChart.some(
        (item) => item.revenue > 0 || item.orders > 0
    );

    const statCards = [
        {
            title: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            description: "Lifetime captured payments",
            icon: IndianRupee,
            href: "/admin/orders",
            color: "bg-purple-100 text-[#7D45C2]",
        },
        {
            title: "Total Orders",
            value: formatNumber(stats.totalOrders),
            description: "All customer orders",
            icon: ShoppingCart,
            href: "/admin/orders",
            color: "bg-blue-100 text-blue-600",
        },
        {
            title: "Total Products",
            value: formatNumber(stats.totalProducts),
            description: "Products in your store",
            icon: Package,
            href: "/admin/products",
            color: "bg-amber-100 text-amber-600",
        },
        {
            title: "Total Customers",
            value: formatNumber(stats.totalCustomers),
            description: "Registered customers",
            icon: Users,
            href: "/admin/users",
            color: "bg-emerald-100 text-emerald-600",
        },
        {
            title: "Total Inquiries",
            value: formatNumber(stats.totalInquiries),
            description: "Customer inquiries",
            icon: MessageSquareText,
            href: "/admin/inquiry",
            color: "bg-pink-100 text-pink-600",
        },
        {
            title: "Published Blogs",
            value: formatNumber(stats.publishedBlogs),
            description: "Published articles",
            icon: Newspaper,
            href: "/admin/blogs",
            color: "bg-indigo-100 text-indigo-600",
        },
        {
            title: "Pending Reviews",
            value: formatNumber(stats.pendingReviews),
            description: "Awaiting moderation",
            icon: Star,
            href: "/admin/products",
            color: "bg-orange-100 text-orange-600",
        },
        {
            title: "Average Order Value",
            value: formatCurrency(stats.averageOrderValue),
            description: "Revenue per paid order",
            icon: Wallet,
            href: "/admin/orders",
            color: "bg-teal-100 text-teal-600",
        },
    ];

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

                            <h1 className="text-3xl tracking-wide text-[#24202B] sm:text-4xl">
                                Admin Dashboard
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Monitor your store performance and manage
                                your business.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={() => fetchDashboard(true)}
                                disabled={loading || refreshing}
                                className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E9DFF5] bg-white px-4 text-sm font-medium text-gray-600 transition hover:bg-purple-50 disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={16}
                                    className={
                                        refreshing ? "animate-spin" : ""
                                    }
                                />
                                Refresh
                            </button>

                            <Link
                                href="/admin/products"
                                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#7D45C2] px-5 text-sm font-semibold text-white! transition hover:bg-[#6935AA]"
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
                                onClick={() => fetchDashboard(true)}
                                className="text-sm font-semibold text-red-700 underline"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {loading && !dashboard ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-44 animate-pulse rounded-2xl bg-white"
                                />
                            ))}
                        </div>
                    ) : !dashboard ? (
                        <EmptyState message="Dashboard data is unavailable" />
                    ) : (
                        <>
                            {/* Statistics */}
                            <section>
                                <div className="mb-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-[#24202B]">
                                        Store Overview
                                    </h2>

                                    <span className="text-xs text-gray-400">
                                        Live database statistics
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                    {statCards.map((stat) => (
                                        <StatCard
                                            key={stat.title}
                                            {...stat}
                                        />
                                    ))}
                                </div>
                            </section>

                            {/* Graphs */}
                            <section className="mt-9">
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-[#24202B]">
                                            Sales Analytics
                                        </h2>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Revenue and sales performance
                                        </p>
                                    </div>

                                    <select
                                        value={period}
                                        onChange={(e) =>
                                            setPeriod(e.target.value)
                                        }
                                        className="rounded-xl border border-[#E9DFF5] bg-white px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[#7D45C2]"
                                    >
                                        {PERIOD_OPTIONS.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                                    {/* Revenue Chart */}
                                    <div className="min-w-0 xl:col-span-2">
                                        <SectionCard
                                            title="Revenue Overview"
                                            subtitle="Captured payment revenue in INR"
                                            action={
                                                <TrendingUp
                                                    size={20}
                                                    className="text-[#7D45C2]"
                                                />
                                            }
                                        >
                                            {hasSales ? (
                                                <div className="h-[300px] w-full sm:h-[350px]">
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <AreaChart
                                                            data={salesChart}
                                                            margin={{
                                                                top: 10,
                                                                right: 8,
                                                                left: -15,
                                                                bottom: 0,
                                                            }}
                                                        >
                                                            <defs>
                                                                <linearGradient
                                                                    id="revenueGradient"
                                                                    x1="0"
                                                                    y1="0"
                                                                    x2="0"
                                                                    y2="1"
                                                                >
                                                                    <stop
                                                                        offset="0%"
                                                                        stopColor={PRIMARY}
                                                                        stopOpacity={0.28}
                                                                    />
                                                                    <stop
                                                                        offset="95%"
                                                                        stopColor={PRIMARY}
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
                                                                minTickGap={25}
                                                            />

                                                            <YAxis
                                                                tick={{
                                                                    fontSize: 11,
                                                                    fill: "#9CA3AF",
                                                                }}
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tickFormatter={(v) =>
                                                                    v >= 1000
                                                                        ? `${(v / 1000).toFixed(0)}k`
                                                                        : v
                                                                }
                                                            />

                                                            <Tooltip
                                                                content={
                                                                    <CustomTooltip currency />
                                                                }
                                                            />

                                                            <Area
                                                                type="monotone"
                                                                dataKey="revenue"
                                                                name="Revenue"
                                                                stroke={PRIMARY}
                                                                strokeWidth={3}
                                                                fill="url(#revenueGradient)"
                                                                activeDot={{
                                                                    r: 6,
                                                                }}
                                                            />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <EmptyState message="No captured sales in this period" />
                                            )}
                                        </SectionCard>
                                    </div>

                                    {/* Order Status Chart */}
                                    <SectionCard
                                        title="Order Distribution"
                                        subtitle="All-time orders by status"
                                    >
                                        {totalStatusOrders > 0 ? (
                                            <>
                                                <div className="h-[230px] w-full">
                                                    <ResponsiveContainer
                                                        width="100%"
                                                        height="100%"
                                                    >
                                                        <PieChart>
                                                            <Pie
                                                                data={orderStatuses}
                                                                cx="50%"
                                                                cy="50%"
                                                                innerRadius={65}
                                                                outerRadius={90}
                                                                paddingAngle={3}
                                                                dataKey="value"
                                                                nameKey="name"
                                                                stroke="none"
                                                            >
                                                                {orderStatuses.map(
                                                                    (_, index) => (
                                                                        <Cell
                                                                            key={index}
                                                                            fill={
                                                                                COLORS[
                                                                                index %
                                                                                COLORS.length
                                                                                ]
                                                                            }
                                                                        />
                                                                    )
                                                                )}
                                                            </Pie>

                                                            <Tooltip />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>

                                                <div className="space-y-3">
                                                    {orderStatuses.map(
                                                        (item, index) => (
                                                            <div
                                                                key={item.name}
                                                                className="flex items-center justify-between gap-3 text-sm"
                                                            >
                                                                <div className="flex min-w-0 items-center gap-2">
                                                                    <span
                                                                        className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                                        style={{
                                                                            backgroundColor:
                                                                                COLORS[
                                                                                index %
                                                                                COLORS.length
                                                                                ],
                                                                        }}
                                                                    />

                                                                    <span className="truncate capitalize text-gray-600">
                                                                        {item.name.replaceAll(
                                                                            "_",
                                                                            " "
                                                                        )}
                                                                    </span>
                                                                </div>

                                                                <span className="font-semibold text-[#24202B]">
                                                                    {item.value}
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </>
                                        ) : (
                                            <EmptyState message="No orders available" />
                                        )}
                                    </SectionCard>
                                </div>

                                {/* Orders Chart */}
                                <div className="mt-5">
                                    <SectionCard
                                        title="Paid Orders Trend"
                                        subtitle="Unique orders with captured payments"
                                    >
                                        {hasSales ? (
                                            <div className="h-[260px] w-full">
                                                <ResponsiveContainer
                                                    width="100%"
                                                    height="100%"
                                                >
                                                    <BarChart
                                                        data={salesChart}
                                                        margin={{
                                                            top: 10,
                                                            right: 8,
                                                            left: -20,
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
                                                            minTickGap={25}
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

                                                        <Tooltip
                                                            content={
                                                                <CustomTooltip />
                                                            }
                                                        />

                                                        <Bar
                                                            dataKey="orders"
                                                            name="Paid Orders"
                                                            fill={PRIMARY}
                                                            radius={[6, 6, 0, 0]}
                                                            maxBarSize={32}
                                                        />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        ) : (
                                            <EmptyState message="No paid orders in this period" />
                                        )}
                                    </SectionCard>
                                </div>
                            </section>

                            {/* Recent Orders and Top Products */}
                            <section className="mt-9 grid grid-cols-1 gap-5 xl:grid-cols-3">
                                <div className="min-w-0 xl:col-span-2">
                                    <SectionCard
                                        title="Recent Orders"
                                        subtitle="Latest customer purchases"
                                        action={
                                            <Link
                                                href="/admin/orders"
                                                className="flex items-center gap-1 text-sm font-medium text-[#7D45C2]"
                                            >
                                                View All
                                                <ArrowRight size={15} />
                                            </Link>
                                        }
                                    >
                                        {recentOrders.length > 0 ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[620px] text-left">
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
                                                            {/* <th className="pb-4 font-medium">
                                                                Status
                                                            </th> */}
                                                            <th className="pb-4 font-medium">
                                                                Date
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {recentOrders.map(
                                                            (order) => (
                                                                <tr
                                                                    key={order.id}
                                                                    className="border-b border-gray-50 last:border-0"
                                                                >
                                                                    <td className="py-4 text-sm font-semibold text-[#7D45C2]">
                                                                        #
                                                                        {String(
                                                                            order.orderNumber
                                                                        ).slice(-10)}
                                                                    </td>

                                                                    <td className="py-4 text-sm text-gray-600">
                                                                        {order.customer}
                                                                    </td>

                                                                    <td className="py-4 text-sm font-semibold text-gray-800">
                                                                        {formatCurrency(
                                                                            order.amount
                                                                        )}
                                                                    </td>

                                                                    {/* <td className="py-4">
                                                                        <StatusBadge
                                                                            status={
                                                                                order.status
                                                                            }
                                                                        />
                                                                    </td> */}

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
                                </div>

                                <SectionCard
                                    title="Top Selling Products"
                                    subtitle="By quantity ordered, excluding cancelled orders"
                                >
                                    {topProducts.length > 0 ? (
                                        <div className="space-y-5">
                                            {topProducts.map(
                                                (product, index) => {
                                                    const maxSold = Math.max(
                                                        ...topProducts.map(
                                                            (p) => p.sold
                                                        ),
                                                        1
                                                    );

                                                    const width =
                                                        (product.sold /
                                                            maxSold) *
                                                        100;

                                                    return (
                                                        <div key={product.id || index}>
                                                            <div className="mb-2 flex items-center justify-between gap-3">
                                                                <div className="flex min-w-0 items-center gap-3">
                                                                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7F2FC] text-xs font-bold text-[#7D45C2]">
                                                                        {index + 1}
                                                                    </span>

                                                                    <p className="truncate text-sm font-medium text-gray-700">
                                                                        {product.name}
                                                                    </p>
                                                                </div>

                                                                <span className="shrink-0 text-xs font-semibold text-gray-500">
                                                                    {product.sold} sold
                                                                </span>
                                                            </div>

                                                            <div className="h-2 overflow-hidden rounded-full bg-purple-50">
                                                                <div
                                                                    className="h-full rounded-full bg-[#7D45C2]"
                                                                    style={{
                                                                        width: `${width}%`,
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    ) : (
                                        <EmptyState message="No product sales yet" />
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
                                                className="group flex items-center gap-4 rounded-2xl border border-[#E9DFF5] bg-white p-5 transition hover:border-[#D5BCEF] hover:shadow-lg hover:shadow-purple-100 sm:p-6"
                                            >
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F7F2FC] text-[#7D45C2] transition group-hover:bg-[#7D45C2] group-hover:text-white">
                                                    <Icon size={22} />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base font-semibold text-[#24202B]">
                                                        {item.title}
                                                    </h3>

                                                    <p className="mt-1 text-sm text-gray-500">
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
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
