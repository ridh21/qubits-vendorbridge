"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  VENDOR_CATEGORIES,
  vendorSchema,
  type VendorInput,
} from "@/lib/validation/vendor"
import { createVendor, updateVendor } from "@/lib/actions/vendors"

type Props = {
  id?: string
  defaultValues?: Partial<VendorInput>
  canEditStatus?: boolean
}

const STATUS_OPTIONS = ["ACTIVE", "PENDING", "INACTIVE"] as const

export function VendorForm({ id, defaultValues, canEditStatus }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const form = useForm<VendorInput>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      name: "",
      category: "Other",
      gstNumber: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      status: "ACTIVE",
      ...defaultValues,
    },
  })

  const onSubmit = (values: VendorInput) => {
    start(async () => {
      try {
        if (id) {
          await updateVendor(id, values)
          toast.success("Vendor updated")
        } else {
          const v = await createVendor(values)
          toast.success("Vendor created")
          router.push(`/vendors/${v.id}`)
          return
        }
        router.refresh()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Vendor name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Steel Co." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {VENDOR_CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gstNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GST number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="27AAACA1234A1Z5"
                    className="font-mono uppercase"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact name</FormLabel>
                <FormControl>
                  <Input placeholder="Anil Kumar" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="anil@acme.in" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact phone</FormLabel>
                <FormControl>
                  <Input placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {canEditStatus && (
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Street, city, state, postal code"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : id ? "Save changes" : "Create vendor"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
