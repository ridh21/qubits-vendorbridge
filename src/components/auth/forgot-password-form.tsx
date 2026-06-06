"use client"

import { useTransition } from "react"
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
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validation/auth"
import { forgotPasswordAction } from "@/lib/actions/auth"

export function ForgotPasswordForm() {
  const [pending, start] = useTransition()
  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = (values: ForgotPasswordInput) => {
    start(async () => {
      const res = await forgotPasswordAction(values)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(res.message ?? "Check your email")
      form.reset()
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </Form>
  )
}
