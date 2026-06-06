import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/rbac"
import { GlassNav } from "@/components/landing/glass-nav"
import { Hero } from "@/components/landing/hero"
import { Marquee } from "@/components/landing/marquee"
import { FeaturesBento } from "@/components/landing/features-bento"
import { Workflow } from "@/components/landing/workflow"
import { FAQ } from "@/components/landing/faq"
import { CTA } from "@/components/landing/cta"
import { LandingFooter } from "@/components/landing/landing-footer"

export default async function LandingPage() {
  const user = await getSessionUser()
  if (user) redirect("/dashboard")

  return (
    <div className="flex flex-col min-h-screen bg-[#f6f9fc]">
      <GlassNav />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <FeaturesBento />
        <Workflow />
        <FAQ />
        <CTA />
      </main>
      <LandingFooter />
    </div>
  )
}
