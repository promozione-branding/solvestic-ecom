
"use client";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/components/admin/Sidebar";
import {
    Users,
    UserCheck,
    UserX,
    ShieldCheck,
    Search,
    RefreshCw,
    Mail,
    Phone,
    CalendarDays,
    ChevronDown,
} from "lucide-react";

const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition focus:border-purple-500";

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        blocked: 0,
        verified: 0,
    });
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        total: 0,
        totalPages: 1,
        limit: 10,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const { data } = await axios.get("/api/admin/users", {
                params: {
                    search: search.trim(),
                    status,
                    page,
                    limit: 10,
                },
            });

            setUsers(data.users || []);
            setStats(
                data.stats || {
                    total: 0,
                    active: 0,
                    blocked: 0,
                    verified: 0,
                }
            );
            setPagination(
                data.pagination || {
                    page: 1,
                    total: 0,
                    totalPages: 1,
                    limit: 10,
                }
            );
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load customers."
            );
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, [search, status, page]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        setPage(1);
    }, [search, status]);

    const formatDate = (date) => {
        if (!date) return "—";

        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(new Date(date));
    };

    const getInitials = (name) => {
        return (
            name
                ?.trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase() || "U"
        );
    };

    const StatusBadge = ({ value }) => (
        <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${value === "active"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
        >
            {value || "unknown"}
        </span>
    );

    const VerificationBadge = ({ verified }) => (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${verified
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
        >
            {verified ? <ShieldCheck size={13} /> : null}
            {verified ? "Verified" : "Not verified"}
        </span>
    );

    return (
        <div className="min-h-screen bg-[#F7F2FC] text-[#24202B]">
            <Sidebar />

            <main className="min-w-0 p-4 sm:p-6 lg:ml-72 lg:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm font-medium text-[#7D45C2]">
                                CUSTOMER MANAGEMENT
                            </p>
                            <h1 className="mt-1 text-3xl font-bold tracking-tight">
                                Customers
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                View registered customers and their account
                                verification status.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={fetchUsers}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#6937A8] disabled:opacity-60"
                        >
                            <RefreshCw
                                size={17}
                                className={loading ? "animate-spin" : ""}
                            />
                            Refresh customers
                        </button>
                    </header>

                    {error && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                            <button
                                type="button"
                                onClick={fetchUsers}
                                className="ml-3 font-semibold underline"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: "Total customers",
                                value: stats.total,
                                icon: Users,
                                color: "text-[#7D45C2]",
                                bg: "bg-purple-50",
                            },
                            {
                                label: "Active customers",
                                value: stats.active,
                                icon: UserCheck,
                                color: "text-green-600",
                                bg: "bg-green-50",
                            },
                            {
                                label: "Blocked customers",
                                value: stats.blocked,
                                icon: UserX,
                                color: "text-red-500",
                                bg: "bg-red-50",
                            },
                            {
                                label: "Mobile verified",
                                value: stats.verified,
                                icon: ShieldCheck,
                                color: "text-blue-600",
                                bg: "bg-blue-50",
                            },
                        ].map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-gray-500">
                                            {item.label}
                                        </p>
                                        <div
                                            className={`flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
                                        >
                                            <Icon size={20} />
                                        </div>
                                    </div>
                                    <p className="mt-3 text-3xl font-bold">
                                        {item.value}
                                    </p>
                                </div>
                            );
                        })}
                    </section>

                    <section className="overflow-hidden rounded-2xl border border-purple-100 bg-white shadow-sm">
                        <div className="border-b border-gray-100 p-4 sm:p-5">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_auto]">
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
                                        placeholder="Search name, email or mobile..."
                                        className={`${inputClass} pl-10`}
                                    />
                                </div>

                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(e.target.value)
                                        }
                                        className={`${inputClass} appearance-none pr-10`}
                                    >
                                        <option value="">All statuses</option>
                                        <option value="active">Active</option>
                                        <option value="blocked">Blocked</option>
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
                                        setStatus("");
                                        setPage(1);
                                    }}
                                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
                                >
                                    Clear filters
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
                                <RefreshCw
                                    size={20}
                                    className="animate-spin text-[#7D45C2]"
                                />
                                Loading customers...
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-[#7D45C2]">
                                    <Users size={26} />
                                </div>
                                <h2 className="mt-4 text-lg font-semibold">
                                    No customers found
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Try changing your search or status filter.
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
                                                    Contact
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Mobile verification
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Status
                                                </th>
                                                <th className="px-5 py-4 font-semibold">
                                                    Joined
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-100">
                                            {users.map((user) => (
                                                <tr
                                                    key={user._id}
                                                    className="transition hover:bg-purple-50/30"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-[#7D45C2]">
                                                                {getInitials(
                                                                    user.name
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="max-w-56 truncate text-sm font-semibold">
                                                                    {user.name}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-400">
                                                                    ID:{" "}
                                                                    {user._id.slice(
                                                                        -8
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="space-y-2">
                                                            <p className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Mail
                                                                    size={14}
                                                                    className="shrink-0 text-gray-400"
                                                                />
                                                                {user.email}
                                                            </p>
                                                            <p className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Phone
                                                                    size={14}
                                                                    className="shrink-0 text-gray-400"
                                                                />
                                                                {user.mobile}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <VerificationBadge
                                                            verified={
                                                                user.mobileVerified
                                                            }
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge
                                                            value={user.status}
                                                        />
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="flex items-center gap-2 text-sm text-gray-600">
                                                            <CalendarDays
                                                                size={15}
                                                                className="text-gray-400"
                                                            />
                                                            {formatDate(
                                                                user.createdAt
                                                            )}
                                                        </p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-gray-100 md:hidden">
                                    {users.map((user) => (
                                        <article
                                            key={user._id}
                                            className="p-4"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-100 font-bold text-[#7D45C2]">
                                                    {getInitials(user.name)}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <h3 className="truncate text-sm font-semibold">
                                                        {user.name}
                                                    </h3>
                                                    <p className="mt-1 break-all text-sm text-gray-500">
                                                        {user.email}
                                                    </p>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {user.mobile}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap items-center gap-2">
                                                        <StatusBadge
                                                            value={user.status}
                                                        />
                                                        <VerificationBadge
                                                            verified={
                                                                user.mobileVerified
                                                            }
                                                        />
                                                    </div>
                                                    <p className="mt-3 text-xs text-gray-400">
                                                        Joined{" "}
                                                        {formatDate(
                                                            user.createdAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </article>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                    <p className="text-sm text-gray-500">
                                        Showing{" "}
                                        {pagination.total === 0
                                            ? 0
                                            : (page - 1) * pagination.limit + 1}
                                        –
                                        {Math.min(
                                            page * pagination.limit,
                                            pagination.total
                                        )}{" "}
                                        of {pagination.total} customers
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={page <= 1}
                                            onClick={() =>
                                                setPage((current) =>
                                                    Math.max(1, current - 1)
                                                )
                                            }
                                            className="rounded-lg border border-gray-200 px-4 py-2 text-sm disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        <span className="px-2 text-sm text-gray-500">
                                            {page} /{" "}
                                            {pagination.totalPages || 1}
                                        </span>

                                        <button
                                            type="button"
                                            disabled={
                                                page >= pagination.totalPages
                                            }
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
        </div>
    );
}
