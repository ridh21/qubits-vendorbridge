"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { IconArrowUpRight, IconCheck, IconLoader2 } from "@tabler/icons-react"

import { FadeUp } from "@/components/landing/motion"
import { submitDemoRequest } from "@/lib/actions/demo-requests"
import {
  demoRequestSchema,
  type DemoRequestInput,
} from "@/lib/validation/demo-request"

const TEAM_SIZES = [
  "Just me",
  "2–10",
  "11–50",
  "51–200",
  "200+",
]

export function CTA() {
  const [done, setDone] = useState(false)
  const [pending, start] = useTransition()
  const form = useForm<DemoRequestInput>({
    resolver: zodResolver(demoRequestSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      teamSize: "",
      message: "",
    },
  })

  const onSubmit = (values: DemoRequestInput) => {
    start(async () => {
      const res = await submitDemoRequest(values)
      if (res.ok) {
        setDone(true)
        toast.success("Thanks — we’ll be in touch shortly.")
        form.reset()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <section id="demo" className="py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white grid md:grid-cols-2">
          <div
            aria-hidden
            className="absolute -top-32 -right-20 size-96 rounded-full blur-3xl"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-32 -left-20 size-96 rounded-full blur-3xl"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />

          <FadeUp className="relative p-10 md:p-14 flex flex-col justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/50 font-semibold">
                Ready when you are
              </p>
              <h2 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight leading-[1.05]">
                Request a demo,
                <br />
                see VendorBridge live.
              </h2>
              <p className="mt-4 text-white/65 text-base md:text-lg max-w-md">
                Tell us about your team and we’ll set up a tailored walkthrough
                of the full procurement flow.
              </p>
            </div>
            <ul className="mt-10 space-y-2 text-sm text-white/70">
              {[
                "30-minute personalised demo",
                "Sample dataset to play with",
                "Pricing tailored to your team size",
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <IconCheck className="size-4 text-white" />
                  {t}
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp delay={0.1} className="relative p-6 md:p-8">
            <div className="rounded-2xl bg-white text-zinc-950 p-6 md:p-8 ring-1 ring-white/10">
              {done ? (
                <div className="py-10 text-center">
                  <span className="inline-flex size-12 rounded-full bg-[#086AA5] text-white items-center justify-center">
                    <IconCheck className="size-6" />
                  </span>
                  <h3 className="mt-4 text-xl font-semibold">
                    You’re on the list.
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 max-w-sm mx-auto">
                    We’ll reach out within one business day to schedule your
                    demo.
                  </p>
                  <button
                    onClick={() => setDone(false)}
                    className="mt-6 text-sm font-medium underline underline-offset-4"
                  >
                    Submit another
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                      Full name
                    </label>
                    <input
                      type="text"
                      autoComplete="name"
                      {...form.register("name")}
                      className="mt-1 w-full px-3 py-2.5 rounded-lg bg-zinc-50 ring-1 ring-zinc-200 focus:ring-[#086AA5] focus:bg-white outline-none transition-all text-sm"
                      placeholder="Ridham Patel"
                    />
                    {form.formState.errors.name && (
                      <p className="mt-1 text-xs text-rose-600">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                      Work email
                    </label>
                    <input
                      type="email"
                      autoComplete="email"
                      {...form.register("email")}
                      className="mt-1 w-full px-3 py-2.5 rounded-lg bg-zinc-50 ring-1 ring-zinc-200 focus:ring-[#086AA5] focus:bg-white outline-none transition-all text-sm"
                      placeholder="you@company.com"
                    />
                    {form.formState.errors.email && (
                      <p className="mt-1 text-xs text-rose-600">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                        Company
                      </label>
                      <input
                        type="text"
                        autoComplete="organization"
                        {...form.register("company")}
                        className="mt-1 w-full px-3 py-2.5 rounded-lg bg-zinc-50 ring-1 ring-zinc-200 focus:ring-[#086AA5] focus:bg-white outline-none transition-all text-sm"
                        placeholder="Acme Steel"
                      />
                      {form.formState.errors.company && (
                        <p className="mt-1 text-xs text-rose-600">
                          {form.formState.errors.company.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                        Team size
                      </label>
                      <select
                        {...form.register("teamSize")}
                        className="mt-1 w-full px-3 py-2.5 rounded-lg bg-zinc-50 ring-1 ring-zinc-200 focus:ring-[#086AA5] focus:bg-white outline-none transition-all text-sm"
                      >
                        <option value="">Select…</option>
                        {TEAM_SIZES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
                      What problem are you solving?{" "}
                      <span className="text-zinc-400 normal-case">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      rows={3}
                      {...form.register("message")}
                      className="mt-1 w-full px-3 py-2.5 rounded-lg bg-zinc-50 ring-1 ring-zinc-200 focus:ring-[#086AA5] focus:bg-white outline-none transition-all text-sm resize-none"
                      placeholder="A few words about your procurement workflow…"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pending}
                    className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white rounded-full bg-[#086AA5] hover:bg-[#075a8e] transition-colors disabled:opacity-60"
                  >
                    {pending ? (
                      <>
                        <IconLoader2 className="size-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        Request demo
                        <IconArrowUpRight className="size-4 group-hover:rotate-45 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-zinc-500 text-center">
                    No credit card. We respond within one business day.
                  </p>
                </form>
              )}
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
