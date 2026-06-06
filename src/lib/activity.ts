"use server"

import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

export type LogActivityInput = {
  userId?: string | null
  actorRole?: Role | null
  entityType: string
  entityId: string
  action: string
  message: string
}

export async function logActivity(input: LogActivityInput) {
  await prisma.activityLog.create({
    data: {
      userId: input.userId ?? null,
      actorRole: input.actorRole ?? null,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      message: input.message,
    },
  })
}

export type NotifyInput = {
  userIds: string[]
  type:
    | "RFQ_PUBLISHED"
    | "QUOTATION_SUBMITTED"
    | "APPROVAL_REQUESTED"
    | "APPROVAL_DECIDED"
    | "PO_ISSUED"
    | "INVOICE_SENT"
    | "GENERIC"
  title: string
  body: string
  link?: string
}

export async function notify(input: NotifyInput) {
  if (input.userIds.length === 0) return
  await prisma.notification.createMany({
    data: input.userIds.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    })),
  })
}
