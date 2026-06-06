import { z } from "zod"

export const profileInfoSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
})
export type ProfileInfoInput = z.infer<typeof profileInfoSchema>

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
