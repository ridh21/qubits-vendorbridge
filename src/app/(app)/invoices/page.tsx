import { formatDistanceToNow } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { Card } from "@/components/ui/card"
import { ClickableTableRow } from "@/components/common/clickable-table-row"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { listInvoices } from "@/lib/actions/invoices"
import { requireUser } from "@/lib/rbac"
import { formatCurrency } from "@/lib/money"

export default async function InvoicesPage() {
  const user = await requireUser()
  const invoices = await listInvoices(
    user.role === "VENDOR" && user.vendorId ? { vendorId: user.vendorId } : {},
  )
  return (
    <div>
      <PageHeader
        title="Invoices"
        description={
          user.role === "VENDOR"
            ? "Invoices you've received."
            : "Issued invoices and their delivery status."
        }
      />
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>RFQ</TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead className="text-right">Grand total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No invoices yet.
                </TableCell>
              </TableRow>
            )}
            {invoices.map((inv) => (
              <ClickableTableRow key={inv.id} href={`/invoices/${inv.id}`}>
                <TableCell className="font-mono text-xs">{inv.code}</TableCell>
                <TableCell>{inv.po.quotation.rfq.title}</TableCell>
                <TableCell>{inv.vendor.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(inv.grandTotal)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(inv.createdAt, { addSuffix: true })}
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
