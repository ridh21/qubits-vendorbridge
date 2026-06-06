"use client"

import { useState, useTransition } from "react"
import { IconSend } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { sendInvoiceEmailAction } from "@/lib/actions/invoices"

export function InvoiceSendForm({
  invoiceId,
  defaultRecipient,
}: {
  invoiceId: string
  defaultRecipient: string
}) {
  const [pending, start] = useTransition()
  const [recipient, setRecipient] = useState(defaultRecipient)
  const [message, setMessage] = useState(
    "Please find your invoice attached. Reach out if you have any questions.",
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send via email</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="recipient">Recipient</Label>
          <Input
            id="recipient"
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <Button
          className="w-full"
          disabled={pending || !recipient}
          onClick={() =>
            start(async () => {
              try {
                await sendInvoiceEmailAction(invoiceId, { recipient, message })
                toast.success(`Invoice sent to ${recipient}`)
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed")
              }
            })
          }
        >
          <IconSend className="size-4" />
          {pending ? "Sending…" : "Send invoice"}
        </Button>
      </CardContent>
    </Card>
  )
}
