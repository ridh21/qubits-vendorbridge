"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { logActivity, notify } from "@/lib/activity"
import { createPurchaseOrderFromQuotation } from "@/lib/actions/purchase-orders"

export async function shortlistQuotation(quotationId: string) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const q = await prisma.quotation.update({
    where: { id: quotationId },
    data: { status: "SHORTLISTED" },
    include: { vendor: { select: { name: true } } },
  })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Quotation",
    entityId: quotationId,
    action: "shortlisted",
    message: `${q.code} (${q.vendor.name}) shortlisted by ${user.name ?? "Procurement Officer"}`,
  })
  revalidatePath(`/rfqs/${q.rfqId}`)
  revalidatePath(`/rfqs/${q.rfqId}/compare`)
}

export async function submitForApproval(quotationId: string) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const existing = await prisma.approval.findUnique({ where: { quotationId } })
  if (existing) throw new Error("Approval already requested")

  const q = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { rfq: true, vendor: { select: { name: true } } },
  })
  if (!q) throw new Error("Quotation not found")
  if (q.status !== "SHORTLISTED" && q.status !== "SUBMITTED") {
    throw new Error("Only submitted or shortlisted quotations can go for approval")
  }

  await prisma.$transaction([
    prisma.approval.create({ data: { quotationId, status: "PENDING" } }),
    prisma.quotation.update({
      where: { id: quotationId },
      data: { status: "SHORTLISTED" },
    }),
  ])

  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Approval",
    entityId: quotationId,
    action: "requested",
    message: `Approval requested for ${q.code} — ${q.vendor.name} (RFQ ${q.rfq.code}) by ${user.name ?? "Procurement Officer"}`,
  })

  const managers = await prisma.user.findMany({
    where: { role: { in: ["MANAGER", "ADMIN"] } },
    select: { id: true },
  })
  await notify({
    userIds: managers.map((u) => u.id),
    type: "APPROVAL_REQUESTED",
    title: `Approval requested: ${q.code}`,
    body: q.rfq.title,
    link: `/approvals`,
  })

  revalidatePath("/approvals")
  revalidatePath(`/rfqs/${q.rfqId}/compare`)
  revalidatePath(`/rfqs/${q.rfqId}`)
}

export async function decideApproval(
  approvalId: string,
  decision: "APPROVED" | "REJECTED",
  remarks: string,
) {
  const user = await requireRole(["ADMIN", "MANAGER"])
  const approval = await prisma.approval.findUnique({
    where: { id: approvalId },
    include: {
      quotation: {
        include: { rfq: true, vendor: { select: { name: true } } },
      },
    },
  })
  if (!approval) throw new Error("Not found")
  if (approval.status !== "PENDING") throw new Error("Already decided")

  await prisma.approval.update({
    where: { id: approvalId },
    data: {
      status: decision,
      remarks,
      approverId: user.id,
      decidedAt: new Date(),
    },
  })

  if (decision === "APPROVED") {
    await prisma.quotation.update({
      where: { id: approval.quotationId },
      data: { status: "AWARDED" },
    })
    await prisma.rfq.update({
      where: { id: approval.quotation.rfqId },
      data: { status: "AWARDED" },
    })
    await createPurchaseOrderFromQuotation(approval.quotationId, user.id, user.role)
  } else {
    await prisma.quotation.update({
      where: { id: approval.quotationId },
      data: { status: "REJECTED" },
    })
  }

  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Approval",
    entityId: approvalId,
    action: decision.toLowerCase(),
    message: `${approval.quotation.code} (${approval.quotation.vendor.name}) ${decision.toLowerCase()} by ${user.name ?? "Manager"} — ${remarks}`,
  })

  const officers = await prisma.user.findMany({
    where: { role: { in: ["PROCUREMENT_OFFICER", "ADMIN"] } },
    select: { id: true },
  })
  await notify({
    userIds: officers.map((u) => u.id),
    type: "APPROVAL_DECIDED",
    title: `${decision === "APPROVED" ? "Approved" : "Rejected"}: ${approval.quotation.code}`,
    body: remarks || approval.quotation.rfq.title,
    link:
      decision === "APPROVED"
        ? `/purchase-orders`
        : `/rfqs/${approval.quotation.rfqId}/compare`,
  })

  revalidatePath("/approvals")
  revalidatePath(`/approvals/${approvalId}`)
  revalidatePath(`/rfqs/${approval.quotation.rfqId}`)
}

export async function listPendingApprovals() {
  return prisma.approval.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    include: {
      quotation: {
        include: {
          rfq: { select: { id: true, code: true, title: true } },
          vendor: { select: { name: true } },
        },
      },
    },
  })
}

export async function listAllApprovals() {
  return prisma.approval.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      quotation: {
        include: {
          rfq: { select: { id: true, code: true, title: true } },
          vendor: { select: { name: true } },
        },
      },
      approver: { select: { name: true } },
    },
  })
}
