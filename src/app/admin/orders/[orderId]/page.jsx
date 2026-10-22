
"use client";

import React, {
    useCallback,
    useEffect,
    useState,
} from "react";
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
    Banknote,
    AlertCircle,
    Clock3,
    CalendarDays,
    ShieldCheck,
    XCircle,
    ChevronDown,
} from "lucide-react";

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10";

const STATUS_TRANSITIONS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped", "cancelled"],
    shipped: ["delivered", "returned"],
    delivered: ["returned"],
    cancelled: [],
    returned: [],
};

const ACTIVE_SHIPMENT_STATUSES = [
    "created",
    "pickup_scheduled",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "rto",
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

function InfoRow({ label, value }) {
    return (
        <div className="flex flex-col gap-1 border-b border-gray-100 py-3 last:border-0 sm:flex-row sm:justify-between sm:gap-5">
            <span className="text-sm text-gray-500">
                {label}
            </span>

            <span className="break-words text-sm font-medium sm:text-right">
                {value === null ||
                    value === undefined ||
                    value === ""
                    ? "—"
                    : value}
            </span>
        </div>
    );
}

function StatusBadge({ value }) {
    const colors = {
        pending: "bg-amber-50 text-amber-700",
        confirmed: "bg-blue-50 text-blue-700",
        processing:
            "bg-purple-50 text-purple-700",
        shipped: "bg-indigo-50 text-indigo-700",
        delivered: "bg-green-50 text-green-700",
        cancelled: "bg-red-50 text-red-700",
        returned: "bg-orange-50 text-orange-700",
        paid: "bg-green-50 text-green-700",
        failed: "bg-red-50 text-red-700",
        refunded: "bg-gray-100 text-gray-700",
        partially_refunded:
            "bg-orange-50 text-orange-700",
    };

    return (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colors[value] ||
                "bg-gray-100 text-gray-600"
                }`}
        >
            {formatLabel(value)}
        </span>
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = "text-[#7D45C2]",
}) {
    return (
        <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-gray-500">
                    {title}
                </p>

                <Icon
                    size={21}
                    className={iconColor}
                />
            </div>

            <p className="mt-3 break-words text-xl font-bold sm:text-2xl">
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

function getAllowedStatuses(order) {
    if (!order) return [];

    const currentStatus = order.orderStatus;

    let allowed = [
        ...(STATUS_TRANSITIONS[
            currentStatus
        ] || []),
    ];

    // Razorpay must be paid before fulfillment.
    if (
        order.paymentMethod === "razorpay" &&
        order.paymentStatus !== "paid"
    ) {
        allowed = allowed.filter(
            (status) => status === "cancelled"
        );
    }

    // COD is confirmed during checkout.
    if (
        order.paymentMethod === "cod" &&
        currentStatus === "pending"
    ) {
        allowed = allowed.filter(
            (status) => status !== "confirmed"
        );
    }

    const shipment = order.shipment || {};

    const hasActiveShipment =
        Boolean(shipment.shiprocketOrderId) ||
        Boolean(shipment.awbCode) ||
        ACTIVE_SHIPMENT_STATUSES.includes(
            shipment.status
        );

    // Cancellation requires shipment and
    // refund handling first.
    if (
        hasActiveShipment ||
        order.paymentStatus === "paid"
    ) {
        allowed = allowed.filter(
            (status) => status !== "cancelled"
        );
    }

    // Must create Shiprocket shipment first.
    if (!shipment.shiprocketOrderId) {
        allowed = allowed.filter(
            (status) => status !== "shipped"
        );
    }

    // Delivery must be confirmed by Shiprocket.
    if (shipment.status !== "delivered") {
        allowed = allowed.filter(
            (status) => status !== "delivered"
        );
    }

    return allowed;
}

export default function AdminOrderDetailsPage() {
    const params = useParams();
    const orderId = params?.orderId;

    const [order, setOrder] = useState(null);

    const [selectedStatus, setSelectedStatus] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [collectingCOD, setCollectingCOD] =
        useState(false);

    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    const fetchOrder = useCallback(
        async (signal) => {
            if (!orderId) return;

            setLoading(true);
            setError("");

            try {
                const { data } = await axios.get(
                    `/api/admin/orders/${orderId}`,
                    { signal }
                );

                if (!data.success || !data.order) {
                    throw new Error(
                        data.message ||
                        "Order not found."
                    );
                }

                setOrder(data.order);

                setSelectedStatus(
                    data.order.orderStatus
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
                    "Failed to load order."
                );
            } finally {
                if (!signal?.aborted) {
                    setLoading(false);
                }
            }
        },
        [orderId]
    );

    useEffect(() => {
        const controller =
            new AbortController();

        fetchOrder(controller.signal);

        return () => controller.abort();
    }, [fetchOrder]);

    const refreshOrder = () => {
        setNotice("");
        fetchOrder();
    };

    const handleUpdateStatus = async (event) => {
        event.preventDefault();

        if (
            !order ||
            !selectedStatus ||
            selectedStatus === order.orderStatus
        ) {
            return;
        }

        const allowed =
            getAllowedStatuses(order);

        if (!allowed.includes(selectedStatus)) {
            setError(
                "This status transition is not allowed."
            );
            return;
        }

        if (selectedStatus === "cancelled") {
            const confirmed = window.confirm(
                "Are you sure you want to cancel this order?"
            );

            if (!confirmed) return;
        }

        setSaving(true);
        setError("");
        setNotice("");

        try {
            const { data } = await axios.patch(
                `/api/admin/orders/${orderId}`,
                {
                    action: "update_status",
                    orderStatus: selectedStatus,
                }
            );

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Failed to update status."
                );
            }

            setOrder(data.order);

            setSelectedStatus(
                data.order.orderStatus
            );

            setNotice(
                data.message ||
                "Order status updated successfully."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to update order status."
            );

            // Refresh to pick up concurrent updates.
            try {
                const { data } = await axios.get(
                    `/api/admin/orders/${orderId}`
                );

                if (data.order) {
                    setOrder(data.order);
                    setSelectedStatus(
                        data.order.orderStatus
                    );
                }
            } catch {
                // Keep the current page visible.
            }
        } finally {
            setSaving(false);
        }
    };

    const handleCollectCOD = async () => {
        if (!order) return;

        if (
            order.paymentMethod !== "cod" ||
            order.paymentStatus !== "pending"
        ) {
            return;
        }

        const confirmed = window.confirm(
            `Confirm that ${formatPrice(
                order.totalAmount
            )} has actually been collected for order ${order.orderNumber
            }?\n\nOnly confirm after verifying the payment.`
        );

        if (!confirmed) return;

        setCollectingCOD(true);
        setError("");
        setNotice("");

        try {
            const { data } = await axios.patch(
                `/api/admin/orders/${orderId}`,
                {
                    action: "collect_cod",
                    confirmCollected: true,
                }
            );

            if (!data.success) {
                throw new Error(
                    data.message ||
                    "Unable to confirm COD collection."
                );
            }

            setOrder(data.order);

            setSelectedStatus(
                data.order.orderStatus
            );

            setNotice(
                data.message ||
                "COD payment marked as collected."
            );
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Failed to confirm COD payment."
            );
        } finally {
            setCollectingCOD(false);
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
                            {error ||
                                "This order could not be found."}
                        </p>

                        <button
                            type="button"
                            onClick={refreshOrder}
                            className="mt-5 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white"
                        >
                            Try again
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    const address =
        order.shippingAddress || {};

    const shipment =
        order.shipment || {};

    const allowedStatuses =
        getAllowedStatuses(order);

    const isCOD =
        order.paymentMethod === "cod";

    const codPending =
        isCOD &&
        order.paymentStatus === "pending" &&
        ![
            "pending",
            "cancelled",
            "returned",
        ].includes(order.orderStatus);

    const codPaid =
        isCOD &&
        order.paymentStatus === "paid";

    const isBusy =
        saving || collectingCOD;

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-8">
                <div className="mx-auto max-w-6xl space-y-6">
                    {/* Back */}
                    <Link
                        href="/admin/orders"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#7D45C2] hover:underline"
                    >
                        <ArrowLeft size={17} />
                        Back to orders
                    </Link>

                    {/* Header */}
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#7D45C2]">
                                ORDER DETAILS
                            </p>

                            <h1 className="mt-1 break-all text-2xl font-bold sm:text-3xl">
                                {order.orderNumber}
                            </h1>

                            <p className="mt-2 text-sm text-gray-500">
                                Placed on{" "}
                                {formatDate(
                                    order.createdAt
                                )}
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <StatusBadge
                                    value={
                                        order.orderStatus
                                    }
                                />

                                <StatusBadge
                                    value={
                                        order.paymentStatus
                                    }
                                />

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${isCOD
                                            ? "bg-orange-50 text-orange-700"
                                            : "bg-purple-50 text-[#7D45C2]"
                                        }`}
                                >
                                    {isCOD
                                        ? "Cash on Delivery"
                                        : "Razorpay"}
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={refreshOrder}
                            disabled={isBusy}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </header>

                    {/* Alerts */}
                    {error && (
                        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            <AlertCircle
                                size={18}
                                className="shrink-0"
                            />

                            <p className="flex-1">
                                {error}
                            </p>

                            <button
                                onClick={() =>
                                    setError("")
                                }
                            >
                                <XCircle size={18} />
                            </button>
                        </div>
                    )}

                    {notice && (
                        <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            <CheckCircle2
                                size={18}
                                className="shrink-0"
                            />

                            <p>{notice}</p>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <SummaryCard
                            title="Order total"
                            value={formatPrice(
                                order.totalAmount
                            )}
                            icon={Package}
                        />

                        <SummaryCard
                            title="Payment status"
                            value={formatLabel(
                                order.paymentStatus
                            )}
                            subtitle={
                                isCOD
                                    ? "Cash on Delivery"
                                    : "Razorpay prepaid"
                            }
                            icon={
                                isCOD
                                    ? Banknote
                                    : CreditCard
                            }
                            iconColor={
                                order.paymentStatus ===
                                    "paid"
                                    ? "text-green-600"
                                    : "text-amber-600"
                            }
                        />

                        <SummaryCard
                            title="Order status"
                            value={formatLabel(
                                order.orderStatus
                            )}
                            icon={Truck}
                            iconColor="text-blue-600"
                        />
                    </div>

                    {/* COD Collection Notice */}
                    {codPending && (
                        <div className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <Clock3
                                    size={22}
                                    className="mt-0.5 shrink-0 text-amber-700"
                                />

                                <div>
                                    <h3 className="font-bold text-amber-900">
                                        COD payment pending
                                    </h3>

                                    <p className="mt-1 text-sm text-amber-800">
                                        Collection amount:{" "}
                                        <strong>
                                            {formatPrice(
                                                order.totalAmount
                                            )}
                                        </strong>
                                        . Confirm only after
                                        verifying that the
                                        payment has been
                                        received.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCollectCOD
                                }
                                disabled={isBusy}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-50"
                            >
                                {collectingCOD ? (
                                    <RefreshCw
                                        size={17}
                                        className="animate-spin"
                                    />
                                ) : (
                                    <Banknote size={17} />
                                )}

                                {collectingCOD
                                    ? "Confirming..."
                                    : "Mark COD Collected"}
                            </button>
                        </div>
                    )}

                    {codPaid && (
                        <div className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-5">
                            <ShieldCheck
                                size={22}
                                className="shrink-0 text-green-700"
                            />

                            <div>
                                <h3 className="font-bold text-green-900">
                                    COD payment recorded
                                </h3>

                                <p className="mt-1 text-sm text-green-800">
                                    Collection confirmed on{" "}
                                    {formatDate(
                                        order.codCollectedAt ||
                                        order.paidAt
                                    )}
                                    .
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                        {/* Left Column */}
                        <div className="min-w-0 space-y-6">
                            {/* Products */}
                            <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                                <div className="flex items-center gap-3 border-b border-gray-100 p-5">
                                    <Package
                                        size={21}
                                        className="text-[#7D45C2]"
                                    />

                                    <h2 className="text-lg font-bold">
                                        Ordered products
                                    </h2>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {(order.items || []).map(
                                        (item, index) => (
                                            <div
                                                key={`${item.productId || item.slug || item.name}-${index}`}
                                                className="flex gap-4 p-4 sm:p-5"
                                            >
                                                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                                                    {item.image ? (
                                                        <Image
                                                            src={
                                                                item.image
                                                            }
                                                            alt={
                                                                item.name ||
                                                                "Product"
                                                            }
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
                                                        {item.name ||
                                                            "Product"}
                                                    </p>

                                                    {item.variant && (
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            Variant:{" "}
                                                            {
                                                                item.variant
                                                            }
                                                        </p>
                                                    )}

                                                    <p className="mt-1 text-sm text-gray-500">
                                                        Quantity:{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                    </p>

                                                    <p className="mt-2 text-sm font-semibold text-[#7D45C2]">
                                                        {formatPrice(
                                                            item.unitPrice
                                                        )}{" "}
                                                        each
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-right text-sm font-bold">
                                                    {formatPrice(
                                                        item.lineTotal
                                                    )}
                                                </p>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="space-y-2 border-t border-gray-100 bg-[#FAF8FD] p-5">
                                    <InfoRow
                                        label="Subtotal"
                                        value={formatPrice(
                                            order.subtotal
                                        )}
                                    />

                                    <InfoRow
                                        label="Shipping fee"
                                        value={
                                            Number(
                                                order.shippingFee
                                            ) === 0
                                                ? "FREE"
                                                : formatPrice(
                                                    order.shippingFee
                                                )
                                        }
                                    />

                                    {Number(
                                        order.discount
                                    ) > 0 && (
                                            <InfoRow
                                                label="Discount"
                                                value={`−${formatPrice(
                                                    order.discount
                                                )}`}
                                            />
                                        )}

                                    {order.couponCode && (
                                        <InfoRow
                                            label="Coupon"
                                            value={
                                                order.couponCode
                                            }
                                        />
                                    )}

                                    <div className="flex items-center justify-between gap-4 border-t border-purple-100 pt-4">
                                        <span className="font-bold">
                                            Grand total
                                        </span>

                                        <span className="text-xl font-bold text-[#7D45C2]">
                                            {formatPrice(
                                                order.totalAmount
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* Shipping Address */}
                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-3 flex items-center gap-3">
                                    <MapPin
                                        size={21}
                                        className="text-[#7D45C2]"
                                    />

                                    <h2 className="text-lg font-bold">
                                        Shipping address
                                    </h2>
                                </div>

                                <InfoRow
                                    label="Full name"
                                    value={
                                        address.fullName
                                    }
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

                                <InfoRow
                                    label="City"
                                    value={address.city}
                                />

                                <InfoRow
                                    label="State"
                                    value={address.state}
                                />

                                <InfoRow
                                    label="Country"
                                    value={address.country}
                                />

                                <InfoRow
                                    label="Pincode"
                                    value={address.pincode}
                                />
                            </section>

                            {/* Shipment */}
                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <Truck
                                        size={21}
                                        className="text-[#7D45C2]"
                                    />

                                    <h2 className="text-lg font-bold">
                                        Shipment information
                                    </h2>
                                </div>

                                <InfoRow
                                    label="Shiprocket order ID"
                                    value={
                                        shipment.shiprocketOrderId
                                    }
                                />

                                <InfoRow
                                    label="Shipment ID"
                                    value={
                                        shipment.shipmentId
                                    }
                                />

                                <InfoRow
                                    label="Courier"
                                    value={
                                        shipment.courierName
                                    }
                                />

                                <InfoRow
                                    label="AWB / Tracking number"
                                    value={
                                        shipment.awbCode
                                    }
                                />

                                <InfoRow
                                    label="Shipment status"
                                    value={
                                        shipment.currentStatusText ||
                                        formatLabel(
                                            shipment.status
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Estimated delivery"
                                    value={
                                        shipment.estimatedDeliveryDate
                                            ? formatDate(
                                                shipment.estimatedDeliveryDate
                                            )
                                            : "—"
                                    }
                                />

                                <InfoRow
                                    label="Last synced"
                                    value={
                                        shipment.lastSyncedAt
                                            ? formatDate(
                                                shipment.lastSyncedAt
                                            )
                                            : "—"
                                    }
                                />

                                {shipment.trackingUrl && (
                                    <a
                                        href={
                                            shipment.trackingUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-purple-200 px-4 py-3 text-sm font-semibold text-[#7D45C2] transition hover:bg-purple-50"
                                    >
                                        Track shipment
                                        <ExternalLink
                                            size={16}
                                        />
                                    </a>
                                )}

                                {!shipment.shiprocketOrderId && (
                                    <p className="mt-4 rounded-xl bg-purple-50 p-3 text-sm text-[#7D45C2]">
                                        Shipment has not been
                                        created in Shiprocket
                                        yet.
                                    </p>
                                )}

                                {shipment.lastError && (
                                    <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                                        Shipment note:{" "}
                                        {
                                            shipment.lastError
                                        }
                                    </p>
                                )}
                            </section>
                        </div>

                        {/* Right Column */}
                        <aside className="min-w-0 space-y-6">
                            {/* Status Update */}
                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <RefreshCw
                                        size={20}
                                        className="text-[#7D45C2]"
                                    />

                                    <h2 className="text-lg font-bold">
                                        Update order
                                    </h2>
                                </div>

                                <form
                                    onSubmit={
                                        handleUpdateStatus
                                    }
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Current status
                                        </label>

                                        <div className="rounded-xl bg-[#FAF8FD] px-4 py-3">
                                            <StatusBadge
                                                value={
                                                    order.orderStatus
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium">
                                            Change status to
                                        </label>

                                        <div className="relative">
                                            <select
                                                value={
                                                    selectedStatus
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setSelectedStatus(
                                                        event.target.value
                                                    )
                                                }
                                                disabled={
                                                    isBusy ||
                                                    allowedStatuses.length ===
                                                    0
                                                }
                                                className={`${inputClass} appearance-none pr-10`}
                                            >
                                                <option
                                                    value={
                                                        order.orderStatus
                                                    }
                                                >
                                                    {formatLabel(
                                                        order.orderStatus
                                                    )}{" "}
                                                    (Current)
                                                </option>

                                                {allowedStatuses.map(
                                                    (
                                                        status
                                                    ) => (
                                                        <option
                                                            key={
                                                                status
                                                            }
                                                            value={
                                                                status
                                                            }
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
                                    </div>

                                    {allowedStatuses.length ===
                                        0 && (
                                            <p className="text-xs text-gray-500">
                                                No manual status
                                                transitions are
                                                currently
                                                available.
                                            </p>
                                        )}

                                    <button
                                        type="submit"
                                        disabled={
                                            isBusy ||
                                            selectedStatus ===
                                            order.orderStatus ||
                                            !allowedStatuses.includes(
                                                selectedStatus
                                            )
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

                                        {saving
                                            ? "Saving..."
                                            : "Save status"}
                                    </button>
                                </form>
                            </section>

                            {/* Payment */}
                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <CreditCard
                                        size={20}
                                        className="text-[#7D45C2]"
                                    />

                                    <h2 className="text-lg font-bold">
                                        Customer & payment
                                    </h2>
                                </div>

                                <InfoRow
                                    label="Customer"
                                    value={
                                        address.fullName
                                    }
                                />

                                <InfoRow
                                    label="Email"
                                    value={
                                        order.customerEmail
                                    }
                                />

                                <InfoRow
                                    label="Mobile"
                                    value={
                                        address.mobile
                                    }
                                />

                                <InfoRow
                                    label="Payment method"
                                    value={
                                        isCOD
                                            ? "Cash on Delivery"
                                            : "Razorpay"
                                    }
                                />

                                <InfoRow
                                    label="Payment status"
                                    value={
                                        formatLabel(
                                            order.paymentStatus
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Paid at"
                                    value={
                                        formatDate(
                                            order.paidAt
                                        )
                                    }
                                />

                                {isCOD && (
                                    <InfoRow
                                        label="COD collected at"
                                        value={
                                            formatDate(
                                                order.codCollectedAt
                                            )
                                        }
                                    />
                                )}

                                <InfoRow
                                    label="Confirmed at"
                                    value={
                                        formatDate(
                                            order.confirmedAt
                                        )
                                    }
                                />

                                <InfoRow
                                    label="Cancelled at"
                                    value={
                                        formatDate(
                                            order.cancelledAt
                                        )
                                    }
                                />
                            </section>

                            {/* Order Timeline */}
                            <section className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex items-center gap-3">
                                    <CalendarDays
                                        size={20}
                                        className="text-[#7D45C2]"
                                    />

                                    <h2 className="text-lg font-bold">
                                        Order timeline
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex gap-3">
                                        <CheckCircle2
                                            size={19}
                                            className="mt-0.5 shrink-0 text-green-600"
                                        />

                                        <div>
                                            <p className="text-sm font-semibold">
                                                Order placed
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
                                                {formatDate(
                                                    order.createdAt
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {order.confirmedAt && (
                                        <div className="flex gap-3">
                                            <CheckCircle2
                                                size={19}
                                                className="mt-0.5 shrink-0 text-green-600"
                                            />

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Order
                                                    confirmed
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formatDate(
                                                        order.confirmedAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.paidAt && (
                                        <div className="flex gap-3">
                                            <CheckCircle2
                                                size={19}
                                                className="mt-0.5 shrink-0 text-green-600"
                                            />

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Payment
                                                    recorded
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formatDate(
                                                        order.paidAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {shipment.shiprocketOrderId && (
                                        <div className="flex gap-3">
                                            <Truck
                                                size={19}
                                                className="mt-0.5 shrink-0 text-[#7D45C2]"
                                            />

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Shipment
                                                    created
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    Shiprocket
                                                    order{" "}
                                                    {
                                                        shipment.shiprocketOrderId
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {order.cancelledAt && (
                                        <div className="flex gap-3">
                                            <XCircle
                                                size={19}
                                                className="mt-0.5 shrink-0 text-red-600"
                                            />

                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Order
                                                    cancelled
                                                </p>

                                                <p className="mt-1 text-xs text-gray-500">
                                                    {formatDate(
                                                        order.cancelledAt
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
}
