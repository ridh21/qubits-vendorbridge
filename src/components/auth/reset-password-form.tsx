"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validation/auth"
import { resetPasswordAction } from "@/lib/actions/auth"

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" },
  })

  const onSubmit = (values: ResetPasswordInput) => {
    start(async () => {
      const res = await resetPasswordAction(values)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(res.message ?? "Password updated")
      router.push("/login")
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Form>
  )
}
