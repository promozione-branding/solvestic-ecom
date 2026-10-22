
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    RefreshCw,
    Truck,
} from "lucide-react";

const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
};

export default function OrderTrackingPage() {
    const params = useParams();
    const orderId = params.orderId;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const fetchTracking = async (refresh = false) => {
        if (refreshing) return;

        try {
            setError("");

            if (refresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await axios.get(`/api/user/orders/${orderId}/tracking`, {
                params: refresh
                    ? { refresh: "true" }
                    : {},
                withCredentials: true,
            });

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                    "Unable to fetch tracking."
                );
            }

            setData(response.data);
        } catch (err) {
            const message =
                err.response?.data?.message ||
                err.message ||
                "Unable to load tracking.";

            setError(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (orderId) fetchTracking();
    }, [orderId]);

    if (loading) {
        return (
            <main className="flex min-h-[60vh] items-center justify-center bg-[#F7F2FC]">
                <p className="text-sm text-[#77717F]">
                    Loading order tracking...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-[60vh] bg-[#F7F2FC] px-4 py-12">
                <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center">
                    <Package
                        className="mx-auto text-[#7D45C2]"
                        size={36}
                    />
                    <h1 className="mt-4 text-xl font-semibold">
                        Tracking unavailable
                    </h1>
                    <p className="mt-2 text-sm text-[#77717F]">
                        {error}
                    </p>
                    <button
                        onClick={() => fetchTracking(true)}
                        className="mt-5 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white"
                    >
                        Try again
                    </button>
                </div>
            </main>
        );
    }

    const order = data?.order;
    const shipment = data?.shipment;
    const events = shipment?.events || [];

    const steps = [
        {
            label: "Order placed",
            completed: true,
        },
        {
            label: "Order confirmed",
            completed: [
                "confirmed",
                "processing",
                "shipped",
                "delivered",
            ].includes(order?.orderStatus),
        },
        {
            label: "Shipped",
            completed: [
                "shipped",
                "delivered",
            ].includes(order?.orderStatus),
        },
        {
            label: "Delivered",
            completed:
                order?.orderStatus === "delivered",
        },
    ];

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-10 text-[#24252A] sm:px-6">
            <div className="mx-auto max-w-4xl">
                <Link
                    href="/orders"
                    className="inline-flex items-center gap-2 text-sm text-[#77717F] hover:text-[#7D45C2]"
                >
                    <ArrowLeft size={17} />
                    Back to My Orders
                </Link>

                <div className="mt-6 rounded-3xl border border-[#7D45C2]/10 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-[#7D45C2]">
                                Order Tracking
                            </p>

                            <h1 className="mt-2 text-2xl font-semibold">
                                Order #{order?.orderNumber}
                            </h1>

                            <p className="mt-2 text-sm text-[#77717F]">
                                Placed {formatDate(order?.createdAt)}
                            </p>
                        </div>

                        <button
                            onClick={() => fetchTracking(true)}
                            disabled={refreshing}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EAE5EF] px-4 py-3 text-sm font-semibold hover:bg-[#F7F2FC] disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    refreshing ? "animate-spin" : ""
                                }
                            />
                            {refreshing ? "Updating..." : "Refresh tracking"}
                        </button>
                    </div>

                    <div className="mt-7 rounded-2xl bg-[#F7F2FC] p-5">
                        <div className="flex items-start gap-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#7D45C2]">
                                <Truck size={23} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="font-semibold">
                                    {shipment?.currentStatusText ||
                                        "Preparing your order"}
                                </p>

                                <p className="mt-1 text-sm text-[#77717F]">
                                    {shipment?.courierName ||
                                        "Courier not assigned yet"}
                                </p>

                                {shipment?.awbCode && (
                                    <p className="mt-2 break-all text-sm">
                                        AWB: {shipment.awbCode}
                                    </p>
                                )}

                                {shipment?.estimatedDeliveryDate && (
                                    <p className="mt-2 text-sm">
                                        Estimated delivery:{" "}
                                        {formatDate(
                                            shipment.estimatedDeliveryDate
                                        )}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <section className="mt-8">
                        <h2 className="text-lg font-semibold">
                            Order progress
                        </h2>

                        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {steps.map((step) => (
                                <div
                                    key={step.label}
                                    className="rounded-2xl border border-[#EAE5EF] p-4"
                                >
                                    <CheckCircle2
                                        size={22}
                                        className={
                                            step.completed
                                                ? "text-[#7D45C2]"
                                                : "text-[#D5CEDD]"
                                        }
                                    />

                                    <p className="mt-3 text-sm font-medium">
                                        {step.label}
                                    </p>

                                    <p className="mt-1 text-xs text-[#77717F]">
                                        {step.completed
                                            ? "Completed"
                                            : "Pending"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-9">
                        <h2 className="text-lg font-semibold">
                            Tracking history
                        </h2>

                        {!data?.trackingAvailable ? (
                            <div className="mt-4 rounded-2xl border border-dashed border-[#D5CEDD] p-6 text-center">
                                <Clock
                                    size={30}
                                    className="mx-auto text-[#7D45C2]"
                                />

                                <p className="mt-3 text-sm font-medium">
                                    Shipment not dispatched yet
                                </p>

                                <p className="mt-1 text-sm text-[#77717F]">
                                    Tracking details will appear once
                                    your shipment has an AWB number.
                                </p>
                            </div>
                        ) : events.length === 0 ? (
                            <p className="mt-4 text-sm text-[#77717F]">
                                No courier scan activities are available yet.
                            </p>
                        ) : (
                            <div className="mt-6">
                                {events.map((event, index) => (
                                    <div
                                        key={`${event._id || event.activity}-${index}`}
                                        className="relative flex gap-4 pb-7 last:pb-0"
                                    >
                                        <div className="relative flex w-6 shrink-0 justify-center">
                                            {index !== events.length - 1 && (
                                                <span className="absolute top-6 h-full w-px bg-[#E3D8F0]" />
                                            )}

                                            <span className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#F0E6FB] text-[#7D45C2]">
                                                {index === 0 ? (
                                                    <MapPin size={14} />
                                                ) : (
                                                    <CheckCircle2 size={14} />
                                                )}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold">
                                                {event.activity ||
                                                    event.status ||
                                                    "Shipment update"}
                                            </p>

                                            {event.location && (
                                                <p className="mt-1 text-sm text-[#77717F]">
                                                    {event.location}
                                                </p>
                                            )}

                                            <p className="mt-1 text-xs text-[#88818F]">
                                                {formatDate(
                                                    event.eventTime ||
                                                    event.createdAt
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="mt-9 border-t border-[#EAE5EF] pt-6">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <MapPin
                                size={18}
                                className="text-[#7D45C2]"
                            />
                            Delivery address
                        </h2>

                        <p className="mt-3 text-sm font-medium">
                            {data?.order?.shippingAddress?.fullName ||
                                "Delivery address saved with your order"}
                        </p>
                    </section>
                </div>
            </div>
        </main>
    );
}
