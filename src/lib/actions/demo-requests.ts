"use server"

import { prisma } from "@/lib/prisma"
import {
  demoRequestSchema,
  type DemoRequestInput,
} from "@/lib/validation/demo-request"

export type DemoRequestResult =
  | { ok: true }
  | { ok: false; error: string }

export async function submitDemoRequest(
  input: DemoRequestInput,
): Promise<DemoRequestResult> {
  const parsed = demoRequestSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    await prisma.demoRequest.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        company: parsed.data.company,
        teamSize: parsed.data.teamSize || null,
        message: parsed.data.message || null,
      },
    })
    return { ok: true }
  } catch (err) {
    console.error("[demo-request] save failed:", err)
    return { ok: false, error: "Couldn’t save your request. Please try again." }
  }
}
