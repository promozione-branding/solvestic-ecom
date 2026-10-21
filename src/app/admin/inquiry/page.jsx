"use client";

import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import {
    Search,
    RefreshCw,
    MessageSquare,
    Clock,
    CheckCircle2,
    Eye,
    X,
    Mail,
    Phone,
    CalendarDays,
    ChevronDown,
} from "lucide-react";

const SUPPLIER_TOKEN = process.env.NEXT_PUBLIC_BRANDBNALO_SUPPLIER_TOKEN || "6a9e3df1f9dc8e66e7dd8a92";

function extractForms(payload) {
    if (Array.isArray(payload)) return payload;
    const candidates = [
        payload?.forms,
        payload?.data,
        payload?.data?.forms,
        payload?.data?.data,
        payload?.data?.data?.forms,
        payload?.results,
        payload?.data?.results,
    ];
    return candidates.find(Array.isArray) ?? [];
}

function normalizeInquiry(item, index) {
    const rawStatus = String(item.status || "new").toLowerCase().replaceAll(" ", "_");
    const allowedStatuses = ["new", "in_progress", "resolved", "closed"];
    return {
        id: String(item._id ?? item.id ?? `row-${index}`),
        name: String(item.name ?? item.contactPerson ?? "Unknown"),
        email: String(item.email ?? ""),
        phone: String(item.phone ?? ""),
        subject: String(item.product ?? item.subject ?? item.skinConcern ?? "General enquiry"),
        message: String(item.message ?? ""),
        place: String(item.place ?? ""),
        platform: String(item.platform ?? ""),
        status: allowedStatuses.includes(rawStatus) ? rawStatus : "new",
        date: item.createdAt ?? item.submittedAt ?? item.date ?? null,
    };
}

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none transition focus:border-[#7D45C2]";

function StatusBadge({ status }) {
    const styles = {
        new: "bg-blue-50 text-blue-700",
        in_progress: "bg-amber-50 text-amber-700",
        resolved: "bg-green-50 text-green-700",
        closed: "bg-gray-100 text-gray-600",
    };

    return (
        <span
            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status] || styles.new
                }`}
        >
            {status.replaceAll("_", " ")}
        </span>
    );
}

function formatDate(date) {
    if (!date || Number.isNaN(new Date(date).getTime())) return "—";
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function InquiryPage() {
    const [inquiries, setInquiries] = useState([]);
    const [filter, setFilter] = useState("today");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [page, setPage] = useState(1);

    const pageSize = 8;

    useEffect(() => {
        const controller = new AbortController();
        async function fetchInquiries() {
            setLoading(true);
            setError("");
            try {
                if (!SUPPLIER_TOKEN) throw new Error("Missing NEXT_PUBLIC_BRANDBNALO_SUPPLIER_TOKEN");
                const url = `https://brandbnalo.com/api/form/get-forms/${encodeURIComponent(SUPPLIER_TOKEN)}?filter=${encodeURIComponent(filter)}`;
                const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
                if (!response.ok) throw new Error(`Failed to load inquiries (${response.status})`);
                const payload = await response.json();
                if (payload?.success === false) throw new Error(payload.message || "Unable to load inquiries");
                if (controller.signal.aborted) return;
                setInquiries(extractForms(payload).map(normalizeInquiry));
                setSelectedInquiry(null);
                setPage(1);
            } catch (err) {
                if (controller.signal.aborted) return;
                setError(err.message || "Could not load inquiries");
                setInquiries([]);
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }
        fetchInquiries();
        return () => controller.abort();
    }, [filter, refreshKey]);


    const filteredInquiries = useMemo(() => {
        return inquiries.filter((inquiry) => {
            const query = search.toLowerCase().trim();

            const matchesSearch =
                !query ||
                inquiry.name.toLowerCase().includes(query) ||
                inquiry.email.toLowerCase().includes(query) ||
                inquiry.phone.toLowerCase().includes(query) ||
                inquiry.subject.toLowerCase().includes(query) ||
                inquiry.message.toLowerCase().includes(query) ||
                inquiry.place.toLowerCase().includes(query);

            const matchesStatus =
                statusFilter === "all" ||
                inquiry.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [inquiries, search, statusFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredInquiries.length / pageSize)
    );

    const paginatedInquiries = filteredInquiries.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const updateStatus = (id, status) => {
        setInquiries((previous) =>
            previous.map((inquiry) =>
                inquiry.id === id ? { ...inquiry, status } : inquiry
            )
        );

        setSelectedInquiry((previous) =>
            previous?.id === id ? { ...previous, status } : previous
        );
    };

    const changeSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    const changeFilter = (value) => {
        setStatusFilter(value);
        setPage(1);
    };

    const stats = [
        {
            title: "Total inquiries",
            value: inquiries.length,
            icon: MessageSquare,
            color: "text-[#7D45C2]",
            bg: "bg-purple-50",
        },
        {
            title: "New inquiries",
            value: inquiries.filter((item) => item.status === "new").length,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50",
        },
        {
            title: "In progress",
            value: inquiries.filter(
                (item) => item.status === "in_progress"
            ).length,
            icon: RefreshCw,
            color: "text-amber-600",
            bg: "bg-amber-50",
        },
        {
            title: "Resolved",
            value: inquiries.filter(
                (item) => item.status === "resolved"
            ).length,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
        },
    ];

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header>
                        <p className="text-sm font-semibold tracking-wide text-[#7D45C2]">
                            CUSTOMER SUPPORT
                        </p>

                        <h1 className="mt-1 text-3xl font-bold tracking-tight">
                            Inquiries
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Manage customer questions, requests, and support
                            messages in one place.
                        </p>
                    </header>

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;

                            return (
                                <div
                                    key={stat.title}
                                    className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm text-gray-500">
                                            {stat.title}
                                        </p>

                                        <div
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.color}`}
                                        >
                                            <Icon size={21} />
                                        </div>
                                    </div>

                                    <p className="mt-4 text-3xl font-bold">
                                        {stat.value}
                                    </p>
                                </div>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:p-5">
                            <div>
                                <h2 className="text-lg font-bold">
                                    All inquiries
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Review and manage incoming customer
                                    messages.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(180px,1fr)_180px_180px_auto]">
                                <div className="relative">
                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />

                                    <input
                                        value={search}
                                        onChange={(e) =>
                                            changeSearch(e.target.value)
                                        }
                                        placeholder="Search name, email, phone..."
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>

                                {/* <div className="relative">
                                    <select
                                        value={statusFilter}
                                        onChange={(e) =>
                                            changeFilter(e.target.value)
                                        }
                                        className={`${inputClass} appearance-none pr-10 capitalize`}
                                    >
                                        <option value="all">
                                            All statuses
                                        </option>
                                        <option value="new">New</option>
                                        <option value="in_progress">
                                            In progress
                                        </option>
                                        <option value="resolved">
                                            Resolved
                                        </option>
                                        <option value="closed">Closed</option>
                                    </select>

                                    <ChevronDown
                                        size={16}
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                                    />
                                </div> */}

                                <div className="relative">
                                    <select
                                        value={filter}
                                        onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                                        className={`${inputClass} appearance-none pr-10`}
                                        aria-label="Filter inquiries by date"
                                    >
                                        <option value="today">Today</option>
                                        <option value="yesterday">Yesterday</option>
                                        <option value="7days">Last 7 Days</option>
                                        <option value="30days">Last 30 Days</option>
                                        <option value="all">All Time</option>
                                    </select>
                                    <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        changeFilter("all");
                                        setFilter("today");
                                        setRefreshKey((n) => n + 1);
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
                                >
                                    <RefreshCw size={16} />
                                    Reset filters
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div role="alert" className="mx-4 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                <span>{error}</span>
                                <button type="button" onClick={() => setRefreshKey((n) => n + 1)} className="font-semibold underline">Retry</button>
                            </div>
                        )}
                        {loading ? (
                            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
                                <RefreshCw size={20} className="animate-spin" /> Loading inquiries...
                            </div>
                        ) : filteredInquiries.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                                <MessageSquare
                                    size={32}
                                    className="text-[#7D45C2]"
                                />
                                <h3 className="mt-4 font-semibold">
                                    No inquiries found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {error ? "Could not load inquiries." : "Try another search, status or date filter."}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[900px] text-left">
                                        <thead className="bg-[#FAF8FD] text-xs uppercase tracking-wide text-gray-500">
                                            <tr>
                                                <th className="px-5 py-4 font-semibold">
                                                    Customer
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Subject
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Date
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Status
                                                </th>
                                                <th className="px-5 py-4 text-right font-semibold">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {paginatedInquiries.map(
                                                (inquiry) => (
                                                    <tr
                                                        key={inquiry.id}
                                                        className="transition hover:bg-purple-50/30"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-semibold">
                                                                {inquiry.name}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {inquiry.email}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {inquiry.phone}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-medium">
                                                                {inquiry.subject}
                                                            </p>
                                                            <p className="mt-1 max-w-72 truncate text-xs text-gray-500">
                                                                {inquiry.message}
                                                            </p>
                                                        </td>

                                                        <td className="px-5 py-4 text-sm text-gray-500">
                                                            {formatDate(
                                                                inquiry.date
                                                            )}
                                                        </td>

                                                        <td className="px-5 py-4">
                                                            <StatusBadge
                                                                status={
                                                                    inquiry.status
                                                                }
                                                            />
                                                        </td>

                                                        <td className="px-5 py-4 text-right">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setSelectedInquiry(
                                                                        inquiry
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-2 rounded-xl border border-purple-200 px-3 py-2 text-sm font-medium text-[#7D45C2] transition hover:bg-purple-50"
                                                            >
                                                                <Eye size={16} />
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-gray-100 md:hidden">
                                    {paginatedInquiries.map((inquiry) => (
                                        <article
                                            key={inquiry.id}
                                            className="space-y-4 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-sm font-semibold">
                                                        {inquiry.name}
                                                    </h3>
                                                    <p className="mt-1 break-all text-xs text-gray-500">
                                                        {inquiry.email}
                                                    </p>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {inquiry.phone}
                                                    </p>
                                                </div>

                                                <StatusBadge
                                                    status={inquiry.status}
                                                />
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    {inquiry.subject}
                                                </p>
                                                <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                                    {inquiry.message}
                                                </p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {formatDate(inquiry.date)}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedInquiry(inquiry)
                                                }
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6937A8]"
                                            >
                                                <Eye size={16} />
                                                View inquiry
                                            </button>
                                        </article>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <p className="text-sm text-gray-500">
                                        Showing{" "}
                                        {(page - 1) * pageSize + 1}–
                                        {Math.min(
                                            page * pageSize,
                                            filteredInquiries.length
                                        )}{" "}
                                        of {filteredInquiries.length} inquiries
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={page <= 1}
                                            onClick={() =>
                                                setPage((current) => current - 1)
                                            }
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
                                            onClick={() =>
                                                setPage((current) => current + 1)
                                            }
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

            {selectedInquiry && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) {
                            setSelectedInquiry(null);
                        }
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="inquiry-title"
                        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                    >
                        <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-[#7D45C2]">
                                    Customer inquiry
                                </p>
                                <h2
                                    id="inquiry-title"
                                    className="mt-1 text-xl font-bold"
                                >
                                    {selectedInquiry.subject}
                                </h2>
                                <p className="mt-2 text-sm text-gray-500">
                                    Received{" "}
                                    {formatDate(selectedInquiry.date)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedInquiry(null)}
                                aria-label="Close inquiry"
                                className="rounded-xl border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div className="rounded-xl bg-[#FAF8FD] p-4">
                                <h3 className="font-semibold">
                                    {selectedInquiry.name}
                                </h3>

                                <a
                                    href={`mailto:${selectedInquiry.email}`}
                                    className="mt-3 flex items-center gap-2 break-all text-sm text-[#7D45C2] hover:underline"
                                >
                                    <Mail size={16} className="shrink-0" />
                                    {selectedInquiry.email}
                                </a>

                                <a
                                    href={`tel:${selectedInquiry.phone}`}
                                    className="mt-2 flex items-center gap-2 text-sm text-[#7D45C2] hover:underline"
                                >
                                    <Phone size={16} />
                                    {selectedInquiry.phone}
                                </a>

                                <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                    <CalendarDays size={15} />
                                    {formatDate(selectedInquiry.date)}
                                </p>
                            </div>

                            {selectedInquiry.place && (
                                <p className="text-sm text-gray-600"><strong>Place:</strong> {selectedInquiry.place}</p>
                            )}
                            <div>
                                <h3 className="text-sm font-semibold">
                                    Message
                                </h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                                    {selectedInquiry.message || "No message provided."}
                                </p>
                            </div>

                            {/* <div>
                                <label className="mb-2 block text-sm font-semibold">
                                    Inquiry status
                                </label>

                                <select
                                    value={selectedInquiry.status}
                                    onChange={(e) =>
                                        updateStatus(
                                            selectedInquiry.id,
                                            e.target.value
                                        )
                                    }
                                    className={`${inputClass} capitalize`}
                                >
                                    <option value="new">New</option>
                                    <option value="in_progress">
                                        In progress
                                    </option>
                                    <option value="resolved">Resolved</option>
                                    <option value="closed">Closed</option>
                                </select>

                                <p className="mt-2 text-xs text-gray-400">
                                    Status changes are local to this page and are not saved to BrandBnalo.
                                </p>
                            </div> */}

                            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-between">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSelectedInquiry(null)
                                    }
                                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold hover:bg-gray-50"
                                >
                                    Close
                                </button>

                                <a
                                    href={`mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                                        `Re: ${selectedInquiry.subject}`
                                    )}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6937A8]"
                                >
                                    <Mail size={17} />
                                    Reply by email
                                </a>
                            </div>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}