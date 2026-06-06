"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/rbac"

export async function listMyNotifications(limit = 10) {
  const user = await requireUser()
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.notification.count({
      where: { userId: user.id, readAt: null },
    }),
  ])
  return { items, unread }
}

export async function markAllRead() {
  const user = await requireUser()
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  })
  revalidatePath("/", "layout")
}
