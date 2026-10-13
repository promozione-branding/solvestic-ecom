"use client"
import Image from "next/image";
import React, { useEffect, useId, useState } from "react";

// import heroImg from "./assets/hero.svg";
// import skinLayersImg from "./assets/skin-layers.svg";
// import textureImg from "./assets/texture.svg";
// import dayImg from "./assets/day.svg";
// import nightImg from "./assets/night.svg";

/*
  Solvestic — Our Philosophy
  Tailwind version of the supplied page.

  Requirements:
  - Tailwind CSS
  - No external OurPhilosophy.css file
  - Keep the supplied SVG/image assets in ./assets/
*/

const ANNOUNCEMENTS = [
  "FREE AIRPODS",
  "SULPHATE & PARABEN FREE",
  "CRUELTY-FREE",
  "FDA-APPROVED",
];

const NAV_LINKS = [
  { label: "Shop All", href: "#" },
  { label: "Skincare", href: "#" },
  { label: "Body Care", href: "#" },
  { label: "Bestsellers", href: "#" },
  { label: "Our Philosophy", href: "#", active: true },
];

const STATS = [
  { value: "[XX]%", label: "saw more hydrated skin after [X] weeks" },
  { value: "[XX]%", label: "noticed a smoother, more even texture" },
  { value: "[XX]%", label: "said their skin felt stronger and less sensitive" },
  { value: "[XX]%", label: "would recommend Solvestic to a friend" },
];

const PRINCIPLES = [
  {
    title: "Barrier first",
    text: "Ceramides, lipids and humectants that strengthen and protect the skin’s natural barrier.",
    icon: (
      <>
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
        <path d="M9 12h6" />
      </>
    ),
  },
  {
    title: "Proven actives",
    text: "Ingredients like vitamin C, niacinamide and peptides, used at levels backed by research.",
    icon: (
      <path d="M12 3c3 4 6 7 6 11a6 6 0 01-12 0c0-4 3-7 6-11z" />
    ),
  },
  {
    title: "Gentle by design",
    text: "pH-balanced, dermatologist tested and made without harsh irritants.",
    icon: <path d="M4 18l5-6 4 3 7-9" />,
  },
];

const BENEFITS = [
  ["Strengthens", "the barrier"],
  ["Locks in", "hydration"],
  ["Reveals", "natural glow"],
];

const ROUTINES = [
  {
    key: "day",
    theme: "light",
    img: "/day.svg",
    alt: "Solvestic day serum with sun",
    title: "Day",
    subtitle: "protect",
    tag: "AM routine",
    text: "Antioxidants and lightweight hydration shield skin from sun, pollution and daily wear.",
    ingredients: ["[Ingredient 1]", "[Ingredient 2]", "[Ingredient 3]", "[Ingredient 4]"],
    effects: ["+ Hydration", "+ Antioxidants", "− Dullness"],
  },
  {
    key: "night",
    theme: "dark",
    img: "/night.svg",
    alt: "Solvestic night cream with moon",
    title: "Night",
    subtitle: "repair",
    tag: "PM routine",
    text: "Richer, restorative actives work overnight to renew texture, rebuild the barrier and smooth fine lines.",
    ingredients: ["[Ingredient 1]", "[Ingredient 2]", "[Ingredient 3]", "[Ingredient 4]"],
    effects: ["+ Repair", "+ Collagen", "− Fine lines"],
  },
];

const EXPERTS = [
  {
    name: "[Expert name]",
    role: "[Credentials · Specialty]",
    bio: "[One-line bio: experience, affiliation]",
    photo: null,
  },
  {
    name: "[Expert name]",
    role: "[Credentials · Specialty]",
    bio: "[One-line bio: experience, affiliation]",
    photo: null,
  },
  {
    name: "[Expert name]",
    role: "[Credentials · Specialty]",
    bio: "[One-line bio: experience, affiliation]",
    photo: null,
  },
];

const FOOTER_COLUMNS = [
  { title: "About", links: ["Our Philosophy", "Our Story", "Journal", "Press"] },
  { title: "Support", links: ["FAQs", "Shipping", "Returns & refunds", "Contact us"] },
];

function Marquee({ items, renderItem, className = "", repeat = 4 }) {
  const loop = Array.from({ length: repeat }, () => items).flat();

  return (
    <div className={`w-full overflow-hidden whitespace-nowrap ${className}`}>
      <div className="sv-marquee flex w-max">
        {loop.map((item, i) => (
          <React.Fragment key={i}>
            {renderItem(item)}
            <span
              aria-hidden="true"
              className="mx-[24px] text-[#B6B8DB] sm:mx-[48px]"
            >
              ✦
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function Sparkle({ size, color, style, delay }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      className="sv-twinkle pointer-events-none absolute"
      style={{ animationDelay: delay, ...style }}
    >
      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
    </svg>
  );
}

function SpinningBadge() {
  return (
    <div
      className="sv-spin absolute left-[-8px] top-[-18px] z-20 h-[96px] w-[96px] sm:left-[-20px] sm:h-[112px] sm:w-[112px] lg:left-[-34px] lg:h-[132px] lg:w-[132px]"
      aria-hidden="true"
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 132 132"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <path
            id="svCircle"
            d="M66 66 m-50 0 a50 50 0 1 1 100 0 a50 50 0 1 1 -100 0"
          />
        </defs>
        <circle cx="66" cy="66" r="64" fill="#26244F" />
        <text
         
          fontSize="11.5"
          letterSpacing="3.2"
          fill="#EEEFF8"
        >
          <textPath href="#svCircle">
            SOLVESTIC ✦ CLEAN SCIENCE ✦ REAL RESULTS ✦
          </textPath>
        </text>
        <circle cx="66" cy="66" r="14" fill="#B6B8DB" />
      </svg>
    </div>
  );
}

const Icon = ({ children, size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export default function OurPhilosophy() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
  };

  return (
    <div
      className="sv-page min-h-screen overflow-x-hidden bg-white text-[#26244F]"
      style={{
        "--ink": "#26244F",
        "--ink-2": "#33305F",
        "--violet": "#4B4886",
        "--lavender": "#B6B8DB",
        "--lavender-2": "#8E91C4",
        "--lilac": "#EEEFF8",
        "--line": "#DCDDEF",
        "--muted": "#55537A",
        "--white": "#ffffff",
      }}
    >
      <style>{`
       

       

        .sv-page .sv-serif,
        .sv-page .sv-display,
        .sv-page .sv-h2,
        .sv-page .sv-equation-line,
        .sv-page .sv-newsletter-title,
        .sv-page .sv-footer-logo,
        .sv-page .sv-footer-tagline,
        

        .sv-page *,
        .sv-page *::before,
        .sv-page *::after {
          box-sizing: border-box;
        }

        .sv-page img {
          display: block;
          max-width: 100%;
        }

        .sv-marquee {
          animation: svMarquee 30s linear infinite;
        }

        .sv-marquee--fast .sv-marquee {
          animation-duration: 22s;
        }

        .sv-marquee--slow .sv-marquee {
          animation-duration: 30s;
        }

        .sv-marquee-track:hover .sv-marquee {
          animation-play-state: paused;
        }

        .sv-fade {
          animation: svFadeUp .9s cubic-bezier(.2,.7,.2,1) both;
        }

        .sv-d1 { animation-delay: .12s; }
        .sv-d2 { animation-delay: .26s; }
        .sv-d3 { animation-delay: .4s; }

        .sv-float {
          animation: svFloat 6s ease-in-out infinite;
        }

        .sv-float-slow {
          animation: svFloat 9s ease-in-out infinite;
        }

        .sv-spin {
          animation: svSpin 22s linear infinite;
        }

        .sv-twinkle {
          animation: svTwinkle 3.2s ease-in-out infinite;
        }

        .sv-pulse {
          animation: svPulse 2.6s ease-out infinite;
        }

        .sv-zoom {
          animation: svZoom 12s ease-in-out infinite;
        }

        .sv-shine::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 30%;
          height: 100%;
          background: rgba(255,255,255,.28);
          transform: translateX(-120%) skewX(-20deg);
          animation: svShine 3.4s ease-in-out infinite;
        }

        @keyframes svFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: none; }
        }

        @keyframes svFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        @keyframes svSpin {
          to { transform: rotate(360deg); }
        }

        @keyframes svMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @keyframes svTwinkle {
          0%, 100% { opacity: .25; transform: scale(.7); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes svPulse {
          0% { box-shadow: 0 0 0 0 rgba(182,184,219,.7); }
          70% { box-shadow: 0 0 0 16px rgba(182,184,219,0); }
          100% { box-shadow: 0 0 0 0 rgba(182,184,219,0); }
        }

        @keyframes svShine {
          from { transform: translateX(-120%) skewX(-20deg); }
          to { transform: translateX(320%) skewX(-20deg); }
        }

        @keyframes svZoom {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @media (prefers-reduced-motion: reduce) {
          .sv-page *,
          .sv-page *::before,
          .sv-page *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

      {/* Announcement bar */}
      {/* <div className="flex h-10 items-center overflow-hidden bg-[#7d45c2] text-[11px] uppercase tracking-[.08em] text-[#EEEFF8] sm:text-[13px]">
        <Marquee
          items={ANNOUNCEMENTS}
          renderItem={(t) => <span>{t}</span>}
          className="sv-marquee-track sv-marquee--slow"
        />
      </div> */}

      {/* Header */}
      {/* <header className="relative flex h-[72px] items-center justify-between border-b border-[#DCDDEF] px-4 sm:h-[82px] sm:px-8 lg:h-[88px] lg:px-[80px]">
        <nav
          aria-label="Primary"
          className="hidden items-center gap-5 text-[13px] font-medium lg:flex xl:gap-8 xl:text-[15px]"
        >
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-current={l.active ? "page" : undefined}
              className={`transition-colors hover:text-[#4B4886] ${
                l.active
                  ? "border-b-2 border-[#26244F] pb-1"
                  : ""
              }`}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#26244F] lg:hidden"
        >
          <span className="sr-only">Menu</span>
          <span className="flex w-5 flex-col gap-1.5">
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
            <span className="h-px w-full bg-current" />
          </span>
        </button>

        <a
          href="/"
          className="absolute left-1/2 -translate-x-1/2 font-serif text-[24px] font-medium tracking-[.16em] text-[#26244F] sm:text-[29px] lg:text-[34px]"
          style={{ fontFamily: '"Fraunces", Georgia, serif' }}
        >
          SOLVESTIC
        </a>

        <div className="flex items-center gap-0.5 sm:gap-2">
          <button
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#EEEFF8] sm:h-11 sm:w-11"
          >
            <Icon>
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </Icon>
          </button>

          <button
            aria-label="Account"
            className="hidden h-11 w-11 items-center justify-center rounded-full transition-colors hover:bg-[#EEEFF8] sm:flex"
          >
            <Icon>
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
            </Icon>
          </button>

          <button
            aria-label="Cart"
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#EEEFF8] sm:h-11 sm:w-11"
          >
            <Icon>
              <path d="M5 8h14l-1.2 12H6.2z" />
              <path d="M9 8V6a3 3 0 016 0v2" />
            </Icon>
          </button>
        </div>

        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full z-50 border-b border-[#DCDDEF] bg-white px-5 py-5 shadow-lg lg:hidden">
            <nav className="flex flex-col gap-4 text-sm font-medium">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={l.active ? "text-[#4B4886]" : ""}
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header> */}

      <main>
        {/* Hero */}
        <section className="relative grid min-h-[600px] grid-cols-1 mt-20 items-center gap-10 overflow-hidden bg-[#F0EBF9] px-5 py-14 sm:px-10 lg:min-h-[620px] lg:grid-cols-2 lg:gap-16 lg:px-[70px] lg:py-[60px]">
          <div className="relative z-10 flex flex-col gap-6 lg:gap-7">
            <div className="sv-fade text-[10px] font-bold uppercase tracking-[.22em] text-[#4B4886] sm:text-[13px]">
              Our Philosophy
            </div>

            <h1 className="sv-fade sv-d1 max-w-[720px] text-[#ac4cd1]    font-light leading-[1.02] tracking-[-.02em] text-4xl sm:text-[54px] lg:text-[clamp(44px,5.3vw,76px)]">
              Honest science. <em className="font-medium">Visible results.</em>
            </h1>

            <p className="sv-fade sv-d2 max-w-[520px] text-base md:leading-[1.65] sm:text-[17px] lg:text-[19px] lg:leading-[1.6]">
              Every Solvestic formula starts with one question: what does your
              skin actually need? We pair proven actives with gentle,
              skin-friendly bases — and nothing you don’t need.
            </p>

            <div className="sv-fade sv-d3 mt-1 flex flex-wrap gap-3">
              <a
                href="/"
                className="sv-shine relative inline-flex items-center overflow-hidden rounded-full bg-[#2d1557] px-6 py-3.5 text-[13px] font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(38,36,79,.25)] sm:px-8 sm:py-[18px] sm:text-[15px]"
              >
                <span className="relative z-10">Join Waitlist</span>
              </a>

              
            </div>
          </div>

          <div className="sv-fade sv-d2 relative mx-auto w-full max-w-[700px] lg:mx-0">
  <div className="sv-float-slow">
    <div
      className="
        relative
        h-[400px]
        overflow-hidden
        rounded-[210px_210px_24px_24px]
        bg-[#2d1557]
        sm:h-[500px]
       
      "
    >
      {/* IMAGE */}
      <div className="sv-zoom absolute inset-0 h-full w-full">
        <Image
          src="/newban2.jpeg"
          alt="Clear science. Clear skin."
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 700px, 700px"
          className="
            h-full
            w-full
            object-cover
            object-center
          "
        />
      </div>

      {/* BOTTOM CONTENT */}
      <div
        className="
          absolute
          bottom-5
          left-5
          right-5
          flex
          items-center
          justify-between
          gap-3
          rounded-2xl
          bg-white
          px-4
          py-3.5
          sm:bottom-7
          sm:left-7
          sm:right-7
          sm:px-[22px]
          sm:py-[18px]
        "
      >
        <span className="sv-serif text-[12px] sm:text-[20px]">
          Clear science. Clear skin.
        </span>

        <span className="text-[9px] font-bold uppercase tracking-[.14em] text-[#4B4886] sm:text-[12px]">
          Solvestic
        </span>
      </div>
    </div>
  </div>

  <SpinningBadge />
</div>

          <Sparkle size={22} color="#8E91C4" delay=".3s" style={{ top: 90, left: "44%" }} />
          <Sparkle size={16} color="#B6B8DB" delay="1.4s" style={{ bottom: 40, left: "42%" }} />
          <Sparkle size={18} color="#8E91C4" delay="2.1s" style={{ top: 120, right: 60 }} />
          <Sparkle size={14} color="#B6B8DB" delay=".9s" style={{ bottom: 60, left: 60 }} />
        </section>

        {/* Stats */}
        <section className="flex flex-col items-center gap-5 md:gap-10 px-5 py-6 md:py-13 sm:px-13 ">
          <h2 className="sv-h2 max-w-[760px] text-black text-center text-[32px] font-light leading-[1.15] sm:text-[40px] lg:text-[48px]">
            Results you can <em>see and measure.</em>
          </h2>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STATS.map((s, i) => (
              <div
                key={i}
                className="group flex flex-col gap-3 rounded-b-2xl border-t-[1.5px] border-[#26244F] px-0 py-5 transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_48px_rgba(38,36,79,.12)]"
              >
                <div className="sv-serif text-[#7B44BF] text-[48px] font-light leading-none sm:text-[58px] lg:text-[64px]">
                  {s.value}
                </div>
                <div className="text-[12px] leading-[1.5] sm:text-[15px]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

        
        </section>

        {/* Principles */}
        <section className="bg-[#b1a2cf] px-5 py-6 text-white sm:px-10 sm:py-13">
          <div className="mb-5 md:mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <h2 className="sv-h2 max-w-[640px] text-[30px] font-light leading-[1.1] sm:text-[42px] lg:text-[52px]">
              Three principles{" "}
              <em className="text-[#fff]">behind every formula</em>
            </h2>

            <p className="max-w-[440px] text-[13px] leading-[1.6] text-[#fff] sm:text-[15px] lg:text-[17px]">
              We keep our approach simple, so what goes on your skin is only
              what works for it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:gap-5 md:grid-cols-3">
            {PRINCIPLES.map((p) => (
              <article
                key={p.title}
                className="group flex flex-col gap-2 md:gap-5 rounded-[20px] bg-[#fff] p-6 transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_48px_rgba(0,0,0,.18)] sm:p-8 lg:p-9"
              >
                <div className="sv-pulse flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#b1a2cf] sm:h-14 sm:w-14">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="1.6"
                    aria-hidden="true"
                  >
                    {p.icon}
                  </svg>
                </div>

                <h3 className="sv-serif text-[#7d45c2] text-[24px] sm:text-[28px]">
                  {p.title}
                </h3>

                <p className="text-[13px] leading-[1.9] text-[#7d45c2] sm:text-[15px]">
                  {p.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* How skin works */}
        <section className="grid grid-cols-1 items-center gap-5 px-5 py-6 sm:px-10 md:grid-cols-2 sm:gap-15">
          <img
            className="sv-float mx-auto h-[320px] w-full max-w-[600px] rounded-3xl object-cover sm:h-[460px] lg:h-[560px]"
            src={"/svg2.svg"}
            alt="Illustration of skin layers with a serum drop reaching the barrier"
          />

          <div className="flex flex-col gap-3 md:gap-6">
            <div className="text-[10px] font-bold uppercase tracking-[.22em] text-[#7d45c2] sm:text-[13px]">
              How skin works
            </div>

            <h2 className="sv-h2 text-[#7d45c2] text-[30px] font-light leading-[1.1] sm:text-[42px] lg:text-[52px]">
              Healthy skin starts with{" "}
              <em>a healthy barrier.</em>
            </h2>

            <p className="text-base md:leading-[1.7] sm:text-[17px]">
              The outer layer of skin works like a brick wall — cells held
              together by a mortar of lipids. It locks moisture in and keeps
              irritants out.
            </p>

            <p className="text-base md:leading-[1.7] sm:text-[17px]">
              When that wall is damaged by sun, pollution or harsh products,
              skin loses water and shows it as dryness, dullness, redness and
              breakouts.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <span className="rounded-full bg-[#7d45c2] text-white px-4 py-2.5 text-[12px] font-medium sm:px-[18px] sm:text-[14px]">
                Strong barrier = lasting hydration
              </span>
              <span className="rounded-full bg-[#7d45c2] text-white px-4 py-2.5 text-[12px] font-medium sm:px-[18px] sm:text-[14px]">
                Damaged barrier = dullness &amp; sensitivity
              </span>
            </div>
          </div>
        </section>

        {/* Equation */}
        <section className="flex flex-col items-center gap-7 bg-[#b1a2cf] px-5 py-6 text-center sm:px-10 sm:py-13">
          <div className="text-[10px] font-bold uppercase tracking-[.22em] text-[#ffff] sm:text-[13px]">
            Our formula for skincare
          </div>

          <div className="sv-equation-line flex text-[#fff] flex-wrap items-center justify-center gap-2 text-[30px] font-light sm:gap-7 sm:text-[44px] lg:text-[54px]">
            <span>Science</span>
            <span className="text-[.74em]">+</span>
            <span>Nature</span>
            <span className="text-[.74em]">=</span>
            <em>Solvestic</em>
          </div>

          <p className="max-w-[820px] text-[#fff] text-sm md:leading-[1.7] sm:text-[18px]">
            Lab-proven actives meet skin-loving botanicals. Every formula is
            developed with dermatologists and tested for safety and results
            before it reaches you.
          </p>
        </section>

        {/* Why it matters */}
        <section className="grid grid-cols-1 items-center gap-12 px-5 py-6 md:px-10 md:grid-cols-2 md:py-13">
          <div className="flex flex-col gap-6">
            <div className="text-[10px] font-bold uppercase tracking-[.22em] text-[#7d45c2] sm:text-[13px]">
              Why it matters
            </div>

            <h2 className="sv-h2 text-[30px] text-[#7d45c2]  font-light leading-[1.1] sm:text-[42px] lg:text-[52px]">
              Nothing hidden. <em>Nothing unnecessary.</em>
            </h2>

            <p className="text-sm md:leading-[1.7] sm:text-[17px]">
              We list every ingredient and why it’s there. Our products are
              tested on real skin, free from [parabens, sulphates — add your
              free-from list], and never tested on animals.
            </p>

            <a
              href="/"
              className="self-start border-b-[1.5px] border-[#26244F] pb-1 text-[13px] font-medium transition hover:tracking-[.02em] sm:text-[15px]"
            >
              Join Waitlist →
            </a>
          </div>

                <div className="h-full w-full flex justify-center items-center">
          <img
            className="sv-float-slow mx-auto h-100 w-full object-contain"
            src="/key.png"
            height={100}
            width={100}
            alt="Cream swatch, serum drop and botanicals on lavender"
          />
          </div>
        </section>

        {/* Benefits ticker */}
        {/* <div className="flex h-[76px] items-center overflow-hidden bg-[#ad51c1]  text-[22px] text-white sm:h-24 sm:text-[28px]">
          <Marquee
            items={BENEFITS}
            className="sv-marquee-track sv-marquee--fast"
            renderItem={([lead, accent]) => (
              <span>
                {lead} <em className="text-[#B6B8DB]">{accent}</em>
              </span>
            )}
          />
        </div> */}

        {/* Day / Night system */}
        

        {/* Experts */}
        <section className="px-5 py-6 sm:px-10 sm:py-13">
          <div className="mb-5 md:mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-6">
              <div className="text-[10px] font-bold uppercase tracking-[.22em] text-[#7d45c2] sm:text-[13px]">
                Experts' corner
              </div>

              <h2 className="sv-h2 text-[#7d45c2] text-[30px] font-light leading-[1.1] sm:text-[42px] lg:text-[52px]">
                The Solvestic <em>Advisory Board</em>
              </h2>
            </div>

            <p className="max-w-[460px] text-sm md:leading-[1.6] sm:text-[17px]">
              The dermatologists, cosmetic chemists and formulators who guide
              every Solvestic product.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {EXPERTS.map((x, i) => (
              <article
                key={i}
                className="flex flex-col gap-4 rounded-[20px] border border-[#DCDDEF] p-5 transition duration-300 hover:-translate-y-2 hover:shadow-[0_22px_48px_rgba(38,36,79,.12)] sm:rounded-[24px] sm:p-7"
              >
                {x.photo ? (
                  <img
                    src={x.photo}
                    alt={x.name}
                    className="h-[220px] w-full rounded-2xl object-cover sm:h-[280px]"
                  />
                ) : (
                  <div className="flex h-[220px] w-full items-center justify-center rounded-2xl bg-[#EEEFF8] text-[11px] font-bold uppercase tracking-[.14em] text-[#4B4886] sm:h-[280px]">
                    [Portrait]
                  </div>
                )}

                <h3 className="sv-serif text-[24px] sm:text-[26px]">
                  {x.name}
                </h3>

                <div className="text-[13px] font-medium text-[#4B4886] sm:text-[14px]">
                  {x.role}
                </div>

                <p className="text-[13px] leading-[1.6] sm:text-[15px]">
                  {x.bio}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        
      </main>

      {/* Footer */}
      
    </div>
  );
}
