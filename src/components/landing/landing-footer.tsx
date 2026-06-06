import Image from "next/image"
import Link from "next/link"
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react"

export function LandingFooter() {
  return (
    <footer className="bg-zinc-950 text-white relative overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-6 md:px-10 py-14">
        <div className="grid md:grid-cols-12 gap-10 md:gap-6">
          <div className="md:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="VendorBridge"
                width={40}
                height={26}
                className="object-contain"
              />
              <span className="text-lg font-semibold tracking-tight">
                VendorBridge
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/55 leading-relaxed max-w-sm">
              Procurement &amp; Vendor Management ERP. Centralise vendor
              onboarding, RFQs, quotations, approvals, POs and invoices in one
              workspace.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[
                { icon: IconBrandGithub, href: "https://github.com" },
                { icon: IconBrandX, href: "https://x.com" },
                { icon: IconBrandLinkedin, href: "https://linkedin.com" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-9 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <s.icon className="size-4 text-white/80" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-semibold">
              Product
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[
                ["Features", "#features"],
                ["Workflow", "#workflow"],
                ["Customers", "#customers"],
                ["FAQ", "#faq"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-semibold">
              Company
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {["About", "Customers", "Contact", "Careers"].map((label) => (
                <li key={label}>
                  <a
                    href="#"
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/40 font-semibold">
              Get a demo
            </p>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">
              See VendorBridge live with sample procurement data.
            </p>
            <a
              href="#demo"
              className="mt-4 inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-zinc-950 bg-white rounded-full hover:bg-white/90 transition-colors"
            >
              Request demo
            </a>
            <Link
              href="/login"
              className="mt-2 inline-flex items-center justify-center gap-2 w-full px-4 py-2 text-sm font-semibold text-white bg-white/5 ring-1 ring-white/15 rounded-full hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} VendorBridge. All rights reserved.</p>
          <p className="flex items-center gap-4">
            <a href="#" className="hover:text-white/70">Privacy</a>
            <a href="#" className="hover:text-white/70">Terms</a>
            <a href="#" className="hover:text-white/70">Security</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
