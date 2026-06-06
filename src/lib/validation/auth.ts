import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
})
export type LoginInput = z.infer<typeof loginSchema>

export const signupSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER", "VENDOR"]),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
export type SignupInput = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
})
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
