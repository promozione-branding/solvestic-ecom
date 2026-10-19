"use client";

import React from "react";
import Link from "next/link";
import {
    ArrowLeft,
    ArrowRight,
    RotateCcw,
    PackageCheck,
    Clock,
    CheckCircle2,
    XCircle,
    CreditCard,
    Truck,
    MessageCircle,
    ShieldCheck,
    Mail,
    Phone,
} from "lucide-react";

const policySections = [
    {
        id: "eligibility",
        number: "01",
        title: "Return Eligibility",
        icon: PackageCheck,
        content:
            "We want you to have a positive experience with Solvestic. If you receive a damaged, defective, incorrect, or incomplete product, please contact our support team so we can review your request.",
        points: [
            "Products must be reported as damaged, defective, or incorrect within 48 hours of delivery.",
            "Products should be unused and in their original packaging, wherever applicable.",
            "Please retain the invoice, packaging, and product photographs until your request is resolved.",
            "Returns are subject to verification and approval by our support team.",
        ],
    },
    {
        id: "non-returnable",
        number: "02",
        title: "Non-Returnable Products",
        icon: ShieldCheck,
        content:
            "For hygiene, safety, and product-quality reasons, certain products may not be eligible for return.",
        points: [
            "Opened or used skincare and personal-care products, unless defective or incorrectly supplied.",
            "Products damaged after delivery due to improper handling or storage.",
            "Products returned without prior approval from our support team.",
            "Products that do not meet the applicable return conditions.",
        ],
    },
    {
        id: "damaged",
        number: "03",
        title: "Damaged, Defective or Incorrect Orders",
        icon: Truck,
        content:
            "If your order arrives damaged, defective, or different from what you ordered, contact us as soon as possible.",
        points: [
            "Share your order number and registered contact details.",
            "Attach clear photographs or a video showing the issue and the outer packaging.",
            "Our team will review the information and may request additional details.",
            "Once approved, we will communicate the available resolution, which may include a replacement or refund, depending on the circumstances.",
        ],
    },
    {
        id: "refunds",
        number: "04",
        title: "Refund Process",
        icon: CreditCard,
        content:
            "Refunds are processed only after the request has been reviewed and approved under this policy.",
        points: [
            "Approved refunds will generally be initiated to the original payment method.",
            "Processing time depends on your payment provider or bank.",
            "For eligible prepaid orders, allow approximately 5–10 business days after refund initiation for the amount to reflect.",
            "For cash-on-delivery orders, our team will coordinate the appropriate refund method.",
        ],
    },
    {
        id: "cancellations",
        number: "05",
        title: "Order Cancellation",
        icon: RotateCcw,
        content:
            "Cancellation requests can be made before an order is dispatched. Once an order has been shipped, cancellation may no longer be possible.",
        points: [
            "Contact customer support promptly with your order number.",
            "If payment has already been collected, an approved cancellation refund will be initiated to the original payment method, where applicable.",
            "Orders already dispatched may be subject to the applicable delivery and return process.",
        ],
    },
    {
        id: "shipping",
        number: "06",
        title: "Return Shipping",
        icon: Truck,
        content:
            "Return shipping arrangements and any applicable costs will be communicated by our support team after reviewing your request.",
        points: [
            "Do not ship a product back without receiving return instructions.",
            "Where a return is approved due to an incorrect, damaged, or defective product, we will communicate the applicable shipping arrangements.",
            "For other approved returns, responsibility for return shipping will be communicated before the return proceeds.",
        ],
    },
];

const quickFacts = [
    {
        icon: Clock,
        title: "Report an issue",
        description: "Within 48 hours of delivery",
    },
    {
        icon: CreditCard,
        title: "Refund timeline",
        description: "Typically 5–10 business days after initiation",
    },
    {
        icon: PackageCheck,
        title: "Approval required",
        description: "Contact support before returning an item",
    },
];

export default function Return() {
    return (
        <main className="min-h-screen bg-white text-[#20172B]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-[#F7F2FC]">
                <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-[#7D45C2]/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-[#7D45C2]/10 blur-3xl" />

                <div className="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
                    <Link
                        href="/"
                        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#7D45C2] transition hover:gap-3"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>

                    <div className="max-w-3xl">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#7D45C2]/15 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#7D45C2]">
                            <RotateCcw size={15} />
                            Customer Care
                        </div>

                        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                            Return &{" "}
                            <span className="text-[#7D45C2]">Refund Policy</span>
                        </h1>

                        <p className="mt-5 text-sm text-[#30253D]/60">
                            Last updated: October 19, 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick information */}
            <section className="relative z-10 mx-auto -mt-6 max-w-7xl px-5 sm:px-8 lg:px-12">
                <div className="grid gap-4 rounded-2xl border border-[#7D45C2]/10 bg-white p-5 shadow-[0_12px_50px_rgba(53,29,76,0.07)] sm:grid-cols-3 sm:p-7">
                    {quickFacts.map((fact, index) => {
                        const Icon = fact.icon;

                        return (
                            <div
                                key={fact.title}
                                className={`flex items-start gap-4 ${index !== 0
                                    ? "sm:border-l sm:border-[#7D45C2]/10 sm:pl-6"
                                    : ""
                                    }`}
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F7F2FC] text-[#7D45C2]">
                                    <Icon size={21} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold">
                                        {fact.title}
                                    </h3>
                                    <p className="mt-1 text-sm leading-6 text-[#30253D]/65">
                                        {fact.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Policy content */}
            <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-24">
                {/* Sidebar */}
                <aside className="h-fit lg:sticky lg:top-20">
                    <div className="rounded-2xl border border-[#7D45C2]/10 bg-[#F7F2FC]/60 p-5">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D45C2]">
                            On this page
                        </h2>

                        <nav className="space-y-1">
                            {policySections.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="group flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-[#30253D]/75 transition hover:bg-white hover:text-[#7D45C2]"
                                >
                                    <span>{section.title}</span>
                                    <ArrowRight
                                        size={14}
                                        className="shrink-0 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100"
                                    />
                                </a>
                            ))}
                            <a
                                href="#contact"
                                className="group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-[#7D45C2] transition hover:bg-white"
                            >
                                Contact Support
                                <ArrowRight size={14} />
                            </a>
                        </nav>
                    </div>

                    <div className="mt-5 rounded-2xl bg-[#7D45C2] p-5 text-white">
                        <MessageCircle size={24} />
                        <h3 className="mt-4 text-lg font-semibold">
                            Need assistance?
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/80">
                            Our support team is here to help with your order.
                        </p>
                        <a
                            href="mailto:care@solvestic.com"
                            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold transition hover:gap-3"
                        >
                            Contact Us
                            <ArrowRight size={16} />
                        </a>
                    </div>
                </aside>

                {/* Main content */}
                <div className="min-w-0">
                    <div className="mb-12">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Our commitment to you
                        </h2>
                        <p className="mt-4 text-[15px] leading-8 text-[#30253D]/75">
                            At Solvestic Wellness Private Limited, we strive to
                            deliver quality products and a reliable shopping
                            experience. This policy explains how to request a
                            return, replacement, cancellation, or refund. Please
                            read the following terms before submitting a request.
                        </p>
                    </div>

                    <div className="space-y-12">
                        {policySections.map((section) => {
                            const Icon = section.icon;

                            return (
                                <section
                                    key={section.id}
                                    id={section.id}
                                    className="scroll-mt-28 border-b border-[#7D45C2]/10 pb-10 last:border-0"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F7F2FC] text-[#7D45C2]">
                                            <Icon size={22} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 text-xs font-semibold tracking-[0.16em] text-[#7D45C2]">
                                                POLICY {section.number}
                                            </div>
                                            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                                                {section.title}
                                            </h2>
                                            <p className="mt-4 text-[15px] leading-8 text-[#30253D]/75">
                                                {section.content}
                                            </p>

                                            <ul className="mt-5 space-y-3">
                                                {section.points.map((point) => (
                                                    <li
                                                        key={point}
                                                        className="flex items-start gap-3 text-sm leading-7 text-[#30253D]/80"
                                                    >
                                                        <CheckCircle2
                                                            size={17}
                                                            className="mt-1 shrink-0 text-[#7D45C2]"
                                                        />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    {/* General terms */}
                    <section className="mt-4 rounded-2xl border border-[#7D45C2]/15 bg-[#F7F2FC]/60 p-6 sm:p-8">
                        <div className="flex items-start gap-3">
                            <XCircle
                                size={22}
                                className="mt-1 shrink-0 text-[#7D45C2]"
                            />
                            <div>
                                <h2 className="text-xl font-semibold">
                                    Important Information
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-[#30253D]/75">
                                    Refunds, replacements, and returns are
                                    subject to verification and applicable law.
                                    Nothing in this policy limits any consumer
                                    rights available under applicable Indian law.
                                    If any provision conflicts with applicable
                                    law, the applicable legal requirements will
                                    prevail.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section
                        id="contact"
                        className="scroll-mt-28 pt-14"
                    >
                        <div className="rounded-3xl border border-[#7D45C2]/15 bg-white p-6 shadow-[0_12px_50px_rgba(53,29,76,0.05)] sm:p-9">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F7F2FC] text-[#7D45C2]">
                                <MessageCircle size={23} />
                            </div>

                            <h2 className="mt-5 text-2xl font-semibold">
                                Need help with a return?
                            </h2>
                            <p className="mt-3 max-w-xl text-sm leading-7 text-[#30253D]/70">
                                Get in touch with our customer support team.
                                Please include your order number and a brief
                                description of the issue so we can assist you
                                more efficiently.
                            </p>

                            <div className="mt-7 grid gap-4 sm:grid-cols-2">
                                <a
                                    href="mailto:care@solvestic.com"
                                    className="flex items-center gap-3 rounded-xl border border-[#7D45C2]/15 p-4 transition hover:border-[#7D45C2]/40 hover:bg-[#F7F2FC]/50"
                                >
                                    <Mail
                                        size={20}
                                        className="shrink-0 text-[#7D45C2]"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-xs text-[#30253D]/55">
                                            Email us
                                        </p>
                                        <p className="mt-1 break-all text-sm font-medium">
                                            care@solvestic.com
                                        </p>
                                    </div>
                                </a>

                                <a
                                    href="tel:+919220788799"
                                    className="flex items-center gap-3 rounded-xl border border-[#7D45C2]/15 p-4 transition hover:border-[#7D45C2]/40 hover:bg-[#F7F2FC]/50"
                                >
                                    <Phone
                                        size={20}
                                        className="shrink-0 text-[#7D45C2]"
                                    />
                                    <div>
                                        <p className="text-xs text-[#30253D]/55">
                                            Call us
                                        </p>
                                        <p className="mt-1 text-sm font-medium">
                                            +91 9220788799
                                        </p>
                                    </div>
                                </a>
                            </div>

                            <p className="mt-6 text-xs leading-6 text-[#30253D]/55">
                                Support hours: Monday to Saturday, 11:00 AM –
                                6:15 PM IST.
                            </p>

                            <a
                                href="mailto:care@solvestic.com?subject=Return%20or%20Refund%20Request"
                                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#7D45C2] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#6937A8] sm:w-auto"
                            >
                                Request Return or Refund
                                <ArrowRight size={17} />
                            </a>
                        </div>
                    </section>
                </div>
            </section>

            {/* Bottom banner */}
            <section className="bg-[#F7F2FC]">
                <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center lg:px-12">
                    <div>
                        <h2 className="text-xl font-semibold">
                            Thank you for choosing Solvestic.
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-[#30253D]/65">
                            We appreciate your trust and look forward to
                            assisting you.
                        </p>
                    </div>

                    <Link
                        href="/contact-us"
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#7D45C2]/25 bg-white px-6 py-3 text-sm font-semibold text-[#7D45C2] transition hover:bg-[#7D45C2] hover:text-white"
                    >
                        Contact Support
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </main>
    );
}
