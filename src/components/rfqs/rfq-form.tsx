"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { IconCalendar, IconPlus, IconTrash } from "@tabler/icons-react"
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { VendorMultiSelect } from "@/components/common/vendor-multi-select"
import { rfqSchema, type RfqInput } from "@/lib/validation/rfq"
import { createRfq } from "@/lib/actions/rfqs"
import { cn } from "@/lib/utils"

type Vendor = { id: string; name: string; category: string }

export function RfqForm({ vendors }: { vendors: Vendor[] }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const form = useForm<RfqInput>({
    resolver: zodResolver(rfqSchema),
    defaultValues: {
      title: "",
      description: "",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      items: [{ name: "", description: "", quantity: 1, unit: "unit" }],
      vendorIds: [],
    },
  })
  const items = useFieldArray({ control: form.control, name: "items" })

  const submit = (publish: boolean) =>
    form.handleSubmit((values) => {
      start(async () => {
        try {
          const rfq = await createRfq(values, publish)
          toast.success(publish ? "RFQ published" : "Draft saved")
          router.push(`/rfqs/${rfq.id}`)
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Failed")
        }
      })
    })

  return (
    <Form {...form}>
      <form className="space-y-6 max-w-4xl">
        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Q2 Steel Procurement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="What are you sourcing? Any specs or constraints?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        />
                      }
                    >
                      <IconCalendar className="size-4" />
                      {field.value
                        ? format(field.value, "PPP")
                        : "Pick a date"}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(d) => d && field.onChange(d)}
                        disabled={(d) =>
                          d < new Date(Date.now() - 86_400_000)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vendorIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Invite vendors</FormLabel>
                  <VendorMultiSelect
                    vendors={vendors}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Items</h3>
                <p className="text-xs text-muted-foreground">
                  Add the products or services you&apos;re sourcing.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  items.append({
                    name: "",
                    description: "",
                    quantity: 1,
                    unit: "unit",
                  })
                }
              >
                <IconPlus className="size-4" />
                Add item
              </Button>
            </div>
            <div className="space-y-3">
              {items.fields.map((f, idx) => (
                <div
                  key={f.id}
                  className="grid grid-cols-12 gap-2 items-start"
                >
                  <FormField
                    control={form.control}
                    name={`items.${idx}.name`}
                    render={({ field }) => (
                      <FormItem className="col-span-5">
                        <FormControl>
                          <Input placeholder="Item name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${idx}.quantity`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="Qty"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${idx}.unit`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormControl>
                          <Input placeholder="unit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`items.${idx}.description`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormControl>
                          <Input placeholder="Notes" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="col-span-1"
                    onClick={() => items.remove(idx)}
                    disabled={items.fields.length === 1}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={submit(false)}
            disabled={pending}
          >
            Save as draft
          </Button>
          <Button
            type="button"
            onClick={submit(true)}
            disabled={pending}
          >
            {pending ? "Publishing…" : "Publish RFQ"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
