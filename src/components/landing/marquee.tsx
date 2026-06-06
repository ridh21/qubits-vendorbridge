"use client"

import { FadeUp } from "@/components/landing/motion"

// Real-world brands frequently cited in procurement / B2B SaaS reference lists.
// Rendered as wordmarks (typographic logos) — no third-party image assets needed.
const COMPANIES = [
  { name: "Tata", style: "font-serif italic" },
  { name: "Reliance", style: "font-light tracking-tight" },
  { name: "Infosys", style: "font-semibold tracking-tighter" },
  { name: "Wipro", style: "font-bold uppercase tracking-[0.2em] text-xs md:text-sm" },
  { name: "Mahindra", style: "font-extrabold tracking-tight" },
  { name: "L&T", style: "font-black tracking-[0.05em]" },
  { name: "Maruti Suzuki", style: "font-medium italic" },
  { name: "Bajaj", style: "font-extrabold tracking-tighter" },
  { name: "Asian Paints", style: "font-medium tracking-tight" },
  { name: "ITC", style: "font-semibold tracking-[0.18em] uppercase text-xs md:text-sm" },
  { name: "Godrej", style: "font-bold tracking-tight" },
  { name: "JSW", style: "font-black tracking-tighter italic" },
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
                className={`inline-flex items-center px-10 text-2xl md:text-3xl text-zinc-400 hover:text-zinc-950 transition-colors ${c.style}`}
              >
                {c.name}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .vb-marquee { width: 100%; overflow: hidden; }
        .vb-marquee__track {
          display: inline-flex;
          white-space: nowrap;
          animation: vb-marquee-scroll 42s linear infinite;
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
