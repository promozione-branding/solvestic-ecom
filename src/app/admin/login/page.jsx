"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    ArrowRight,
} from "lucide-react";

export default function Page() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            const response = await axios.post("/api/admin/login",
                { email: email.trim().toLowerCase(), password, },
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json", },
                }
            );

            if (response.data?.success) {
                router.replace("/admin");
                router.refresh();
            } else {
                setError(response.data?.message || "Unable to sign in.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email address or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F2FC] px-4 py-8 sm:px-6">
            <div className="w-full max-w-[440px] rounded-2xl border border-[#e9dff5] bg-white px-6 py-8 shadow-[0_15px_50px_rgba(125,69,194,0.09)] sm:px-10 sm:py-10">
                {/* Logo */}
                <div className="flex justify-center h-20 overflow-hidden relative">
                    <Image
                        src="/logo/logo.gif"
                        alt="Solvestic Logo"
                        width={190}
                        height={65}
                        priority
                        className="h-40 absolute -top-10 w-auto object-cover object-bottom"
                    />
                </div>

                {/* Heading */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl tracking-wide text-[#24202b]">
                        Admin Login
                    </h1>

                    <p className="mt-2 font-sans text-sm leading-6 text-gray-500">
                        Welcome back! Please enter your details.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block font-sans text-sm font-medium text-gray-700"
                        >
                            Email Address
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 transition focus-within:border-[#7D45C2] focus-within:ring-2 focus-within:ring-[#7D45C2]/10">
                            <Mail
                                size={18}
                                className="shrink-0 text-[#7D45C2]"
                            />

                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                                disabled={loading}
                                className="h-full w-full bg-transparent font-sans text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block font-sans text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <div className="flex h-12 items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 transition focus-within:border-[#7D45C2] focus-within:ring-2 focus-within:ring-[#7D45C2]/10">
                            <LockKeyhole
                                size={18}
                                className="shrink-0 text-[#7D45C2]"
                            />

                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                disabled={loading}
                                className="h-full w-full bg-transparent font-sans text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword((prev) => !prev)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                className="shrink-0 text-gray-400 transition hover:text-[#7D45C2]"
                            >
                                {showPassword ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg bg-red-50 px-3 py-2 font-sans text-sm text-red-600"
                        >
                            {error}
                        </p>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#7D45C2] font-sans text-sm font-semibold text-white transition hover:bg-[#6935aa] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {loading ? "Signing in..." : "Sign In"}

                        {!loading && (
                            <ArrowRight
                                size={17}
                                className="transition-transform group-hover:translate-x-1"
                            />
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}