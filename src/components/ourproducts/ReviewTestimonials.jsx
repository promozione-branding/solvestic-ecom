
"use client";

import { motion } from "framer-motion";
import { Star, Quote, Sparkles } from "lucide-react";

const reviews = [
    {
        id: 1,
        name: "A Happy Customer",
        initials: "HC",
        product: "Hydra-Crème 100H Water Lock",
        rating: 5,
        review:
            "My skincare routine feels a little more special now. I love the soft, lightweight feel of this moisturizer and how easily it fits into my everyday routine.",
        color: "bg-[#EDE5F8]",
    },
    {
        id: 2,
        name: "A Beauty Lover",
        initials: "BL",
        product: "Hydra-Protect Sun Mist",
        rating: 5,
        review:
            "I wanted something convenient for my daily sun-care routine. This product is easy to use and makes taking care of my skin feel effortless.",
        color: "bg-[#F7E9E8]",
    },
    {
        id: 3,
        name: "A Skincare Enthusiast",
        initials: "SE",
        product: "Calming Gel Pen",
        rating: 5,
        review:
            "I love having simple skincare essentials that fit into my day. The packaging is lovely, and using it feels like a small self-care moment.",
        color: "bg-[#E7EEE5]",
    },
];

export default function ReviewTestimonials() {
    return (
        <section className="relative overflow-hidden bg-[#F7F2FC] py-12 sm:py-16 lg:py-20">
            {/* BACKGROUND DECORATION */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#D8B8F5]/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#E8D7F8]/40 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
                {/* SECTION HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mx-auto mb-10 max-w-2xl text-center sm:mb-12"
                >
                    <div className="mb-4 flex items-center justify-center gap-2">
                        <span className="h-px w-8 bg-[#7D45C2]" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7D45C2] sm:text-xs">
                            Your Skin, Your Story
                        </span>

                        <span className="h-px w-8 bg-[#7D45C2]" />
                    </div>

                    <h2 className="font-heading text-3xl font-medium leading-tight tracking-tight text-[#2D1557] sm:text-4xl lg:text-5xl">
                        A Little Love
                        <br className="sm:hidden" />{" "}
                        <span className="text-[#7D45C2]">
                            Goes a Long Way.
                        </span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-[#777080] sm:text-base">
                        Every skincare ritual tells a story. Discover the
                        little moments that make self-care feel special.
                    </p>
                </motion.div>

                {/* REVIEW CARDS */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                    {reviews.map((review, index) => (
                        <motion.article
                            key={review.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.12,
                            }}
                            className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/90 bg-white/85 p-5 shadow-[0_8px_30px_rgba(61,30,91,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(61,30,91,0.10)] sm:p-6 lg:p-7"
                        >
                            {/* TOP ROW */}
                            <div className="mb-5 flex items-start justify-between">
                                <div className="flex items-center gap-1">
                                    {Array.from({
                                        length: review.rating,
                                    }).map((_, i) => (
                                        <Star
                                            key={i}
                                            size={15}
                                            fill="#D9A441"
                                            stroke="#D9A441"
                                        />
                                    ))}
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F0E7FA] text-[#7D45C2] transition-transform duration-300 group-hover:rotate-6">
                                    <Quote size={19} />
                                </div>
                            </div>

                            {/* REVIEW TEXT */}
                            <p className="flex-1 text-sm leading-7 text-[#61596D] sm:text-[15px]">
                                “{review.review}”
                            </p>

                            {/* PRODUCT LABEL */}
                            <div className="mt-5 border-t border-[#EEE7F5] pt-4">
                                <div className="mb-4 flex items-center gap-2">
                                    <Sparkles
                                        size={14}
                                        className="shrink-0 text-[#7D45C2]"
                                    />

                                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7D45C2]">
                                        Product experience
                                    </span>
                                </div>

                                <p className="mb-5 text-sm font-medium leading-5 text-[#382451]">
                                    {review.product}
                                </p>

                                {/* CUSTOMER */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${review.color} text-xs font-semibold text-[#5B3B79]`}
                                    >
                                        {review.initials}
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-[#2D1557]">
                                            {review.name}
                                        </h3>

                                        <p className="mt-1 text-xs text-[#8B8295]">
                                            Customer testimonial
                                        </p>
                                    </div>

                                    <div className="ml-auto shrink-0 rounded-full bg-[#F2EBF9] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide text-[#7D45C2]">
                                        {review.rating}.0 / 5
                                    </div>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>

                {/* BOTTOM BRAND MESSAGE */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mt-10 flex flex-col items-center justify-center gap-2 text-center sm:mt-12"
                >
                    <div className="flex items-center gap-2 text-[#7D45C2]">
                        <Sparkles size={15} />
                        <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">
                            The Solvestic Ritual
                        </span>
                        <Sparkles size={15} />
                    </div>

                    <p className="text-sm text-[#777080]">
                        Thoughtful care, one moment at a time.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
