"use client"

import { FadeUp } from "@/components/landing/motion"

type Company = {
  name: string
  src: string
  alt: string
  heightClass: string
}

const COMPANIES: Company[] = [
  { name: "Tata", src: "/logos/tata.svg", alt: "Tata Group logo", heightClass: "h-8 md:h-10" },
  { name: "Reliance", src: "/logos/reliance.png", alt: "Reliance Industries logo", heightClass: "h-8 md:h-10" },
  { name: "Infosys", src: "/logos/infosys.svg", alt: "Infosys logo", heightClass: "h-7 md:h-8" },
  { name: "Wipro", src: "/logos/wipro.svg", alt: "Wipro logo", heightClass: "h-8 md:h-10" },
  { name: "Mahindra", src: "/logos/mahindra.svg", alt: "Mahindra Group logo", heightClass: "h-8 md:h-10" },
  { name: "L&T", src: "/logos/lt.svg", alt: "Larsen & Toubro logo", heightClass: "h-8 md:h-10" },
  { name: "Maruti Suzuki", src: "/logos/maruti-suzuki.svg", alt: "Maruti Suzuki logo", heightClass: "h-6 md:h-7" },
  { name: "Bajaj", src: "/logos/bajaj.svg", alt: "Bajaj Group logo", heightClass: "h-8 md:h-10" },
  { name: "Asian Paints", src: "/logos/asian-paints.svg", alt: "Asian Paints logo", heightClass: "h-8 md:h-10" },
  { name: "ITC", src: "/logos/itc.svg", alt: "ITC Limited logo", heightClass: "h-7 md:h-9" },
  { name: "Godrej", src: "/logos/godrej.svg", alt: "Godrej Group logo", heightClass: "h-8 md:h-10" },
  { name: "JSW", src: "/logos/jsw.svg", alt: "JSW Group logo", heightClass: "h-7 md:h-9" },
]

export function Marquee() {
  return (
    <section
      id="customers"
      className="py-14 md:py-20 border-y border-zinc-200/70 bg-white"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <FadeUp>
          <p className="text-center text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-semibold">
            Built for procurement teams at companies like
          </p>
        </FadeUp>
      </div>
      <div className="mt-10 overflow-hidden relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 z-10"
          style={{
            background:
              "linear-gradient(to right, #ffffff 0%, transparent 100%)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 z-10"
          style={{
            background:
              "linear-gradient(to left, #ffffff 0%, transparent 100%)",
          }}
        />
        <div className="vb-marquee">
          <div className="vb-marquee__track">
            {[...COMPANIES, ...COMPANIES].map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="inline-flex items-center justify-center px-8 md:px-10"
                title={c.name}
              >
                <img
                  src={c.src}
                  alt={c.alt}
                  loading={i < COMPANIES.length ? "eager" : "lazy"}
                  decoding="async"
                  className={`${c.heightClass} w-auto max-w-[160px] object-contain grayscale opacity-60 transition-[filter,opacity] duration-300 hover:grayscale-0 hover:opacity-100`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .vb-marquee { width: 100%; overflow: hidden; }
        .vb-marquee__track {
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
          animation: vb-marquee-scroll 48s linear infinite;
        }
        @keyframes vb-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .vb-marquee__track { animation: none; }
        }
      `}</style>
    </section>
  )
}
