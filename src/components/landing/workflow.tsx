"use client"

import {
  IconClipboardList,
  IconSend,
  IconScale,
  IconCheckupList,
  IconReceipt,
  IconMail,
} from "@tabler/icons-react"

import { FadeUp, StaggerGroup, StaggerItem } from "@/components/landing/motion"

const STEPS = [
  {
    icon: IconClipboardList,
    title: "Create RFQ",
    desc: "Compose, add items, attach specs, set a deadline.",
  },
  {
    icon: IconSend,
    title: "Invite vendors",
    desc: "Select shortlisted suppliers and publish in one click.",
  },
  {
    icon: IconScale,
    title: "Compare",
    desc: "Side-by-side matrix with lowest-price highlights.",
  },
  {
    icon: IconCheckupList,
    title: "Approve",
    desc: "Manager reviews and stamps decision with remarks.",
  },
  {
    icon: IconReceipt,
    title: "Auto PO",
    desc: "Purchase order is auto-generated on approval.",
  },
  {
    icon: IconMail,
    title: "Invoice & email",
    desc: "PDF invoice generated and emailed to the vendor.",
  },
]

export function Workflow() {
  return (
    <section
      id="workflow"
      className="py-20 md:py-28 relative overflow-hidden bg-zinc-950 text-white"
    >
      <div
        aria-hidden
        className="absolute -top-32 -left-32 size-96 rounded-full blur-3xl"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <div
        aria-hidden
        className="absolute -bottom-32 -right-32 size-96 rounded-full blur-3xl"
        style={{ background: "rgba(255,255,255,0.04)" }}
      />

      <div className="relative mx-auto max-w-6xl px-6 md:px-10">
        <FadeUp className="text-center max-w-2xl mx-auto">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/45 font-semibold">
            How it works
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl tracking-tight text-white font-semibold leading-[1.05]">
            From RFQ to paid invoice
            <br />
            in <em className="italic font-light">one</em> workflow.
          </h2>
          <p className="mt-4 text-white/60 text-base md:text-lg">
            Six steps. No spreadsheets. Every action audited.
          </p>
        </FadeUp>

        <StaggerGroup className="mt-14 grid md:grid-cols-3 gap-4">
          {STEPS.map((s, i) => (
            <StaggerItem
              key={s.title}
              className="relative rounded-2xl bg-white/[0.04] backdrop-blur-xl ring-1 ring-white/10 p-6 transition-all hover:bg-white/[0.07] hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="size-10 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center">
                  <s.icon className="size-5 text-white" />
                </span>
                <span className="text-[10px] tracking-[0.2em] text-white/35 font-mono">
                  STEP {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="text-white text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-white/60 leading-relaxed">
                {s.desc}
              </p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
