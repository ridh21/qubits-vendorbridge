"use client"

import {
  IconBuildingStore,
  IconClipboardList,
  IconScale,
  IconCheckupList,
  IconReceipt,
  IconChartBar,
  IconBell,
  IconShieldCheck,
} from "@tabler/icons-react"

import { FadeUp, StaggerGroup, StaggerItem } from "@/components/landing/motion"

export function FeaturesBento() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <FadeUp className="mb-12 md:mb-16 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-semibold">
            Features
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl tracking-tight text-zinc-950 font-semibold leading-[1.05]">
            Every step of procurement,
            <br />
            in <em className="italic font-light">one</em> place.
          </h2>
          <p className="mt-4 text-zinc-600 text-base md:text-lg">
            Stop juggling spreadsheets, emails, and PDFs. VendorBridge turns
            your procurement workflow into a single auditable pipeline.
          </p>
        </FadeUp>

        <StaggerGroup className="grid md:grid-cols-3 gap-4 auto-rows-fr">
          <BentoCard
            colSpan="md:col-span-2"
            rowSpan="md:row-span-2"
            icon={IconBuildingStore}
            title="Vendor onboarding"
            description="Register and categorise vendors, validate GST, track performance ratings, and search by category or status."
          >
            <div className="mt-6 rounded-xl ring-1 ring-zinc-200 bg-white p-3 shadow-sm">
              <div className="grid grid-cols-3 gap-2 text-[10px]">
                {[
                  "IT",
                  "Logistics",
                  "Office",
                  "Services",
                  "Foods",
                  "Industrial",
                ].map((c) => (
                  <span
                    key={c}
                    className="text-center rounded-md px-2 py-1.5 bg-zinc-50 text-zinc-800 font-medium ring-1 ring-zinc-200/60"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  ["Acme Steel Co.", "★★★★★", "Active"],
                  ["Stellar Components", "★★★★☆", "Active"],
                  ["Crestline Mfg.", "★★★★☆", "Pending"],
                ].map(([n, r, s]) => (
                  <div
                    key={n}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="font-medium text-zinc-950">{n}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-amber-500">{r}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${
                          s === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {s}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </BentoCard>

          <BentoCard
            icon={IconClipboardList}
            title="RFQs in minutes"
            description="Compose, attach specs, invite vendors, set deadlines — publish in one click."
          />

          <BentoCard
            icon={IconScale}
            title="Side-by-side compare"
            description="Auto-highlight lowest price per item. Sort by total, delivery, or rating."
          />

          <BentoCard
            icon={IconCheckupList}
            title="Approval workflow"
            description="Send shortlisted quotes for manager approval with remarks and a full timeline."
          />

          <BentoCard
            icon={IconReceipt}
            title="POs &amp; invoices"
            description="Auto-generated PO and tax-correct invoice with PDF download, print, and email."
          />

          <BentoCard
            icon={IconChartBar}
            title="Reports &amp; analytics"
            description="Monthly trends, top vendors, KPIs, vendor performance — CSV-exportable."
          />

          <BentoCard
            colSpan="md:col-span-3"
            icon={IconShieldCheck}
            title="Audit trail &amp; real-time notifications"
            description="Every action — RFQ published, quotation submitted, approval decided, invoice sent — is captured. Role-aware notifications keep the right people in the loop."
          >
            <div className="mt-5 grid md:grid-cols-3 gap-3">
              {[
                {
                  title: "QT-2026-0007 submitted",
                  meta: "Rajesh Iyer · Crestline Mfg.",
                },
                {
                  title: "QT-2026-0007 shortlisted",
                  meta: "Hemant Pande · Procurement Officer",
                },
                {
                  title: "QT-2026-0007 approved",
                  meta: "Marcus Manager · best rate",
                },
              ].map((n) => (
                <div
                  key={n.title}
                  className="rounded-lg bg-white p-3 ring-1 ring-zinc-200 flex items-start gap-2.5"
                >
                  <span className="mt-1 size-7 rounded-full flex items-center justify-center text-white bg-[#086AA5] shrink-0">
                    <IconBell className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-950 truncate">
                      {n.title}
                    </p>
                    <p className="text-[10px] text-zinc-500 truncate">
                      {n.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>
        </StaggerGroup>
      </div>
    </section>
  )
}

function BentoCard({
  icon: Icon,
  title,
  description,
  colSpan,
  rowSpan,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  colSpan?: string
  rowSpan?: string
  children?: React.ReactNode
}) {
  return (
    <StaggerItem
      className={[
        "group relative rounded-2xl bg-white ring-1 ring-zinc-200 p-6 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.2)]",
        colSpan ?? "",
        rowSpan ?? "",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="absolute -top-20 -right-20 size-56 rounded-full bg-zinc-100/80 blur-3xl -z-10"
      />
      <div className="flex items-center gap-2 mb-3">
        <span className="size-9 rounded-xl bg-[#086AA5] text-white flex items-center justify-center">
          <Icon className="size-4" />
        </span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-950 leading-snug">
        {title}
      </h3>
      <p className="mt-1.5 text-sm text-zinc-600 leading-relaxed">
        {description}
      </p>
      {children}
    </StaggerItem>
  )
}
