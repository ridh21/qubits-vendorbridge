import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { getInvoice } from "@/lib/actions/invoices"
import { renderInvoicePdfBuffer } from "@/lib/pdf"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }
  const { id } = await params
  const invoice = await getInvoice(id)
  if (!invoice) return new NextResponse("Not found", { status: 404 })

  if (
    session.user.role === "VENDOR" &&
    invoice.vendorId !== session.user.vendorId
  ) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const pdf = await renderInvoicePdfBuffer(invoice)
  return new NextResponse(pdf as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${invoice.code}.pdf"`,
    },
  })
}
