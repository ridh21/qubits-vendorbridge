"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { IconCheck, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { decideApproval } from "@/lib/actions/approvals"

export function ApprovalDecisionButtons({ approvalId }: { approvalId: string }) {
  const [pending, start] = useTransition()
  const [mode, setMode] = useState<"APPROVED" | "REJECTED" | null>(null)
  const [remarks, setRemarks] = useState("")

  const submit = () => {
    if (!mode) return
    start(async () => {
      try {
        await decideApproval(approvalId, mode, remarks)
        toast.success(`${mode === "APPROVED" ? "Approved" : "Rejected"}`)
        setMode(null)
        setRemarks("")
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed")
      }
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Decision</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => setMode("APPROVED")}
            disabled={pending}
          >
            <IconCheck className="size-4" /> Approve
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => setMode("REJECTED")}
            disabled={pending}
          >
            <IconX className="size-4" /> Reject
          </Button>
        </CardContent>
      </Card>

      <Dialog open={mode !== null} onOpenChange={(o) => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode === "APPROVED" ? "Approve quotation" : "Reject quotation"}
            </DialogTitle>
            <DialogDescription>
              Add remarks for the audit trail.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            rows={4}
            placeholder="Reasoning, conditions, follow-ups…"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMode(null)} disabled={pending}>
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={pending || remarks.trim().length === 0}
              variant={mode === "REJECTED" ? "destructive" : "default"}
            >
              {pending
                ? "Saving…"
                : mode === "APPROVED"
                ? "Confirm approval"
                : "Confirm rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
