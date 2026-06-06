import Link from "next/link"
import { IconBuildingStore } from "@tabler/icons-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <IconBuildingStore className="size-5" />
          VendorBridge
        </Link>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Procurement, simplified.
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Manage vendors, run RFQs, compare quotations, approve purchases, and
            ship invoices — all from a single workspace.
          </p>
        </div>
        <p className="text-xs text-zinc-500">
          © {new Date().getFullYear()} VendorBridge
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
