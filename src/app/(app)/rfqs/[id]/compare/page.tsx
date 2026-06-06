import { notFound } from "next/navigation"
import { format } from "date-fns"
import { IconArrowLeft, IconStarFilled } from "@tabler/icons-react"
import Link from "next/link"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/common/status-badge"
import { QuotationActionsCell } from "@/components/approvals/quotation-actions-cell"
import { getRfq } from "@/lib/actions/rfqs"
import { requireRole } from "@/lib/rbac"
import { buildComparison } from "@/lib/compare"
import { formatCurrency, DEFAULT_TAX_RATE } from "@/lib/money"
import { cn } from "@/lib/utils"

export default async function CompareQuotationsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const { id } = await params
  const rfq = await getRfq(id)
  if (!rfq) notFound()

  const eligible = rfq.quotations.filter(
    (q) =>
      q.status === "SUBMITTED" ||
      q.status === "SHORTLISTED" ||
      q.status === "AWARDED",
  )

  if (eligible.length === 0) {
    return (
      <div>
        <PageHeader
          title="Compare quotations"
          description={`${rfq.code} · ${rfq.title}`}
          actions={
            <Button variant="ghost" render={<Link href={`/rfqs/${rfq.id}`} />}>
              <IconArrowLeft className="size-4" /> Back to RFQ
            </Button>
          }
        />
        <Card className="p-12 text-center text-muted-foreground">
          No submissions yet. Comparison is available once vendors submit
          quotations.
        </Card>
      </div>
    )
  }

  const { rows, summaries, lowestTotalVendorId, fastestVendorId } =
    buildComparison(rfq.items, eligible)

  return (
    <div>
      <PageHeader
        title="Compare quotations"
        description={
          <span className="text-sm">
            <code className="font-mono">{rfq.code}</code> · {rfq.title} · Deadline{" "}
            {format(rfq.deadline, "PP")}
          </span>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
              All totals include {DEFAULT_TAX_RATE}% GST
            </Badge>
            <Button variant="ghost" render={<Link href={`/rfqs/${rfq.id}`} />}>
              <IconArrowLeft className="size-4" /> Back to RFQ
            </Button>
          </div>
        }
      />

      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="sticky left-0 bg-background text-left p-3 font-medium w-56">
                Item
              </th>
              {eligible.map((q) => (
                <th
                  key={q.id}
                  className={cn(
                    "text-left p-3 font-medium min-w-44",
                    q.vendorId === lowestTotalVendorId &&
                      "bg-emerald-50/60 border-x border-emerald-200",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{q.vendor.name}</span>
                    {q.vendorId === lowestTotalVendorId && (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                        Lowest total
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <IconStarFilled className="size-3 text-amber-500" />
                    {q.vendor.rating.toFixed(1)} · {q.deliveryDays}d delivery
                    {q.vendorId === fastestVendorId && (
                      <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[9px]">
                        Fastest
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={q.status} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.itemId} className="border-b">
                <td className="sticky left-0 bg-background p-3 align-top">
                  <div className="font-medium">{row.itemName}</div>
                  <div className="text-xs text-muted-foreground">
                    Qty {row.quantity} {row.unit}
                  </div>
                </td>
                {eligible.map((q) => {
                  const cell = row.cells[q.vendorId]
                  const isLow = row.lowestVendorId === q.vendorId
                  return (
                    <td
                      key={q.id}
                      className={cn(
                        "p-3 align-top",
                        isLow && "bg-emerald-50/60",
                      )}
                    >
                      <div className="font-medium tabular-nums">
                        {formatCurrency(cell.unitPrice)}
                        {isLow && (
                          <Badge className="ml-2 bg-emerald-100 text-emerald-800 border-emerald-200 text-[9px]">
                            Lowest
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground tabular-nums">
                        Line: {formatCurrency(cell.lineTotal)}
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr className="border-b">
              <td className="sticky left-0 bg-background p-3 text-muted-foreground">
                Subtotal
              </td>
              {summaries.map((s) => (
                <td
                  key={s.vendorId}
                  className={cn(
                    "p-3 tabular-nums text-muted-foreground",
                    s.vendorId === lowestTotalVendorId && "bg-emerald-50/60",
                  )}
                >
                  {formatCurrency(s.subtotal)}
                </td>
              ))}
            </tr>
            <tr className="border-b">
              <td className="sticky left-0 bg-background p-3 text-muted-foreground">
                GST ({DEFAULT_TAX_RATE}%)
              </td>
              {summaries.map((s) => (
                <td
                  key={s.vendorId}
                  className={cn(
                    "p-3 tabular-nums text-muted-foreground",
                    s.vendorId === lowestTotalVendorId && "bg-emerald-50/60",
                  )}
                >
                  {formatCurrency(s.gstAmount)}
                </td>
              ))}
            </tr>
            <tr className="border-b font-medium">
              <td className="sticky left-0 bg-background p-3">
                Grand Total{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (incl. GST)
                </span>
              </td>
              {summaries.map((s) => (
                <td
                  key={s.vendorId}
                  className={cn(
                    "p-3 tabular-nums",
                    s.vendorId === lowestTotalVendorId &&
                      "bg-emerald-50/60 font-semibold",
                  )}
                >
                  {formatCurrency(s.total)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-background p-3"></td>
              {summaries.map((s) => (
                <td key={s.vendorId} className="p-3">
                  <QuotationActionsCell
                    quotationId={s.quotationId}
                    status={s.status}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  )
}
