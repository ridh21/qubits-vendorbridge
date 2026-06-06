import { renderToBuffer } from "@react-pdf/renderer"

import { InvoicePdf, type InvoicePdfProps } from "@/components/pdf/invoice-pdf"

export type InvoiceWithRelations = {
  code: string
  createdAt: Date
  taxRate: number
  subtotal: number
  taxAmount: number
  grandTotal: number
  status: string
  vendor: {
    name: string
    contactEmail: string
    contactPhone?: string | null
    address?: string | null
    gstNumber?: string | null
  }
  lines: { name: string; quantity: number; unitPrice: number; lineTotal: number }[]
  po: { code: string; quotation: { rfq: { code: string; title: string } } }
}

function toPdfProps(invoice: InvoiceWithRelations): InvoicePdfProps {
  return {
    code: invoice.code,
    issuedAt: invoice.createdAt.toISOString(),
    status: invoice.status,
    poCode: invoice.po.code,
    rfqTitle: invoice.po.quotation.rfq.title,
    subtotal: invoice.subtotal,
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount,
    grandTotal: invoice.grandTotal,
    vendor: {
      name: invoice.vendor.name,
      email: invoice.vendor.contactEmail,
      phone: invoice.vendor.contactPhone ?? undefined,
      address: invoice.vendor.address ?? undefined,
      gst: invoice.vendor.gstNumber ?? undefined,
    },
    lines: invoice.lines.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      lineTotal: l.lineTotal,
    })),
  }
}

export async function renderInvoicePdfBuffer(
  invoice: InvoiceWithRelations,
): Promise<Uint8Array> {
  const buffer = await renderToBuffer(<InvoicePdf {...toPdfProps(invoice)} />)
  return new Uint8Array(buffer)
}
