import { z } from "zod"

export const VENDOR_CATEGORIES = [
  "IT",
  "Office Supplies",
  "Logistics",
  "Services",
  "Manufacturing",
  "Other",
] as const

const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/

export const vendorSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.enum(VENDOR_CATEGORIES),
  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => v === "" || gstRegex.test(v), "Invalid GST number")
    .optional()
    .or(z.literal("")),
  contactName: z.string().min(2, "Contact name is required"),
  contactEmail: z.string().email("Enter a valid email"),
  contactPhone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]),
})
export type VendorInput = z.infer<typeof vendorSchema>
