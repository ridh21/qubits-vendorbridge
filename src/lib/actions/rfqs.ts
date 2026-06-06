"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { prisma } from "@/lib/prisma"
import { requireRole, requireUser } from "@/lib/rbac"
import { logActivity, notify } from "@/lib/activity"
import { nextCode } from "@/lib/codes"
import { rfqSchema, type RfqInput } from "@/lib/validation/rfq"

export async function listRfqs(opts: { vendorId?: string } = {}) {
  const where = opts.vendorId
    ? { vendors: { some: { vendorId: opts.vendorId } } }
    : {}
  return prisma.rfq.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
      _count: { select: { quotations: true, vendors: true } },
    },
  })
}

export async function getRfq(id: string) {
  return prisma.rfq.findUnique({
    where: { id },
    include: {
      items: { orderBy: { position: "asc" } },
      attachments: true,
      vendors: {
        include: {
          vendor: {
            select: { id: true, name: true, contactEmail: true, rating: true },
          },
        },
      },
      quotations: {
        include: {
          vendor: { select: { id: true, name: true, rating: true } },
          lines: true,
        },
      },
      createdBy: { select: { id: true, name: true } },
    },
  })
}

export async function createRfq(input: RfqInput, publish: boolean) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const parsed = rfqSchema.parse(input)
  const code = await nextCode("RFQ")

  const rfq = await prisma.rfq.create({
    data: {
      code,
      title: parsed.title,
      description: parsed.description || null,
      deadline: parsed.deadline,
      status: publish ? "OPEN" : "DRAFT",
      createdById: user.id,
      items: {
        create: parsed.items.map((it, idx) => ({
          name: it.name,
          description: it.description || null,
          quantity: it.quantity,
          unit: it.unit || "unit",
          position: idx,
        })),
      },
      vendors: {
        create: parsed.vendorIds.map((vid) => ({ vendorId: vid })),
      },
    },
    include: { vendors: { include: { vendor: true } } },
  })

  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Rfq",
    entityId: rfq.id,
    action: publish ? "published" : "created",
    message: `${rfq.code} ${publish ? "published" : "saved as draft"} — "${rfq.title}"`,
  })

  if (publish) {
    const vendorUsers = await prisma.user.findMany({
      where: { vendorId: { in: parsed.vendorIds }, role: "VENDOR" },
      select: { id: true },
    })
    await notify({
      userIds: vendorUsers.map((u) => u.id),
      type: "RFQ_PUBLISHED",
      title: `New RFQ: ${rfq.code}`,
      body: rfq.title,
      link: `/quotations`,
    })
  }

  revalidatePath("/rfqs")
  return rfq
}

export async function publishRfq(id: string) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const rfq = await prisma.rfq.update({
    where: { id },
    data: { status: "OPEN" },
    include: { vendors: true },
  })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Rfq",
    entityId: rfq.id,
    action: "published",
    message: `${rfq.code} published`,
  })
  const vendorUsers = await prisma.user.findMany({
    where: { vendorId: { in: rfq.vendors.map((v) => v.vendorId) }, role: "VENDOR" },
    select: { id: true },
  })
  await notify({
    userIds: vendorUsers.map((u) => u.id),
    type: "RFQ_PUBLISHED",
    title: `New RFQ: ${rfq.code}`,
    body: rfq.title,
    link: `/quotations`,
  })
  revalidatePath("/rfqs")
  revalidatePath(`/rfqs/${id}`)
}

export async function closeRfq(id: string) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const rfq = await prisma.rfq.update({ where: { id }, data: { status: "CLOSED" } })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Rfq",
    entityId: rfq.id,
    action: "closed",
    message: `${rfq.code} closed`,
  })
  revalidatePath("/rfqs")
  revalidatePath(`/rfqs/${id}`)
}

export async function deleteRfq(id: string) {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  await prisma.rfq.delete({ where: { id } })
  revalidatePath("/rfqs")
  redirect("/rfqs")
}

export async function listActiveVendors() {
  await requireUser()
  return prisma.vendor.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true, contactEmail: true },
  })
}
