"use client"

import { FadeUp, StaggerGroup, StaggerItem } from "@/components/landing/motion"

type TeamMember = {
  name: string
  title: string
  photo: string
  linkedin: string
  github: string
  bio: string
  accent: string
}

const TEAM: TeamMember[] = [
  {
    name: "Ridham Patel",
    title: "Cloud · Architecture · DevOps",
    photo: "/team/ridham.jpg",
    linkedin: "https://www.linkedin.com/in/ridhampatel2k4/",
    github: "https://github.com/ridh21",
    bio: "Owns the cloud topology and the server actions behind every mutation. Decides how Prisma, NextAuth, and the WebSocket hub actually talk to each other.",
    accent: "from-[#086AA5] to-[#3B86B0]",
  },
  {
    name: "Hemant Pande",
    title: "Schema · Integrations",
    photo: "/team/hemant.jpg",
    linkedin: "https://www.linkedin.com/in/hemant-pande926591/",
    github: "https://github.com/HEMANT-PANDE",
    bio: "Designs the Prisma schema and the NextAuth wiring behind every user. Owns the webhook contract between the app, the WS hub, and the email pipeline.",
    accent: "from-[#0D2A41] to-[#086AA5]",
  },
  {
    name: "Hetvi Hinsu",
    title: "QA · Documentation",
    photo: "/team/hetvi.jpg",
    linkedin: "https://www.linkedin.com/in/hetvi-hinsu-4a87aa288/",
    github: "https://github.com/Hetvi-css",
    bio: "Finds the edge cases before users do, then writes the docs that prevent the next one. Owns the QA pass on every PR and the README section you'll actually read.",
    accent: "from-[#3B86B0] to-[#0D2A41]",
  },
  {
    name: "Honey Modha",
    title: "UI/UX · Frontend",
    photo: "/team/honey.jpg",
    linkedin: "https://www.linkedin.com/in/honey-modha/",
    github: "https://github.com/honeymodha",
    bio: "Designs the components you tap and the animations you feel. Owns the shadcn/ui layer, the Tailwind tokens, and the landing page you'll land on.",
    accent: "from-[#086AA5] to-[#0D2A41]",
  },
]

export function Team() {
  return (
    <section
      id="team"
      className="relative overflow-hidden py-24 md:py-32 border-y border-zinc-200/70"
    >
      {/* Background: layered radial glows + dot grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#f6fafd] to-white"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(8,106,165,0.18), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(13,42,65,0.12) 1px, transparent 0)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 40%, transparent 75%)",
        }}
      />

      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <FadeUp className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 backdrop-blur px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-700 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-[#086AA5] opacity-60" />
              <span className="relative inline-flex size-1.5 rounded-full bg-[#086AA5]" />
            </span>
            The Team
          </span>
          <h2 className="mt-5 text-4xl md:text-5xl tracking-tight text-zinc-950 font-semibold leading-[1.05]">
            Meet the team behind{" "}
            <span className="bg-gradient-to-r from-[#086AA5] to-[#0D2A41] bg-clip-text text-transparent">
              VendorBridge.
            </span>
          </h2>
          <p className="mt-4 text-zinc-600 text-base md:text-[17px] leading-relaxed">
            Four engineers. One product. From the database schema to the last
            pixel — every line of VendorBridge is handcrafted.
          </p>
        </FadeUp>

        <StaggerGroup
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
          stagger={0.08}
        >
          {TEAM.map((m) => (
            <StaggerItem key={m.name}>
              <article className="group relative h-full overflow-hidden rounded-2xl bg-white ring-1 ring-zinc-200/80 shadow-[0_1px_0_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_48px_-24px_rgba(8,106,165,0.35)] hover:ring-[#086AA5]/40">
                {/* Top accent strip — gradient line */}
                <div
                  aria-hidden
                  className={`h-1 w-full bg-gradient-to-r ${m.accent}`}
                />

                <div className="p-6 md:p-7">
                  {/* Avatar with gradient ring */}
                  <div className="relative mx-auto size-28 md:size-32">
                    <div
                      aria-hidden
                      className={`absolute -inset-1 rounded-full bg-gradient-to-br ${m.accent} opacity-90 blur-[1px]`}
                    />
                    <div className="relative h-full w-full overflow-hidden rounded-full ring-[3px] ring-white shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.photo}
                        alt={`${m.name} — ${m.title}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover object-[center_22%] transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Name & title */}
                  <div className="mt-5 text-center">
                    <h3 className="text-zinc-950 font-semibold text-lg leading-tight">
                      {m.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-[#086AA5]">
                      {m.title}
                    </p>
                  </div>

                  {/* Bio */}
                  <p className="mt-3 text-center text-sm text-zinc-600 leading-relaxed">
                    {m.bio}
                  </p>

                  {/* Divider */}
                  <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

                  {/* Social logos */}
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} on LinkedIn`}
                      className="inline-flex size-10 items-center justify-center rounded-full bg-white ring-1 ring-zinc-200 transition-all hover:scale-110 hover:ring-[#086AA5]/60 hover:shadow-[0_8px_20px_-8px_rgba(8,106,165,0.5)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/social/linkedin.png"
                        alt=""
                        className="size-5"
                      />
                    </a>
                    <a
                      href={m.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${m.name} on GitHub`}
                      className="inline-flex size-10 items-center justify-center rounded-full bg-white ring-1 ring-zinc-200 transition-all hover:scale-110 hover:ring-zinc-950/40 hover:shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/social/github.png"
                        alt=""
                        className="size-5"
                      />
                    </a>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  )
}
