"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { shortlistQuotation, submitForApproval } from "@/lib/actions/approvals"

export function QuotationActionsCell({
  quotationId,
  status,
}: {
  quotationId: string
  status: string
}) {
  const [pending, start] = useTransition()

  const handle = (fn: () => Promise<void>, success: string) => () =>
    start(async () => {
      try {
        await fn()
        toast.success(success)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed")
      }
    })

  if (status === "AWARDED") {
    return (
      <p className="text-xs text-emerald-700 font-medium">Awarded</p>
    )
  }
  if (status === "REJECTED") {
    return <p className="text-xs text-rose-700 font-medium">Rejected</p>
  }

  return (
    <div className="flex flex-col gap-1.5">
      {status === "SUBMITTED" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={handle(
            () => shortlistQuotation(quotationId),
            "Shortlisted",
          )}
        >
          Shortlist
        </Button>
      )}
      <Button
        size="sm"
        disabled={pending}
        onClick={handle(
          () => submitForApproval(quotationId),
          "Sent for approval",
        )}
      >
        {status === "SHORTLISTED" ? "Send for approval" : "Send for approval"}
      </Button>
    </div>
  )
}
