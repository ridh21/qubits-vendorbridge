"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { IconInfoCircle, IconTruck } from "@tabler/icons-react"

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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { quotationSchema, type QuotationInput } from "@/lib/validation/rfq"
import { saveQuotation } from "@/lib/actions/quotations"
import { formatCurrency, toPaise, fromPaise, DEFAULT_TAX_RATE } from "@/lib/money"

type Item = { id: string; name: string; quantity: number; unit: string }
type Line = {
  rfqItemId: string
  unitPrice: number
  quantity: number
  deliveryDays?: number
}

export function QuotationForm({
  quotationId,
  rfqItems,
  defaultLines,
  notes,
  readOnly,
}: {
  quotationId: string
  rfqItems: Item[]
  defaultLines: Line[]
  notes: string
  readOnly: boolean
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  const form = useForm<QuotationInput>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      notes,
      lines: rfqItems.map((item) => {
        const existing = defaultLines.find((l) => l.rfqItemId === item.id)
        return {
          rfqItemId: item.id,
          unitPrice: existing ? fromPaise(existing.unitPrice) : 0,
          quantity: existing?.quantity ?? item.quantity,
          deliveryDays: existing?.deliveryDays ?? 0,
        }
      }),
    },
  })

  const lines = useWatch({ control: form.control, name: "lines" }) ?? []
  const subtotal = lines.reduce(
    (s, l) => s + toPaise(l.unitPrice ?? 0) * (l.quantity ?? 0),
    0,
  )
  const gstAmount = Math.round((subtotal * DEFAULT_TAX_RATE) / 100)
  const grandTotal = subtotal + gstAmount
  const overallDelivery = lines.reduce(
    (max, l) => Math.max(max, Number(l.deliveryDays ?? 0)),
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
      <form className="space-y-5">
        <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50/60 px-3 py-2 text-xs text-blue-800 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
          <IconInfoCircle className="size-4 shrink-0 mt-0.5" />
          <p>
            All prices are subject to <strong>{DEFAULT_TAX_RATE}% GST</strong>.
            Enter base unit prices and delivery days per item — GST and the
            overall lead time are calculated for you.
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                          Unit price (₹)
                          <IconInfoCircle className="size-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Enter base price per unit. {DEFAULT_TAX_RATE}% GST is
                          added automatically.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                  <TableHead className="text-right">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="inline-flex items-center gap-1 cursor-help">
                          Delivery (days)
                          <IconInfoCircle className="size-3.5 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Days needed to deliver this item. Overall lead time =
                          max of all line items.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
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
                      <TableCell className="text-right">
                        <FormField
                          control={form.control}
                          name={`lines.${idx}.deliveryDays`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={0}
                                  step={1}
                                  disabled={readOnly}
                                  className="text-right w-24 ml-auto"
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
                  <TableCell colSpan={4} className="text-right text-muted-foreground">
                    Subtotal
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 text-[#0D2A41]">
                      <IconTruck className="size-3.5 text-[#1F88C9]" />
                      <span className="font-medium tabular-nums">
                        {overallDelivery}
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        days lead time
                      </span>
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(subtotal)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="text-right text-muted-foreground">
                    GST ({DEFAULT_TAX_RATE}%)
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(gstAmount)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-medium">
                    Grand Total{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (incl. GST)
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatCurrency(grandTotal)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                Notes &amp; comments
              </FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  disabled={readOnly}
                  placeholder="Anything the procurement team should know — payment terms, conditions, exclusions…"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
