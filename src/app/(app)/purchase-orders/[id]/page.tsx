import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { IconArrowLeft, IconFileInvoice } from "@tabler/icons-react"

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
import { getPurchaseOrder } from "@/lib/actions/purchase-orders"
import { generateInvoiceAction } from "@/lib/actions/invoices"
import { requireUser } from "@/lib/rbac"
import { formatCurrency } from "@/lib/money"

export default async function PurchaseOrderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const po = await getPurchaseOrder(id)
  if (!po) notFound()

  const canInvoice =
    (user.role === "ADMIN" || user.role === "PROCUREMENT_OFFICER") && !po.invoice

  return (
    <div>
      <PageHeader
        title={`Purchase Order ${po.code}`}
        description={
          <span className="text-sm">
            For RFQ{" "}
            <Link
              href={`/rfqs/${po.quotation.rfq.id}`}
              className="font-mono hover:underline"
            >
              {po.quotation.rfq.code}
            </Link>{" "}
            · {po.quotation.rfq.title}
          </span>
        }
        actions={
          <>
            <StatusBadge status={po.status} />
            {po.invoice && (
              <Button variant="secondary" render={<Link href={`/invoices/${po.invoice.id}`} />}>
                <IconFileInvoice className="size-4" />
                View invoice ({po.invoice.code})
              </Button>
            )}
            {canInvoice && (
              <form action={generateInvoiceAction.bind(null, po.id)}>
                <Button type="submit">
                  <IconFileInvoice className="size-4" />
                  Generate invoice
                </Button>
              </form>
            )}
            <Button variant="ghost" render={<Link href="/purchase-orders" />}>
              <IconArrowLeft className="size-4" />
              Back
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line items</CardTitle>
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
                {po.quotation.rfq.items.map((it) => {
                  const line = po.quotation.lines.find((l) => l.rfqItemId === it.id)
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
                    {formatCurrency(po.totalAmount)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right text-muted-foreground">
                    Tax
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(po.taxAmount)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Grand total
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(po.grandTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Name
              </p>
              <p className="font-medium">{po.vendor.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Email
              </p>
              <p>{po.vendor.contactEmail}</p>
            </div>
            {po.vendor.contactPhone && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p>{po.vendor.contactPhone}</p>
              </div>
            )}
            {po.vendor.gstNumber && (
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  GST
                </p>
                <p className="font-mono">{po.vendor.gstNumber}</p>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Issued
              </p>
              <p>{format(po.issuedAt, "PPp")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
