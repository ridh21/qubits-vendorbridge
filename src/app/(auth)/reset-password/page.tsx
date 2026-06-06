import Link from "next/link"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

type Props = { searchParams: Promise<{ token?: string }> }

export default async function ResetPasswordPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold">Invalid link</h2>
        <p className="text-sm text-muted-foreground">
          The password reset link is missing or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm underline underline-offset-4 font-medium"
        >
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Reset password</h2>
        <p className="text-sm text-muted-foreground">
          Choose a new password for your account.
        </p>
      </div>
      <ResetPasswordForm token={token} />
    </div>
  )
}
