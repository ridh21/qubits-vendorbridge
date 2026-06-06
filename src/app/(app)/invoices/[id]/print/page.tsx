import Image from "next/image"
import { notFound } from "next/navigation"
import { format } from "date-fns"

import { PrintTrigger } from "@/components/invoices/print-trigger"
import { getInvoice } from "@/lib/actions/invoices"
import { requireUser } from "@/lib/rbac"
import { formatCurrency } from "@/lib/money"

const BRAND_NAVY = "#0D2A41"
const BRAND_BLUE = "#1F88C9"

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
    <div className="min-h-screen bg-slate-50 print:bg-white text-[#0D2A41]">
      <PrintTrigger />
      <div className="mx-auto max-w-3xl bg-white shadow-sm print:shadow-none my-8 print:my-0 print:max-w-none">
        <div
          className="h-1.5 print:h-2"
          style={{ background: BRAND_BLUE }}
        />

        <header className="flex items-start justify-between border-b px-10 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="VendorBridge"
              width={56}
              height={36}
              className="object-contain"
              priority
            />
            <div>
              <p className="text-lg font-bold" style={{ color: BRAND_NAVY }}>
                VendorBridge
              </p>
              <p className="text-[11px] text-slate-500">
                Procurement &amp; Vendor Management ERP
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-xl font-bold tracking-[0.18em]"
              style={{ color: BRAND_BLUE }}
            >
              INVOICE
            </p>
            <p className="text-sm font-semibold" style={{ color: BRAND_NAVY }}>
              {invoice.code}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {format(invoice.createdAt, "PPP")}
            </p>
            <span
              className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: "#eef2f7", color: BRAND_NAVY }}
            >
              {invoice.status}
            </span>
          </div>
        </header>

        <section className="px-10 pt-6 grid grid-cols-2 gap-4">
          <div
            className="rounded-md p-4"
            style={{
              background: "#f7fafd",
              borderLeft: `3px solid ${BRAND_BLUE}`,
            }}
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Bill to
            </p>
            <p className="font-semibold text-sm" style={{ color: BRAND_NAVY }}>
              {invoice.vendor.name}
            </p>
            <p className="text-xs">{invoice.vendor.contactEmail}</p>
            {invoice.vendor.contactPhone && (
              <p className="text-xs">{invoice.vendor.contactPhone}</p>
            )}
            {invoice.vendor.address && (
              <p className="text-xs text-slate-500">{invoice.vendor.address}</p>
            )}
            {invoice.vendor.gstNumber && (
              <p className="text-xs text-slate-500 font-mono">
                GST {invoice.vendor.gstNumber}
              </p>
            )}
          </div>
          <div
            className="rounded-md p-4"
            style={{
              background: "#f7fafd",
              borderLeft: `3px solid ${BRAND_BLUE}`,
            }}
          >
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
              Reference
            </p>
            <p className="font-semibold text-sm" style={{ color: BRAND_NAVY }}>
              {invoice.po.code}
            </p>
            <p className="text-xs text-slate-500">
              RFQ: {invoice.po.quotation.rfq.title}
            </p>
          </div>
        </section>

        <section className="px-10 pt-6">
          <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
            Items
          </p>
          <div className="rounded-md overflow-hidden border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="text-[11px] uppercase tracking-wider text-white text-left"
                  style={{ background: BRAND_NAVY }}
                >
                  <th className="py-2.5 px-3 font-semibold">Description</th>
                  <th className="py-2.5 px-3 text-right font-semibold">Qty</th>
                  <th className="py-2.5 px-3 text-right font-semibold">
                    Unit price
                  </th>
                  <th className="py-2.5 px-3 text-right font-semibold">
                    Line total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((l, i) => (
                  <tr
                    key={l.id}
                    className={i % 2 === 1 ? "bg-slate-50" : "bg-white"}
                  >
                    <td className="py-2.5 px-3">{l.name}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {l.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {formatCurrency(l.unitPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {formatCurrency(l.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="px-10 pt-4 flex justify-end">
          <div className="w-72">
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500">Subtotal</span>
              <span className="tabular-nums">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-1">
              <span className="text-slate-500">
                Tax ({invoice.taxRate.toFixed(2)}%)
              </span>
              <span className="tabular-nums">
                {formatCurrency(invoice.taxAmount)}
              </span>
            </div>
            <div
              className="mt-2 rounded-md flex justify-between items-center px-3 py-2.5 text-white"
              style={{ background: BRAND_NAVY }}
            >
              <span className="text-xs font-semibold uppercase tracking-wider">
                Grand total
              </span>
              <span className="font-bold tabular-nums text-base">
                {formatCurrency(invoice.grandTotal)}
              </span>
            </div>
          </div>
        </section>

        <section className="px-10 pt-6">
          <div className="rounded-md bg-slate-50 px-4 py-3 text-xs text-slate-500 leading-relaxed">
            Thank you for partnering with us. Payment is due as per the agreed
            terms on the purchase order. For any billing queries, contact your
            procurement representative.
          </div>
        </section>

        <footer className="px-10 mt-6 pb-8 flex items-center justify-between border-t pt-4 text-[10px] text-slate-500">
          <span>VendorBridge — Procurement &amp; Vendor Management</span>
          <span>{invoice.code} · {format(invoice.createdAt, "PP")}</span>
        </footer>
      </div>
    </div>
  )
}
