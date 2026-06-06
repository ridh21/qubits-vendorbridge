import { notFound } from "next/navigation"
import { format } from "date-fns"

import { PrintTrigger } from "@/components/invoices/print-trigger"
import { getInvoice } from "@/lib/actions/invoices"
import { requireUser } from "@/lib/rbac"
import { formatCurrency, fromPaise } from "@/lib/money"

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) notFound()
  if (user.role === "VENDOR" && invoice.vendorId !== user.vendorId) notFound()

  return (
    <div className="bg-white text-zinc-900 min-h-screen p-12 print:p-0">
      <PrintTrigger />
      <div className="max-w-3xl mx-auto">
        <header className="flex items-start justify-between border-b pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-bold">VendorBridge</h1>
            <p className="text-xs text-zinc-500">
              Procurement & Vendor Management ERP
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="text-lg font-semibold">INVOICE</p>
            <p className="font-mono">{invoice.code}</p>
            <p className="text-zinc-500">{format(invoice.createdAt, "PPP")}</p>
            <p className="text-zinc-500">Status: {invoice.status}</p>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
              Bill to
            </p>
            <p className="font-semibold">{invoice.vendor.name}</p>
            <p>{invoice.vendor.contactEmail}</p>
            {invoice.vendor.contactPhone && <p>{invoice.vendor.contactPhone}</p>}
            {invoice.vendor.address && (
              <p className="text-zinc-500">{invoice.vendor.address}</p>
            )}
            {invoice.vendor.gstNumber && (
              <p className="text-zinc-500 font-mono">GST {invoice.vendor.gstNumber}</p>
            )}
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500 mb-1">
              Reference
            </p>
            <p>PO: {invoice.po.code}</p>
            <p>RFQ: {invoice.po.quotation.rfq.title}</p>
          </div>
        </div>

        <table className="w-full text-sm border-t border-b">
          <thead>
            <tr className="text-left text-xs uppercase text-zinc-500 bg-zinc-50">
              <th className="py-2 px-3">Item</th>
              <th className="py-2 px-3 text-right">Qty</th>
              <th className="py-2 px-3 text-right">Unit price</th>
              <th className="py-2 px-3 text-right">Line total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((l) => (
              <tr key={l.id} className="border-t">
                <td className="py-2 px-3">{l.name}</td>
                <td className="py-2 px-3 text-right">{l.quantity}</td>
                <td className="py-2 px-3 text-right tabular-nums">
                  {formatCurrency(l.unitPrice)}
                </td>
                <td className="py-2 px-3 text-right tabular-nums">
                  {formatCurrency(l.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-4">
          <table className="text-sm">
            <tbody>
              <tr>
                <td className="text-right pr-6 text-zinc-500">Subtotal</td>
                <td className="text-right tabular-nums w-32">
                  {formatCurrency(invoice.subtotal)}
                </td>
              </tr>
              <tr>
                <td className="text-right pr-6 text-zinc-500">
                  Tax ({invoice.taxRate.toFixed(2)}%)
                </td>
                <td className="text-right tabular-nums">
                  {formatCurrency(invoice.taxAmount)}
                </td>
              </tr>
              <tr className="text-lg font-bold">
                <td className="text-right pr-6 pt-2">Grand total</td>
                <td className="text-right tabular-nums pt-2">
                  {formatCurrency(invoice.grandTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-12 text-xs text-zinc-500 text-center">
          Amount due: {fromPaise(invoice.grandTotal).toLocaleString("en-IN")} INR
          · Thank you for your business.
        </p>
      </div>
    </div>
  )
}
