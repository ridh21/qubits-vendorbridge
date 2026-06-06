"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "motion/react"
import { IconArrowUpRight, IconMenu2, IconX } from "@tabler/icons-react"

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Workflow", href: "#workflow" },
  { label: "Customers", href: "#customers" },
  { label: "FAQ", href: "#faq" },
]

export function GlassNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:pt-5"
    >
      <div
        className={[
          "mx-auto max-w-6xl rounded-2xl border transition-all duration-300",
          scrolled
            ? "bg-white/70 backdrop-blur-2xl backdrop-saturate-150 border-zinc-200/70 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)]"
            : "bg-white/40 backdrop-blur-xl backdrop-saturate-150 border-white/50",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-4 py-2.5 md:px-5 md:py-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-zinc-950"
          >
            <Image
              src="/logo.png"
              alt="VendorBridge"
              width={32}
              height={22}
              className="object-contain"
              priority
            />
            <span className="text-base tracking-tight">VendorBridge</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="px-3 py-1.5 text-sm text-zinc-700 hover:text-zinc-950 rounded-full hover:bg-zinc-100/70 transition-colors"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm text-zinc-700 hover:text-zinc-950"
            >
              Sign in
            </Link>
            <a
              href="#demo"
              className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium text-white rounded-full bg-[#086AA5] hover:bg-[#075a8e] transition-colors"
            >
              Request demo
              <IconArrowUpRight className="size-3.5 group-hover:rotate-45 transition-transform" />
            </a>
          </div>

          <button
            aria-label="Toggle menu"
            className="md:hidden p-1.5 rounded-full hover:bg-zinc-100 text-zinc-950"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-zinc-200/70 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {NAV.map((n) => (
                  <a
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block px-2 py-1.5 text-sm text-zinc-700"
                  >
                    {n.label}
                  </a>
                ))}
                <div className="pt-2 flex gap-2">
                  <Link
                    href="/login"
                    className="flex-1 px-3 py-2 text-center text-sm rounded-full border border-zinc-300 text-zinc-950"
                  >
                    Sign in
                  </Link>
                  <a
                    href="#demo"
                    onClick={() => setOpen(false)}
                    className="flex-1 px-3 py-2 text-center text-sm rounded-full text-white bg-[#086AA5]"
                  >
                    Request demo
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}
