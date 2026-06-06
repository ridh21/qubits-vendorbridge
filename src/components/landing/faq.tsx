"use client"

import { IconChevronDown } from "@tabler/icons-react"

import { FadeUp, StaggerGroup, StaggerItem } from "@/components/landing/motion"

const FAQS = [
  {
    q: "How long does it take to onboard?",
    a: "Most teams are live in under 30 minutes. Seed demo accounts and you can run a full RFQ → invoice flow immediately. No external services to configure on day one.",
  },
  {
    q: "Can vendors log in to submit quotations?",
    a: "Yes. Each vendor record is linked to a vendor user account. Vendor users see only the RFQs they’ve been invited to and can only edit their own quotations until the deadline or until shortlisted.",
  },
  {
    q: "How are approvals enforced?",
    a: "Quotation status flows through a guarded state machine: SUBMITTED → SHORTLISTED → AWARDED. Only managers can approve, and the action atomically transitions the quotation, marks the RFQ as AWARDED, and issues the PO.",
  },
  {
    q: "Does the PDF look the same as the print view?",
    a: "Yes — the on-screen print page and the @react-pdf/renderer document share the same brand styling, layout, and totals math. Both regenerate from the live database every time, so they always reflect the latest state.",
  },
  {
    q: "How is money stored?",
    a: "All amounts are stored as integers in paise (or cents) to avoid floating-point drift. Tax, line totals, and grand totals are computed centrally and formatted at the edge.",
  },
  {
    q: "What about audit trails?",
    a: "Every mutation writes to an immutable ActivityLog plus role-aware Notifications. The /activity view is filterable and CSV-exportable. The approval timeline shows actor, role/organisation, and remarks.",
  },
]

export function FAQ() {
  return (
    <section id="faq" className="py-20 md:py-28 bg-zinc-50">
      <div className="mx-auto max-w-4xl px-6 md:px-10">
        <FadeUp className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500 font-semibold">
            FAQ
          </p>
          <h2 className="mt-3 text-4xl md:text-5xl tracking-tight text-zinc-950 font-semibold leading-[1.05]">
            Questions, answered.
          </h2>
        </FadeUp>

        <StaggerGroup className="space-y-3" stagger={0.05}>
          {FAQS.map((f, i) => (
            <StaggerItem key={f.q}>
              <details
                className="group rounded-xl bg-white ring-1 ring-zinc-200 transition-all open:ring-[#086AA5]/40 open:shadow-[0_8px_24px_-12px_rgba(8,106,165,0.2)]"
                {...(i === 0 ? { open: true } : {})}
              >
                <summary className="list-none cursor-pointer select-none p-5 flex items-center justify-between gap-4">
                  <span className="text-zinc-950 font-semibold text-base md:text-[17px]">
                    {f.q}
                  </span>
                  <span className="size-7 rounded-full bg-zinc-100 group-open:bg-[#086AA5] group-open:text-white flex items-center justify-center transition-colors shrink-0">
                    <IconChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  </span>
                </summary>
                <div className="px-5 pb-5 -mt-1 text-sm text-zinc-600 leading-relaxed">
                  {f.a}
                </div>
              </details>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
