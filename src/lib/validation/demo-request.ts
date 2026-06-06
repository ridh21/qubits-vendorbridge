import { z } from "zod"

export const demoRequestSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().min(2, "Company is required"),
  teamSize: z.string().optional().or(z.literal("")),
  message: z.string().optional().or(z.literal("")),
})

export type DemoRequestInput = z.infer<typeof demoRequestSchema>
