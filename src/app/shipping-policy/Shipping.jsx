"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ArrowRight,
    CheckCircle2,
    Clock3,
    Headphones,
    MapPin,
    Package,
    PackageCheck,
    ShieldCheck,
    Truck,
} from "lucide-react";

const shippingSteps = [
    {
        number: "01",
        title: "Order Confirmed",
        description:
            "Once your order is successfully placed, we begin processing your items.",
        icon: CheckCircle2,
    },
    {
        number: "02",
        title: "Order Processing",
        description:
            "Your order is prepared and packed for dispatch with care.",
        icon: Package,
    },
    {
        number: "03",
        title: "Order Dispatched",
        description:
            "After dispatch, tracking information may be shared with you.",
        icon: Truck,
    },
    {
        number: "04",
        title: "Delivered to You",
        description:
            "Your package is delivered to the shipping address provided at checkout.",
        icon: PackageCheck,
    },
];

const shippingDetails = [
    {
        icon: Clock3,
        title: "Delivery Timeline",
        description:
            "Delivery time depends on your location, product availability, and courier service. Your estimated delivery date may be shown at checkout or in your order updates.",
    },
    {
        icon: MapPin,
        title: "Delivery Locations",
        description:
            "We deliver to serviceable PIN codes across India. Enter your PIN code at checkout to check whether delivery is available in your area.",
    },
    {
        icon: Truck,
        title: "Shipping Charges",
        description:
            "Applicable shipping fees, if any, will be displayed during checkout before you complete your order.",
    },
    {
        icon: ShieldCheck,
        title: "Order Safety",
        description:
            "Please provide a complete and accurate delivery address and contact number to help ensure successful delivery.",
    },
];

const shippingFaqs = [
    {
        question: "How can I track my order?",
        answer:
            "Once your order is dispatched, use the tracking link or shipment details shared with you, if available, to follow your package.",
    },
    {
        question: "What if my order is delayed?",
        answer:
            "Delivery can occasionally be affected by courier delays, weather, or other circumstances. If your order has not arrived within the estimated timeline, contact our support team with your order number.",
    },
    {
        question: "Can I change my shipping address?",
        answer:
            "Please contact us as soon as possible if you need to update your address. Address changes may not be possible after an order has been processed or dispatched.",
    },
    {
        question: "What happens if I am unavailable at delivery?",
        answer:
            "The courier may contact you or attempt delivery again according to its delivery procedures. Please keep your phone number accessible and follow any instructions provided by the courier.",
    },
    {
        question: "What should I do if I receive a damaged package?",
        answer:
            "Contact our support team promptly with your order number, a description of the damage, and clear photographs of the package and product so we can review your concern.",
    },
];

export default function Shipping() {
    return (
        <main className="min-h-screen bg-[#fff] text-[#24252A]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-[#F7F2FC] px-5 pb-10 pt-10 sm:pb-15 sm:pt-15">
                <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-[#7D45C2]/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#7D45C2]/10 blur-3xl" />

                <div className="relative mx-auto max-w-[1200px]">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7D45C2]/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                            <Truck size={15} />
                            Delivery Information
                        </span>

                        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                            Shipping{" "}
                            <span className="text-[#7D45C2]">Policy</span>
                        </h1>

                        {/* <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#706978] sm:text-base">
                            From placing your order to receiving your package,
                            here is everything you need to know about our
                            shipping and delivery process.
                        </p> */}

                        <div className="mt-4 flex flex-wrap justify-center gap-3">
                            <a
                                href="#shipping-details"
                                className="inline-flex items-center gap-2 rounded-full bg-[#7D45C2] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#6936AC]"
                            >
                                Shipping Details
                                <ArrowRight size={16} />
                            </a>

                            <Link
                                href="/contact-us"
                                className="inline-flex items-center gap-2 rounded-full border border-[#7D45C2]/20 bg-white px-6 py-3 text-sm font-semibold text-[#7D45C2] transition hover:border-[#7D45C2]"
                            >
                                Contact Support
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Shipping Highlights */}
            <section
                id="shipping-details"
                className="scroll-mt-24 px-5 py-20 sm:py-14"
            >
                <div className="mx-auto max-w-[1200px]">
                    <div className="mb-10 max-w-2xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                            Good to Know
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Shipping at a Glance
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-[#706978] sm:text-base">
                            Review the important details before placing your
                            order.
                        </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {shippingDetails.map((item, index) => {
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={item.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{
                                        duration: 0.45,
                                        delay: index * 0.08,
                                    }}
                                    className="rounded-3xl border border-[#7D45C2]/10 bg-white p-6 sm:p-8"
                                >
                                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7F2FC] text-[#7D45C2]">
                                        <Icon size={23} />
                                    </div>

                                    <h3 className="text-lg font-semibold">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-[#77717F]">
                                        {item.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Delivery Process */}
            <section className="bg-[#F7F2FC] px-5 py-20 sm:py-24">
                <div className="mx-auto max-w-[1200px]">
                    <div className="mx-auto mb-14 max-w-2xl text-center">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                            How It Works
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Your Order Journey
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-[#706978] sm:text-base">
                            Four simple steps from checkout to your doorstep.
                        </p>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {shippingSteps.map((step, index) => {
                            const Icon = step.icon;

                            return (
                                <motion.div
                                    key={step.number}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.2 }}
                                    transition={{
                                        duration: 0.45,
                                        delay: index * 0.1,
                                    }}
                                    className="relative"
                                >
                                    <div className="mb-5 flex items-center justify-between">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F2FC] text-[#7D45C2]">
                                            <Icon size={25} />
                                        </div>
                                        <span className="text-3xl font-semibold text-[#7D45C2]/20">
                                            {step.number}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-semibold">
                                        {step.title}
                                    </h3>

                                    <p className="mt-3 text-sm leading-7 text-[#77717F]">
                                        {step.description}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Shipping FAQs */}
            <section className="px-5 py-20 sm:py-24">
                <div className="mx-auto grid max-w-[1200px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                            Need Answers?
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Shipping FAQs
                        </h2>
                        <p className="mt-4 text-sm leading-7 text-[#706978] sm:text-base">
                            Find quick answers to common delivery and shipping
                            questions.
                        </p>

                        <Link
                            href="/faq"
                            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7D45C2] transition hover:gap-3"
                        >
                            Explore all FAQs
                            <ArrowRight size={17} />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {shippingFaqs.map((faq, index) => (
                            <div
                                key={faq.question}
                                className="rounded-2xl border border-[#7D45C2]/10 bg-white p-5 sm:p-6"
                            >
                                <h3 className="text-sm font-semibold leading-6 sm:text-base">
                                    {faq.question}
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-[#77717F]">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="px-5 pb-20 sm:pb-24">
                <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[2rem] bg-[#7D45C2] px-6 py-8 text-center text-white sm:px-12 sm:py-10">
                    <div className="pointer-events-none absolute -right-10 -top-20 h-60 w-60 rounded-full border-[35px] border-white/10" />
                    <div className="pointer-events-none absolute -bottom-24 -left-10 h-60 w-60 rounded-full border-[35px] border-white/10" />

                    <div className="relative mx-auto max-w-2xl">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                            <Headphones size={27} />
                        </div>

                        <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">
                            Need Help With Your Delivery?
                        </h2>

                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
                            If you have a question about shipping, tracking, or
                            a delayed order, our team is ready to assist you.
                        </p>

                        <Link
                            href="/contact-us"
                            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#7D45C2] transition hover:bg-[#F7F2FC]"
                        >
                            Get in Touch
                            <ArrowRight size={17} />
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}