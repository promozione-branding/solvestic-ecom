"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const paragraphs = [
  "As I stepped into a new chapter of my life, like any girl, I wanted to feel beautiful, confident, and comfortable in my own skin.",

  "I explored skincare with the same curiosity so many of us do — trying products, discovering brands, and trusting what seemed right.",

  "But one experience changed the way I looked at skincare entirely. What began as a simple attempt to care for my skin left me dealing with a skin concern I had never experienced before.",

  "I felt frustrated, overwhelmed, and, for a while, even hesitant to step outside.",

  "More than the skin concern itself, it made me question how easily we trust what we put on our skin — and how difficult it can be to know what is actually right for us.",
];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const paragraphs1 = [
  "We wanted to create skincare differently — with transparency at the centre of every decision.",

  "We wanted to understand skin concerns properly before trying to create solutions for them.",

  "No unnecessary promises, no trying to make skincare complicated, and no building something simply because it sounds good.",
];

export default function About() {
  return (
    <section className="w-full bg-white text-[#26244F]">

      {/* =====================================================
          HERO / INTRO
      ===================================================== */}
      <div className="">
        <div className="relative min-h-[320px] overflow-hidden bg-[#7b44bf] sm:min-h-[510px] ">
          {/* Replace with your Solvestic image */}
          <img
            src="/Personal Experience Beauty Campaign (1).png"
            alt="Solvestic story"
            className="absolute inset-0 h-full w-full object-cover md:block hidden"
          />
          <img
            src="/Build From Personal Experience (1).png"
            alt="Solvestic story"
            className="absolute inset-0 h-full w-full object-cover md:hidden block"
          />
        </div>
      </div>

      {/* =====================================================
          STORY INTRO
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#F7F2FC]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-10 sm:py-20 lg:px-16 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-24">

            {/* LEFT CONTENT */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              transition={{ staggerChildren: 0.12 }}
              className="order-2 lg:order-1"
            >
              <motion.p
                variants={fadeUp}
                className="mb-5 text-[11px] font-medium uppercase tracking-[0.25em] text-[#8E91C4]"
              >
                A STORY FROM SKIN
              </motion.p>

              <motion.h2
                variants={fadeUp}
                className="max-w-[650px] font-serif text-4xl leading-[1.12] text-[#191919] sm:text-5xl lg:text-[54px] xl:text-[60px]"
              >
                It all started with a{" "}
                <span className="italic text-[#7D45C2]">
                  personal experience.
                </span>
              </motion.h2>

              <div className="mt-7 space-y-4 md:mt-9 md:space-y-5">
                {paragraphs.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    variants={fadeUp}
                    className="text-sm leading-[1.9] text-[#484454] sm:text-[15px]"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              <motion.div
                variants={fadeUp}
                className="mt-9 border-l-[3px] border-[#7D45C2] pl-5 md:mt-12"
              >
                <p className="font-serif text-xl italic leading-relaxed text-[#26244F] sm:text-2xl">
                  “Understand first. Act second. Always.”
                </p>
              </motion.div>
            </motion.div>

            {/* RIGHT IMAGE */}
            <motion.div
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              whileInView={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative order-1 lg:order-2"
            >
              {/* Decorative background */}
              <div className="absolute -right-5 -top-5 h-full w-full rounded-[30px] border border-[#7D45C2]/20 sm:-right-7 sm:-top-7" />

              <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-[30px] bg-[#EDE5F8] sm:aspect-[5/6] lg:aspect-[4/5]">
                <Image
                  src="/about.jpg"
                  alt="The personal skincare journey behind Solvestic"
                  fill
                  priority={false}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />

                {/* Soft gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#26244F]/20 via-transparent to-transparent" />
              </div>

              {/* Floating decorative circle */}
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-6 -left-5 hidden h-28 w-28 rounded-full border border-[#7D45C2]/20 bg-[#EDE5F8]/80 backdrop-blur-sm sm:block"
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* =====================================================
          THE QUESTION
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#F7F2FC] px-3 py-8 sm:px-5 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid overflow-hidden rounded-[24px] bg-white lg:grid-cols-2 lg:rounded-[32px]">

            {/* LEFT IMAGE */}
            <motion.div
              initial={{
                opacity: 0,
                x: -70,
                scale: 0.95,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex h-[320px] items-center justify-center overflow-hidden bg-[#F4EDF9] sm:h-[450px] lg:h-full lg:min-h-[570px]"
            >
              <div className="group relative h-full w-full overflow-hidden">
                <Image
                  src="/about1.jpg"
                  alt="The beginning of Solvestic"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />
              </div>
            </motion.div>

            {/* RIGHT CONTENT */}
            <div className="flex items-center px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20 xl:px-20">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  staggerChildren: 0.15,
                }}
                className="max-w-[620px]"
              >
                {/* Eyebrow */}
                <motion.p
                  variants={fadeUp}
                  className="mb-5 text-[11px] font-medium uppercase tracking-[0.25em] text-[#8E91C4] sm:mb-7"
                >
                  THE BEGINNING
                </motion.p>

                {/* Heading */}
                <motion.h2
                  variants={fadeUp}
                  className="font-serif text-4xl leading-[1.12] text-[#191919] sm:text-5xl lg:text-[52px]"
                >
                  One simple question{" "}
                  <span className="italic text-[#7D45C2]">
                    changed everything.
                  </span>
                </motion.h2>

                {/* Intro */}
                <motion.p
                  variants={fadeUp}
                  className="mt-6 text-sm leading-[1.9] text-[#484454] sm:mt-8 sm:text-base"
                >
                  One day, during a conversation with my
                  husband, he simply asked me,
                </motion.p>

                {/* Highlighted Quote */}
                <motion.blockquote
                  variants={fadeUp}
                  className="relative my-7 border-l-[3px] border-[#7D45C2] pl-5 font-serif text-2xl italic leading-[1.35] text-[#7D45C2] sm:my-9 sm:pl-7 sm:text-3xl"
                >
                  “Instead of looking here and there, why
                  don’t you formulate one yourself?”
                </motion.blockquote>

                {/* Description */}
                <motion.p
                  variants={fadeUp}
                  className="text-sm leading-[1.9] text-[#484454] sm:text-base"
                >
                  It was a simple question, but it stayed
                  with us. Somewhere between long
                  conversations and even longer nights,
                  that question slowly became an idea —
                  and eventually, a promise we made to
                  each other, and to everyone who would
                  one day trust us with their skin.
                </motion.p>

                {/* Decorative line */}
                <motion.div
                  variants={fadeUp}
                  className="mt-9 h-[2px] w-16 bg-[#7D45C2]/50"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          SOLVESTIC PHILOSOPHY
      ===================================================== */}
      <div className="px-4 py-6 md:px-20 sm:py-13 bg-[#F7F2FC]">
        <div className="grid gap-6 md:gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-black">
              OUR PHILOSOPHY
            </p>

            <h2 className="mt-3 md:mt-5 max-w-[500px] text-black font-serif text-4xl leading-[0.98] sm:text-6xl">
              Understand first.
              <br />
              <i>Act second.</i>
              <br />
              Always.
            </h2>
          </div>

          <div className="max-w-[680px] text-sm  text-black sm:text-base">

            <p>
              That became the thought behind Solvestic.
            </p>

            <p className="mt-3 md:mt-6">
              Solvestic was founded by Sneha Suman, a fashion designer, and
              Prince Verma, a model by profession — two people who came from
              creative worlds, but found themselves united by a deeply personal
              experience with skincare.
            </p>

            <p className="mt-3 md:mt-6">
              Neither of us set out to build a skincare brand. But that
              experience made us curious, then questioning, and eventually
              determined to understand skincare differently.
            </p>

            <p className="mt-3 md:mt-6">
              What began as a conversation between two people slowly became
              something we wanted to build together.
            </p>

          </div>
        </div>
      </div>

      {/* =====================================================
          FOUNDER STORY
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#F7F2FC] px-3 py-8 sm:px-5 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="overflow-hidden rounded-[24px] bg-white lg:rounded-[32px]">
            <div className="grid md:grid-cols-2">

              {/* LEFT CONTENT */}
              <div className="order-1 flex items-center px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20 xl:px-20">
                <motion.div
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    staggerChildren: 0.15,
                  }}
                  className="max-w-[550px]"
                >
                  {/* Small heading */}
                  <motion.p
                    variants={fadeUp}
                    className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#8E91C4]"
                  >
                    THE PEOPLE BEHIND SOLVESTIC
                  </motion.p>

                  {/* Main heading */}
                  <motion.h2
                    variants={fadeUp}
                    className="mt-5 font-serif text-4xl leading-[1.12] text-[#191919] sm:mt-7 sm:text-5xl lg:text-[52px]"
                  >
                    Two creative minds.
                    <br />
                    <span className="italic text-[#7D45C2]">
                      One shared belief.
                    </span>
                  </motion.h2>

                  {/* Paragraphs */}
                  <div className="mt-7 space-y-5 sm:mt-9 sm:space-y-6">
                    {paragraphs.map((paragraph, index) => (
                      <motion.p
                        key={index}
                        variants={fadeUp}
                        className="text-sm leading-[1.9] text-[#484454] sm:text-base"
                      >
                        {paragraph}
                      </motion.p>
                    ))}
                  </div>

                  {/* Founder Names */}
                  <motion.div
                    variants={fadeUp}
                    className="mt-10 grid grid-cols-2 gap-5 border-t border-[#E5DDED] pt-7 sm:gap-8"
                  >
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#26244F]">
                        Sneha Suman
                      </p>
                      <p className="mt-2 text-sm text-[#777184]">
                        Co-Founder
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#26244F]">
                        Prince Verma
                      </p>
                      <p className="mt-2 text-sm text-[#777184]">
                        Co-Founder
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* RIGHT FOUNDER IMAGE */}
              <motion.div
                initial={{
                  opacity: 0,
                  x: 70,
                  scale: 0.95,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="order-2 relative min-h-[380px] overflow-hidden bg-[#E5E2E7] sm:min-h-[500px] md:min-h-[600px]"
              >
                <div className="group absolute inset-0 overflow-hidden">
                  <Image
                    src="/founder.jpg"
                    alt="Sneha Suman and Prince Verma - Founders of Solvestic"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />

                  {/* Subtle gradient overlay */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#26244F]/15 via-transparent to-transparent" />
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MISSION
      ===================================================== */}
      <section className="relative overflow-hidden bg-[#F7F2FC] px-3 py-8 sm:px-5 lg:py-16">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid overflow-hidden rounded-[24px] bg-white lg:grid-cols-2 lg:rounded-[32px]">

            {/* LEFT IMAGE */}
            <motion.div
              initial={{
                opacity: 0,
                x: -70,
                scale: 0.95,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
                scale: 1,
              }}
              viewport={{
                once: true,
                amount: 0.2,
              }}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative min-h-[350px] overflow-hidden bg-[#EDE5F8] sm:min-h-[450px] lg:min-h-[600px]"
            >
              <div className="group absolute inset-0 overflow-hidden">
                <Image
                  src="/about2.jpg"
                  alt="Solvestic skincare mission"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-top transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />

                {/* Soft gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#26244F]/15 via-transparent to-transparent" />
              </div>
            </motion.div>

            {/* RIGHT CONTENT */}
            <div className="flex items-center px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-20 xl:px-20">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  staggerChildren: 0.15,
                }}
                className="max-w-[650px]"
              >
                {/* Eyebrow */}
                <motion.p
                  variants={fadeUp}
                  className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#8E91C4]"
                >
                  OUR MISSION
                </motion.p>

                {/* Heading */}
                <motion.h2
                  variants={fadeUp}
                  className="mt-5 font-serif text-4xl leading-[1.12] text-[#191919] sm:mt-7 sm:text-5xl lg:text-[52px]"
                >
                  Skincare that feels less like a brand
                  selling to you,{" "}
                  <span className="italic text-[#7D45C2]">
                    and more like someone understands.
                  </span>
                </motion.h2>

                {/* Description */}
                <motion.p
                  variants={fadeUp}
                  className="mt-7 text-sm leading-[1.9] text-[#484454] sm:mt-9 sm:text-base"
                >
                  Our mission is simple, and it’s one we
                  return to every day: keep listening,
                  keep understanding, and keep building
                  things that are honest — one
                  relationship, one skin, one concern at
                  a time.
                </motion.p>

                {/* Decorative line */}
                <motion.div
                  variants={fadeUp}
                  className="mt-9 h-[2px] w-16 bg-[#7D45C2]/50"
                />
              </motion.div>
            </div>

          </div>
        </div>
      </section>

    </section>
  );
}