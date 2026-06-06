"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "motion/react"
import gsap from "gsap"
import {
  IconArrowUpRight,
  IconCheck,
  IconPlayerPlay,
  IconSparkles,
} from "@tabler/icons-react"

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce || !headlineRef.current) return
    const words = headlineRef.current.querySelectorAll("[data-word]")
    gsap.set(words, { yPercent: 110, opacity: 0 })
    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 1.0,
      ease: "power4.out",
      stagger: 0.045,
      delay: 0.15,
    })
  }, [reduce])

  return (
    <section
      id="top"
      className="relative pt-36 md:pt-44 pb-20 md:pb-28 overflow-hidden"
    >
      {/* Background — clean radial wash, no grid */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(1100px 600px at 50% -10%, rgba(0,0,0,0.06), transparent 60%), radial-gradient(900px 500px at 90% 100%, rgba(0,0,0,0.04), transparent 65%), #fafafa",
        }}
      />
      {/* soft noise overlay for texture */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.5] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-col items-center text-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-xl ring-1 ring-zinc-200 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-zinc-700"
          >
            <IconSparkles className="size-3.5 text-zinc-950" />
            Procurement, end-to-end
          </motion.span>

          <h1
            ref={headlineRef}
            className="mt-6 font-[var(--font-heading)] text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[1.02] tracking-[-0.025em] text-zinc-950"
          >
            <span className="inline-block overflow-hidden">
              <span data-word className="inline-block">One</span>
            </span>{" "}
            <span className="inline-block overflow-hidden">
              <span data-word className="inline-block">workspace</span>
            </span>{" "}
            <span className="inline-block overflow-hidden">
              <span data-word className="inline-block">for</span>
            </span>{" "}
            <span className="inline-block overflow-hidden">
              <span data-word className="inline-block">vendors,</span>
            </span>
            <br className="hidden md:inline" />{" "}
            <span className="inline-block overflow-hidden">
              <span data-word className="inline-block italic font-light">RFQs,</span>
            </span>{" "}
            <span className="inline-block overflow-hidden">
              <span data-word className="inline-block italic font-light">approvals</span>
            </span>{" "}
            <span className="inline-block overflow-hidden">
              <span data-word className="inline-block">and</span>
            </span>{" "}
            <span className="inline-block overflow-hidden">
              <span data-word className="inline-block">invoices.</span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-6 max-w-2xl text-base md:text-lg text-zinc-600 leading-relaxed"
          >
            VendorBridge centralises vendor onboarding, RFQs, side-by-side
            quotation comparison, approvals, purchase orders, and invoices —
            with PDF export and one-click email delivery.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3"
          >
            <a
              href="#demo"
              className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-full bg-[#086AA5] hover:bg-[#075a8e] transition-colors shadow-[0_10px_30px_-10px_rgba(8,106,165,0.45)]"
            >
              Request a demo
              <IconArrowUpRight className="size-4 group-hover:rotate-45 transition-transform" />
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full bg-white ring-1 ring-zinc-200 text-zinc-950 hover:bg-zinc-50 transition-colors"
            >
              <IconPlayerPlay className="size-4" />
              Sign in
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-zinc-500"
          >
            {[
              "Built for procurement teams",
              "Audit-ready trail",
              "Live in under 30 min",
            ].map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5">
                <IconCheck className="size-3.5 text-zinc-950" />
                {t}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Glass preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16"
        >
          <div
            aria-hidden
            className="absolute -inset-x-10 -top-10 -bottom-10 blur-3xl -z-10 opacity-50"
            style={{
              background:
                "radial-gradient(600px 200px at 50% 50%, rgba(0,0,0,0.15), transparent 70%)",
            }}
          />
          <div className="rounded-2xl bg-white/80 backdrop-blur-2xl ring-1 ring-zinc-200 p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)]">
            <div className="rounded-xl bg-white overflow-hidden border border-zinc-100">
              <div className="flex items-center gap-1.5 px-3 py-2 border-b bg-zinc-50/60">
                <span className="size-2.5 rounded-full bg-rose-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-3 text-[11px] text-zinc-400 font-mono">
                  app.vendorbridge.io / dashboard
                </span>
              </div>
              <div className="grid md:grid-cols-3 gap-3 p-4">
                {[
                  { label: "Open RFQs", value: "12" },
                  { label: "Pending approvals", value: "4" },
                  { label: "Invoices sent", value: "37" },
                ].map((c) => (
                  <div
                    key={c.label}
                    className="rounded-lg p-4 bg-zinc-50 ring-1 ring-zinc-200"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                      {c.label}
                    </p>
                    <p className="text-3xl font-bold tabular-nums text-zinc-950 mt-1">
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <div className="rounded-lg ring-1 ring-zinc-200 overflow-hidden">
                  <div className="grid grid-cols-12 px-4 py-2 bg-[#086AA5] text-white text-[10px] uppercase tracking-wider font-semibold">
                    <span className="col-span-3">RFQ</span>
                    <span className="col-span-4">Vendor</span>
                    <span className="col-span-2 text-right">Status</span>
                    <span className="col-span-3 text-right">Total</span>
                  </div>
                  {[
                    ["RFQ-2026-0007", "Acme Steel Co.", "Awarded", "₹2,38,400"],
                    ["RFQ-2026-0006", "Stellar Components", "Shortlisted", "₹1,97,800"],
                    ["RFQ-2026-0005", "Crestline Mfg.", "Submitted", "₹3,15,000"],
                  ].map((r, i) => (
                    <div
                      key={i}
                      className={`grid grid-cols-12 items-center px-4 py-2.5 text-xs ${
                        i % 2 ? "bg-zinc-50/60" : "bg-white"
                      }`}
                    >
                      <span className="col-span-3 font-mono text-zinc-500">
                        {r[0]}
                      </span>
                      <span className="col-span-4 text-zinc-950 font-medium">
                        {r[1]}
                      </span>
                      <span className="col-span-2 text-right">
                        <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-800">
                          {r[2]}
                        </span>
                      </span>
                      <span className="col-span-3 text-right tabular-nums text-zinc-950">
                        {r[3]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
