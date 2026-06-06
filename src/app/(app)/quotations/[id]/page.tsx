import { notFound } from "next/navigation"
import { format } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { StatusBadge } from "@/components/common/status-badge"
import { QuotationForm } from "@/components/quotations/quotation-form"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/rbac"

export default async function QuotationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      rfq: { include: { items: { orderBy: { position: "asc" } } } },
      vendor: true,
      lines: true,
    },
  })
  if (!quotation) notFound()

  const isOwner =
    user.role === "VENDOR" && quotation.vendorId === user.vendorId
  const isOfficer = user.role === "ADMIN" || user.role === "PROCUREMENT_OFFICER"
  if (!isOwner && !isOfficer) notFound()

  const readOnly =
    !isOwner ||
    quotation.status === "SHORTLISTED" ||
    quotation.status === "AWARDED" ||
    quotation.rfq.deadline < new Date()

  return (
    <div>
      <PageHeader
        title={quotation.rfq.title}
        description={
          <span className="flex items-center gap-2 text-sm">
            <code className="font-mono">{quotation.code}</code>
            <span>·</span>
            <span>{quotation.vendor.name}</span>
            <span>·</span>
            <span>Deadline {format(quotation.rfq.deadline, "PP")}</span>
          </span>
        }
        actions={<StatusBadge status={quotation.status} />}
      />

      {quotation.rfq.description && (
        <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-2.5">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
            RFQ brief
          </p>
          <p className="text-sm text-[#0D2A41] leading-relaxed">
            {quotation.rfq.description}
          </p>
        </div>
      )}

      <QuotationForm
        quotationId={quotation.id}
        rfqItems={quotation.rfq.items}
        defaultLines={quotation.lines}
        notes={quotation.notes ?? ""}
        readOnly={readOnly}
      />
    </div>
  )
}
