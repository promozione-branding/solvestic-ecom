
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
    X,
    MapPin,
    Navigation,
    LoaderCircle,
    CheckCircle2,
} from "lucide-react";

const initialAddress = {
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

const fields = [
    { name: "fullName", label: "Full Name", required: true },
    { name: "mobile", label: "Mobile Number", required: true },
    {
        name: "addressLine1",
        label: "House No. / Street / Area",
        required: true,
        // wide: true,
    },
    {
        name: "addressLine2",
        label: "Landmark (Optional)",
        // wide: true,
    },
    { name: "city", label: "City", required: true },
    { name: "state", label: "State", required: true },
    { name: "pincode", label: "PIN Code", required: true },
    { name: "country", label: "Country", required: true },
];

export default function AddressManager({
    open,
    onClose,
    onSelect,
    user,
    editingAddress = null,
}) {
    const [form, setForm] = useState(initialAddress);
    const [locating, setLocating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [locationMessage, setLocationMessage] = useState("");

    useEffect(() => {
        if (!open) return;

        setForm(
            editingAddress
                ? {
                    ...initialAddress,
                    ...editingAddress,
                    fullName: editingAddress.fullName || "",
                    mobile: editingAddress.mobile || "",
                    addressLine1: editingAddress.addressLine1 || "",
                    addressLine2: editingAddress.addressLine2 || "",
                    city: editingAddress.city || "",
                    state: editingAddress.state || "",
                    country: editingAddress.country || "India",
                    pincode: editingAddress.pincode || "",
                    isDefault: Boolean(editingAddress.isDefault),
                }
                : {
                    ...initialAddress,
                    fullName: user?.name || "",
                    mobile: "",
                }
        );

        setError("");
        setLocationMessage("");
    }, [open, editingAddress, user?.name, user?.mobile]);

    if (!open) return null;

    const updateField = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const getCurrentLocation = () => {
        setError("");
        setLocationMessage("");

        if (!navigator.geolocation) {
            setError("Your browser does not support location access.");
            return;
        }

        setLocating(true);

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&lat=${coords.latitude}&lon=${coords.longitude}`
                    );

                    if (!response.ok) {
                        throw new Error("Unable to find your address.");
                    }

                    const result = await response.json();
                    const address = result.address || {};

                    const city =
                        address.city ||
                        address.town ||
                        address.village ||
                        address.municipality ||
                        address.county ||
                        "";

                    const street = [
                        address.house_number,
                        address.road || address.pedestrian,
                    ]
                        .filter(Boolean)
                        .join(" ");

                    const locality =
                        address.neighbourhood ||
                        address.suburb ||
                        address.residential ||
                        address.quarter ||
                        "";

                    setForm((previous) => ({
                        ...previous,
                        addressLine1:
                            street ||
                            locality ||
                            result.display_name ||
                            previous.addressLine1,
                        addressLine2:
                            street && locality
                                ? locality
                                : previous.addressLine2,
                        city: city || previous.city,
                        state: address.state || previous.state,
                        country: address.country || previous.country,
                        pincode:
                            address.postcode || previous.pincode,
                    }));

                    setLocationMessage(
                        "Location found. Please review your address."
                    );
                } catch (err) {
                    setError(
                        err.message ||
                        "Could not retrieve your address. Please enter it manually."
                    );
                } finally {
                    setLocating(false);
                }
            },
            (err) => {
                setLocating(false);

                setError(
                    err.code === 1
                        ? "Location permission denied. Allow location access in your browser settings."
                        : err.code === 3
                            ? "Location request timed out. Please try again."
                            : "Unable to get your location. Please try again or enter your address manually."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000,
            }
        );
    };


    const normalizeMobile = (value) => {
        let digits = String(value || "").replace(/\D/g, "");

        if (digits.length > 10 && digits.startsWith("91")) {
            digits = digits.slice(2);
        }

        if (digits.length > 10 && digits.startsWith("0")) {
            digits = digits.slice(1);
        }

        return digits.slice(0, 10);
    };

    const handleMobileChange = (e) => {
        const mobile = normalizeMobile(e.target.value);

        setForm((prev) => ({
            ...prev,
            mobile,
        }));
    };

    const saveAddress = async (event) => {
        event.preventDefault();
        setError("");

        const digits = normalizeMobile(form.mobile);

        if (!/^[6-9]\d{9}$/.test(digits)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (!/^\d{6}$/.test(String(form.pincode).trim())) {
            setError("Please enter a valid 6-digit PIN code.");
            return;
        }

        const payload = {
            ...form,
            mobile: `+91${digits}`,
            pincode: String(form.pincode).trim(),
        };

        try {
            setSaving(true);

            const response = editingAddress
                ? await axios.patch("/api/user/addresses", {
                    ...payload,
                    addressId: editingAddress._id,
                    action: "edit",
                })
                : await axios.post("/api/user/addresses", payload);

            const data = response.data;

            if (!data.success || !data.address) {
                throw new Error(
                    data.message || "Unable to save this address."
                );
            }

            onSelect?.(data.address, data.addresses);
            onClose?.();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.message ||
                "Unable to save your address."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex h-[100dvh] items-end justify-center overflow-hidden overscroll-none bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !saving) {
                    onClose?.();
                }
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="address-modal-title"
                className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#EEE8F5] bg-white px-5 py-4 sm:px-7">
                    <div>
                        <h2
                            id="address-modal-title"
                            className="text-lg font-semibold text-[#24252A]"
                        >
                            {editingAddress ? "Edit Delivery Address" : "Add Delivery Address"}
                        </h2>
                        <p className="mt-1 text-xs text-[#88818F]">
                            Enter your details for delivery.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close address popup"
                        className="rounded-full bg-[#F7F2FC] p-2 text-[#7D45C2] transition hover:bg-[#EEE3FA] disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-7">
                    <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locating || saving}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#7D45C2]/25 bg-[#F7F2FC] px-4 py-3.5 text-sm font-semibold text-[#7D45C2] transition hover:bg-[#EEE3FA] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {locating ? (
                            <LoaderCircle
                                size={18}
                                className="animate-spin"
                            />
                        ) : (
                            <Navigation size={18} />
                        )}

                        {locating
                            ? "Finding your location..."
                            : "Use My Current Location"}
                    </button>

                    {locationMessage && (
                        <p className="mt-3 flex items-center gap-2 text-xs text-green-700">
                            <CheckCircle2 size={16} />
                            {locationMessage}
                        </p>
                    )}

                    {error && (
                        <p
                            role="alert"
                            className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {fields.map((field) => (
                            <div
                                key={field.name}
                                className={
                                    field.wide ? "sm:col-span-2" : ""
                                }
                            >
                                <label
                                    htmlFor={`address-${field.name}`}
                                    className="mb-2 block text-xs font-medium text-[#625B6B]"
                                >
                                    {field.label}
                                    {field.required && (
                                        <span className="text-red-500">
                                            {" "}*
                                        </span>
                                    )}
                                </label>


                                <input
                                    id={`address-${field.name}`}
                                    name={field.name}
                                    type={field.name === "mobile" ? "tel" : "text"}
                                    inputMode={
                                        ["mobile", "pincode"].includes(field.name)
                                            ? "numeric"
                                            : "text"
                                    }
                                    maxLength={
                                        field.name === "mobile"
                                            ? 13
                                            : field.name === "pincode"
                                                ? 6
                                                : undefined
                                    }
                                    value={form[field.name] ?? ""}
                                    onChange={
                                        field.name === "mobile"
                                            ? handleMobileChange
                                            : updateField
                                    }
                                    required={field.required}
                                    autoComplete={
                                        field.name === "mobile" ? "tel-national" : "on"
                                    }
                                    placeholder={
                                        field.name === "mobile"
                                            ? "Enter 10-digit mobile number"
                                            : `Enter ${field.label.toLowerCase()}`
                                    }
                                    className="w-full rounded-xl border border-[#EAE5EF] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA3B1] focus:border-[#7D45C2] focus:ring-4 focus:ring-[#7D45C2]/10"
                                />

                            </div>
                        ))}
                    </div>

                    <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm text-[#625B6B]">
                        <input
                            type="checkbox"
                            checked={form.isDefault}
                            onChange={(event) =>
                                setForm((previous) => ({
                                    ...previous,
                                    isDefault: event.target.checked,
                                }))
                            }
                            className="h-4 w-4 accent-[#7D45C2]"
                        />
                        Save as my default address
                    </label>

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="rounded-xl border border-[#EAE5EF] px-5 py-3 text-sm font-medium text-[#625B6B] hover:bg-gray-50 disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            onClick={saveAddress}
                            type="submit"
                            disabled={saving || locating}
                            className="flex items-center justify-center gap-2 rounded-xl bg-[#7D45C2] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6936AC] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {saving && (
                                <LoaderCircle
                                    size={17}
                                    className="animate-spin"
                                />
                            )}
                            {saving
                                ? "Saving..."
                                : editingAddress
                                    ? "Update Address"
                                    : "Save Address"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
