
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, ChevronRight, ArrowUpRight } from "lucide-react";

const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "information", title: "Information We Collect" },
    { id: "usage", title: "How We Use Your Information" },
    { id: "cookies", title: "Cookies & Tracking" },
    { id: "sharing", title: "Sharing of Information" },
    { id: "security", title: "Data Security" },
    { id: "retention", title: "Data Retention" },
    { id: "rights", title: "Your Privacy Rights" },
    { id: "third-party", title: "Third-Party Links" },
    { id: "children", title: "Children's Privacy" },
    { id: "changes", title: "Policy Updates" },
    { id: "contact", title: "Contact Us" },
];

export default function Privacy() {
    const [activeSection, setActiveSection] = useState("introduction");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSections = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top -
                            b.boundingClientRect.top
                    );

                if (visibleSections.length) {
                    setActiveSection(visibleSections[0].target.id);
                }
            },
            {
                rootMargin: "-15% 0px -70% 0px",
                threshold: 0,
            }
        );

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, []);

    const updatedDate = "October 16, 2026";

    return (
        <main className="min-h-screen bg-white text-[#24252a]">
            {/* Hero */}
            <section className="relative overflow-hidden bg-[#F7F2FC] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15">
                <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-[#7D45C2]/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-[#d2efd9]/40 blur-3xl" />

                <div className="relative mx-auto max-w-[1200px]">
                    <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                        <Link
                            href="/"
                            className="transition-colors hover:text-[#7D45C2]"
                        >
                            Home
                        </Link>
                        <ChevronRight size={15} />
                        <span className="text-[#7D45C2]">
                            Privacy Policy
                        </span>
                    </div>

                    <div className="flex max-w-3xl flex-col items-start">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7D45C2]/15 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7D45C2]">
                            <ShieldCheck size={15} />
                            Your Privacy Matters
                        </span>

                        <h1 className="text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                            Privacy{" "}
                            <span className="text-[#7D45C2]">
                                Policy
                            </span>
                        </h1>

                        {/* <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-gray-600 sm:text-base sm:leading-8">
                            We respect your privacy and are committed to
                            handling your personal information responsibly.
                            This policy explains what information we collect,
                            how we use it, and the choices available to you.
                        </p> */}

                        <p className="mt-2 text-xs text-gray-500 sm:text-sm">
                            Last updated: {updatedDate}
                        </p>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <section className="px-5 py-10 sm:px-8 sm:py-10 lg:px-12 lg:py-10">
                <div className="mx-auto grid max-w-[1300px] grid-cols-1 items-start gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
                    {/* Sticky sidebar */}
                    <aside className="lg:sticky lg:top-2">
                        <div className="rounded-2xl border border-gray-100 bg-[#FCFAFE] p-5">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                                On this page
                            </p>

                            <nav
                                aria-label="Privacy policy sections"
                                className="space-y-1"
                            >
                                {sections.map((section, index) => {
                                    const isActive =
                                        activeSection === section.id;

                                    return (
                                        <a
                                            key={section.id}
                                            href={`#${section.id}`}
                                            onClick={() =>
                                                setActiveSection(section.id)
                                            }
                                            className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition-all duration-200 ${isActive
                                                ? "bg-[#7D45C2]/10 font-medium text-[#7D45C2]"
                                                : "text-gray-500 hover:bg-white hover:text-[#7D45C2]"
                                                }`}
                                        >
                                            <span
                                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[10px] ${isActive
                                                    ? "bg-[#7D45C2] text-white"
                                                    : "bg-gray-100 text-gray-400 group-hover:bg-[#7D45C2]/10 group-hover:text-[#7D45C2]"
                                                    }`}
                                            >
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0"
                                                )}
                                            </span>

                                            <span className="flex-1 text-nowrap">
                                                {section.title}
                                            </span>

                                            {isActive && (
                                                <ChevronRight
                                                    size={15}
                                                    className="shrink-0"
                                                />
                                            )}
                                        </a>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Contact card */}
                        <div className="mt-5 rounded-2xl bg-[#7D45C2] p-6 text-white">
                            <ShieldCheck
                                size={24}
                                strokeWidth={1.5}
                            />

                            <h3 className="mt-4 text-lg font-medium">
                                Have a privacy question?
                            </h3>

                            <p className="mt-2 text-sm font-light leading-6 text-white/75">
                                Contact our team if you have questions about
                                your personal information.
                            </p>

                            <a
                                href="#contact"
                                className="mt-5 inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-75"
                            >
                                Get in touch
                                <ArrowUpRight size={16} />
                            </a>
                        </div>
                    </aside>

                    {/* Policy content */}
                    <article className="min-w-0">
                        <div className="mb-10 border-b border-gray-100 pb-8">
                            <p className="text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
                                Please read this Privacy Policy carefully to
                                understand our practices regarding your
                                personal information. By using our website
                                or services, you acknowledge that you have
                                read this policy. Where consent is required
                                by applicable law, we will seek it separately.
                            </p>
                        </div>

                        <div className="space-y-12 sm:space-y-14">
                            <section
                                id="introduction"
                                className="scroll-mt-28"
                            >
                                <SectionHeading number="01">
                                    Introduction
                                </SectionHeading>
                                <PolicyText>
                                    This Privacy Policy describes how our
                                    website and services collect, use,
                                    disclose, and protect information when
                                    you visit our website, contact us, or
                                    interact with our services.
                                </PolicyText>
                                <PolicyText>
                                    In this policy, "we," "us," and "our"
                                    refer to the organization operating this
                                    website. The specific entity responsible
                                    for your information should be identified
                                    in our website's contact or legal
                                    information.
                                </PolicyText>
                            </section>

                            <section
                                id="information"
                                className="scroll-mt-28"
                            >
                                <SectionHeading number="02">
                                    Information We Collect
                                </SectionHeading>
                                <PolicyText>
                                    Depending on how you interact with us,
                                    we may collect the following categories
                                    of information:
                                </PolicyText>
                                <PolicyList
                                    items={[
                                        "Contact information, such as your name, email address, and phone number, when you submit a form or contact us.",
                                        "Communication details and information you choose to include in inquiries or messages.",
                                        "Technical information, such as your IP address, browser type, device information, and website usage data.",
                                        "Cookie and preference information, where cookies or similar technologies are used.",
                                        "Other information you voluntarily provide when using our services.",
                                    ]}
                                />
                                <PolicyText>
                                    We aim to collect only information that
                                    is relevant to the purposes described
                                    in this policy.
                                </PolicyText>
                            </section>

                            <section id="usage" className="scroll-mt-28">
                                <SectionHeading number="03">
                                    How We Use Your Information
                                </SectionHeading>
                                <PolicyText>
                                    We may use collected information for
                                    purposes such as:
                                </PolicyText>
                                <PolicyList
                                    items={[
                                        "Responding to your questions, requests, and inquiries.",
                                        "Providing, maintaining, and improving our website and services.",
                                        "Communicating updates or service-related information.",
                                        "Understanding website performance and visitor interactions.",
                                        "Protecting our website, preventing misuse, and maintaining security.",
                                        "Complying with applicable legal obligations and enforcing our terms.",
                                    ]}
                                />
                                <PolicyText>
                                    We rely on an appropriate legal basis for
                                    processing personal information, such as
                                    consent, contractual necessity, legitimate
                                    interests, or legal obligations, where
                                    applicable.
                                </PolicyText>
                            </section>

                            <section id="cookies" className="scroll-mt-28">
                                <SectionHeading number="04">
                                    Cookies & Tracking
                                </SectionHeading>
                                <PolicyText>
                                    Our website may use cookies and similar
                                    technologies to support functionality,
                                    remember preferences, understand traffic,
                                    and measure marketing performance.
                                </PolicyText>
                                <PolicyText>
                                    Where required, we will request your
                                    consent before using non-essential cookies
                                    or tracking technologies. You can also
                                    manage cookies through your browser
                                    settings. Disabling certain cookies may
                                    affect some website features.
                                </PolicyText>
                            </section>

                            <section id="sharing" className="scroll-mt-28">
                                <SectionHeading number="05">
                                    Sharing of Information
                                </SectionHeading>
                                <PolicyText>
                                    We do not disclose personal information
                                    indiscriminately. We may share relevant
                                    information with:
                                </PolicyText>
                                <PolicyList
                                    items={[
                                        "Service providers that help operate our website, communications, analytics, or business systems.",
                                        "Professional advisers where reasonably necessary.",
                                        "Authorities or other parties when disclosure is required by law or necessary to protect legal rights and safety.",
                                        "A successor organization in connection with a business transfer, subject to applicable legal requirements.",
                                    ]}
                                />
                                <PolicyText>
                                    Service providers are expected to handle
                                    information appropriately and only for
                                    authorized purposes. We do not sell
                                    personal information as part of our
                                    stated privacy practices.
                                </PolicyText>
                            </section>

                            <section id="security" className="scroll-mt-28">
                                <SectionHeading number="06">
                                    Data Security
                                </SectionHeading>
                                <PolicyText>
                                    We use reasonable technical and
                                    organizational safeguards designed to
                                    protect personal information against
                                    unauthorized access, loss, misuse,
                                    alteration, or disclosure.
                                </PolicyText>
                                <PolicyText>
                                    However, no method of transmitting or
                                    storing information electronically is
                                    completely secure. We cannot guarantee
                                    absolute security in every circumstance.
                                </PolicyText>
                            </section>

                            <section id="retention" className="scroll-mt-28">
                                <SectionHeading number="07">
                                    Data Retention
                                </SectionHeading>
                                <PolicyText>
                                    We retain personal information only for
                                    as long as reasonably necessary to fulfil
                                    the purposes for which it was collected,
                                    including providing services, resolving
                                    disputes, maintaining records, and meeting
                                    applicable legal requirements.
                                </PolicyText>
                                <PolicyText>
                                    When information is no longer needed, we
                                    will take appropriate steps to delete it
                                    or otherwise handle it in accordance with
                                    applicable law.
                                </PolicyText>
                            </section>

                            <section id="rights" className="scroll-mt-28">
                                <SectionHeading number="08">
                                    Your Privacy Rights
                                </SectionHeading>
                                <PolicyText>
                                    Depending on your location and applicable
                                    law, you may have the right to:
                                </PolicyText>
                                <PolicyList
                                    items={[
                                        "Request access to personal information we hold about you.",
                                        "Request correction of inaccurate or incomplete information.",
                                        "Request deletion of information where legally applicable.",
                                        "Withdraw consent where processing is based on consent.",
                                        "Object to or request restrictions on certain processing.",
                                        "Raise a complaint with the appropriate data protection authority.",
                                    ]}
                                />
                                <PolicyText>
                                    To exercise an applicable right, contact
                                    us using the details provided below.
                                    We may need to verify your identity before
                                    processing your request.
                                </PolicyText>
                            </section>

                            <section
                                id="third-party"
                                className="scroll-mt-28"
                            >
                                <SectionHeading number="09">
                                    Third-Party Links
                                </SectionHeading>
                                <PolicyText>
                                    Our website may contain links to
                                    third-party websites, platforms, or
                                    services. Those third parties maintain
                                    their own privacy policies and practices.
                                    We encourage you to review their policies
                                    before providing personal information.
                                </PolicyText>
                            </section>

                            <section id="children" className="scroll-mt-28">
                                <SectionHeading number="10">
                                    Children's Privacy
                                </SectionHeading>
                                <PolicyText>
                                    Our website is not intended to collect
                                    personal information from children in
                                    violation of applicable law. If you
                                    believe a child has provided personal
                                    information improperly, please contact
                                    us so we can review the matter and take
                                    appropriate action.
                                </PolicyText>
                            </section>

                            <section id="changes" className="scroll-mt-28">
                                <SectionHeading number="11">
                                    Policy Updates
                                </SectionHeading>
                                <PolicyText>
                                    We may update this Privacy Policy from
                                    time to time to reflect changes in our
                                    practices, services, or legal obligations.
                                    Any revised policy will be published on
                                    this page with an updated revision date.
                                </PolicyText>
                                <PolicyText>
                                    We encourage you to review this page
                                    periodically to stay informed about how
                                    your information is handled.
                                </PolicyText>
                            </section>

                            <section id="contact" className="scroll-mt-28">
                                <SectionHeading number="12">
                                    Contact Us
                                </SectionHeading>
                                <PolicyText>
                                    If you have questions about this Privacy
                                    Policy, would like to make a privacy
                                    request, or need additional information
                                    about our data practices, please contact
                                    us using the official contact details
                                    published on our website.
                                </PolicyText>

                                <div className="mt-6 rounded-2xl border border-[#7D45C2]/15 bg-[#F7F2FC] p-5 sm:p-7">
                                    <ShieldCheck
                                        size={25}
                                        className="text-[#7D45C2]"
                                    />
                                    <h3 className="mt-4 text-lg font-medium">
                                        Privacy-related inquiries
                                    </h3>
                                    <p className="mt-2 text-sm leading-7 text-gray-600">
                                        Please include enough information
                                        for us to understand your request.
                                        Avoid sending passwords or other
                                        sensitive credentials.
                                    </p>
                                    <Link
                                        href="/contact-us"
                                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#7D45C2] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#6836a9]"
                                    >
                                        Contact our team
                                        <ArrowUpRight size={16} />
                                    </Link>
                                </div>
                            </section>
                        </div>

                        {/* Footer note */}
                        <div className="mt-14 border-t border-gray-100 pt-6">
                            <p className="text-xs leading-6 text-gray-400">
                                Last updated: {updatedDate}
                            </p>
                        </div>
                    </article>
                </div>
            </section>
        </main>
    );
}

function SectionHeading({ number, children }) {
    return (
        <div className="mb-5 flex items-start gap-4">
            <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#7D45C2]/10 text-xs font-semibold text-[#7D45C2]">
                {number}
            </span>
            <h2 className="text-xl font-medium tracking-tight text-[#24252a] sm:text-2xl">
                {children}
            </h2>
        </div>
    );
}

function PolicyText({ children }) {
    return (
        <p className="mt-4 text-sm font-light leading-7 text-gray-600 sm:text-[15px] sm:leading-8">
            {children}
        </p>
    );
}

function PolicyList({ items }) {
    return (
        <ul className="mt-4 space-y-3">
            {items.map((item) => (
                <li
                    key={item}
                    className="flex items-start gap-3 text-sm font-light leading-7 text-gray-600 sm:text-[15px]"
                >
                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#7D45C2]" />
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}
