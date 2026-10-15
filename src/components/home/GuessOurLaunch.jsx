"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Vote,
  Users,
} from "lucide-react";

const products = [
  {
    id: "lip-balm",
    name: "Lip Balm",
    description: "Soft, nourished lips",
    votes: 142,
    image: "/images/lip-balm.png",
    color: "bg-[#fce8f0]",
  },
  {
    id: "under-eye-patch",
    name: "Under Eye Patch",
    description: "A refreshed under-eye look",
    votes: 121,
    image: "/images/under-eye-patch.png",
    color: "bg-[#eee5fc]",
  },
  {
    id: "face-wash",
    name: "Face Wash",
    description: "Your daily cleansing ritual",
    votes: 161,
    image: "/images/face-wash.png",
    color: "bg-[#e9e5fb]",
  },
  {
    id: "serum",
    name: "Serum",
    description: "A little extra glow",
    votes: 82,
    image: "/images/serum.png",
    color: "bg-[#f1e7fb]",
  },
];

export default function GuessNewLaunch() {
  const [selected, setSelected] = useState(null);
  const [voteCounts, setVoteCounts] = useState(
    Object.fromEntries(products.map((product) => [
      product.id,
      product.votes,
    ]))
  );

  const totalVotes = Object.values(voteCounts).reduce(
    (total, count) => total + count,
    0
  );

  const handleVote = (productId) => {
    if (selected) return;

    setSelected(productId);

    setVoteCounts((previous) => ({
      ...previous,
      [productId]: previous[productId] + 1,
    }));
  };

  const getPercentage = (count) =>
    totalVotes ? Math.round((count / totalVotes) * 100) : 0;

  return (
    <section
      id="new-launch-poll"
      className="overflow-hidden bg-white px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-15"
    >
      <div className="mx-auto max-w-7xl">

        {/* HERO */}
        {/* <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7D45C2]/20 bg-[#f3eef8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7D45C2]">
              <Sparkles className="h-4 w-4" />
              Something exciting is coming
            </div>

            <h2 className="mt-6 text-4xl font-medium leading-[1.1] tracking-[-0.055em] text-[#28222e] sm:text-6xl">
              Guess our
              <span className="block text-[#7D45C2]">
                new launch.
              </span>
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-[#716a78] sm:text-base">
              We've got something special in the works.
              Which skincare essential do you think is
              coming next? Cast your vote and be part of
              the Solvestic journey.
            </p>

            <button
              onClick={() =>
                document.getElementById("launch-poll")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                })
              }
              className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[#7D45C2] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#6736a6]"
            >
              Cast your vote
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="mt-7 flex items-center gap-2 text-xs text-[#89818f]">
              <Users className="h-4 w-4 text-[#7D45C2]" />
              Join the conversation and share your pick.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-[2rem] bg-[#f3eef8] p-5 sm:p-8"
          >
            <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#d9c0f6]/60 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white blur-3xl" />

            <div className="relative grid grid-cols-2 gap-3 sm:gap-5">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.12,
                  }}
                  whileHover={{ y: -5 }}
                  className={`flex aspect-[1/1.05] flex-col items-center justify-center rounded-2xl ${product.color} p-3 sm:p-5`}
                >
                  <div className="relative flex min-h-0 flex-1 items-center justify-center">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full max-h-36 w-full max-w-36 object-contain drop-shadow-md sm:max-h-44 sm:max-w-44"
                    />
                  </div>

                  <p className="mt-3 text-center text-sm font-semibold text-[#302936]">
                    {product.name}
                  </p>

                  <p className="mt-1 text-center text-[10px] text-[#716a78] sm:text-xs">
                    {product.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="relative mt-5 flex items-center justify-center gap-2 text-center text-xs font-medium text-[#7D45C2]">
              <Sparkles className="h-4 w-4" />
              Four possibilities. One exciting reveal.
            </div>
          </motion.div>
        </div> */}

        {/* POLL */}
        <div
          id="launch-poll"
          className="scroll-mt-24 rounded-[2rem] bg-[#f7f3fc] p-5 sm:p-9"
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7D45C2]">
              The community poll
            </p>

            <h3 className="mt-2 text-2xl font-medium tracking-[-0.04em] text-[#28222e] sm:text-4xl">
              Which product are you most excited about?
            </h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, index) => {
              const percentage = getPercentage(voteCounts[product.id]);
              const isSelected = selected === product.id;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.15 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border bg-white p-5 transition-colors ${isSelected
                    ? "border-[#7D45C2] ring-2 ring-[#7D45C2]/10"
                    : "border-[#eee7f4]"
                    }`}
                >
                  <div className={`flex h-40 items-center justify-center overflow-hidden rounded-xl ${product.color} p-4`}>
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-contain"
                      whileHover={{ scale: 1.08 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <div className="mt-5 flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-[#302936]">
                      {product.name}
                    </h4>

                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-[#7D45C2]" />
                    )}
                  </div>

                  <p className="mt-1 text-xs text-[#89818f]">
                    {product.description}
                  </p>

                  {/* RESULTS */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#716a78]">
                        {selected ? "Poll results" : "Community votes"}
                      </span>

                      <span className="font-semibold text-[#7D45C2]">
                        {percentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eee7f4]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{
                          duration: 0.7,
                          ease: "easeOut",
                        }}
                        className="h-full rounded-full bg-[#7D45C2]"
                      />
                    </div>

                    <p className="mt-2 text-[11px] text-[#89818f]">
                      {voteCounts[product.id]} votes
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVote(product.id)}
                    disabled={Boolean(selected)}
                    className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-4 py-3 text-xs font-semibold transition ${isSelected
                      ? "border-[#7D45C2] bg-[#7D45C2] text-white"
                      : selected
                        ? "cursor-not-allowed border-[#e9e1f0] bg-white text-[#aaa1b2]"
                        : "border-[#7D45C2]/50 text-[#7D45C2] hover:bg-[#7D45C2] hover:text-white"
                      }`}
                  >
                    {isSelected ? (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        Your vote
                      </>
                    ) : (
                      <>
                        <Vote className="h-4 w-4" />
                        {selected ? "Vote submitted" : "Vote for this"}
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 flex flex-col items-center justify-center gap-2 text-center"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-[#7D45C2]">
                  <CheckCircle2 className="h-5 w-5" />
                  Thanks for voting!
                </div>

                <p className="text-xs leading-5 text-[#716a78]">
                  You picked {products.find((p) => p.id === selected)?.name}.
                  Thanks for helping shape our next launch.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}