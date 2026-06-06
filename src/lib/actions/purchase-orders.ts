"use server"

import { revalidatePath } from "next/cache"
import type { Role } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { logActivity, notify } from "@/lib/activity"
import { nextCode } from "@/lib/codes"
import { computeTotals, DEFAULT_TAX_RATE } from "@/lib/money"

export async function createPurchaseOrderFromQuotation(
  quotationId: string,
  actorId: string,
  actorRole: Role,
) {
  const existing = await prisma.purchaseOrder.findUnique({
    where: { quotationId },
  })
  if (existing) return existing

  const q = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { lines: true, vendor: true, rfq: true },
  })
  if (!q) throw new Error("Quotation not found")

  const lines = q.lines.map((l) => ({ unitPrice: l.unitPrice, quantity: l.quantity }))
  const totals = computeTotals(lines, DEFAULT_TAX_RATE)
  const code = await nextCode("PO")

  const po = await prisma.purchaseOrder.create({
    data: {
      code,
      quotationId: q.id,
      vendorId: q.vendorId,
      totalAmount: totals.subtotal,
      taxAmount: totals.taxAmount,
      grandTotal: totals.grandTotal,
      status: "ISSUED",
    },
  })

  await logActivity({
    userId: actorId,
    actorRole,
    entityType: "PurchaseOrder",
    entityId: po.id,
    action: "issued",
    message: `${po.code} issued from ${q.code}`,
  })

  const vendorUsers = await prisma.user.findMany({
    where: { vendorId: q.vendorId, role: "VENDOR" },
    select: { id: true },
  })
  await notify({
    userIds: vendorUsers.map((u) => u.id),
    type: "PO_ISSUED",
    title: `Purchase Order ${po.code}`,
    body: `For ${q.rfq.title}`,
    link: `/purchase-orders/${po.id}`,
  })

  revalidatePath("/purchase-orders")
  return po
}

export async function listPurchaseOrders(opts: { vendorId?: string } = {}) {
  return prisma.purchaseOrder.findMany({
    where: opts.vendorId ? { vendorId: opts.vendorId } : {},
    orderBy: { issuedAt: "desc" },
    include: {
      vendor: { select: { id: true, name: true } },
      quotation: {
        include: { rfq: { select: { code: true, title: true } } },
      },
      invoice: { select: { id: true, code: true, status: true } },
    },
  })
}

export async function getPurchaseOrder(id: string) {
  return prisma.purchaseOrder.findUnique({
    where: { id },
    include: {
      vendor: true,
      quotation: {
        include: {
          rfq: { include: { items: { orderBy: { position: "asc" } } } },
          lines: true,
        },
      },
      invoice: { select: { id: true, code: true } },
    },
  })
}

export async function setPurchaseOrderStatus(
  id: string,
  status: "ISSUED" | "FULFILLED" | "CANCELLED",
) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: { status },
  })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "PurchaseOrder",
    entityId: po.id,
    action: "status_changed",
    message: `${po.code} set to ${status}`,
  })
  revalidatePath("/purchase-orders")
  revalidatePath(`/purchase-orders/${id}`)
}
