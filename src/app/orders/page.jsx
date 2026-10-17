
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    Package,
    CalendarDays,
    Loader2,
    ShoppingBag,
    Truck,
} from "lucide-react";

export default function OrdersPage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useSelector(
        (state) => state.auth
    );

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchOrders() {
            try {
                const { data } = await axios.get("/api/user/orders", {
                    withCredentials: true,
                });

                if (!cancelled && data.success) {
                    setOrders(data.orders || []);
                } else if (!cancelled) {
                    setError(data.message || "Unable to load orders.");
                }
            } catch (err) {
                if (cancelled) return;

                if (err.response?.status === 401) {
                    router.replace("/account/login");
                    return;
                }

                setError(
                    err.response?.data?.message || "Unable to load your orders."
                );
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        if (!isLoading) {
            if (isAuthenticated && user) {
                fetchOrders();
            } else {
                router.replace("/account/login");
            }
        }

        return () => {
            cancelled = true;
        };
    }, [isLoading, isAuthenticated, user, router]);

    const formatPrice = (amount, currency = "INR") =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency,
            maximumFractionDigits: 2,
        }).format(Number(amount || 0));

    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            })
            : "Date unavailable";

    const statusClass = (status) => {
        switch ((status || "").toLowerCase()) {
            case "delivered":
            case "paid":
                return "bg-green-50 text-green-700";
            case "cancelled":
            case "failed":
            case "returned":
            case "lost":
                return "bg-red-50 text-red-600";
            case "shipped":
            case "in_transit":
            case "out_for_delivery":
                return "bg-blue-50 text-blue-700";
            default:
                return "bg-amber-50 text-amber-700";
        }
    };

    if (isLoading || loading) {
        return (
            <div className="flex min-h-[65vh] items-center justify-center bg-[#F7F2FC]">
                <Loader2 className="h-9 w-9 animate-spin text-[#7D45C2]" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/account"
                    className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-[#7D45C2]"
                >
                    <ArrowLeft size={17} /> Back to My Account
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 rounded-3xl bg-[#7D45C2] p-6 text-white sm:p-9"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                            <ShoppingBag size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold sm:text-3xl">
                                My Orders
                            </h1>
                            <p className="mt-2 text-sm text-white/80">
                                View your purchases and track your deliveries.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {!error && orders.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-[#E9DDF5] bg-white px-6 text-center shadow-sm">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2]">
                            <Package size={30} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            No orders yet
                        </h2>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                            Your purchases will appear here once you place an order.
                        </p>
                        <Link
                            href="/our-products"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6937AA]"
                        >
                            Explore Products <ArrowRight size={17} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-5">
                        <p className="text-sm text-gray-500">
                            {orders.length} {orders.length === 1 ? "order" : "orders"} found
                        </p>

                        {orders.map((order) => {
                            const items = order.items || [];
                            const itemCount = items.reduce(
                                (sum, item) => sum + Number(item.quantity || 0),
                                0
                            );

                            return (
                                <Link
                                    key={order._id}
                                    href={`/orders/${order._id}`}
                                    className="block rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm transition hover:border-[#7D45C2] hover:shadow-md sm:p-7"
                                >
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                                Order Number
                                            </p>
                                            <h2 className="mt-1 break-all text-base font-bold text-gray-900">
                                                {order.orderNumber}
                                            </h2>
                                            <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                                <CalendarDays size={15} />
                                                {formatDate(order.createdAt)}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusClass(order.orderStatus)}`}>
                                                {(order.orderStatus || "pending").replaceAll("_", " ")}
                                            </span>
                                            <span className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusClass(order.paymentStatus)}`}>
                                                Payment: {(order.paymentStatus || "pending").replaceAll("_", " ")}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="my-5 border-t border-gray-100" />

                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div
                                                key={`${item.productId || item.slug || item.name}-${index}`}
                                                className="flex items-center gap-4"
                                            >
                                                {item.image ? (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name || "Product"}
                                                        className="h-16 w-16 shrink-0 rounded-xl border border-gray-100 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#F7F2FC] text-[#7D45C2]">
                                                        <Package size={23} />
                                                    </div>
                                                )}

                                                <div className="min-w-0 flex-1">
                                                    <p className="font-semibold text-gray-900">
                                                        {item.name || "Product"}
                                                    </p>
                                                    {item.variant && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {item.variant}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Qty: {item.quantity}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-sm font-semibold text-gray-900">
                                                    {formatPrice(
                                                        item.lineTotal ??
                                                        Number(item.unitPrice || 0) * Number(item.quantity || 0),
                                                        order.currency
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="my-5 border-t border-gray-100" />

                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                        <div className="text-sm text-gray-500">
                                            <p>{itemCount} {itemCount === 1 ? "item" : "items"}</p>
                                            <p className="mt-1">
                                                {order.paymentMethod === "razorpay"
                                                    ? "Online Payment"
                                                    : "Cash on Delivery"}
                                            </p>

                                            {order.shipment?.trackingUrl && (
                                                <a
                                                    href={order.shipment.trackingUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="mt-3 inline-flex items-center gap-1.5 font-semibold text-[#7D45C2] hover:underline"
                                                >
                                                    <Truck size={16} /> Track Shipment
                                                </a>
                                            )}
                                        </div>

                                        <div className="sm:text-right">
                                            <p className="text-xs text-gray-400">
                                                Total Amount
                                            </p>
                                            <p className="mt-1 text-2xl font-bold text-gray-900">
                                                {formatPrice(order.totalAmount, order.currency)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </main>
    );
}
