"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { requireUser, requireRole } from "@/lib/rbac"
import { logActivity, notify } from "@/lib/activity"
import { nextCode } from "@/lib/codes"
import { toPaise } from "@/lib/money"
import { quotationSchema, type QuotationInput } from "@/lib/validation/rfq"

export async function listInvitationsForVendor(vendorId: string) {
  return prisma.rfqVendor.findMany({
    where: { vendorId },
    orderBy: { invitedAt: "desc" },
    include: {
      rfq: {
        include: {
          quotations: {
            where: { vendorId },
            select: { id: true, status: true, totalAmount: true },
          },
        },
      },
    },
  })
}

export async function listQuotationsForOfficer() {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  return prisma.quotation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      rfq: { select: { id: true, code: true, title: true } },
      vendor: { select: { id: true, name: true } },
    },
  })
}

export async function getOrCreateQuotation(rfqId: string, vendorId: string) {
  const user = await requireUser()
  if (user.role === "VENDOR" && user.vendorId !== vendorId) {
    throw new Error("Forbidden")
  }
  const invitation = await prisma.rfqVendor.findUnique({
    where: { rfqId_vendorId: { rfqId, vendorId } },
  })
  if (!invitation) throw new Error("Vendor not invited to this RFQ")

  let q = await prisma.quotation.findUnique({
    where: { rfqId_vendorId: { rfqId, vendorId } },
    include: { lines: true, rfq: { include: { items: true } } },
  })
  if (q) return q

  const rfq = await prisma.rfq.findUnique({
    where: { id: rfqId },
    include: { items: true },
  })
  if (!rfq) throw new Error("RFQ not found")

  const code = await nextCode("QT")
  q = await prisma.quotation.create({
    data: {
      code,
      rfqId,
      vendorId,
      status: "DRAFT",
      lines: {
        create: rfq.items.map((it) => ({
          rfqItemId: it.id,
          unitPrice: 0,
          quantity: it.quantity,
          lineTotal: 0,
        })),
      },
    },
    include: { lines: true, rfq: { include: { items: true } } },
  })
  return q
}

export async function saveQuotation(
  quotationId: string,
  input: QuotationInput,
  submit: boolean,
) {
  const user = await requireUser()
  const parsed = quotationSchema.parse(input)
  const existing = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { rfq: true },
  })
  if (!existing) throw new Error("Quotation not found")
  if (user.role === "VENDOR" && existing.vendorId !== user.vendorId) {
    throw new Error("Forbidden")
  }
  if (existing.status === "AWARDED" || existing.status === "SHORTLISTED") {
    throw new Error("Quotation is locked")
  }
  if (existing.rfq.deadline < new Date() && submit) {
    throw new Error("RFQ deadline has passed")
  }

  const linesData = parsed.lines.map((l) => {
    const unit = toPaise(l.unitPrice)
    return {
      rfqItemId: l.rfqItemId,
      unitPrice: unit,
      quantity: l.quantity,
      lineTotal: unit * l.quantity,
    }
  })
  const total = linesData.reduce((s, l) => s + l.lineTotal, 0)

  await prisma.$transaction([
    prisma.quotationLine.deleteMany({ where: { quotationId } }),
    prisma.quotation.update({
      where: { id: quotationId },
      data: {
        deliveryDays: parsed.deliveryDays,
        notes: parsed.notes || null,
        totalAmount: total,
        status: submit ? "SUBMITTED" : "DRAFT",
        submittedAt: submit ? new Date() : null,
        lines: { create: linesData },
      },
    }),
    prisma.rfqVendor.update({
      where: { rfqId_vendorId: { rfqId: existing.rfqId, vendorId: existing.vendorId } },
      data: { status: submit ? "RESPONDED" : "INVITED" },
    }),
  ])

  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Quotation",
    entityId: quotationId,
    action: submit ? "submitted" : "saved",
    message: submit
      ? `${existing.code} submitted`
      : `${existing.code} draft saved`,
  })

  if (submit) {
    const officers = await prisma.user.findMany({
      where: { role: { in: ["PROCUREMENT_OFFICER", "ADMIN"] } },
      select: { id: true },
    })
    await notify({
      userIds: officers.map((u) => u.id),
      type: "QUOTATION_SUBMITTED",
      title: `Quotation submitted on ${existing.rfq.code}`,
      body: `${existing.code}`,
      link: `/rfqs/${existing.rfqId}`,
    })
  }

  revalidatePath(`/quotations/${quotationId}`)
  revalidatePath(`/quotations`)
  revalidatePath(`/rfqs/${existing.rfqId}`)
}

export async function openOrCreateQuotation(rfqId: string, vendorId: string) {
  const q = await getOrCreateQuotation(rfqId, vendorId)
  redirect(`/quotations/${q.id}`)
}

export async function withdrawQuotation(quotationId: string) {
  const user = await requireUser()
  const q = await prisma.quotation.findUnique({ where: { id: quotationId } })
  if (!q) throw new Error("Not found")
  if (user.role === "VENDOR" && q.vendorId !== user.vendorId) {
    throw new Error("Forbidden")
  }
  await prisma.quotation.update({
    where: { id: quotationId },
    data: { status: "WITHDRAWN" },
  })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Quotation",
    entityId: quotationId,
    action: "withdrawn",
    message: `${q.code} withdrawn`,
  })
  revalidatePath(`/quotations`)
  revalidatePath(`/rfqs/${q.rfqId}`)
}
