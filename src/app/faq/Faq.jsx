"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
    ArrowRight,
    ChevronDown,
    Headphones,
    Package,
    CreditCard,
    RotateCcw,
    Sparkles,
    Truck,
} from "lucide-react";

const faqCategories = [
    {
        id: "products",
        title: "Products",
        icon: Sparkles,
        questions: [
            {
                question: "How do I choose the right product for my hair?",
                answer:
                    "Explore our product descriptions to understand the benefits and intended use of each product. If you need help choosing, please contact our support team for guidance.",
            },
            {
                question: "How should I use your products?",
                answer:
                    "Follow the directions provided on the product packaging. For the best experience, use each product as recommended and avoid exceeding the suggested frequency of use.",
            },
            {
                question: "Are your products suitable for all hair types?",
                answer:
                    "Product suitability can vary depending on your hair type and individual needs. Please review the product details before purchasing or contact us if you need assistance.",
            },
            {
                question: "Where can I find product ingredients?",
                answer:
                    "Please check the product packaging or the product details on our website for available ingredient information.",
            },
            {
                question: "Can I use multiple products together?",
                answer:
                    "Some products may complement each other. Check their individual usage instructions before combining them. If you have specific concerns, consult a qualified professional.",
            },
        ],
    },
    {
        id: "shipping",
        title: "Shipping",
        icon: Truck,
        questions: [
            {
                question: "Where do you deliver?",
                answer:
                    "We deliver to serviceable locations across India. Delivery availability depends on your PIN code and our shipping partners.",
            },
            {
                question: "How long will my order take to arrive?",
                answer:
                    "Delivery times depend on your location, product availability, and courier service. Your estimated delivery timeline may be displayed during checkout or shared in your order updates.",
            },
            {
                question: "How can I track my order?",
                answer:
                    "Once your order is dispatched, tracking details may be shared through your registered contact information. Use the tracking link provided to check your shipment status.",
            },
            {
                question: "Do you charge shipping fees?",
                answer:
                    "Shipping charges, if applicable, are displayed during checkout before you complete your purchase.",
            },
            {
                question: "What should I do if my package is delayed?",
                answer:
                    "If your order has not arrived within the estimated delivery period, contact our support team with your order number so we can help you check its status.",
            },
        ],
    },
    {
        id: "orders",
        title: "Orders and Payment",
        icon: CreditCard,
        questions: [
            {
                question: "How can I place an order?",
                answer:
                    "Browse our products, select the item you want, add it to your cart, and proceed to checkout. Enter your delivery details and complete the available payment steps.",
            },
            {
                question: "Which payment methods do you accept?",
                answer:
                    "Available payment methods are shown at checkout. These may include supported UPI services, cards, net banking, or other payment options depending on availability.",
            },
            {
                question: "Can I modify or cancel my order?",
                answer:
                    "Please contact us as soon as possible if you need to modify or cancel an order. Changes may not be possible once the order has been processed or dispatched.",
            },
            {
                question: "I have paid, but my order is not confirmed. What should I do?",
                answer:
                    "Please allow some time for payment confirmation. If your order is still not confirmed, contact our support team with your order details and payment reference. Never share your PIN or OTP.",
            },
            {
                question: "Will I receive an order confirmation?",
                answer:
                    "Order confirmation details are provided through the contact information submitted during checkout, where the relevant notification service is available.",
            },
        ],
    },
    {
        id: "returns",
        title: "Returns and Refunds",
        icon: RotateCcw,
        questions: [
            {
                question: "What is your return policy?",
                answer:
                    "Returns are subject to our applicable return policy and the condition of the product. Please review the return terms provided on our website or contact our team before sending an item back.",
            },
            {
                question: "Can I return an opened or used product?",
                answer:
                    "For hygiene and product-safety reasons, opened or used products may not be eligible for return unless required by applicable law or covered by an approved damaged, defective, or incorrect-item claim.",
            },
            {
                question: "What if I receive a damaged or incorrect product?",
                answer:
                    "Please contact us promptly with your order number, a description of the issue, and clear photographs of the product and packaging. Our team will review the request and advise you on the next steps.",
            },
            {
                question: "How long does a refund take?",
                answer:
                    "Once a refund is approved, the time it takes to appear in your account depends on the original payment method and your bank or payment provider.",
            },
            {
                question: "How can I request a return or refund?",
                answer:
                    "Contact our support team with your order number and the reason for your request. Our team will guide you through the applicable process and eligibility requirements.",
            },
        ],
    },
    {
        id: "contact",
        title: "Contact Us",
        icon: Headphones,
        questions: [
            {
                question: "How can I contact customer support?",
                answer:
                    "Visit our Contact Us page to find the available ways to reach our team. Please include your order number if your enquiry relates to an existing purchase.",
            },
            {
                question: "What information should I include in my enquiry?",
                answer:
                    "Include your name, registered email address or phone number, order number if applicable, and a brief description of how we can help.",
            },
            {
                question: "How long does it take to receive a response?",
                answer:
                    "We aim to respond to enquiries as soon as possible during our business hours. Response times may vary depending on the volume and nature of your request.",
            },
            {
                question: "Can I ask for help choosing a product?",
                answer:
                    "Absolutely! Contact our team with your product-related questions, and we will help you find the information you need.",
            },
        ],
    },
];

export default function Faq() {
    const [activeCategory, setActiveCategory] = useState("products");
    const [openQuestion, setOpenQuestion] = useState("products-0");

    const selectedCategory = faqCategories.find(
        (category) => category.id === activeCategory
    );

    return (
        <main className="min-h-screen bg-[#fff] text-[#24252A]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-[#F7F2FC] px-5 pb-8 pt-10 sm:pb-10 sm:pt-15">
                <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#7D45C2]/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#7D45C2]/10 blur-3xl" />

                <div className="relative mx-auto max-w-[1200px]">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mx-auto max-w-3xl text-center"
                    >
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7D45C2]/20 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#7D45C2]">
                            <Package size={15} />
                            Help & Support
                        </span>

                        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                            Frequently Asked{" "}
                            <span className="text-[#7D45C2]">Questions</span>
                        </h1>

                        {/* <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#66616E] sm:text-base">
                            Everything you need to know about our products,
                            shipping, payments, returns, and customer support.
                        </p> */}
                    </motion.div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="px-5 py-10 sm:py-15 bg-white">
                <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[290px_1fr] lg:gap-12">
                    {/* Categories */}
                    <aside className="h-fit rounded-3xl border border-[#7D45C2]/10 bg-white p-4 shadow-[0_15px_50px_rgba(58,31,87,0.05)] lg:sticky lg:top-28">
                        <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#96909F]">
                            Browse Topics
                        </p>

                        <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
                            {faqCategories.map((category) => {
                                const Icon = category.icon;
                                const isActive = activeCategory === category.id;

                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setActiveCategory(category.id);
                                            setOpenQuestion(`${category.id}-0`);
                                        }}
                                        className={`flex shrink-0 items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm font-medium transition-all duration-300 lg:w-full ${isActive
                                            ? "bg-[#7D45C2] text-white shadow-lg shadow-[#7D45C2]/20"
                                            : "bg-transparent text-[#696471] hover:bg-[#F7F2FC] hover:text-[#7D45C2]"
                                            }`}
                                    >
                                        <Icon size={18} />
                                        <span>{category.title}</span>
                                        <span
                                            className={`ml-auto hidden text-xs lg:block ${isActive
                                                ? "text-white/70"
                                                : "text-[#A39BAF]"
                                                }`}
                                        >
                                            {category.questions.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-5 hidden rounded-2xl bg-[#F7F2FC] p-5 lg:block">
                            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#7D45C2] shadow-sm">
                                <Headphones size={20} />
                            </div>
                            <h3 className="font-semibold">Still need help?</h3>
                            <p className="mt-2 text-sm leading-6 text-[#77717F]">
                                Our team is here to help with your questions.
                            </p>
                            <Link
                                href="/contact"
                                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7D45C2] hover:gap-3"
                            >
                                Contact us <ArrowRight size={16} />
                            </Link>
                        </div>
                    </aside>

                    {/* Questions */}
                    <div className="min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeCategory}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="mb-7">
                                    <p className="text-sm font-medium text-[#7D45C2]">
                                        Help Center / {selectedCategory.title}
                                    </p>
                                    <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">
                                        {selectedCategory.title}
                                    </h2>
                                </div>

                                <div className="space-y-3">
                                    {selectedCategory.questions.map((item, index) => {
                                        const questionId = `${activeCategory}-${index}`;
                                        const isOpen =
                                            openQuestion === questionId;

                                        return (
                                            <div
                                                key={item.question}
                                                className={`overflow-hidden rounded-2xl border bg-white transition-colors duration-300 ${isOpen
                                                    ? "border-[#7D45C2]/30 shadow-[0_10px_35px_rgba(80,42,120,0.07)]"
                                                    : "border-[#7D45C2]/10"
                                                    }`}
                                            >
                                                <button
                                                    type="button"
                                                    aria-expanded={isOpen}
                                                    onClick={() =>
                                                        setOpenQuestion(
                                                            isOpen
                                                                ? ""
                                                                : questionId
                                                        )
                                                    }
                                                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                                                >
                                                    <span className="text-sm font-semibold leading-6 sm:text-base">
                                                        {item.question}
                                                    </span>
                                                    <span
                                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${isOpen
                                                            ? "rotate-180 bg-[#7D45C2] text-white"
                                                            : "bg-[#F7F2FC] text-[#7D45C2]"
                                                            }`}
                                                    >
                                                        <ChevronDown
                                                            size={17}
                                                        />
                                                    </span>
                                                </button>

                                                <AnimatePresence initial={false}>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            animate={{
                                                                height: "auto",
                                                                opacity: 1,
                                                            }}
                                                            exit={{
                                                                height: 0,
                                                                opacity: 0,
                                                            }}
                                                            transition={{
                                                                duration: 0.25,
                                                            }}
                                                            className="overflow-hidden"
                                                        >
                                                            <p className="px-5 pb-5 pr-12 text-sm leading-7 text-[#77717F] sm:px-6 sm:pb-6">
                                                                {item.answer}
                                                            </p>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    }
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Mobile contact card */}
                        <div className="mt-8 flex items-center justify-between gap-4 rounded-2xl bg-[#7D45C2] p-5 text-white lg:hidden">
                            <div>
                                <h3 className="font-semibold">
                                    Still have questions?
                                </h3>
                                <p className="mt-1 text-sm text-white/75">
                                    We are happy to help.
                                </p>
                            </div>
                            <Link
                                href="/contact"
                                aria-label="Contact support"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#7D45C2]"
                            >
                                <ArrowRight size={19} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}