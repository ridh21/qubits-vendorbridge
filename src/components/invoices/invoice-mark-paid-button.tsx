"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { IconCheck } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { markInvoicePaid } from "@/lib/actions/invoices"

export function InvoiceMarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const [pending, start] = useTransition()
  return (
    <Button
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await markInvoicePaid(invoiceId)
            toast.success("Marked as paid")
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed")
          }
        })
      }
    >
      <IconCheck className="size-4" />
      {pending ? "Saving…" : "Mark as paid"}
    </Button>
  )
}
