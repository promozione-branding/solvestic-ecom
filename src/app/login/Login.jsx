
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Eye,
    EyeOff,
    LockKeyhole,
    Mail,
    Phone,
    ShieldCheck,
    LoaderCircle,
    ArrowLeft,
} from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber, } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";

export default function Login() {
    const router = useRouter();
    const verifier = useRef(null);
    const confirmation = useRef(null);

    const [method, setMethod] = useState("email");
    const [showPassword, setShowPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [form, setForm] = useState({
        email: "",
        password: "",
        mobile: "",
        otp: "",
        remember: true,
    });

    const update = (e) => {
        const { name, value, checked, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const request = async (url, body) => {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Something went wrong.");
        }

        return data;
    };

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            await request("/api/user/login", {
                email: form.email,
                password: form.password,
                remember: form.remember,
            });

            router.replace("/account");
            router.refresh();
        } catch (err) {
            setError(err.message || "Unable to sign in.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            const mobile = form.mobile.trim();

            if (!/^\+[1-9]\d{7,14}$/.test(mobile)) {
                throw new Error(
                    "Enter your mobile number with country code, e.g. +919876543210."
                );
            }

            if (!verifier.current) {
                verifier.current = new RecaptchaVerifier(
                    firebaseAuth,
                    "login-recaptcha",
                    { size: "invisible" }
                );
            }

            confirmation.current = await signInWithPhoneNumber(
                firebaseAuth,
                mobile,
                verifier.current
            );

            setOtpSent(true);
            setMessage("Verification code sent to " + mobile);
        } catch (err) {
            verifier.current?.clear();
            verifier.current = null;
            setError(err.message || "Unable to send OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!confirmation.current) {
            setError("Please request a new verification code.");
            return;
        }

        if (!/^\d{6}$/.test(form.otp.trim())) {
            setError("Enter the 6-digit verification code.");
            return;
        }

        setLoading(true);

        try {
            const credential = await confirmation.current.confirm(
                form.otp.trim()
            );

            const idToken = await credential.user.getIdToken();

            await request("/api/user/otp/verify", { idToken });

            router.replace("/account");
            router.refresh();
        } catch (err) {
            setError(
                err.message?.includes("invalid-verification-code")
                    ? "Incorrect verification code. Please try again."
                    : err.message || "OTP verification failed."
            );
        } finally {
            setLoading(false);
        }
    };

    const switchMethod = (next) => {
        setMethod(next);
        setError("");
        setMessage("");
    };

    return (
        <main className="min-h-screen bg-[#F7F2FC] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45 }}
                    className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_20px_80px_rgba(60,32,90,0.12)] lg:grid-cols-2"
                >
                    <section className="relative hidden min-h-[680px] overflow-hidden bg-[#7D45C2] p-12 text-white lg:flex lg:flex-col lg:justify-between">
                        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-white/15" />
                        <div className="absolute -bottom-24 -left-20 h-96 w-96 rounded-full border border-white/15" />

                        <Link href="/" className="relative z-10 flex justify-center items-center">
                            <Image
                                src="/logo/solve.png"
                                alt="Solvestic"
                                width={200}
                                height={90}
                                priority
                                className="h-auto w-auto object-contain"
                            />
                        </Link>

                        <div className="relative z-10 max-w-md">
                            <div className="mb-7 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
                                <ShieldCheck size={30} />
                            </div>

                            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
                                Your account, your space
                            </p>

                            <h1 className="text-5xl font-bold leading-[1.15] tracking-tight">
                                A better experience starts here.
                            </h1>

                            <p className="mt-6 max-w-sm leading-7 text-white/75">
                                Sign in securely to manage your Solvestic account and keep
                                everything you need in one place.
                            </p>
                        </div>

                        <p className="relative z-10 text-sm text-white/65">
                            © {new Date().getFullYear()} Solvestic. All rights reserved.
                        </p>
                    </section>

                    <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
                        <div className="w-full max-w-md">
                            <Link href="/" className="mb-8 inline-block lg:hidden">
                                <Image
                                    src="/logo/solvestic.png"
                                    alt="Solvestic"
                                    width={150}
                                    height={46}
                                    priority
                                    className="h-auto max-h-12 w-auto object-contain"
                                />
                            </Link>

                            <div className="mb-8">
                                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                                    Welcome back
                                </p>
                                <h2 className="text-3xl font-bold tracking-tight text-[#20172B] sm:text-4xl">
                                    Sign in to your account
                                </h2>
                                <p className="mt-3 text-sm leading-6 text-gray-500">
                                    Choose your preferred way to securely sign in.
                                </p>
                            </div>

                            <div className="mb-7 grid grid-cols-2 rounded-xl bg-[#F7F2FC] p-1">
                                <button
                                    type="button"
                                    onClick={() => switchMethod("email")}
                                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${method === "email"
                                        ? "bg-white text-[#7D45C2] shadow-sm"
                                        : "text-gray-500 hover:text-[#7D45C2]"
                                        }`}
                                >
                                    <Mail size={17} />
                                    Email login
                                </button>

                                <button
                                    type="button"
                                    onClick={() => switchMethod("mobile")}
                                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-semibold transition ${method === "mobile"
                                        ? "bg-white text-[#7D45C2] shadow-sm"
                                        : "text-gray-500 hover:text-[#7D45C2]"
                                        }`}
                                >
                                    <Phone size={17} />
                                    Mobile OTP
                                </button>
                            </div>

                            {error && (
                                <div
                                    role="alert"
                                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                >
                                    {error}
                                </div>
                            )}

                            {message && (
                                <div
                                    role="status"
                                    className="mb-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-[#6936AE]"
                                >
                                    {message}
                                </div>
                            )}

                            {method === "email" ? (
                                <form onSubmit={handleEmailLogin} className="space-y-5">
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-[#30253D]"
                                        >
                                            Email address
                                        </label>
                                        <div className="relative">
                                            <Mail
                                                size={19}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                value={form.email}
                                                onChange={update}
                                                required
                                                className="h-14 w-full rounded-xl border border-[#E8DFEF] bg-[#FCFAFE] pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#7D45C2] focus:ring-4 focus:ring-[#7D45C2]/10"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between gap-2">
                                            <label
                                                htmlFor="password"
                                                className="text-sm font-semibold text-[#30253D]"
                                            >
                                                Password
                                            </label>

                                        </div>

                                        <div className="relative">
                                            <LockKeyhole
                                                size={19}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            />
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                value={form.password}
                                                onChange={update}
                                                required
                                                className="h-14 w-full rounded-xl border border-[#E8DFEF] bg-[#FCFAFE] pl-12 pr-12 text-sm text-gray-800 outline-none transition focus:border-[#7D45C2] focus:ring-4 focus:ring-[#7D45C2]/10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((v) => !v)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7D45C2]"
                                            >
                                                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex mt-2 justify-between items-center">
                                        <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-600">
                                            <input
                                                type="checkbox"
                                                name="remember"
                                                checked={form.remember}
                                                onChange={update}
                                                className="h-4 w-4 accent-[#7D45C2]"
                                            />
                                            Keep me signed in
                                        </label>
                                        <Link
                                            href="/account/forgot-password"
                                            className="text-sm font-semibold text-[#7D45C2] hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#7D45C2] px-5 text-sm font-bold text-white shadow-lg shadow-[#7D45C2]/20 transition hover:bg-[#6936AE] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <LoaderCircle className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                Sign in <ArrowRight size={19} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <form
                                    onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                                    className="space-y-5"
                                >
                                    {!otpSent ? (
                                        <div>
                                            <label
                                                htmlFor="mobile"
                                                className="mb-2 block text-sm font-semibold text-[#30253D]"
                                            >
                                                Mobile number
                                            </label>
                                            <div className="relative">
                                                <Phone
                                                    size={19}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                                />
                                                <input
                                                    id="mobile"
                                                    name="mobile"
                                                    type="tel"
                                                    inputMode="tel"
                                                    autoComplete="tel"
                                                    placeholder="+919876543210"
                                                    value={form.mobile}
                                                    onChange={update}
                                                    required
                                                    className="h-14 w-full rounded-xl border border-[#E8DFEF] bg-[#FCFAFE] pl-12 pr-4 text-sm text-gray-800 outline-none transition focus:border-[#7D45C2] focus:ring-4 focus:ring-[#7D45C2]/10"
                                                />
                                            </div>
                                            <p className="mt-2 text-xs leading-5 text-gray-500">
                                                Include your country code. We will send you a
                                                verification code by SMS.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <label
                                                    htmlFor="otp"
                                                    className="mb-2 block text-sm font-semibold text-[#30253D]"
                                                >
                                                    Verification code
                                                </label>
                                                <input
                                                    id="otp"
                                                    name="otp"
                                                    type="text"
                                                    inputMode="numeric"
                                                    autoComplete="one-time-code"
                                                    maxLength={6}
                                                    placeholder="Enter 6-digit OTP"
                                                    value={form.otp}
                                                    onChange={(e) =>
                                                        setForm((prev) => ({
                                                            ...prev,
                                                            otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                                                        }))
                                                    }
                                                    required
                                                    className="h-14 w-full rounded-xl border border-[#E8DFEF] bg-[#FCFAFE] px-4 text-center text-lg tracking-[0.4em] text-gray-800 outline-none transition focus:border-[#7D45C2] focus:ring-4 focus:ring-[#7D45C2]/10"
                                                />
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Sent to {form.mobile}
                                                </p>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    confirmation.current = null;
                                                    setOtpSent(false);
                                                    setForm((prev) => ({ ...prev, otp: "" }));
                                                    setError("");
                                                    setMessage("");
                                                }}
                                                className="flex items-center gap-2 text-sm font-semibold text-[#7D45C2] hover:underline"
                                            >
                                                <ArrowLeft size={16} /> Change mobile number
                                            </button>
                                        </>
                                    )}

                                    <div id="login-recaptcha" />

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#7D45C2] px-5 text-sm font-bold text-white shadow-lg shadow-[#7D45C2]/20 transition hover:bg-[#6936AE] disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading ? (
                                            <LoaderCircle className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                {otpSent ? "Verify & sign in" : "Send OTP"}
                                                <ArrowRight size={19} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            <div className="my-8 flex items-center gap-4">
                                <div className="h-px flex-1 bg-[#EEE7F4]" />
                                <span className="text-xs font-medium text-gray-400">
                                    NEW TO SOLVESTIC?
                                </span>
                                <div className="h-px flex-1 bg-[#EEE7F4]" />
                            </div>

                            <Link
                                href="/register"
                                className="flex h-14 w-full items-center justify-center rounded-xl border border-[#DCCBEF] text-sm font-bold text-[#7D45C2] transition hover:border-[#7D45C2] hover:bg-[#F7F2FC]"
                            >
                                Create an account
                            </Link>

                            <p className="mt-7 text-center text-xs leading-5 text-gray-400">
                                By continuing, you agree to our{" "}
                                <Link href="/terms" className="font-medium text-[#7D45C2] hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy-policy" className="font-medium text-[#7D45C2] hover:underline">
                                    Privacy Policy
                                </Link>.
                            </p>
                        </div>
                    </section>
                </motion.div>
            </div>
        </main>
    );
}
