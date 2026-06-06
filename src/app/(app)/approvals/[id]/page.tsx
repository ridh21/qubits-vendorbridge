import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { IconArrowLeft } from "@tabler/icons-react"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { ApprovalDecisionButtons } from "@/components/approvals/approval-decision-buttons"
import { ApprovalTimeline } from "@/components/approvals/approval-timeline"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { formatCurrency } from "@/lib/money"

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole(["ADMIN", "MANAGER"])
  const { id } = await params
  const approval = await prisma.approval.findUnique({
    where: { id },
    include: {
      approver: { select: { name: true } },
      quotation: {
        include: {
          vendor: true,
          lines: true,
          rfq: { include: { items: { orderBy: { position: "asc" } } } },
        },
      },
    },
  })
  if (!approval) notFound()

  const timeline = await prisma.activityLog.findMany({
    where: {
      OR: [
        { entityType: "Approval", entityId: approval.id },
        { entityType: "Quotation", entityId: approval.quotationId },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      user: {
        select: { name: true, vendor: { select: { name: true } } },
      },
    },
  })

  return (
    <div>
      <PageHeader
        title={`Approval: ${approval.quotation.code}`}
        description={
          <span className="text-sm">
            For RFQ{" "}
            <Link
              href={`/rfqs/${approval.quotation.rfq.id}`}
              className="font-mono hover:underline"
            >
              {approval.quotation.rfq.code}
            </Link>{" "}
            · {approval.quotation.rfq.title}
          </span>
        }
        actions={
          <>
            <StatusBadge status={approval.status} />
            <Button variant="ghost" render={<Link href="/approvals" />}>
              <IconArrowLeft className="size-4" /> Back
            </Button>
          </>
        }
      />

      <div className="mb-4">
        <ApprovalTimeline
          entries={timeline}
          decision={approval.status as "PENDING" | "APPROVED" | "REJECTED"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quotation snapshot</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Unit price</TableHead>
                    <TableHead className="text-right">Line total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approval.quotation.rfq.items.map((it) => {
                    const line = approval.quotation.lines.find(
                      (l) => l.rfqItemId === it.id,
                    )
                    return (
                      <TableRow key={it.id}>
                        <TableCell className="font-medium">{it.name}</TableCell>
                        <TableCell className="text-right">
                          {line?.quantity ?? it.quantity}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(line?.unitPrice ?? 0)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatCurrency(line?.lineTotal ?? 0)}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right text-muted-foreground">
                      Subtotal
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency((() => {
                        const sub = approval.quotation.lines.reduce((s, l) => s + l.lineTotal, 0)
                        return sub
                      })())}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right text-muted-foreground">
                      GST (18%)
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency((() => {
                        const sub = approval.quotation.lines.reduce((s, l) => s + l.lineTotal, 0)
                        return Math.round((sub * 18) / 100)
                      })())}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium">
                      Grand Total <span className="text-xs font-normal text-muted-foreground">(incl. GST)</span>
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {formatCurrency(approval.quotation.totalAmount)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vendor & terms</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Vendor
                </p>
                <p className="font-medium">{approval.quotation.vendor.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Contact
                </p>
                <p className="font-medium">
                  {approval.quotation.vendor.contactEmail}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Delivery
                </p>
                <p className="font-medium">
                  {approval.quotation.deliveryDays} days
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Submitted
                </p>
                <p className="font-medium">
                  {approval.quotation.submittedAt
                    ? format(approval.quotation.submittedAt, "PPp")
                    : "—"}
                </p>
              </div>
              {approval.quotation.notes && (
                <div className="col-span-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Notes
                  </p>
                  <p>{approval.quotation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {approval.status === "PENDING" && (
            <ApprovalDecisionButtons approvalId={approval.id} />
          )}
          {approval.remarks && approval.status !== "PENDING" && (
            <Card>
              <CardHeader>
                <CardTitle>Decision remarks</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="mb-2">{approval.remarks}</p>
                <p className="text-xs text-muted-foreground">
                  {approval.approver?.name ?? "—"} ·{" "}
                  {approval.decidedAt
                    ? format(approval.decidedAt, "PPp")
                    : ""}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendor</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{approval.quotation.vendor.name}</p>
              <p className="text-xs text-muted-foreground">
                {approval.quotation.vendor.contactEmail}
              </p>
              {approval.quotation.vendor.contactPhone && (
                <p className="text-xs text-muted-foreground">
                  {approval.quotation.vendor.contactPhone}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
