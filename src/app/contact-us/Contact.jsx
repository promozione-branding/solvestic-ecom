"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    ArrowRight,
    CheckCircle2,
    LoaderCircle,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        place: "",
        message: "",
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;
        const phone = formData.phone.trim().replace(/[\s()-]/g, "");

        if (!/^(?:\+91|91)?[6-9]\d{9}$/.test(phone)) {
            toast.error("Please enter a valid Indian phone number");
            return;
        }

        const data = {
            supplierToken: "6a9e3df1f9dc8e66e7dd8a92",
            platform: "Solvestic",
            platformEmail: "solvesticwellness@gmail.com",
            name: formData.name.trim(),
            email: formData.email.trim(),
            company: "N/A",
            phone,
            product: "Contact Enquiry",
            place: formData.place.trim(),
            message: formData.message.trim(),
        };

        try {
            setLoading(true);
            setSubmitted(false);

            const res = await axios.post(
                "https://brandbnalo.com/api/form/add",
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    timeout: 15000,
                    validateStatus: (status) =>
                        status >= 200 && status < 500,
                }
            );

            if (res.status >= 200 && res.status < 300) {
                setSubmitted(true);

                toast.success(
                    "Your message has been sent successfully!"
                );

                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    place: "",
                    message: "",
                });

                setTimeout(() => {
                    setSubmitted(false);
                }, 3000);
            } else {
                toast.error(
                    res.data?.message ||
                    "Something went wrong. Please try again."
                );
            }
        } catch (error) {
            console.error(
                "Contact form error:",
                error.response?.data || error.message
            );

            toast.error(
                error.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="overflow-hidden bg-white">
            {/* HERO */}
            <section className="bg-[#f3eef8] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-18">
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="mx-auto max-w-7xl text-center"
                >
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7D45C2]">
                        We'd love to hear from you
                    </p>

                    <h1 className="mt-5 text-4xl font-medium tracking-[-0.01em] text-[#28222e] sm:text-6xl lg:text-7xl">
                        Let's start a
                        <span className="text-[#7D45C2]"> conversation.</span>
                    </h1>
                </motion.div>
            </section>

            {/* CONTACT CONTENT */}
            <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">

                    {/* LEFT: CONTACT DETAILS */}
                    <motion.div
                        initial={{ opacity: 0, x: -25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65 }}
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D45C2]">
                            Contact information
                        </p>

                        <h2 className="mt-4 text-3xl font-medium tracking-[-0.04em] text-[#28222e] sm:text-4xl">
                            We're always happy to help.
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-[#716a78]">
                            Reach out to our team for product enquiries,
                            order assistance, or any other questions.
                        </p>

                        <div className="mt-9 space-y-7">

                            {/* ADDRESS */}
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eef8] text-[#7D45C2]">
                                    <MapPin className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[#302936]">
                                        Our office
                                    </h3>

                                    <p className="mt-2 text-sm leading-7 text-[#716a78]">
                                        <strong className="font-semibold text-[#302936]">
                                            Solvestic Wellness Private Limited
                                        </strong>
                                        <br />
                                        Office No. 1001, Pearl Best Heights-2,
                                        <br />
                                        Plot-C9, NSP, Pitampura,
                                        <br />
                                        Delhi – 110034
                                    </p>

                                    <a
                                        href="https://www.google.com/maps/search/?api=1&query=Solvestic+Wellness+Private+Limited+Pearl+Best+Heights+2+Pitampura+Delhi+110034"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#7D45C2] hover:underline"
                                    >
                                        Get directions
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>

                            {/* SUPPORT HOURS */}
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eef8] text-[#7D45C2]">
                                    <Clock className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[#302936]">
                                        Support hours
                                    </h3>

                                    <p className="mt-2 text-sm leading-7 text-[#716a78]">
                                        Monday – Saturday
                                        <br />
                                        11:00 AM – 6:15 PM
                                    </p>

                                    <p className="mt-1 text-xs text-[#89818f]">
                                        Drop us a note anytime.
                                    </p>
                                </div>
                            </div>

                            {/* PHONE */}
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eef8] text-[#7D45C2]">
                                    <Phone className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[#302936]">
                                        Call us
                                    </h3>

                                    <a
                                        href="tel:+919220788799"
                                        className="mt-2 block text-sm text-[#716a78] transition-colors hover:text-[#7D45C2]"
                                    >
                                        +91 9220788799
                                    </a>
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#f3eef8] text-[#7D45C2]">
                                    <Mail className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-semibold text-[#302936]">
                                        Email us
                                    </h3>

                                    <a
                                        href="mailto:care@solvestic.com"
                                        className="mt-2 block break-all text-sm text-[#716a78] transition-colors hover:text-[#7D45C2]"
                                    >
                                        care@solvestic.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT: CONTACT FORM */}
                    <motion.div
                        initial={{ opacity: 0, x: 25 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.65 }}
                        className="rounded-[2rem] border border-[#eee7f4] bg-white p-6 shadow-[0_15px_60px_rgba(55,30,75,0.06)] sm:p-9 lg:p-10"
                    >
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D45C2]">
                            Send us a message
                        </p>

                        <h2 className="mt-3 text-2xl font-medium tracking-tight text-[#28222e] sm:text-3xl">
                            How can we help you?
                        </h2>

                        <p className="mt-3 text-sm leading-6 text-[#716a78]">
                            Fill in the details below and we'll get back to you.
                        </p>

                        {submitted && (
                            <div className="mt-6 flex items-center gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                                <CheckCircle2 className="h-5 w-5 shrink-0" />
                                Your message has been submitted successfully.
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* NAME */}
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-xs font-semibold text-[#302936]"
                                    >
                                        Full name *
                                    </label>

                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        autoComplete="name"
                                        className="w-full rounded-xl border border-[#e9e1f0] bg-[#fcfaff] px-4 py-3.5 text-sm text-[#28222e] outline-none transition placeholder:text-[#aaa1b2] focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10"
                                    />
                                </div>

                                {/* PHONE */}
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className="mb-2 block text-xs font-semibold text-[#302936]"
                                    >
                                        Phone number *
                                    </label>

                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        autoComplete="tel"
                                        pattern="[+]?[0-9\s()-]{10,18}"
                                        title="Please enter a valid phone number"
                                        className="w-full rounded-xl border border-[#e9e1f0] bg-[#fcfaff] px-4 py-3.5 text-sm text-[#28222e] outline-none transition placeholder:text-[#aaa1b2] focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* EMAIL */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-2 block text-xs font-semibold text-[#302936]"
                                    >
                                        Email address *
                                    </label>

                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        autoComplete="email"
                                        className="w-full rounded-xl border border-[#e9e1f0] bg-[#fcfaff] px-4 py-3.5 text-sm text-[#28222e] outline-none transition placeholder:text-[#aaa1b2] focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10"
                                    />
                                </div>

                                {/* PLACE */}
                                <div>
                                    <label
                                        htmlFor="place"
                                        className="mb-2 block text-xs font-semibold text-[#302936]"
                                    >
                                        City / Place *
                                    </label>

                                    <input
                                        id="place"
                                        name="place"
                                        type="text"
                                        placeholder="Enter your city"
                                        value={formData.place}
                                        onChange={handleChange}
                                        required
                                        autoComplete="address-level2"
                                        className="w-full rounded-xl border border-[#e9e1f0] bg-[#fcfaff] px-4 py-3.5 text-sm text-[#28222e] outline-none transition placeholder:text-[#aaa1b2] focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10"
                                    />
                                </div>
                            </div>

                            {/* MESSAGE */}
                            <div>
                                <label
                                    htmlFor="message"
                                    className="mb-2 block text-xs font-semibold text-[#302936]"
                                >
                                    Your message *
                                </label>

                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    placeholder="Tell us how we can help..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full resize-y rounded-xl border border-[#e9e1f0] bg-[#fcfaff] px-4 py-3.5 text-sm text-[#28222e] outline-none transition placeholder:text-[#aaa1b2] focus:border-[#7D45C2] focus:ring-2 focus:ring-[#7D45C2]/10"
                                />
                            </div>

                            {/* SUBMIT */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="group flex w-full items-center justify-center gap-3 rounded-full bg-[#7D45C2] px-6 py-4 text-sm font-semibold text-white transition duration-300 hover:bg-[#6736a6] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        Sending message...
                                    </>
                                ) : (
                                    <>
                                        Send message
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>

                            <p className="text-center text-xs leading-5 text-[#89818f]">
                                Your information will be used to respond to your enquiry.
                            </p>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* GOOGLE MAP */}
            <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12 lg:pb-24">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D45C2]">
                            Find us
                        </p>

                        <h2 className="mt-3 text-2xl font-medium tracking-tight text-[#28222e] sm:text-3xl">
                            Visit our office
                        </h2>
                    </div>

                    <div className="overflow-hidden rounded-[2rem] border border-[#eee7f4] bg-[#f3eef8]">
                        <iframe
                            title="Solvestic Wellness Private Limited office location"
                            src="https://maps.google.com/maps?q=Pearl%20Best%20Heights%202%2C%20Plot%20C9%2C%20NSP%2C%20Pitampura%2C%20Delhi%20110034&t=&z=15&ie=UTF8&iwloc=&output=embed"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </div>
                </div>
            </section>
        </main>
    );
}