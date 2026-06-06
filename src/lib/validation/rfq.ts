import { z } from "zod"

export const rfqItemSchema = z.object({
  name: z.string().min(1, "Item name required"),
  description: z.string().optional().or(z.literal("")),
  quantity: z.coerce.number().int().positive("Quantity must be > 0"),
  unit: z.string().min(1),
})
export type RfqItemInput = z.infer<typeof rfqItemSchema>

export const rfqSchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  deadline: z.coerce.date().refine((d) => d > new Date(Date.now() - 86_400_000), {
    message: "Deadline must be in the future",
  }),
  items: z.array(rfqItemSchema).min(1, "Add at least one item"),
  vendorIds: z.array(z.string()).min(1, "Invite at least one vendor"),
})
export type RfqInput = z.infer<typeof rfqSchema>

export const quotationSchema = z.object({
  deliveryDays: z.coerce.number().int().nonnegative(),
  notes: z.string().optional().or(z.literal("")),
  lines: z
    .array(
      z.object({
        rfqItemId: z.string(),
        unitPrice: z.coerce.number().nonnegative(),
        quantity: z.coerce.number().int().nonnegative(),
      }),
    )
    .min(1),
})
export type QuotationInput = z.infer<typeof quotationSchema>
