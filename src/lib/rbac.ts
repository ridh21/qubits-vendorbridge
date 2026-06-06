import { redirect } from "next/navigation"
import type { Role } from "@prisma/client"
import { auth } from "@/lib/auth"

export type SessionUser = {
  id: string
  name?: string | null
  email?: string | null
  role: Role
  vendorId: string | null
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role,
    vendorId: session.user.vendorId ?? null,
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  return user
}

export async function requireRole(roles: Role[]): Promise<SessionUser> {
  const user = await requireUser()
  if (!roles.includes(user.role)) redirect("/dashboard")
  return user
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  PROCUREMENT_OFFICER: "Procurement Officer",
  MANAGER: "Manager",
  VENDOR: "Vendor",
}

export type Permission =
  | "vendor.create"
  | "vendor.edit"
  | "vendor.toggleStatus"
  | "rfq.create"
  | "rfq.publish"
  | "quotation.submit"
  | "quotation.shortlist"
  | "approval.decide"
  | "po.generate"
  | "invoice.generate"
  | "invoice.send"
  | "users.manage"
  | "reports.view"

const PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    "vendor.create",
    "vendor.edit",
    "vendor.toggleStatus",
    "rfq.create",
    "rfq.publish",
    "quotation.shortlist",
    "approval.decide",
    "po.generate",
    "invoice.generate",
    "invoice.send",
    "users.manage",
    "reports.view",
  ],
  PROCUREMENT_OFFICER: [
    "vendor.create",
    "vendor.edit",
    "rfq.create",
    "rfq.publish",
    "quotation.shortlist",
    "po.generate",
    "invoice.generate",
    "invoice.send",
    "reports.view",
  ],
  MANAGER: ["approval.decide", "reports.view"],
  VENDOR: ["quotation.submit"],
}

export function can(role: Role, permission: Permission): boolean {
  return PERMISSIONS[role].includes(permission)
}
