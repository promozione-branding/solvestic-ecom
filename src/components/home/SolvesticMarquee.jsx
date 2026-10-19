
"use client";

import Image from "next/image";

const marqueeItems = [
    {
        normal: "Thoughtful",
        bold: "Skincare",
        icon: "✳",
    },
    {
        normal: "Made for",
        bold: "Every Skin",
        icon: "✦",
    },
    {
        normal: "Care Beyond",
        bold: "The Surface",
        icon: "✦",
    },
];

function MarqueeContent() {
    return (
        <div className="flex shrink-0 items-center gap-8 pr-8 md:gap-12 md:pr-12">
            {marqueeItems.map((item, index) => (
                <div
                    key={index}
                    className="flex shrink-0 items-center gap-8 md:gap-12"
                >
                    {/* Decorative symbol */}
                    <span
                        aria-hidden="true"
                        className="text-[34px] leading-none text-[#7D45C2]"
                    >
                        ●
                    </span>

                    {/* Text */}
                    <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-[24px] font-light tracking-[-0.015em] text-black sm:text-[30px]">
                        <span>{item.normal}</span>
                        <strong className="font-semibold">
                            {item.bold}
                        </strong>
                    </div>

                    {/* Small product image */}
                    {/* <div className="relative flex h-[65px] w-[48px] shrink-0 items-center justify-center sm:h-[85px] sm:w-[60px] lg:h-[105px] lg:w-[75px]">
                        <Image
                            src="/products/1.png"
                            alt="Solvestic Face Cleanser"
                            fill
                            sizes="(max-width: 640px) 48px, 75px"
                            className="object-contain"
                        />
                    </div> */}
                </div>
            ))}
        </div>
    );
}

export default function SolvesticMarquee() {
    return (
        <section
            aria-label="Solvestic skincare philosophy"
            className="relative w-full overflow-hidden border-y border-[#B6B8DB]/20 bg-white py-3 sm:py-4"
        >
            <div className="solvestic-marquee-track flex w-max items-center">
                <MarqueeContent />

                <div aria-hidden="true">
                    <MarqueeContent />
                </div>
            </div>

            <style jsx global>{`
        @keyframes solvesticMarquee {
          from {
            transform: translate3d(0, 0, 0);
          }
          to {
            transform: translate3d(-50%, 0, 0);
          }
        }

        .solvestic-marquee-track {
          animation: solvesticMarquee 32s linear infinite;
          will-change: transform;
        }

        .solvestic-marquee-track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .solvestic-marquee-track {
            animation: none;
          }
        }
      `}</style>
        </section>
    );
}
