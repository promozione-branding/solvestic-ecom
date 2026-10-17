"use client";

import React, { useMemo, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import {
    Search,
    RefreshCw,
    MessageSquare,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    X,
    Mail,
    Phone,
    CalendarDays,
    ChevronDown,
} from "lucide-react";

const initialInquiries = [
    {
        id: 1,
        name: "Rahul Sharma",
        email: "rahul.sharma@example.com",
        phone: "+91 98765 43210",
        subject: "Product enquiry",
        message:
            "I would like to know more about your hair care products and available offers.",
        status: "new",
        date: "2026-10-17T10:30:00",
    },
    {
        id: 2,
        name: "Priya Verma",
        email: "priya.verma@example.com",
        phone: "+91 98765 12345",
        subject: "Order related",
        message:
            "I need an update regarding my recent order and its expected delivery date.",
        status: "in_progress",
        date: "2026-10-16T14:15:00",
    },
    {
        id: 3,
        name: "Amit Gupta",
        email: "amit.gupta@example.com",
        phone: "+91 98111 22334",
        subject: "Bulk purchase",
        message:
            "Please share the pricing and available discounts for bulk purchases.",
        status: "resolved",
        date: "2026-10-15T11:45:00",
    },
    {
        id: 4,
        name: "Sneha Kapoor",
        email: "sneha.kapoor@example.com",
        phone: "+91 98990 11223",
        subject: "Return and refund",
        message:
            "I want to understand the return policy for a product I recently purchased.",
        status: "new",
        date: "2026-10-14T16:20:00",
    },
    {
        id: 5,
        name: "Vikash Singh",
        email: "vikash.singh@example.com",
        phone: "+91 99100 33445",
        subject: "Other",
        message:
            "I have a question about the ingredients used in your products.",
        status: "closed",
        date: "2026-10-13T09:10:00",
    },
];

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
            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                styles[status] || styles.new
            }`}
        >
            {status.replaceAll("_", " ")}
        </span>
    );
}

function formatDate(date) {
    return new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function InquiryPage() {
    const [inquiries, setInquiries] = useState(initialInquiries);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [page, setPage] = useState(1);

    const pageSize = 8;

    const filteredInquiries = useMemo(() => {
        return inquiries.filter((inquiry) => {
            const query = search.toLowerCase().trim();

            const matchesSearch =
                !query ||
                inquiry.name.toLowerCase().includes(query) ||
                inquiry.email.toLowerCase().includes(query) ||
                inquiry.phone.toLowerCase().includes(query) ||
                inquiry.subject.toLowerCase().includes(query) ||
                inquiry.message.toLowerCase().includes(query);

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

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(200px,1fr)_220px_auto]">
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

                                <div className="relative">
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
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch("");
                                        changeFilter("all");
                                    }}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
                                >
                                    <RefreshCw size={16} />
                                    Reset filters
                                </button>
                            </div>
                        </div>

                        {filteredInquiries.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                                <MessageSquare
                                    size={32}
                                    className="text-[#7D45C2]"
                                />
                                <h3 className="mt-4 font-semibold">
                                    No inquiries found
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Try another search or status filter.
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

                            <div>
                                <h3 className="text-sm font-semibold">
                                    Message
                                </h3>
                                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-gray-600">
                                    {selectedInquiry.message}
                                </p>
                            </div>

                            <div>
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
                                    Demo UI: status changes are kept in local
                                    page state and are not saved to a database.
                                </p>
                            </div>

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