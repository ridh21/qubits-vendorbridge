import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { IconArrowLeft, IconDownload, IconPrinter } from "@tabler/icons-react"

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
import { InvoiceSendForm } from "@/components/invoices/invoice-send-form"
import { InvoiceMarkPaidButton } from "@/components/invoices/invoice-mark-paid-button"
import { getInvoice } from "@/lib/actions/invoices"
import { requireUser } from "@/lib/rbac"
import { formatCurrency } from "@/lib/money"

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) notFound()

  const canManage =
    user.role === "ADMIN" || user.role === "PROCUREMENT_OFFICER"

  return (
    <div>
      <PageHeader
        title={`Invoice ${invoice.code}`}
        description={
          <span className="text-sm">
            For PO{" "}
            <Link
              href={`/purchase-orders/${invoice.poId}`}
              className="font-mono hover:underline"
            >
              {invoice.po.code}
            </Link>{" "}
            · {invoice.po.quotation.rfq.title}
          </span>
        }
        actions={
          <>
            <StatusBadge status={invoice.status} />
            <Button
              variant="outline"
              render={
                <a
                  href={`/api/invoices/${invoice.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <IconDownload className="size-4" />
              PDF
            </Button>
            <Button variant="outline" render={<Link href={`/invoices/${invoice.id}/print`} />}>
              <IconPrinter className="size-4" />
              Print
            </Button>
            <Button variant="ghost" render={<Link href="/invoices" />}>
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
                {invoice.lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell className="text-right">{l.quantity}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(l.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(l.lineTotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-right text-muted-foreground">
                    Subtotal
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(invoice.subtotal)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right text-muted-foreground">
                    Tax ({invoice.taxRate.toFixed(2)}%)
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(invoice.taxAmount)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Grand total
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(invoice.grandTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bill to</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="font-semibold">{invoice.vendor.name}</p>
              <p>{invoice.vendor.contactEmail}</p>
              {invoice.vendor.contactPhone && <p>{invoice.vendor.contactPhone}</p>}
              {invoice.vendor.address && (
                <p className="text-muted-foreground">{invoice.vendor.address}</p>
              )}
              {invoice.vendor.gstNumber && (
                <p className="text-muted-foreground font-mono">
                  GST {invoice.vendor.gstNumber}
                </p>
              )}
              <div className="pt-2 text-xs text-muted-foreground space-y-0.5">
                <p>Created {format(invoice.createdAt, "PPp")}</p>
                {invoice.sentAt && <p>Sent {format(invoice.sentAt, "PPp")}</p>}
                {invoice.paidAt && <p>Paid {format(invoice.paidAt, "PPp")}</p>}
              </div>
            </CardContent>
          </Card>

          {canManage && (
            <>
              <InvoiceSendForm
                invoiceId={invoice.id}
                defaultRecipient={invoice.recipientEmail ?? invoice.vendor.contactEmail}
              />
              {invoice.status !== "PAID" && (
                <InvoiceMarkPaidButton invoiceId={invoice.id} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
