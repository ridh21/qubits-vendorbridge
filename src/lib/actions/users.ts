"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
import type { Role } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { logActivity } from "@/lib/activity"
import { sendUserCredentialsEmail } from "@/lib/email"

const userSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    role: z.enum(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER", "VENDOR"]),
    vendorId: z.string().optional().or(z.literal("")),
    password: z.string().min(8).optional().or(z.literal("")),
  })
  .refine((d) => d.role !== "VENDOR" || !!d.vendorId, {
    message: "Vendor users must be linked to a vendor",
    path: ["vendorId"],
  })
export type UserFormInput = z.infer<typeof userSchema>

export async function listUsers() {
  await requireRole(["ADMIN"])
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { vendor: { select: { name: true } } },
  })
}

export async function listVendorsForLink() {
  await requireRole(["ADMIN"])
  return prisma.vendor.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
}

export async function createUser(input: UserFormInput) {
  const actor = await requireRole(["ADMIN"])
  const parsed = userSchema.parse(input)
  if (!parsed.password) throw new Error("Password is required for new users")
  const existing = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
  })
  if (existing) throw new Error("Email already in use")
  const passwordHash = await bcrypt.hash(parsed.password, 10)
  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email.toLowerCase(),
      role: parsed.role as Role,
      vendorId: parsed.vendorId || null,
      passwordHash,
    },
  })

  await sendUserCredentialsEmail({
    to: user.email,
    name: user.name,
    password: parsed.password,
  })

  await logActivity({
    userId: actor.id,
    actorRole: actor.role,
    entityType: "User",
    entityId: user.id,
    action: "created",
    message: `User ${user.email} created as ${user.role}`,
  })
  revalidatePath("/admin/users")
  return user
}

export async function updateUser(id: string, input: UserFormInput) {
  const actor = await requireRole(["ADMIN"])
  const parsed = userSchema.parse(input)
  const data: {
    name: string
    email: string
    role: Role
    vendorId: string | null
    passwordHash?: string
  } = {
    name: parsed.name,
    email: parsed.email.toLowerCase(),
    role: parsed.role as Role,
    vendorId: parsed.vendorId || null,
  }
  if (parsed.password) {
    data.passwordHash = await bcrypt.hash(parsed.password, 10)
  }
  const user = await prisma.user.update({ where: { id }, data })
  await logActivity({
    userId: actor.id,
    actorRole: actor.role,
    entityType: "User",
    entityId: user.id,
    action: "updated",
    message: `User ${user.email} updated`,
  })
  revalidatePath("/admin/users")
}

export async function setUserDisabled(id: string, disabled: boolean) {
  const actor = await requireRole(["ADMIN"])
  const user = await prisma.user.update({
    where: { id },
    data: { disabled },
  })
  await logActivity({
    userId: actor.id,
    actorRole: actor.role,
    entityType: "User",
    entityId: user.id,
    action: disabled ? "disabled" : "enabled",
    message: `User ${user.email} ${disabled ? "disabled" : "re-enabled"}`,
  })
  revalidatePath("/admin/users")
}
