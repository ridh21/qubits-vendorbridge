"use server"

import { revalidatePath } from "next/cache"
import type { Prisma, VendorStatus } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { logActivity } from "@/lib/activity"
import { vendorSchema, type VendorInput } from "@/lib/validation/vendor"

export type ListVendorsArgs = {
  q?: string
  category?: string
  status?: VendorStatus
}

export async function listVendors(args: ListVendorsArgs = {}) {
  const where: Prisma.VendorWhereInput = {}
  if (args.q) {
    where.OR = [
      { name: { contains: args.q, mode: "insensitive" } },
      { gstNumber: { contains: args.q, mode: "insensitive" } },
      { contactEmail: { contains: args.q, mode: "insensitive" } },
    ]
  }
  if (args.category && args.category !== "all") where.category = args.category
  if (args.status) where.status = args.status

  return prisma.vendor.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { quotations: true, invitations: true } } },
  })
}

export async function getVendor(id: string) {
  return prisma.vendor.findUnique({
    where: { id },
    include: {
      users: { select: { id: true, name: true, email: true, role: true } },
      invitations: {
        include: { rfq: { select: { id: true, code: true, title: true, status: true } } },
        orderBy: { invitedAt: "desc" },
        take: 10,
      },
      quotations: {
        include: { rfq: { select: { id: true, code: true, title: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      purchaseOrders: { orderBy: { issuedAt: "desc" }, take: 10 },
    },
  })
}

export async function createVendor(input: VendorInput) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const parsed = vendorSchema.parse(input)
  const vendor = await prisma.vendor.create({
    data: {
      name: parsed.name,
      category: parsed.category,
      gstNumber: parsed.gstNumber || null,
      contactName: parsed.contactName,
      contactEmail: parsed.contactEmail,
      contactPhone: parsed.contactPhone || null,
      address: parsed.address || null,
      status: parsed.status,
    },
  })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Vendor",
    entityId: vendor.id,
    action: "created",
    message: `Vendor "${vendor.name}" registered`,
  })
  revalidatePath("/vendors")
  return vendor
}

export async function updateVendor(id: string, input: VendorInput) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const parsed = vendorSchema.parse(input)
  const vendor = await prisma.vendor.update({
    where: { id },
    data: {
      name: parsed.name,
      category: parsed.category,
      gstNumber: parsed.gstNumber || null,
      contactName: parsed.contactName,
      contactEmail: parsed.contactEmail,
      contactPhone: parsed.contactPhone || null,
      address: parsed.address || null,
      status: parsed.status,
    },
  })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Vendor",
    entityId: vendor.id,
    action: "updated",
    message: `Vendor "${vendor.name}" updated`,
  })
  revalidatePath("/vendors")
  revalidatePath(`/vendors/${id}`)
  return vendor
}

export async function setVendorStatus(id: string, status: VendorStatus) {
  const user = await requireRole(["ADMIN"])
  const vendor = await prisma.vendor.update({
    where: { id },
    data: { status },
  })
  await logActivity({
    userId: user.id,
    actorRole: user.role,
    entityType: "Vendor",
    entityId: vendor.id,
    action: "status_changed",
    message: `Vendor "${vendor.name}" set to ${status}`,
  })
  revalidatePath("/vendors")
  revalidatePath(`/vendors/${id}`)
}
