import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const abcDiatype = localFont({
  src: [
    {
      path: "../../public/fonts/ABCDiatype-Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/ABCDiatype-Light.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/ABCDiatype-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/ABCDiatype-Medium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/ABCDiatype-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "VendorBridge — Procurement & Vendor Management ERP",
  description:
    "Centralise vendor onboarding, RFQs, quotations, approvals, purchase orders, and invoices.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", abcDiatype.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors closeButton position="top-right" />
      </body>
    </html>
  )
}
