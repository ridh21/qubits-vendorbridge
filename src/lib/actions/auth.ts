"use server"

import { randomBytes, createHash } from "crypto"
import bcrypt from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { signIn } from "@/lib/auth"
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  type ForgotPasswordInput,
  type LoginInput,
  type ResetPasswordInput,
  type SignupInput,
} from "@/lib/validation/auth"
import { sendPasswordResetEmail } from "@/lib/email"

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    })
    return { ok: true }
  } catch {
    return { ok: false, error: "Invalid email or password" }
  }
}

export async function signupAction(input: SignupInput): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const email = parsed.data.email.toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { ok: false, error: "Email already registered" }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: parsed.data.role,
    },
  })

  try {
    await signIn("credentials", {
      email,
      password: parsed.data.password,
      redirect: false,
    })
  } catch {
    // signed up but auto-login failed; user can log in manually
  }
  return { ok: true }
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: "Invalid email" }
  }
  const email = parsed.data.email.toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })
  // Always return success to avoid leaking which emails exist
  if (!user) return { ok: true, message: "Check your email for a reset link" }

  const token = randomBytes(32).toString("hex")
  const tokenHash = createHash("sha256").update(token).digest("hex")
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30) // 30 min

  await prisma.passwordReset.create({
    data: { userId: user.id, tokenHash, expiresAt },
  })

  const link = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`
  await sendPasswordResetEmail(user.email, user.name, link)

  return { ok: true, message: "Check your email for a reset link" }
}

export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }
  const tokenHash = createHash("sha256").update(parsed.data.token).digest("hex")
  const record = await prisma.passwordReset.findUnique({ where: { tokenHash } })
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { ok: false, error: "Reset link is invalid or expired" }
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
  ])
  return { ok: true, message: "Password updated. You can now log in." }
}
