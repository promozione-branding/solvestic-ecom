
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  UserRound,
  Mail,
  Phone,
  LockKeyhole,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { setUser } from "@/redux/authSlice";

export default function Register() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const update = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleMobileChange = (e) => {
    let digits = e.target.value.replace(/\D/g, "");

    // Handle pasted numbers with +91 or 91
    if (digits.length > 10 && digits.startsWith("91")) {
      digits = digits.slice(2);
    }

    // Handle pasted numbers with leading 0
    if (digits.length === 11 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    setForm((prev) => ({
      ...prev,
      mobile: digits.slice(0, 10),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8 || form.password.length > 72) {
      setError("Password must be between 8 and 72 characters.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/user/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({
          name: form.name.trim(),
          mobile: `+91${form.mobile}`,
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Registration failed. Please try again.");
        return;
      }

      // Update Redux authentication state.
      dispatch(setUser(data.user));
      setSuccess("Account created successfully! Redirecting...");
      window.dispatchEvent(new Event("solvestic-cart-updated"));
      router.replace("/cart");
      router.refresh();
    } catch (error) {
      console.error("Registration error:", error);
      setError("Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "h-13 w-full rounded-xl border border-[#E8DFEF] bg-[#FCFAFE] px-4 pl-11 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#7D45C2] focus:ring-4 focus:ring-[#7D45C2]/10";

  return (
    <main className="min-h-screen bg-[#F7F2FC] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[85vh] max-w-6xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="grid w-full max-w-5xl overflow-hidden rounded-[28px] bg-white shadow-[0_20px_80px_rgba(60,32,90,0.12)] lg:grid-cols-2"
        >
          <section className="relative hidden min-h-[720px] overflow-hidden bg-[#7D45C2] p-12 text-white lg:flex lg:flex-col lg:justify-between">
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
                Join Solvestic
              </p>

              <h1 className="text-5xl font-bold leading-[1.15] tracking-tight">
                Make yourself at home.
              </h1>

              <p className="mt-6 leading-7 text-white/75">
                Create your account for a simpler, more personal shopping
                experience with Solvestic.
              </p>
            </div>

            <p className="relative z-10 text-sm text-white/65">
              © {new Date().getFullYear()} Solvestic. All rights reserved.
            </p>
          </section>

          <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
            <div className="w-full max-w-md">
              <Link href="/" className="mb-8 flex justify-center items-center lg:hidden">
                <Image
                  src="/logo/solve.png"
                  alt="Solvestic"
                  width={150}
                  height={46}
                  priority
                  className="h-auto max-h-12 w-auto object-contain"
                />
              </Link>

              <div className="mb-7">
                <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                  Get started
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-[#20172B] sm:text-4xl">
                  Create your account
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Enter your details to join Solvestic.
                </p>
              </div>

              {error && (
                <div role="alert" className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="mb-5 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-[#6936AE]">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#30253D]">
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="name" name="name" type="text" autoComplete="name" maxLength={100} placeholder="Enter your full name" value={form.name} onChange={update} required className={fieldClass} />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="mobile"
                    className="mb-2 block text-sm font-semibold text-[#30253D]"
                  >
                    Mobile number
                  </label>

                  <div className="relative">
                    <Phone
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="9876543210"
                      value={form.mobile}
                      onChange={handleMobileChange}
                      maxLength={13}
                      pattern="[6-9][0-9]{9}"
                      required
                      className={fieldClass}
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-gray-400">
                    Enter your 10-digit mobile number.
                  </p>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#30253D]">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="email" name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" value={form.email} onChange={update} required className={fieldClass} />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#30253D]">
                    Password
                  </label>
                  <div className="relative">
                    <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} maxLength={72} placeholder="Create a strong password" value={form.password} onChange={update} required className={`${fieldClass} pr-12`} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7D45C2]">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    Use 8–72 characters.
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#30253D]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirmPassword} onChange={update} required className={fieldClass} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#7D45C2] px-5 text-sm font-bold text-white shadow-lg shadow-[#7D45C2]/20 transition hover:bg-[#6936AE] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <LoaderCircle className="animate-spin" size={20} />
                  ) : (
                    <>Create account <ArrowRight size={19} /></>
                  )}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-gray-500">
                Already have an account?{" "}
                <Link href="/account/login" className="font-bold text-[#7D45C2] hover:underline">
                  Sign in
                </Link>
              </p>

              <p className="mt-6 text-center text-xs leading-5 text-gray-400">
                By creating an account, you agree to our{" "}
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
