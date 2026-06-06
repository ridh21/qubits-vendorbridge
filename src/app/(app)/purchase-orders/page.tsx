import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
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
import { listPurchaseOrders } from "@/lib/actions/purchase-orders"
import { requireUser } from "@/lib/rbac"
import { formatCurrency } from "@/lib/money"

export default async function PurchaseOrdersPage() {
  const user = await requireUser()
  const pos = await listPurchaseOrders(
    user.role === "VENDOR" && user.vendorId ? { vendorId: user.vendorId } : {},
  )

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description={
          user.role === "VENDOR"
            ? "Orders raised against your accepted quotations."
            : "Track issued purchase orders and convert them to invoices."
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
              <TableHead>Invoice</TableHead>
              <TableHead>Issued</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pos.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No purchase orders yet.
                </TableCell>
              </TableRow>
            )}
            {pos.map((po) => (
              <ClickableTableRow key={po.id} href={`/purchase-orders/${po.id}`}>
                <TableCell className="font-mono text-xs">{po.code}</TableCell>
                <TableCell>{po.quotation.rfq.title}</TableCell>
                <TableCell>{po.vendor.name}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(po.grandTotal)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={po.status} />
                </TableCell>
                <TableCell>
                  {po.invoice ? (
                    <StopPropagation>
                      <Link
                        href={`/invoices/${po.invoice.id}`}
                        className="text-xs font-mono hover:underline"
                      >
                        {po.invoice.code}
                      </Link>
                    </StopPropagation>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDistanceToNow(po.issuedAt, { addSuffix: true })}
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
