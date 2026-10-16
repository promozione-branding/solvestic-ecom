
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    FileText,
    ChevronRight,
    ArrowUpRight,
    Scale,
} from "lucide-react";

const sections = [
    { id: "acceptance", title: "Acceptance of Terms" },
    { id: "eligibility", title: "Eligibility" },
    { id: "services", title: "Our Services" },
    { id: "accounts", title: "User Responsibilities" },
    { id: "acceptable-use", title: "Acceptable Use" },
    { id: "intellectual-property", title: "Intellectual Property" },
    { id: "products", title: "Products & Pricing" },
    { id: "payments", title: "Payments & Refunds" },
    { id: "third-party", title: "Third-Party Services" },
    { id: "disclaimer", title: "Disclaimer" },
    { id: "liability", title: "Limitation of Liability" },
    { id: "indemnification", title: "Indemnification" },
    { id: "termination", title: "Termination" },
    { id: "law", title: "Governing Law" },
    { id: "changes", title: "Changes to These Terms" },
    { id: "contact", title: "Contact Us" },
];

const updatedDate = "October 16, 2026";

export default function Terms() {
    const [activeSection, setActiveSection] = useState("acceptance");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top -
                            b.boundingClientRect.top
                    );

                if (visible.length) {
                    setActiveSection(visible[0].target.id);
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
                            Terms & Conditions
                        </span>
                    </div>

                    <div className="flex max-w-3xl flex-col items-start">
                        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7D45C2]/15 bg-white/80 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-[#7D45C2]">
                            <Scale size={15} />
                            Terms of Service
                        </span>

                        <h1 className="text-4xl font-medium leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
                            Terms &{" "}
                            <span className="text-[#7D45C2]">
                                Conditions
                            </span>
                        </h1>

                        {/* <p className="mt-6 max-w-2xl text-sm font-light leading-7 text-gray-600 sm:text-base sm:leading-8">
                            Please read these terms carefully before using
                            our website or services. They explain the
                            conditions that apply to your access, use,
                            and interactions with us.
                        </p> */}

                        <p className="mt-4 text-xs text-gray-500 sm:text-sm">
                            Last updated: {updatedDate}
                        </p>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="px-5 py-10 sm:px-8 sm:py-10 lg:px-12 lg:py-10">
                <div className="mx-auto grid max-w-[1300px] grid-cols-1 items-start gap-10 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-16">
                    {/* Sticky sidebar */}
                    <aside className="lg:sticky lg:top-2">
                        <div className="rounded-2xl border border-gray-100 bg-[#FCFAFE] p-5">
                            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                                On this page
                            </p>

                            <nav
                                aria-label="Terms and conditions sections"
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

                                            <span className="flex-1">
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
                            <FileText
                                size={24}
                                strokeWidth={1.5}
                            />

                            <h3 className="mt-4 text-lg font-medium">
                                Need clarification?
                            </h3>

                            <p className="mt-2 text-sm font-light leading-6 text-white/75">
                                Contact our team if you have questions
                                about these terms or our services.
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

                    {/* Terms content */}
                    <article className="min-w-0">
                        <div className="mb-10 border-b border-gray-100 pb-8">
                            <p className="text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
                                These Terms & Conditions govern your use
                                of this website and the services made
                                available through it. By accessing or
                                using the website, you agree to these
                                terms to the extent permitted by applicable
                                law. If you do not agree, please discontinue
                                use of the website.
                            </p>
                        </div>

                        <div className="space-y-12 sm:space-y-14">
                            <section id="acceptance" className="scroll-mt-28">
                                <SectionHeading number="01">
                                    Acceptance of Terms
                                </SectionHeading>

                                <PolicyText>
                                    By accessing, browsing, or using our
                                    website or services, you acknowledge
                                    that you have read and understood
                                    these Terms & Conditions and agree
                                    to comply with them.
                                </PolicyText>

                                <PolicyText>
                                    Additional terms may apply to specific
                                    products, services, promotions, or
                                    transactions. Where applicable, those
                                    terms will be provided separately.
                                </PolicyText>
                            </section>

                            <section id="eligibility" className="scroll-mt-28">
                                <SectionHeading number="02">
                                    Eligibility
                                </SectionHeading>

                                <PolicyText>
                                    You must have the legal capacity to
                                    enter into a binding agreement under
                                    the laws applicable to you to use
                                    our services independently. If you
                                    use the website on behalf of an
                                    organization, you represent that
                                    you have the authority to act on
                                    its behalf.
                                </PolicyText>

                                <PolicyText>
                                    If you are not legally able to accept
                                    these terms, you may use the website
                                    only with the involvement and
                                    authorization of a parent, guardian,
                                    or other legally authorized person,
                                    where permitted by law.
                                </PolicyText>
                            </section>

                            <section id="services" className="scroll-mt-28">
                                <SectionHeading number="03">
                                    Our Services
                                </SectionHeading>

                                <PolicyText>
                                    We aim to provide accurate information
                                    about our website, products, and
                                    services. Features, availability,
                                    descriptions, and content may change
                                    from time to time.
                                </PolicyText>

                                <PolicyText>
                                    We may update, suspend, or discontinue
                                    any part of the website where reasonably
                                    necessary, subject to applicable law
                                    and any contractual obligations we
                                    have agreed to fulfil.
                                </PolicyText>
                            </section>

                            <section id="accounts" className="scroll-mt-28">
                                <SectionHeading number="04">
                                    User Responsibilities
                                </SectionHeading>

                                <PolicyText>
                                    When submitting information, contacting
                                    us, or using any account-based feature,
                                    you agree to provide information that
                                    is accurate to the best of your
                                    knowledge and to keep relevant details
                                    reasonably up to date.
                                </PolicyText>

                                <PolicyList
                                    items={[
                                        "Use the website in accordance with applicable laws and these terms.",
                                        "Keep your account credentials confidential, if account access is provided.",
                                        "Notify us promptly if you suspect unauthorized access to your account.",
                                        "Avoid submitting information that is false, misleading, unlawful, or infringes another person's rights.",
                                        "Take responsibility for activities carried out through your account, subject to applicable law.",
                                    ]}
                                />
                            </section>

                            <section
                                id="acceptable-use"
                                className="scroll-mt-28"
                            >
                                <SectionHeading number="05">
                                    Acceptable Use
                                </SectionHeading>

                                <PolicyText>
                                    You must not use the website in any
                                    manner that is unlawful, fraudulent,
                                    harmful, or likely to interfere with
                                    the website or other users.
                                </PolicyText>

                                <PolicyList
                                    items={[
                                        "Attempt to gain unauthorized access to systems, accounts, or data.",
                                        "Introduce malicious software or interfere with website security or availability.",
                                        "Copy, scrape, reproduce, or redistribute website content in violation of applicable law or our rights.",
                                        "Use the website to distribute unlawful, abusive, deceptive, or infringing material.",
                                        "Misrepresent your identity or affiliation with another person or organization.",
                                    ]}
                                />
                            </section>

                            <section
                                id="intellectual-property"
                                className="scroll-mt-28"
                            >
                                <SectionHeading number="06">
                                    Intellectual Property
                                </SectionHeading>

                                <PolicyText>
                                    Unless otherwise stated, the website
                                    and its original content, branding,
                                    designs, graphics, text, images, and
                                    other materials are owned by us or
                                    licensed to us and may be protected
                                    by intellectual property laws.
                                </PolicyText>

                                <PolicyText>
                                    You may access and use the website
                                    for lawful personal or authorized
                                    business purposes. You may not
                                    reproduce, modify, distribute,
                                    commercially exploit, or create
                                    derivative works from protected
                                    content without appropriate
                                    authorization, except where permitted
                                    by applicable law.
                                </PolicyText>
                            </section>

                            <section id="products" className="scroll-mt-28">
                                <SectionHeading number="07">
                                    Products & Pricing
                                </SectionHeading>

                                <PolicyText>
                                    Product descriptions, photographs,
                                    specifications, availability, and
                                    prices are provided for general
                                    information and may be updated
                                    without notice, subject to applicable
                                    law and confirmed order terms.
                                </PolicyText>

                                <PolicyText>
                                    We make reasonable efforts to present
                                    product information accurately.
                                    However, display differences, errors,
                                    or availability changes may occur.
                                    If a material issue affects an order,
                                    we will address it in accordance
                                    with applicable law and the relevant
                                    transaction terms.
                                </PolicyText>
                            </section>

                            <section id="payments" className="scroll-mt-28">
                                <SectionHeading number="08">
                                    Payments & Refunds
                                </SectionHeading>

                                <PolicyText>
                                    Where paid services or products are
                                    offered, the applicable price,
                                    payment method, taxes, delivery
                                    charges, and other transaction
                                    conditions will be communicated
                                    during the purchase or booking
                                    process, as applicable.
                                </PolicyText>

                                <PolicyText>
                                    Cancellation, return, exchange, and
                                    refund eligibility will be governed
                                    by the policy communicated for the
                                    relevant product or service and by
                                    applicable law. Nothing in these
                                    terms is intended to exclude
                                    mandatory consumer rights.
                                </PolicyText>
                            </section>

                            <section id="third-party" className="scroll-mt-28">
                                <SectionHeading number="09">
                                    Third-Party Services
                                </SectionHeading>

                                <PolicyText>
                                    Our website may contain links to,
                                    or integrations with, third-party
                                    websites and services. Those services
                                    may be subject to separate terms,
                                    privacy policies, fees, or availability
                                    conditions.
                                </PolicyText>

                                <PolicyText>
                                    Unless expressly agreed otherwise,
                                    we are not responsible for third-party
                                    content or services that we do not
                                    control. Your interactions with
                                    third parties remain subject to
                                    their applicable terms and laws.
                                </PolicyText>
                            </section>

                            <section id="disclaimer" className="scroll-mt-28">
                                <SectionHeading number="10">
                                    Disclaimer
                                </SectionHeading>

                                <PolicyText>
                                    To the extent permitted by applicable
                                    law, the website and its general
                                    informational content are provided
                                    on an "as available" basis. We do
                                    not guarantee that the website will
                                    always be uninterrupted, error-free,
                                    or free from harmful components.
                                </PolicyText>

                                <PolicyText>
                                    Information on the website is not
                                    intended to replace professional
                                    advice where such advice is required.
                                    You should independently assess
                                    information before relying on it
                                    for decisions relevant to your
                                    circumstances.
                                </PolicyText>
                            </section>

                            <section id="liability" className="scroll-mt-28">
                                <SectionHeading number="11">
                                    Limitation of Liability
                                </SectionHeading>

                                <PolicyText>
                                    To the maximum extent permitted
                                    by applicable law, we will not
                                    be liable for indirect or
                                    consequential losses arising
                                    from your use of the website
                                    where such exclusion is legally
                                    permitted.
                                </PolicyText>

                                <PolicyText>
                                    Nothing in these terms excludes
                                    or limits liability that cannot
                                    lawfully be excluded or limited.
                                    Any limitations applicable to a
                                    particular transaction will also
                                    be subject to mandatory legal
                                    protections.
                                </PolicyText>
                            </section>

                            <section
                                id="indemnification"
                                className="scroll-mt-28"
                            >
                                <SectionHeading number="12">
                                    Indemnification
                                </SectionHeading>

                                <PolicyText>
                                    To the extent permitted by law,
                                    you may be responsible for losses,
                                    claims, or reasonable costs arising
                                    directly from your unlawful use
                                    of the website, your material
                                    breach of these terms, or your
                                    infringement of another party's
                                    rights.
                                </PolicyText>

                                <PolicyText>
                                    This section does not apply where
                                    such responsibility would be
                                    inconsistent with mandatory
                                    consumer protections or other
                                    applicable legal requirements.
                                </PolicyText>
                            </section>

                            <section id="termination" className="scroll-mt-28">
                                <SectionHeading number="13">
                                    Termination
                                </SectionHeading>

                                <PolicyText>
                                    We may restrict or suspend access
                                    to the website where reasonably
                                    necessary for security, maintenance,
                                    suspected misuse, legal compliance,
                                    or a material breach of these terms.
                                </PolicyText>

                                <PolicyText>
                                    Where required by law or an applicable
                                    agreement, we will provide notice
                                    or an opportunity to address the
                                    issue. Termination does not affect
                                    rights or obligations that accrued
                                    before termination.
                                </PolicyText>
                            </section>

                            <section id="law" className="scroll-mt-28">
                                <SectionHeading number="14">
                                    Governing Law
                                </SectionHeading>

                                <PolicyText>
                                    These terms are subject to the
                                    applicable laws and jurisdiction
                                    governing the relevant transaction
                                    or relationship, as determined
                                    under applicable law.
                                </PolicyText>

                                <PolicyText>
                                    Any disputes will be handled by
                                    the courts or dispute-resolution
                                    mechanisms that have jurisdiction
                                    under applicable law. Mandatory
                                    consumer rights and statutory
                                    protections remain unaffected.
                                </PolicyText>
                            </section>

                            <section id="changes" className="scroll-mt-28">
                                <SectionHeading number="15">
                                    Changes to These Terms
                                </SectionHeading>

                                <PolicyText>
                                    We may revise these Terms &
                                    Conditions to reflect changes
                                    to our services, business practices,
                                    or legal requirements.
                                </PolicyText>

                                <PolicyText>
                                    Updated terms will be published
                                    on this page with a revised
                                    date. Where required by law,
                                    we will provide additional notice
                                    or seek your agreement to
                                    material changes.
                                </PolicyText>
                            </section>

                            <section id="contact" className="scroll-mt-28">
                                <SectionHeading number="16">
                                    Contact Us
                                </SectionHeading>

                                <PolicyText>
                                    If you have questions about these
                                    Terms & Conditions or need
                                    clarification regarding our
                                    services, please contact us
                                    using the official contact
                                    information provided on our website.
                                </PolicyText>

                                <div className="mt-6 rounded-2xl border border-[#7D45C2]/15 bg-[#F7F2FC] p-5 sm:p-7">
                                    <FileText
                                        size={25}
                                        className="text-[#7D45C2]"
                                    />

                                    <h3 className="mt-4 text-lg font-medium">
                                        Terms-related inquiries
                                    </h3>

                                    <p className="mt-2 text-sm leading-7 text-gray-600">
                                        Please provide sufficient
                                        details about your question
                                        so our team can direct it
                                        to the appropriate person.
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
