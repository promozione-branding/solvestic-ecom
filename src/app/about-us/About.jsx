"use client";

import React from "react";

export default function About() {
  return (
    <section className="w-full bg-white mt-28 text-[#26244F]">

      {/* =====================================================
          HERO / INTRO
      ===================================================== */}
      <div className="px-3 pt-3 sm:px-5 sm:pt-5">
        <div className="relative min-h-[320px] overflow-hidden rounded-[24px] bg-[#7b44bf] sm:min-h-[510px] ">

          {/* Replace with your Solvestic image */}
          <img
            src="/aboutban2.webp"
            alt="Solvestic story"
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          <div className="absolute bottom-1 md:bottom-7 left-6 right-6 flex items-end justify-between gap-5 text-white sm:bottom-10 sm:left-10 sm:right-10">
            <div>
              

              
            </div>

            <div className=" text-lg text-right md:text-4xl  sm:flex">
              Build From 
              Personal  <br  /> Experience
             
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          STORY INTRO
      ===================================================== */}
      <div className="px-5 py-7 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-[850px] text-center">

          <p className="mb-4 md:mb-8 text-[10px] uppercase tracking-[0.2em] text-[#8E91C4]">
            A STORY FROM SKIN
          </p>

          <h2 className="font-serif text-4xl text-black leading-[1.05] sm:text-5xl lg:text-6xl">
            It all started with a personal experience.
          </h2>

          <div className="mt-5 md:mt-10 space-y-4 md:space-y-6 text-sm leading-[1.9] text-black sm:text-base">
            <p>
              As I stepped into a new chapter of my life, like any girl, I
              wanted to feel beautiful, confident, and comfortable in my own
              skin.
            </p>

            <p>
              I explored skincare with the same curiosity so many of us do —
              trying products, discovering brands, and trusting what seemed
              right.
            </p>

            <p>
              But one experience changed the way I looked at skincare entirely.
              What began as a simple attempt to care for my skin left me
              dealing with a skin concern I had never experienced before.
            </p>

            <p>
              I felt frustrated, overwhelmed, and, for a while, even hesitant
              to step outside.
            </p>

            <p>
              More than the skin concern itself, it made me question how easily
              we trust what we put on our skin — and how difficult it can be to
              know what is actually right for us.
            </p>
          </div>

          <div className="mt-6 md:mt-12 font-serif text-xl italic text-[#26244F]">
            “Understand first. Act second. Always.”
          </div>
        </div>
      </div>

      {/* =====================================================
          THE QUESTION
      ===================================================== */}
      <div className="px-3 sm:px-5">
        <div className="grid overflow-hidden rounded-[24px] bg-[#fff] lg:grid-cols-2">

          {/* Image */}
          <div className="min-h-[430px] bg-[#E7E4EA] lg:min-h-[620px]">
            <img
              src="/ban2.jpeg"
              alt="The beginning of Solvestic"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex items-center px-4 py-6 md:py-13 sm:px-12 lg:px-20">
            <div className="max-w-[680px]">

              <p className="mb-4 md:mb-7 text-[10px] uppercase tracking-[0.2em] text-[#8E91C4]">
                THE BEGINNING
              </p>

              <h2 className="font-serif text-3xl leading-[1.05] text-black sm:text-5xl">
                One simple question changed everything.
              </h2>

              <p className="mt-4 md:mt-8 text-sm leading-[1.9] text-black sm:text-base">
                One day, during a conversation with my husband, he simply
                asked me,
              </p>

              <blockquote className="my-6 md:my-8 border-l border-[#AD51C1] pl-5 font-serif text-2xl leading-tight text-[#AD51C1] sm:text-3xl">
                “Instead of looking here and there, why don’t you formulate
                one yourself?”
              </blockquote>

              <p className="text-sm leading-[1.9] text-black sm:text-base">
                It was a simple question, but it stayed with us. Somewhere
                between long conversations and even longer nights, that
                question slowly became an idea — and eventually, a promise we
                made to each other, and to everyone who would one day trust us
                with their skin.
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SOLVESTIC PHILOSOPHY
      ===================================================== */}
      <div className="px-4 py-6 sm:px-10 sm:py-13">

        <div className="grid gap-6 md:gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">

          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-black">
              OUR PHILOSOPHY
            </p>

            <h2 className="mt-3 md:mt-5 max-w-[420px] text-black font-serif text-4xl leading-[0.98] sm:text-6xl">
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
      <div className="px-3 sm:px-5">
        <div className="overflow-hidden rounded-[24px] bg-[#fff]">

          <div className="grid md:grid-cols-2  ">

            {/* Founder image */}
            <div className="min-h-[420px] order-2 bg-[#E5E2E7] md:min-h-[600px]">
              <img
                src="/about4.jpeg"
                alt="Sneha Suman and Prince Verma"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Founder copy */}
            <div className="flex order-1  items-center px-4 py-6 md:py-13 sm:px-12 lg:px-20">
              <div className="max-w-[550px]">

                <p className="text-[10px] uppercase tracking-[0.2em] text-[#8E91C4]">
                  THE PEOPLE BEHIND SOLVESTIC
                </p>

                <h2 className="mt-3 md:mt-6 font-serif text-black text-3xl leading-[1.05] sm:text-5xl">
                  Two creative minds.
                  <br />
                  One shared belief.
                </h2>

                <p className="mt-4 md:mt-8 text-sm md:leading-[1.9] text-black sm:text-base">
                  We wanted to create skincare differently — with transparency
                  at the centre of every decision.
                </p>

                <p className="mt-3 md:mt-6 text-sm md:leading-[1.9] text-black sm:text-base">
                  We wanted to understand skin concerns properly before trying
                  to create solutions for them.
                </p>

                <p className="mt-3 md:mt-6 text-sm md:leading-[1.9] text-black sm:text-base">
                  No unnecessary promises, no trying to make skincare
                  complicated, and no building something simply because it
                  sounds good.
                </p>

                {/* <div className="mt-10 grid grid-cols-2 gap-8 border-t border-[#DCDDEF] pt-7">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black">
                      SNEHA SUMAN
                    </p>
                    <p className="mt-2 text-sm text-black">
                      Fashion Designer
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-black">
                      PRINCE VERMA
                    </p>
                    <p className="mt-2 text-sm text-black">
                      Model
                    </p>
                  </div>
                </div> */}

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* =====================================================
          MISSION
      ===================================================== */}
      <div className="px-5 py-6 text-center sm:px-10 sm:py-13">

        <p className="text-[10px] uppercase tracking-[0.2em] text-[#8E91C4]">
          OUR MISSION
        </p>

        <h2 className="mx-auto mt-3 md:mt-6 max-w-[850px] font-serif text-[#7b44bf] text-3xl md:leading-[1.05] sm:text-5xl lg:text-7xl">
          Skincare that feels less like a brand selling to you,
          <br className="hidden lg:block" />
          <i>and more like someone understands.</i>
        </h2>

        <div className="mx-auto mt-5 md:mt-10 max-w-[680px] text-sm md:leading-[1.9] text-black sm:text-base">
          <p>
            Our mission is simple, and it’s one we return to every day:
            keep listening, keep understanding, and keep building things that
            are honest — one relationship, one skin, one concern at a time.
          </p>
        </div>

      </div>

      {/* =====================================================
          CLOSING IMAGE / STATEMENT
      ===================================================== */}
      <div className="px-3 pb-3 sm:px-5 sm:pb-5">

        <div className="relative min-h-[340px] overflow-hidden rounded-[24px] bg-[#7b44bf] sm:min-h-[580px]">

          {/* <img
            src="/images/our-story-closing.jpg"
            alt="Solvestic"
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          /> */}

          <div className="absolute inset-0 bg-[#26244F]/35" />

          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white">

            <div className="max-w-[850px]">

              <p className="mb-8 text-[10px] uppercase tracking-[0.25em]">
                THIS IS SOLVESTIC
              </p>

              <h2 className="font-serif text-5xl leading-[0.95] sm:text-7xl lg:text-9xl">
                Built from a
                <br />
                personal experience.
              </h2>

              <div className="mx-auto mt-10 space-y-1 font-serif text-xl italic sm:text-2xl">
                <p>Shaped with love.</p>
                <p>Made with the intention to be real.</p>
              </div>

            </div>

          </div>
        </div>
      </div>

    </section>
  );
}