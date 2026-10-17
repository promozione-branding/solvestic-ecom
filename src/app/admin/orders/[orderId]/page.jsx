"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    ArrowLeft,
    Package,
    MapPin,
    CreditCard,
    Truck,
    RefreshCw,
    Save,
    ExternalLink,
    CheckCircle2,
} from "lucide-react";

const orderStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
];

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none focus:border-purple-500";

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

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-5">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="break-words text-sm font-medium sm:text-right">
                {value || "—"}
            </span>
        </div>
    );
}

export default function AdminOrderDetailsPage() {
    const params = useParams();
    const orderId = params.orderId;

    const [order, setOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const fetchOrder = useCallback(async () => {
        if (!orderId) return;

        setLoading(true);
        setError("");

        try {
            const { data } = await axios.get(
                `/api/admin/orders/${orderId}`
            );

            setOrder(data.order);
            setSelectedStatus(data.order.orderStatus);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load order."
            );
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleUpdateStatus = async (e) => {
        e.preventDefault();

        if (!order || selectedStatus === order.orderStatus) return;

        setSaving(true);
        setError("");
        setNotice("");

        try {
            const { data } = await axios.patch(
                `/api/admin/orders/${orderId}`,
                { orderStatus: selectedStatus }
            );

            setOrder(data.order);
            setSelectedStatus(data.order.orderStatus);
            setNotice(data.message || "Order status updated.");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to update order status."
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F7F2FC]">
                <Sidebar />
                <main className="flex min-h-screen items-center justify-center gap-3 p-5 lg:ml-72">
                    <RefreshCw className="animate-spin text-[#7D45C2]" />
                    <span className="text-sm text-gray-500">
                        Loading order...
                    </span>
                </main>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[#F7F2FC]">
                <Sidebar />
                <main className="p-5 lg:ml-72 lg:p-8">
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#7D45C2]"
                    >
                        <ArrowLeft size={17} />
                        Back to orders
                    </Link>

                    <div className="mt-6 rounded-2xl border border-red-100 bg-white p-8 text-center">
                        <h1 className="text-xl font-bold">
                            Unable to load order
                        </h1>
                        <p className="mt-2 text-sm text-gray-500">
                            {error || "This order could not be found."}
                        </p>
                        <button
                            type="button"
                            onClick={fetchOrder}
                            className="mt-5 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white"
                        >
                            Try again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const address = order.shippingAddress || {};
    const shipment = order.shipment || {};

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#7D45C2] hover:underline"
                    >
                        <ArrowLeft size={17} />
                        Back to orders
                    </Link>

                    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#7D45C2]">
                                ORDER DETAILS
                            </p>
                            <h1 className="mt-1 break-all text-2xl font-bold sm:text-3xl">
                                {order.orderNumber}
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Placed on {formatDate(order.createdAt)}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchOrder}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:bg-gray-50"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </header>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {notice && (
                        <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            <CheckCircle2 size={18} />
                            {notice}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Order total
                            </p>
                            <p className="mt-2 text-2xl font-bold">
                                {formatPrice(order.totalAmount)}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Payment status
                            </p>
                            <p className="mt-2 text-lg font-bold capitalize">
                                {(order.paymentStatus || "pending").replaceAll(
                                    "_",
                                    " "
                                )}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                                Method: {(order.paymentMethod || "—").toUpperCase()}
                            </p>
                        </div>

                        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                            <p className="text-sm text-gray-500">
                                Order status
                            </p>
                            <p className="mt-2 text-lg font-bold capitalize">
                                {(order.orderStatus || "pending").replaceAll(
                                    "_",
                                    " "
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
                        <div className="space-y-6">
                            <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b border-gray-100 p-5">
                                    <Package
                                        className="text-[#7D45C2]"
                                        size={21}
                                    />
                                    <h2 className="text-lg font-bold">
                                        Ordered products
                                    </h2>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {(order.items || []).map((item, index) => (
                                        <div
                                            key={`${item.productId || item.slug || item.name}-${index}`}
                                            className="flex gap-4 p-4 sm:p-5"
                                        >
                                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                                {item.image ? (
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name || "Product"}
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
                                                <p className="font-semibold">
                                                    {item.name || "Product"}
                                                </p>
                                                {item.variant && (
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Variant: {item.variant}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-sm text-gray-500">
                                                    Quantity: {item.quantity}
                                                </p>
                                                <p className="mt-2 text-sm font-semibold text-[#7D45C2]">
                                                    {formatPrice(item.unitPrice)} each
                                                </p>
                                            </div>

                                            <p className="shrink-0 text-right text-sm font-bold">
                                                {formatPrice(item.lineTotal)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 border-t border-gray-100 bg-[#FAF8FD] p-5">
                                    <InfoRow
                                        label="Subtotal"
                                        value={formatPrice(order.subtotal)}
                                    />
                                    <InfoRow
                                        label="Shipping fee"
                                        value={formatPrice(order.shippingFee)}
                                    />
                                    <InfoRow
                                        label="Discount"
                                        value={`−${formatPrice(order.discount)}`}
                                    />
                                    <div className="flex items-center justify-between gap-4 pt-2">
                                        <span className="font-bold">
                                            Grand total
                                        </span>
                                        <span className="text-xl font-bold text-[#7D45C2]">
                                            {formatPrice(order.totalAmount)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-3">
                                    <MapPin
                                        className="text-[#7D45C2]"
                                        size={21}
                                    />
                                    <h2 className="text-lg font-bold">
                                        Shipping address
                                    </h2>
                                </div>

                                <InfoRow
                                    label="Full name"
                                    value={address.fullName}
                                />
                                <InfoRow
                                    label="Mobile"
                                    value={address.mobile}
                                />
                                <InfoRow
                                    label="Address"
                                    value={[
                                        address.addressLine1,
                                        address.addressLine2,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                />
                                <InfoRow label="City" value={address.city} />
                                <InfoRow label="State" value={address.state} />
                                <InfoRow
                                    label="Country"
                                    value={address.country}
                                />
                                <InfoRow
                                    label="Pincode"
                                    value={address.pincode}
                                />
                            </section>

                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-3">
                                    <Truck
                                        className="text-[#7D45C2]"
                                        size={21}
                                    />
                                    <h2 className="text-lg font-bold">
                                        Shipment information
                                    </h2>
                                </div>

                                <InfoRow
                                    label="Courier"
                                    value={shipment.courierName}
                                />
                                <InfoRow
                                    label="AWB / Tracking number"
                                    value={shipment.awbCode}
                                />
                                <InfoRow
                                    label="Shipment status"
                                    value={shipment.currentStatusText || shipment.status}
                                />
                                <InfoRow
                                    label="Estimated delivery"
                                    value={shipment.estimatedDeliveryDate
                                        ? formatDate(shipment.estimatedDeliveryDate)
                                        : "—"}
                                />

                                {shipment.trackingUrl && (
                                    <a
                                        href={shipment.trackingUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-sm font-semibold text-[#7D45C2] hover:bg-purple-50"
                                    >
                                        Track shipment
                                        <ExternalLink size={16} />
                                    </a>
                                )}

                                {shipment.lastError && (
                                    <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                        Shipment note: {shipment.lastError}
                                    </p>
                                )}
                            </section>
                        </div>

                        <aside className="space-y-6">
                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <RefreshCw
                                        className="text-[#7D45C2]"
                                        size={20}
                                    />
                                    <h2 className="text-lg font-bold">
                                        Update order
                                    </h2>
                                </div>

                                <form
                                    onSubmit={handleUpdateStatus}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Order status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) =>
                                                setSelectedStatus(e.target.value)
                                            }
                                            className={`${inputClass} capitalize`}
                                        >
                                            {orderStatuses.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {status.replaceAll("_", " ")}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={
                                            saving ||
                                            selectedStatus === order.orderStatus
                                        }
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6937A8] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <RefreshCw
                                                size={17}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Save size={17} />
                                        )}
                                        {saving ? "Saving..." : "Save status"}
                                    </button>
                                </form>
                            </section>

                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-3">
                                    <CreditCard
                                        className="text-[#7D45C2]"
                                        size={20}
                                    />
                                    <h2 className="text-lg font-bold">
                                        Customer & payment
                                    </h2>
                                </div>

                                <InfoRow
                                    label="Customer"
                                    value={address.fullName}
                                />
                                <InfoRow
                                    label="Email"
                                    value={order.customerEmail}
                                />
                                <InfoRow
                                    label="Mobile"
                                    value={address.mobile}
                                />
                                <InfoRow
                                    label="Payment method"
                                    value={order.paymentMethod?.toUpperCase()}
                                />
                                <InfoRow
                                    label="Payment status"
                                    value={order.paymentStatus?.replaceAll(
                                        "_",
                                        " "
                                    )}
                                />
                                <InfoRow
                                    label="Paid at"
                                    value={order.paidAt
                                        ? formatDate(order.paidAt)
                                        : "—"}
                                />
                                <InfoRow
                                    label="Cancelled at"
                                    value={order.cancelledAt
                                        ? formatDate(order.cancelledAt)
                                        : "—"}
                                />
                            </section>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}