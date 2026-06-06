"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { publishRfq } from "@/lib/actions/rfqs"

export function PublishRfqButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await publishRfq(id)
            toast.success("RFQ published")
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed")
          }
        })
      }
    >
      {pending ? "Publishing…" : "Publish"}
    </Button>
  )
}
