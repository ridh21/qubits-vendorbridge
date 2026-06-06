"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { requireRole, requireUser } from "@/lib/rbac"
import { logActivity, notify } from "@/lib/activity"
import { nextCode } from "@/lib/codes"
import { computeTotals, DEFAULT_TAX_RATE } from "@/lib/money"

export async function listInvoices(opts: { vendorId?: string } = {}) {
  return prisma.invoice.findMany({
    where: opts.vendorId ? { vendorId: opts.vendorId } : {},
    orderBy: { createdAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
      po: { include: { quotation: { include: { rfq: { select: { code: true, title: true } } } } } },
    },
  })
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      vendor: true,
      lines: true,
      po: {
        include: {
          quotation: { include: { rfq: { select: { code: true, title: true } } } },
        },
      },
    },
  })
}

export async function generateInvoiceFromPO(poId: string) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const existing = await prisma.invoice.findUnique({ where: { poId } })
  if (existing) {
    redirect(`/invoices/${existing.id}`)
  }

  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      vendor: true,
      quotation: {
        include: {
          rfq: { include: { items: { orderBy: { position: "asc" } } } },
          lines: true,
        },
      },
    },
  })
  if (!po) throw new Error("PO not found")

  const lines = po.quotation.lines.map((l) => ({
    unitPrice: l.unitPrice,
    quantity: l.quantity,
  }))
  const totals = computeTotals(lines, DEFAULT_TAX_RATE)
  const code = await nextCode("INV")

  const lineRows = po.quotation.lines.map((l) => {
    const item = po.quotation.rfq.items.find((it) => it.id === l.rfqItemId)
    return {
      name: item?.name ?? "Line item",
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      lineTotal: l.unitPrice * l.quantity,
    }
  })

  const invoice = await prisma.invoice.create({
    data: {
      code,
      poId,
      vendorId: po.vendorId,
      subtotal: totals.subtotal,
      taxRate: DEFAULT_TAX_RATE,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      recipientEmail: po.vendor.contactEmail,
      lines: { create: lineRows },
    },
  })

  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Invoice",
    entityId: invoice.id,
    action: "generated",
    message: `${invoice.code} generated from ${po.code}`,
  })

  revalidatePath("/invoices")
  revalidatePath(`/purchase-orders/${poId}`)
  redirect(`/invoices/${invoice.id}`)
}

export async function markInvoicePaid(id: string) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const inv = await prisma.invoice.update({
    where: { id },
    data: { status: "PAID", paidAt: new Date() },
  })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Invoice",
    entityId: inv.id,
    action: "paid",
    message: `${inv.code} marked as paid`,
  })
  revalidatePath(`/invoices/${id}`)
  revalidatePath("/invoices")
}

export async function sendInvoiceEmailAction(
  id: string,
  opts: { recipient: string; message: string },
) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { vendor: true, lines: true, po: { include: { quotation: { include: { rfq: true } } } } },
  })
  if (!invoice) throw new Error("Not found")

  const { renderInvoicePdfBuffer } = await import("@/lib/pdf")
  const pdfBuffer = await renderInvoicePdfBuffer(invoice)

  const { sendInvoiceEmail } = await import("@/lib/email")
  await sendInvoiceEmail({
    to: opts.recipient || invoice.vendor.contactEmail,
    invoiceCode: invoice.code,
    vendorName: invoice.vendor.name,
    message: opts.message,
    pdf: pdfBuffer,
  })

  await prisma.invoice.update({
    where: { id },
    data: {
      status: invoice.status === "PAID" ? "PAID" : "SENT",
      sentAt: new Date(),
      recipientEmail: opts.recipient || invoice.vendor.contactEmail,
    },
  })

  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Invoice",
    entityId: id,
    action: "sent",
    message: `${invoice.code} emailed to ${opts.recipient || invoice.vendor.contactEmail}`,
  })

  const vendorUsers = await prisma.user.findMany({
    where: { vendorId: invoice.vendorId, role: "VENDOR" },
    select: { id: true },
  })
  await notify({
    userIds: vendorUsers.map((u) => u.id),
    type: "INVOICE_SENT",
    title: `Invoice ${invoice.code}`,
    body: `Sent to ${opts.recipient || invoice.vendor.contactEmail}`,
    link: `/invoices/${invoice.id}`,
  })

  revalidatePath(`/invoices/${id}`)
}

export async function generateInvoiceAction(poId: string) {
  return generateInvoiceFromPO(poId)
}

export async function listVendorInvoices() {
  const user = await requireUser()
  if (user.role !== "VENDOR" || !user.vendorId) return []
  return listInvoices({ vendorId: user.vendorId })
}
