"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { quotationSchema, type QuotationInput } from "@/lib/validation/rfq"
import { saveQuotation } from "@/lib/actions/quotations"
import { formatCurrency, toPaise, fromPaise } from "@/lib/money"

type Item = { id: string; name: string; quantity: number; unit: string }
type Line = { rfqItemId: string; unitPrice: number; quantity: number }

export function QuotationForm({
  quotationId,
  rfqItems,
  defaultLines,
  deliveryDays,
  notes,
  readOnly,
}: {
  quotationId: string
  rfqItems: Item[]
  defaultLines: Line[]
  deliveryDays: number
  notes: string
  readOnly: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const form = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      deliveryDays,
      notes,
      lines: rfqItems.map((item) => {
        const existing = defaultLines.find((l) => l.rfqItemId === item.id)
        return {
          rfqItemId: item.id,
          unitPrice: existing ? fromPaise(existing.unitPrice) : 0,
          quantity: existing?.quantity ?? item.quantity,
        }
      }),
    },
  })

  const lines = useWatch({ control: form.control, name: "lines" }) ?? []
  const total = lines.reduce(
    (s, l) => s + toPaise(l.unitPrice ?? 0) * (l.quantity ?? 0),
    0,
  )

  const submit = (asSubmission: boolean) =>
    form.handleSubmit((values) => {
      start(async () => {
        try {
          await saveQuotation(quotationId, values, asSubmission)
          toast.success(asSubmission ? "Quotation submitted" : "Draft saved")
          router.refresh()
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Failed")
        }
      })
    })

  return (
    <Form {...form}>
      <form className="space-y-6">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Unit price (₹)</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfqItems.map((item, idx) => {
                  const unitPrice = lines[idx]?.unitPrice ?? 0
                  const qty = lines[idx]?.quantity ?? 0
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">
                        <FormField
                          control={form.control}
                          name={`lines.${idx}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  disabled={readOnly}
                                  className="text-right"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(event) => {
                                    const nextValue = event.target.value
                                    field.onChange(nextValue === "" ? 0 : Number(nextValue))
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(toPaise(unitPrice) * qty)}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(total)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="deliveryDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Delivery timeline (days)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      disabled={readOnly}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Notes / comments</FormLabel>
                  <FormControl>
                    <Textarea rows={3} disabled={readOnly} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {!readOnly && (
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={submit(false)}
              disabled={pending}
            >
              Save draft
            </Button>
            <Button
              type="button"
              onClick={submit(true)}
              disabled={pending}
            >
              {pending ? "Submitting…" : "Submit quotation"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}
