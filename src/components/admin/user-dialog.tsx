"use client"

import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { IconPlus, IconRefresh } from "@tabler/icons-react"
import { toast } from "sonner"
import type { Role } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createUser, updateUser, type UserFormInput } from "@/lib/actions/users"

function generatePassword(length = 14) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*"
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (value) => chars[value % chars.length]).join("")
}

type Props =
  | { mode: "create"; vendors: { id: string; name: string }[]; user?: undefined }
  | {
    mode: "edit"
    vendors: { id: string; name: string }[]
    user: { id: string; name: string; email: string; role: Role; vendorId: string | null }
  }

const ROLES: { value: Role; label: string }[] = [
  { value: "PROCUREMENT_OFFICER", label: "Procurement Officer" },
  { value: "MANAGER", label: "Manager / Approver" },
  { value: "VENDOR", label: "Vendor" },
  { value: "ADMIN", label: "Admin" },
]

export function UserDialog(props: Props) {
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const form = useForm<UserFormInput>({
    defaultValues:
      props.mode === "edit"
        ? {
          name: props.user.name,
          email: props.user.email,
          role: props.user.role,
          vendorId: props.user.vendorId ?? "",
          password: "",
        }
        : {
          name: "",
          email: "",
          role: "PROCUREMENT_OFFICER",
          vendorId: "",
          password: "",
        },
  })

  const role = useWatch({ control: form.control, name: "role" })
  const password = useWatch({ control: form.control, name: "password" })
  const vendorId = useWatch({ control: form.control, name: "vendorId" })

  const onSubmit = (values: UserFormInput) => {
    start(async () => {
      try {
        if (props.mode === "create") {
          await createUser(values)
          toast.success("User created")
        } else {
          await updateUser(props.user.id, values)
          toast.success("User updated")
        }
        setOpen(false)
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          props.mode === "create" ? (
            <Button>
              <IconPlus className="size-4" />
              New user
            </Button>
          ) : (
            <Button size="sm" variant="outline">
              Edit
            </Button>
          )
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.mode === "create" ? "New user" : "Edit user"}
          </DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <Label>Full name</Label>
            <Input {...form.register("name", { required: true })} />
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input type="email" {...form.register("email", { required: true })} />
          </div>
          <div className="space-y-1">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => form.setValue("role", v as Role)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {role === "VENDOR" && (
            <div className="space-y-1">
              <Label>Linked vendor</Label>
              <Select
                value={vendorId || ""}
                onValueChange={(v) => form.setValue("vendorId", v ?? "")}
              >
                <SelectTrigger className="w-full">
                  <span className="flex flex-1 text-left" data-slot="select-value">
                    {vendorId
                      ? props.vendors.find((v) => v.id === vendorId)?.name ?? "Pick a vendor"
                      : <span className="text-muted-foreground">Pick a vendor</span>}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {props.vendors.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1">
            <Label>
              {props.mode === "edit" ? "New password (optional)" : "Password"}
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Type a password or generate one"
                autoComplete="new-password"
                {...form.register("password")}
              />
              {props.mode === "create" && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    form.setValue("password", generatePassword(), { shouldDirty: true })
                  }
                >
                  <IconRefresh className="size-4" />
                  Generate
                </Button>
              )}
            </div>
            {props.mode === "create" && password && (
              <p className="text-xs text-muted-foreground">
                Password will be emailed to the user after creation.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending
                ? "Saving…"
                : props.mode === "create"
                  ? "Create user"
                  : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
