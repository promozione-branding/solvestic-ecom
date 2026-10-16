
"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Vote,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

const products = [
  {
    id: "lip-balm",
    name: "Lip Balm",
    image: "/guess/1.png",
    votes: 142,
    bg: "#FCE8F0",
  },
  {
    id: "under-eye-patch",
    name: "Under Eye Patch",
    image: "/guess/2.png",
    votes: 121,
    bg: "#EEE5FC",
  },
  {
    id: "face-wash",
    name: "Face Wash",
    image: "/guess/3.png",
    votes: 161,
    bg: "#E9E5FB",
  },
  {
    id: "serum",
    name: "Serum",
    image: "/guess/4.png",
    votes: 82,
    bg: "#F1E7FB",
  },
];

export default function GuessNewLaunch() {
  const [selected, setSelected] = useState(null);
  const [voteCounts, setVoteCounts] = useState(
    Object.fromEntries(
      products.map((product) => [product.id, product.votes])
    )
  );

  const totalVotes = Object.values(voteCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const handleVote = (id) => {
    if (selected) return;

    setSelected(id);
    setVoteCounts((prev) => ({
      ...prev,
      [id]: prev[id] + 1,
    }));
  };

  return (
    <section className="overflow-hidden bg-[#f7f3fc] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">

        {/* LEFT: HEADING AND DESCRIPTION */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7D45C2]/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D45C2]">
            {/* <Sparkles className="h-4 w-4" /> */}
            Something exciting is coming
          </div>

          <h2 className="mt-6 text-4xl font-medium leading-[1] tracking-[-0.015em] text-[#28222e] sm:text-5xl lg:text-6xl">
            Guess our
            <span className="block text-[#7D45C2]">
              new launch.
            </span>
          </h2>

          <p className="mt-5 max-w-md text-sm leading-7 text-[#716a78] sm:text-base">
            Four possibilities. One exciting reveal.
            Which skincare essential do you think Solvestic
            is launching next? Choose your favourite and
            let us know what you want to see.
          </p>

          <button
            type="button"
            onClick={() =>
              document
                .getElementById("solvestic-poll")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                })
            }
            className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[#7D45C2] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#6736a6]"
          >
            Vote for your favourite
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <div className="mt-9 border-t border-[#7D45C2]/15 pt-6">
            <p className="text-3xl font-medium tracking-tight text-[#28222e]">
              {totalVotes.toLocaleString("en-IN")}
              <span className="ml-2 text-sm font-normal text-[#716a78]">
                community votes
              </span>
            </p>

            <p className="mt-2 text-xs leading-5 text-[#89818f]">
              Your choice helps us understand what
              you're excited to try next.
            </p>
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-center gap-2 text-sm font-medium text-[#7D45C2]"
              >
                <CheckCircle2 className="h-5 w-5" />
                Thanks! You voted for{" "}
                {products.find((p) => p.id === selected)?.name}.
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* RIGHT: FOUR PRODUCT CARDS IN 2x2 GRID */}
        <div
          id="solvestic-poll"
          className="grid scroll-mt-24 grid-cols-2 gap-3 sm:gap-5"
        >
          {products.map((product, index) => {
            const isSelected = selected === product.id;
            const percentage = Math.round(
              (voteCounts[product.id] / totalVotes) * 100
            );

            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.1,
                }}
                whileHover={{ y: -5 }}
                className={`overflow-hidden rounded-2xl border bg-white transition-colors sm:rounded-3xl ${isSelected
                  ? "border-[#7D45C2] ring-2 ring-[#7D45C2]/10"
                  : "border-white"
                  }`}
              >
                {/* PRODUCT IMAGE */}
                <div
                  className="relative flex h-42 items-center justify-center overflow-hidden"
                  style={{ backgroundColor: product.bg }}
                >
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.35 }}
                    className="h-full w-full object-contain"
                  />

                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#7D45C2] text-white">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>

                <div className="px-3 py-2">
                  {/* NAME */}
                  <h3 className="text-sm font-semibold tracking-wider text-[#302936] sm:text-base">
                    {product.name}
                  </h3>


                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[10px] text-[#716a78] sm:text-xs">
                      <span>{voteCounts[product.id]} votes</span>
                      <span className="font-semibold text-[#7D45C2]">
                        {percentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eee7f4]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded-full bg-[#7D45C2]"
                      />
                    </div>
                  </div>

                  {/* VOTE BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleVote(product.id)}
                    disabled={Boolean(selected)}
                    className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border px-2 py-2 text-xs font-semibold transition sm:text-sm ${isSelected
                      ? "border-[#7D45C2] bg-[#7D45C2] text-white"
                      : selected
                        ? "cursor-not-allowed border-[#e9e1f0] text-[#aaa1b2]"
                        : "border-[#7D45C2]/40 text-[#7D45C2] hover:bg-[#7D45C2] hover:text-white"
                      }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Voted
                      </>
                    ) : (
                      <>
                        <Vote className="h-4 w-4" />
                        {selected ? "Vote closed" : "Vote now"}
                      </>
                    )}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}