
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Sparkles, ArrowUpRight } from "lucide-react";

const faqs = [
  {
    question: "Are Solvestic products suitable for all skin types?",
    answer:
      "Our skincare range is designed with different skin needs in mind. Check each product's ingredients and directions to find the best fit for your skin type.",
  },
  {
    question: "Do your products contain any harsh chemicals?",
    answer:
      "We focus on thoughtful formulations and clearly listed ingredients. Please review the individual product label for the full ingredient list before use.",
  },
  {
    question: "Is Solvestic skincare made with natural ingredients?",
    answer:
      "Every formulation has its own ingredient profile. Visit the individual product page to learn more about its key ingredients and how to use it.",
  },
  {
    question: "Is your skincare suitable for sensitive or acne-prone skin?",
    answer:
      "Skin sensitivities vary from person to person. Review the ingredient list, patch test before first use, and consult a dermatologist if you have persistent irritation or specific skin concerns.",
  },
  {
    question: "Do Solvestic products contain synthetic fragrance or dyes?",
    answer:
      "Ingredients can vary by product. Refer to the product packaging or its ingredient list for accurate information about fragrance, colorants, and other ingredients.",
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(3);

  return (
    <section className="overflow-hidden bg-[#fffaf7] px-4 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <div className="mx-auto max-w-[1350px]">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.7 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#7D45C2] sm:text-xs">
            A little clarity goes a long way
          </p>

          <h2 className="text-3xl font-medium uppercase leading- tracking-[-0.02em] text-[#28242c] sm:text-5xl lg:text-[58px]">
            Your questions,
            <span className="block text-[#7D45C2]">
              clearly answered.
            </span> 
          </h2>
        </motion.div>

        <div className="grid items-center gap-9 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-[500px]"
          >
            <div className="absolute -left-3 -top-3 h-full w-full rounded-[25px] border border-[#d0c6ef] sm:-left-4 sm:-top-4" />

            <div className="relative aspect-[0.94/1] overflow-hidden rounded-[22px] bg-[#e9e0f4]">
              <Image
                src="/products/4.png"
                alt="Skincare self-care routine"
                fill
                sizes="(max-width: 1024px) 90vw, 42vw"
                className="object-cover transition-transform duration-700 hover:scale-[1.04]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#43355e]/15 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 sm:bottom-10 sm:left-7">
                <h3 className="max-w-sm text-2xl font-medium leading-tight text-white sm:text-3xl">
                  Your skin deserves thoughtful care.
                </h3>
              </div>
            </div>

            {/* Decorative label */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="absolute -bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur-md sm:right-6"
            >
              <span className="h-2 w-2 rounded-full bg-[#7D45C2]" />
              <span className="text-[10px] font-medium tracking-wide text-[#625775] sm:text-xs">
                THE SOLVESTIC GUIDE
              </span>
            </motion.div>
          </motion.div>

          {/* Accordion */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="pt-3 lg:pt-0"
          >
            {faqs.map((faq, index) => {
              const isOpen = activeIndex === index;

              return (
                <motion.div
                  key={faq.question}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.5 },
                    },
                  }}
                  className={`border-b transition-colors duration-300 ${
                    isOpen
                      ? "border-[#d0c6ef]"
                      : "border-[#d0c6ef]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setActiveIndex(isOpen ? -1 : index)
                    }
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-5 py-5 text-left sm:py-6"
                  >
                    <span
                      className={`text-sm font-medium leading-6 transition-colors sm:text-base lg:text-[17px] ${
                        isOpen
                          ? "text-[#7D45C2]"
                          : "text-black"
                      }`}
                    >
                      {faq.question}
                    </span>

                    <motion.span
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${
                        isOpen
                          ? "bg-[#7D45C2] text-white"
                          : "bg-[#f0edf8] text-[#7D45C2]"
                      }`}
                    >
                      {isOpen ? (
                        <Minus size={16} strokeWidth={1.7} />
                      ) : (
                        <Plus size={16} strokeWidth={1.7} />
                      )}
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: {
                            duration: 0.35,
                            ease: "easeInOut",
                          },
                          opacity: { duration: 0.25 },
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-6 pr-8 text-sm font-light leading-7 text-[#333135] sm:pr-12">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}

            {/* Contact CTA */}
            <motion.a
              href="/contact"
              whileHover={{ x: 4 }}
              className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-[#8576b8] transition-colors hover:text-[#62518f]"
            >
              Still have questions? Contact us
              <ArrowUpRight size={16} />
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
