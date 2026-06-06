import Image from "next/image"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden bg-zinc-50"
      style={{
        background:
          "radial-gradient(1100px 600px at 50% -10%, rgba(0,0,0,0.06), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(0,0,0,0.04), transparent 60%), #fafafa",
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-zinc-950"
        >
          <Image
            src="/logo.png"
            alt="VendorBridge"
            width={40}
            height={26}
            className="object-contain"
            priority
          />
          <span className="text-lg tracking-tight">VendorBridge</span>
        </Link>
        <p className="hidden sm:block text-xs text-zinc-500 uppercase tracking-[0.18em]">
          Procurement ERP
        </p>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white/85 backdrop-blur-xl shadow-[0_1px_2px_rgba(0,0,0,0.04),0_20px_50px_-20px_rgba(0,0,0,0.18)] ring-1 ring-zinc-200 p-8 sm:p-10">
            {children}
          </div>
          <p className="mt-6 text-center text-xs text-zinc-500">
            VendorBridge centralises vendors, RFQs, approvals, POs and invoices —
            all in one workspace.
          </p>
        </div>
      </main>

      <footer className="relative z-10 px-6 py-4 md:px-10 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
        <span>© {new Date().getFullYear()} VendorBridge</span>
        <span className="flex items-center gap-4">
          <Link href="/login" className="hover:text-zinc-950">
            Sign in
          </Link>
          <Link href="/forgot-password" className="hover:text-zinc-950">
            Forgot password
          </Link>
        </span>
      </footer>
    </div>
  )
}
