"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { setUserDisabled } from "@/lib/actions/users"

export function ToggleUserButton({
  id,
  disabled,
}: {
  id: string
  disabled: boolean
}) {
  const [pending, start] = useTransition()
  return (
    <Button
      size="sm"
      variant={disabled ? "secondary" : "destructive"}
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await setUserDisabled(id, !disabled)
            toast.success(disabled ? "User enabled" : "User disabled")
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed")
          }
        })
      }
    >
      {disabled ? "Enable" : "Disable"}
    </Button>
  )
}
