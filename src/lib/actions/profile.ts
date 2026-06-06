"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/rbac"
import {
  profileInfoSchema,
  changePasswordSchema,
  type ProfileInfoInput,
  type ChangePasswordInput,
} from "@/lib/validation/profile"
import { logActivity } from "@/lib/activity"

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

export async function updateProfileInfo(input: ProfileInfoInput): Promise<ActionResult> {
  try {
    const actor = await requireUser()
    const parsed = profileInfoSchema.parse(input)

    await prisma.user.update({
      where: { id: actor.id },
      data: {
        name: parsed.name,
      },
    })

    await logActivity({
      userId: actor.id,
      actorRole: actor.role,
      entityType: "User",
      entityId: actor.id,
      action: "updated",
      message: `User updated their own profile info (Name: ${parsed.name})`,
    })

    revalidatePath("/profile")
    return { ok: true, message: "Profile info updated successfully" }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "An error occurred while updating profile info" }
  }
}

export async function changePassword(input: ChangePasswordInput): Promise<ActionResult> {
  try {
    const actor = await requireUser()
    const parsed = changePasswordSchema.parse(input)

    const user = await prisma.user.findUnique({
      where: { id: actor.id },
    })

    if (!user) {
      return { ok: false, error: "User not found" }
    }

    const ok = await bcrypt.compare(parsed.currentPassword, user.passwordHash)
    if (!ok) {
      return { ok: false, error: "Incorrect current password" }
    }

    const passwordHash = await bcrypt.hash(parsed.newPassword, 10)
    await prisma.user.update({
      where: { id: actor.id },
      data: { passwordHash },
    })

    await logActivity({
      userId: actor.id,
      actorRole: actor.role,
      entityType: "User",
      entityId: actor.id,
      action: "updated",
      message: "User changed their own password",
    })

    return { ok: true, message: "Password updated successfully" }
  } catch (err: any) {
    return { ok: false, error: err?.message ?? "An error occurred while changing password" }
  }
}
