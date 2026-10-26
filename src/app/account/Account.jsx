
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { motion } from "framer-motion";
import {
    UserRound,
    Package,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    ShoppingBag,
    Mail,
    Phone,
    CalendarDays,
    ShieldCheck,
    Loader2,
    ArrowRight,
    CircleUserRound,
    Headphones,
    Pencil,
    Plus,
    X,
    Save,
    CheckCircle2,
    Navigation,
} from "lucide-react";
import Link from "next/link";
import { clearUser, setUser, setAuthLoading } from "@/redux/authSlice";

const PURPLE = "#7D45C2";

const menuItems = [
    { label: "My Profile", icon: UserRound, id: "profile" },
    { label: "Saved Addresses", icon: MapPin, id: "addresses" },
    { label: "My Orders", icon: Package, id: "orders" },
    { label: "Help Center", icon: Headphones, id: "help-center" },
    { label: "Account Settings", icon: Settings, id: "settings" },
];

const emptyAddress = {
    fullName: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    isDefault: false,
};

export default function Account() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { user, isAuthenticated, isLoading } = useSelector(
        (state) => state.auth
    );

    const [activeTab, setActiveTab] = useState("profile");
    const [loggingOut, setLoggingOut] = useState(false);

    const [editingProfile, setEditingProfile] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");
    const [profileForm, setProfileForm] = useState({
        name: "",
        email: "",
        mobile: "",
        currentPassword: "",
        newPassword: "",
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState("");
    const [addresses, setAddresses] = useState([]);
    const [addressesLoading, setAddressesLoading] = useState(false);
    const [addressError, setAddressError] = useState("");
    const [addressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressForm, setAddressForm] = useState(emptyAddress);
    const [savingAddress, setSavingAddress] = useState(false);
    const [addressMessage, setAddressMessage] = useState("");

    // Restore the customer session on refresh.
    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            if (isAuthenticated && user) {
                dispatch(setAuthLoading(false));
                return;
            }

            dispatch(setAuthLoading(true));

            try {
                const { data } = await axios.get("/api/user/me", {
                    withCredentials: true,
                });

                if (cancelled) return;

                if (data.success && data.user) {
                    dispatch(setUser(data.user));
                } else {
                    dispatch(clearUser());
                    router.replace("/account/login");
                }
            } catch {
                if (!cancelled) {
                    dispatch(clearUser());
                    router.replace("/account/login");
                }
            } finally {
                if (!cancelled) dispatch(setAuthLoading(false));
            }
        };

        loadUser();

        return () => {
            cancelled = true;
        };
    }, [dispatch, isAuthenticated, user, router]);

    // Keep the profile form in sync with Redux.
    useEffect(() => {
        if (!user) return;

        setProfileForm({
            name: user.name || "",
            email: user.email || "",
            mobile: user.mobile || "",
            currentPassword: "",
            newPassword: "",
        });
    }, [user]);

    useEffect(() => {
        if (activeTab !== "orders" || !user) return;

        let cancelled = false;

        const loadRecentOrders = async () => {
            setOrdersLoading(true);
            setOrdersError("");

            try {
                const { data } = await axios.get("/api/user/orders", {
                    withCredentials: true,
                });

                if (!cancelled) {
                    setRecentOrders(data.success ? data.orders || [] : []);
                    if (!data.success) {
                        setOrdersError(data.message || "Unable to load orders.");
                    }
                }
            } catch (error) {
                if (!cancelled) {
                    setOrdersError(
                        error.response?.data?.message ||
                        "Unable to load your orders."
                    );
                }
            } finally {
                if (!cancelled) setOrdersLoading(false);
            }
        };

        loadRecentOrders();

        return () => {
            cancelled = true;
        };
    }, [activeTab, user]);

    const loadAddresses = useCallback(async () => {
        setAddressesLoading(true);
        setAddressError("");

        try {
            const { data } = await axios.get("/api/user/addresses", {
                withCredentials: true,
            });

            if (data.success) {
                setAddresses(data.addresses || []);
            } else {
                setAddressError(data.message || "Could not load your addresses.");
            }
        } catch (error) {
            setAddressError(
                error.response?.data?.message || "Could not load your addresses."
            );
        } finally {
            setAddressesLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === "addresses" && user) loadAddresses();
    }, [activeTab, user, loadAddresses]);

    const handleLogout = async () => {
        setLoggingOut(true);

        try {
            await axios.post("/api/user/logout", {}, { withCredentials: true });
            window.dispatchEvent(new Event("solvestic-cart-updated"));
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            dispatch(clearUser());
            router.replace("/account/login");
            router.refresh();
        }
    };

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setProfileForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleProfileSave = async (event) => {
        event.preventDefault();
        setSavingProfile(true);
        setProfileMessage("");
        setProfileError("");

        try {
            const { data } = await axios.patch(
                "/api/user/profile",
                profileForm,
                { withCredentials: true }
            );

            if (!data.success || !data.user) {
                throw new Error(data.message || "Unable to update your profile.");
            }

            dispatch(setUser(data.user));
            setProfileMessage(data.message || "Account details updated.");
            setEditingProfile(false);
            setProfileForm((previous) => ({
                ...previous,
                currentPassword: "",
                newPassword: "",
            }));
        } catch (error) {
            setProfileError(
                error.response?.data?.message ||
                error.message ||
                "Unable to update your profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    const openAddAddress = () => {
        setEditingAddress(null);
        setAddressForm({ ...emptyAddress, fullName: user?.name || "", mobile: user?.mobile || "" });
        setAddressMessage("");
        setAddressError("");
        setAddressModalOpen(true);
    };

    const openEditAddress = (address) => {
        setEditingAddress(address);
        setAddressForm({
            ...emptyAddress,
            ...address,
            isDefault: Boolean(address.isDefault),
        });
        setAddressMessage("");
        setAddressError("");
        setAddressModalOpen(true);
    };

    const handleAddressChange = (event) => {
        const { name, value, checked, type } = event.target;

        setAddressForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleAddressSave = async (event) => {
        event.preventDefault();
        setSavingAddress(true);
        setAddressError("");
        setAddressMessage("");

        try {
            let response;

            if (editingAddress?._id) {
                response = await axios.patch(
                    "/api/user/addresses",
                    {
                        ...addressForm,
                        addressId: editingAddress._id,
                        action: "edit",
                    },
                    { withCredentials: true }
                );
            } else {
                response = await axios.post(
                    "/api/user/addresses",
                    addressForm,
                    { withCredentials: true }
                );
            }

            const { data } = response;

            if (!data.success) {
                throw new Error(data.message || "Unable to save this address.");
            }

            if (Array.isArray(data.addresses)) {
                setAddresses(data.addresses);
            } else {
                await loadAddresses();
            }

            setAddressModalOpen(false);
            setEditingAddress(null);
            setAddressMessage(
                editingAddress ? "Address updated successfully." : "Address added successfully."
            );
        } catch (error) {
            setAddressError(
                error.response?.data?.message ||
                error.message ||
                "Unable to save this address."
            );
        } finally {
            setSavingAddress(false);
        }
    };

    const handleSetDefaultAddress = async (addressId) => {
        setAddressError("");
        setAddressMessage("");

        try {
            const { data } = await axios.patch(
                "/api/user/addresses",
                { addressId, action: "default" },
                { withCredentials: true }
            );

            if (!data.success) {
                throw new Error(data.message || "Could not update the default address.");
            }

            setAddresses(data.addresses || []);
            setAddressMessage("Default delivery address updated.");
        } catch (error) {
            setAddressError(
                error.response?.data?.message ||
                error.message ||
                "Could not update the default address."
            );
        }
    };

    if (isLoading || (!isAuthenticated && !user)) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center bg-[#F7F2FC]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-9 w-9 animate-spin text-[#7D45C2]" />
                    <p className="text-sm text-gray-500">Loading your account...</p>
                </div>
            </div>
        );
    }

    const displayName = user?.name || "Customer";
    const initials = displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
        })
        : "Valued member";

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="transition hover:text-[#7D45C2]">Home</Link>
                    <ChevronRight size={15} />
                    <span className="font-medium text-gray-900">My Account</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative mb-8 overflow-hidden rounded-3xl bg-[#7D45C2] p-6 text-white sm:p-9"
                >
                    <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[35px] border-white/10" />
                    <div className="pointer-events-none absolute -bottom-28 right-40 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                    <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                        <div>
                            <p className="mb-2 text-sm font-medium text-white/75">YOUR SOLVESTIC ACCOUNT</p>
                            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                Hello, {displayName.split(" ")[0]}!
                            </h1>
                            <p className="mt-3 max-w-lg text-sm leading-6 text-white/80 sm:text-base">
                                Manage your profile, delivery addresses, orders, and account settings in one place.
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-xl font-bold text-[#7D45C2]">
                                {initials || "S"}
                            </div>
                            <div>
                                <p className="font-semibold">{displayName}</p>
                                <div className="mt-1 flex items-center gap-1.5 text-xs text-white/75">
                                    <ShieldCheck size={14} />
                                    Registered customer
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="overflow-hidden rounded-3xl border border-[#E9DDF5] bg-white p-3 shadow-sm">
                        <div className="border-b border-gray-100 px-4 py-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                                Dashboard
                            </p>
                        </div>

                        <nav className="space-y-1 py-3">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = activeTab === item.id;

                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => setActiveTab(item.id)}
                                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left text-sm font-medium transition ${active
                                            ? "bg-[#F1E8FA] text-[#7D45C2]"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-[#7D45C2]"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon size={19} />
                                            {item.label}
                                        </span>
                                        <ChevronRight size={16} />
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="border-t border-gray-100 p-2 pt-4">
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                            >
                                {loggingOut ? <Loader2 size={19} className="animate-spin" /> : <LogOut size={19} />}
                                {loggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </div>
                    </aside>

                    <section className="min-w-0">
                        {activeTab === "profile" && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-8"
                            >
                                <div className="mb-8 flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Personal Information</h2>
                                        <p className="mt-1 text-sm text-gray-500">Your registered account details.</p>
                                    </div>
                                    <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2] sm:flex">
                                        <CircleUserRound size={25} />
                                    </div>
                                </div>

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <InfoCard icon={UserRound} label="Full Name" value={user?.name} />
                                    <InfoCard icon={Mail} label="Email Address" value={user?.email} />
                                    <InfoCard icon={Phone} label="Mobile Number" value={user?.mobile} />
                                    <InfoCard icon={CalendarDays} label="Member Since" value={memberSince} />
                                </div>

                                <div className="mt-8 rounded-2xl bg-[#F7F2FC] p-5">
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="mt-0.5 shrink-0 text-[#7D45C2]" size={21} />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Account security</h3>
                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                Keep your contact details up to date so you can receive important order and account notifications.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditingProfile(true);
                                        setProfileMessage("");
                                        setProfileError("");
                                        setActiveTab("settings");
                                    }}
                                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA]"
                                >
                                    <Pencil size={16} />
                                    Edit Profile
                                </button>
                            </motion.div>
                        )}

                        {activeTab === "settings" && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-8"
                            >
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Account Settings</h2>
                                    <p className="mt-2 text-sm leading-6 text-gray-500">
                                        Update your personal details or change your password.
                                    </p>
                                </div>

                                {profileMessage && <Notice success message={profileMessage} />}
                                {profileError && <Notice message={profileError} />}

                                <form onSubmit={handleProfileSave} className="space-y-5">
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        <Field label="Full Name" name="name" value={profileForm.name} onChange={handleProfileChange} required />
                                        <Field label="Email Address" name="email" type="email" value={profileForm.email} onChange={handleProfileChange} required />
                                        <Field label="Mobile Number" name="mobile" value={profileForm.mobile} onChange={handleProfileChange} required hint="Include your country code, e.g. +919876543210." />
                                    </div>

                                    <div className="border-t border-gray-100 pt-5">
                                        <h3 className="font-semibold text-gray-900">Change Password</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Leave these fields empty if you do not want to change your password.
                                        </p>
                                        <div className="mt-4 grid gap-5 sm:grid-cols-2">
                                            <Field
                                                label="Current Password"
                                                name="currentPassword"
                                                type="password"
                                                value={profileForm.currentPassword}
                                                onChange={handleProfileChange}
                                                autoComplete="current-password"
                                            />
                                            <Field
                                                label="New Password"
                                                name="newPassword"
                                                type="password"
                                                value={profileForm.newPassword}
                                                onChange={handleProfileChange}
                                                autoComplete="new-password"
                                                hint="At least 8 characters."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={savingProfile}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA] disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                            {savingProfile ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                                            {savingProfile ? "Saving..." : "Save Changes"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileForm({
                                                    name: user?.name || "",
                                                    email: user?.email || "",
                                                    mobile: user?.mobile || "",
                                                    currentPassword: "",
                                                    newPassword: "",
                                                });
                                                setProfileError("");
                                                setProfileMessage("");
                                            }}
                                            className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </form>

                                <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-red-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Sign out of your account</h3>
                                        <p className="mt-1 text-sm text-gray-500">You can sign in again whenever you want.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-60"
                                    >
                                        {loggingOut ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
                                        {loggingOut ? "Logging out..." : "Logout"}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "addresses" && (
                            <motion.div
                                key="addresses"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-8"
                            >
                                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Saved Addresses</h2>
                                        <p className="mt-1 text-sm text-gray-500">Manage your delivery addresses.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={openAddAddress}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#6937AA]"
                                    >
                                        <Plus size={17} /> Add Address
                                    </button>
                                </div>

                                {addressMessage && <Notice success message={addressMessage} />}
                                {addressError && <Notice message={addressError} />}

                                {addressesLoading ? (
                                    <div className="flex min-h-40 items-center justify-center">
                                        <Loader2 className="h-7 w-7 animate-spin text-[#7D45C2]" />
                                    </div>
                                ) : addresses.length === 0 ? (
                                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCC8F0] px-6 text-center">
                                        <MapPin className="mb-3 text-[#7D45C2]" size={32} />
                                        <h3 className="font-semibold text-gray-900">No saved addresses yet</h3>
                                        <p className="mt-2 text-sm text-gray-500">Add an address to make checkout faster.</p>
                                        <button type="button" onClick={openAddAddress} className="mt-4 rounded-xl bg-[#7D45C2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#6937AA]">
                                            Add Your First Address
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {addresses.map((address) => (
                                            <div key={address._id} className="rounded-2xl border border-gray-100 p-4 sm:p-5">
                                                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                                                    <div className="flex gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1E8FA] text-[#7D45C2]">
                                                            <MapPin size={20} />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="font-semibold text-gray-900">{address.fullName}</h3>
                                                                {address.isDefault && (
                                                                    <span className="rounded-full bg-[#F1E8FA] px-2.5 py-1 text-xs font-semibold text-[#7D45C2]">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="mt-1 text-sm leading-6 text-gray-600">
                                                                {address.addressLine1}
                                                                {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                                                                {`, ${address.city}, ${address.state} ${address.pincode}, ${address.country}`}
                                                            </p>
                                                            <p className="mt-1 text-sm text-gray-500">{address.mobile}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                                                        {!address.isDefault && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSetDefaultAddress(address._id)}
                                                                className="rounded-lg border border-[#DCC8F0] px-3 py-2 text-xs font-semibold text-[#7D45C2] hover:bg-[#F7F2FC]"
                                                            >
                                                                Set Default
                                                            </button>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditAddress(address)}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                        >
                                                            <Pencil size={14} /> Edit
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "orders" && (
                            <motion.div
                                key="orders"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="rounded-3xl border border-[#E9DDF5] bg-white p-5 shadow-sm sm:p-8"
                            >
                                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                            Recent Orders
                                        </h2>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Your two most recent purchases.
                                        </p>
                                    </div>

                                    <Link
                                        href="/orders"
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA]"
                                    >
                                        View All Orders <ArrowRight size={17} />
                                    </Link>
                                </div>

                                {ordersError && <Notice message={ordersError} />}

                                {ordersLoading ? (
                                    <div className="flex min-h-40 items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-[#7D45C2]" />
                                    </div>
                                ) : recentOrders.length === 0 ? (
                                    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-[#DCC8F0] px-6 text-center">
                                        <Package size={38} className="mb-4 text-[#7D45C2]" />
                                        <h3 className="font-semibold text-gray-900">
                                            No orders yet
                                        </h3>
                                        <p className="mt-2 text-sm text-gray-500">
                                            Your recent purchases will appear here.
                                        </p>
                                        <Link
                                            href="/our-products"
                                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6937AA]"
                                        >
                                            Explore Products <ArrowRight size={17} />
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentOrders.map((order) => {
                                            const items = order.items || [];
                                            const itemCount = items.reduce(
                                                (total, item) => total + Number(item.quantity || 0),
                                                0
                                            );

                                            const orderStatus = (order.orderStatus || "pending")
                                                .replaceAll("_", " ");

                                            const paymentStatus = (order.paymentStatus || "pending")
                                                .replaceAll("_", " ");

                                            return (
                                                <div
                                                    key={order._id}
                                                    className="rounded-2xl border border-gray-100 p-4 transition hover:border-[#DCC8F0] sm:p-5"
                                                >
                                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                        <div>
                                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                                                Order Number
                                                            </p>
                                                            <h3 className="mt-1 break-all font-bold text-gray-900">
                                                                {order.orderNumber}
                                                            </h3>
                                                            <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                                                <CalendarDays size={15} />
                                                                {order.createdAt
                                                                    ? new Date(order.createdAt).toLocaleDateString(
                                                                        "en-IN",
                                                                        {
                                                                            day: "numeric",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        }
                                                                    )
                                                                    : "Date unavailable"}
                                                            </p>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="rounded-full bg-[#F1E8FA] px-3 py-1.5 text-xs font-semibold capitalize text-[#7D45C2]">
                                                                {orderStatus}
                                                            </span>

                                                            <span
                                                                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${paymentStatus === "paid"
                                                                    ? "bg-green-50 text-green-700"
                                                                    : paymentStatus === "failed"
                                                                        ? "bg-red-50 text-red-600"
                                                                        : "bg-amber-50 text-amber-700"
                                                                    }`}
                                                            >
                                                                Payment: {paymentStatus}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="my-4 border-t border-gray-100" />

                                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800">
                                                                {items.length > 0
                                                                    ? items[0].name
                                                                    : "Order items"}
                                                                {items.length > 1
                                                                    ? ` + ${items.length - 1} more ${items.length - 1 === 1
                                                                        ? "product"
                                                                        : "products"
                                                                    }`
                                                                    : ""}
                                                            </p>

                                                            <p className="mt-1 text-sm text-gray-500">
                                                                {itemCount} {itemCount === 1 ? "item" : "items"}
                                                                {" · "}
                                                                {order.paymentMethod === "razorpay"
                                                                    ? "Online Payment"
                                                                    : "Cash on Delivery"}
                                                            </p>

                                                            {order.shipment?.trackingUrl && (
                                                                <a
                                                                    href={order.shipment.trackingUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="mt-2 inline-block text-sm font-semibold text-[#7D45C2] hover:underline"
                                                                >
                                                                    Track Shipment
                                                                </a>
                                                            )}
                                                        </div>

                                                        <div className="shrink-0 sm:text-right">
                                                            <p className="text-xs text-gray-400">
                                                                Total Amount
                                                            </p>
                                                            <p className="mt-1 text-xl font-bold text-gray-900">
                                                                {new Intl.NumberFormat("en-IN", {
                                                                    style: "currency",
                                                                    currency: order.currency || "INR",
                                                                    maximumFractionDigits: 2,
                                                                }).format(Number(order.totalAmount || 0))}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        <div className="pt-2 text-center">
                                            <Link
                                                href="/orders"
                                                className="inline-flex items-center gap-2 rounded-xl border border-[#DCC8F0] px-5 py-3 text-sm font-semibold text-[#7D45C2] transition hover:bg-[#F7F2FC]"
                                            >
                                                View All Orders <ArrowRight size={17} />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "help-center" && (
                            <EmptyState
                                icon={Headphones}
                                title="How can we help?"
                                description="For help with your orders or products, please contact the Solvestic support team."
                                buttonText="Contact Us"
                                href="/contact"
                            />
                        )}
                    </section>
                </div>

                <div className="mt-8 flex flex-col justify-between gap-5 rounded-3xl border border-[#E9DDF5] bg-white p-6 sm:flex-row sm:items-center sm:p-8">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2]">
                            <ShoppingBag size={23} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900">Looking for something special?</h3>
                            <p className="mt-1 text-sm text-gray-500">Explore our collection and find your next favourite.</p>
                        </div>
                    </div>
                    <Link href="/our-products" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA]">
                        Shop Now <ArrowRight size={17} />
                    </Link>
                </div>
            </div>

            {addressModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
                        <div className="mb-6 flex items-start justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingAddress ? "Edit Address" : "Add Delivery Address"}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">Enter your delivery details below.</p>
                            </div>
                            <button type="button" onClick={() => setAddressModalOpen(false)} className="rounded-xl p-2 text-gray-500 hover:bg-gray-100" aria-label="Close address form">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddressSave} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Field label="Full Name" name="fullName" value={addressForm.fullName} onChange={handleAddressChange} required />
                                <Field label="Mobile Number" name="mobile" value={addressForm.mobile} onChange={handleAddressChange} required />
                                <Field label="Address Line 1" name="addressLine1" value={addressForm.addressLine1} onChange={handleAddressChange} required />
                                <Field label="Address Line 2 (Optional)" name="addressLine2" value={addressForm.addressLine2} onChange={handleAddressChange} />
                                <Field label="City" name="city" value={addressForm.city} onChange={handleAddressChange} required />
                                <Field label="State" name="state" value={addressForm.state} onChange={handleAddressChange} required />
                                <Field label="Country" name="country" value={addressForm.country} onChange={handleAddressChange} required />
                                <Field label="PIN Code" name="pincode" value={addressForm.pincode} onChange={handleAddressChange} required />
                            </div>

                            <label className="flex items-center gap-3 rounded-xl bg-[#F7F2FC] p-3 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    checked={Boolean(addressForm.isDefault)}
                                    onChange={handleAddressChange}
                                    className="h-4 w-4 accent-[#7D45C2]"
                                />
                                Set as my default delivery address
                            </label>

                            {addressError && <Notice message={addressError} />}

                            <div className="flex flex-wrap justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setAddressModalOpen(false)} className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50">
                                    Cancel
                                </button>
                                <button type="submit" disabled={savingAddress} className="inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6937AA] disabled:opacity-60">
                                    {savingAddress ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                                    {savingAddress ? "Saving..." : editingAddress ? "Update Address" : "Save Address"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    );
}

function Field({ label, name, value, onChange, type = "text", required = false, hint, autoComplete }) {
    return (
        <div>
            <label htmlFor={name} className="mb-2 block text-sm font-medium text-gray-700">
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value ?? ""}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#7D45C2] focus:ring-4 focus:ring-[#7D45C2]/10"
            />
            {hint && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
        </div>
    );
}

function InfoCard({ icon: Icon, label, value }) {
    return (
        <div className="flex min-w-0 items-start gap-4 rounded-2xl border border-gray-100 p-4 transition hover:border-[#DCC8F0]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F1E8FA] text-[#7D45C2]">
                <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
                <p className="mt-2 break-words text-sm font-semibold text-gray-900">{value || "Not provided"}</p>
            </div>
        </div>
    );
}

function Notice({ message, success = false }) {
    return (
        <div className={`mb-4 flex items-start gap-2 rounded-xl border p-3 text-sm ${success
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-600"
            }`}>
            {success && <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}
            <span>{message}</span>
        </div>
    );
}

function EmptyState({ icon: Icon, title, description, buttonText, href }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-[#E9DDF5] bg-white px-6 py-12 text-center shadow-sm"
        >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F1E8FA] text-[#7D45C2]">
                <Icon size={30} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500">{description}</p>
            <Link href={href} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7D45C2] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#6937AA]">
                {buttonText} <ArrowRight size={17} />
            </Link>
        </motion.div>
    );
}
