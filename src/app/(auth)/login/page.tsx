import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Log in to your VendorBridge workspace
        </p>
      </div>
      <LoginForm />
      <p className="text-sm text-muted-foreground text-center">
        Accounts are created by the admin team.
      </p>
    </div>
  )
}
