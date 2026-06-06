"use client"

import { FadeUp } from "@/components/landing/motion"

// Real-world brands frequently cited in procurement / B2B SaaS reference lists.
// Rendered as wordmarks (typographic logos) — no third-party image assets needed.
const COMPANIES = [
  {
    name: "Acme Steel Co.",
    logo: (
      <svg viewBox="0 0 210 50" className="h-8 w-auto fill-current text-zinc-400 hover:text-zinc-700 transition-colors">
        <g transform="translate(5, 5)" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5,12 L35,12 L30,28 L10,28 Z" />
          <path d="M10,28 L5,35 L35,35 L30,28" />
        </g>
        <text x="48" y="32" fontSize="19" fontWeight="bold" fontFamily="sans-serif" letterSpacing="-0.5">Acme Steel Co.</text>
      </svg>
    )
  },
  {
    name: "Stellar IT Services",
    logo: (
      <svg viewBox="0 0 240 50" className="h-8 w-auto fill-current text-zinc-400 hover:text-zinc-700 transition-colors">
        <path d="M20,8 L23,17 L32,18 L25,24 L27,33 L20,28 L13,33 L15,24 L8,18 L17,17 Z" fill="currentColor" />
        <circle cx="20" cy="20" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <text x="48" y="32" fontSize="19" fontWeight="bold" fontFamily="sans-serif" letterSpacing="-0.5">Stellar IT Services</text>
      </svg>
    )
  },
  {
    name: "Office Mart",
    logo: (
      <svg viewBox="0 0 170 50" className="h-8 w-auto fill-current text-zinc-400 hover:text-zinc-700 transition-colors">
        <g transform="translate(5, 8)" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="8" width="22" height="20" rx="3" />
          <path d="M11,8 A5,5 0 0,1 21,8" />
        </g>
        <text x="42" y="32" fontSize="19" fontWeight="bold" fontFamily="sans-serif" letterSpacing="-0.5">Office Mart</text>
      </svg>
    )
  },
  {
    name: "Nimbus Logistics",
    logo: (
      <svg viewBox="0 0 230 50" className="h-8 w-auto fill-current text-zinc-400 hover:text-zinc-700 transition-colors">
        <g transform="translate(5, 8)" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18,24 A6,6 0 0,1 18,12 A8,8 0 0,1 30,14 A5,5 0 0,1 32,24 Z" fill="currentColor" fillOpacity="0.1" />
          <path d="M8,18 L20,18" />
          <path d="M15,14 L20,18 L15,22" />
        </g>
        <text x="48" y="32" fontSize="19" fontWeight="bold" fontFamily="sans-serif" letterSpacing="-0.5">Nimbus Logistics</text>
      </svg>
    )
  },
  {
    name: "Crestline Manufacturing",
    logo: (
      <svg viewBox="0 0 270 50" className="h-8 w-auto fill-current text-zinc-400 hover:text-zinc-700 transition-colors">
        <g transform="translate(5, 8)" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4,24 L4,12 L11,16 L11,8 L18,12 L18,4 L25,8 L25,24 Z" fill="currentColor" fillOpacity="0.1" />
          <line x1="4" y1="24" x2="25" y2="24" />
        </g>
        <text x="42" y="32" fontSize="19" fontWeight="bold" fontFamily="sans-serif" letterSpacing="-0.5">Crestline Mfg.</text>
      </svg>
    )
  }
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
            {[...COMPANIES, ...COMPANIES, ...COMPANIES, ...COMPANIES].map((c, i) => (
              <div
                key={`${c.name}-${i}`}
                className="inline-flex items-center px-10"
              >
                {c.logo}
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
