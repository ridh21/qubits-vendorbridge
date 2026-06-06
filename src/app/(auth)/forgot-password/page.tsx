import Link from "next/link"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Forgot password</h2>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you a link to reset it.
        </p>
      </div>
      <ForgotPasswordForm />
      <p className="text-sm text-muted-foreground text-center">
        <Link href="/login" className="underline underline-offset-4 font-medium">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
