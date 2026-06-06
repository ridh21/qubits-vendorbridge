import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ClickableTableRow } from "@/components/common/clickable-table-row"
import { StopPropagation } from "@/components/common/stop-propagation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { requireUser } from "@/lib/rbac"
import {
  listInvitationsForVendor,
  listQuotationsForOfficer,
  openOrCreateQuotation,
} from "@/lib/actions/quotations"
import { formatCurrency } from "@/lib/money"

export default async function QuotationsPage() {
  const user = await requireUser()

  if (user.role === "VENDOR" && user.vendorId) {
    const invitations = await listInvitationsForVendor(user.vendorId)
    return (
      <div>
        <PageHeader
          title="My quotations"
          description="RFQs you've been invited to. Click an invitation to draft or submit."
        />
        <Card className="p-0 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RFQ</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    No invitations yet.
                  </TableCell>
                </TableRow>
              )}
              {invitations.map((inv) => {
                const quotation = inv.rfq.quotations[0]
                return (
                  <ClickableTableRow key={inv.id} href={`/quotations/${quotation?.id ?? inv.rfq.id}`}>
                    <TableCell>
                      <StopPropagation>
                        <Link href={`/rfqs/${inv.rfq.id}`} className="font-medium hover:underline">
                        {inv.rfq.title}
                        </Link>
                      </StopPropagation>
                      <div className="text-xs text-muted-foreground font-mono">
                        {inv.rfq.code}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{format(inv.rfq.deadline, "PP")}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(inv.rfq.deadline, { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={quotation?.status ?? "INVITED"} />
                    </TableCell>
                    <TableCell className="text-right">
                      {quotation ? formatCurrency(quotation.totalAmount) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <StopPropagation>
                      <form action={openOrCreateQuotation.bind(null, inv.rfqId, inv.vendorId)}>
                        <Button type="submit" size="sm" variant="secondary">
                          {quotation?.status === "SUBMITTED" || quotation?.status === "SHORTLISTED"
                            ? "View"
                            : quotation
                            ? "Continue"
                            : "Start"}
                        </Button>
                      </form>
                      </StopPropagation>
                    </TableCell>
                  </ClickableTableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    )
  }

  // Officer / Admin view
  const quotations = await listQuotationsForOfficer()
  return (
    <div>
      <PageHeader
        title="Quotations"
        description="All vendor submissions across active and past RFQs."
      />
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>RFQ</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotations.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No quotations yet.
                </TableCell>
              </TableRow>
            )}
            {quotations.map((q) => (
              <ClickableTableRow key={q.id} href={`/quotations/${q.id}`}>
                <TableCell className="font-mono text-xs">{q.code}</TableCell>
                <TableCell>
                  <StopPropagation>
                    <Link href={`/rfqs/${q.rfq.id}`} className="hover:underline">
                      {q.rfq.title}
                    </Link>
                  </StopPropagation>
                </TableCell>
                <TableCell>{q.vendor.name}</TableCell>
                <TableCell>
                  <StatusBadge status={q.status} />
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(q.totalAmount)}
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
