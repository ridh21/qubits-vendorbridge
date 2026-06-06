import { format, formatDistanceToNow } from "date-fns"
import { IconCheck, IconClockHour4, IconX } from "@tabler/icons-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  PROCUREMENT_OFFICER: "Procurement Officer",
  MANAGER: "Manager",
  VENDOR: "Vendor",
}

const STAGES = [
  { key: "submitted", label: "Submitted", actions: ["submitted"] },
  { key: "shortlisted", label: "Shortlisted", actions: ["shortlisted"] },
  { key: "requested", label: "Sent for approval", actions: ["requested"] },
  {
    key: "decided",
    label: "Decision",
    actions: ["approved", "rejected"],
  },
] as const

type Activity = {
  id: string
  action: string
  message: string
  actorRole: string | null
  createdAt: Date
  user: { name: string | null; vendor: { name: string } | null } | null
}

export function ApprovalTimeline({
  entries,
  decision,
}: {
  entries: Activity[]
  decision: "PENDING" | "APPROVED" | "REJECTED"
}) {
  // Find the latest entry per stage.
  const byStage = new Map<string, Activity>()
  for (const e of entries) {
    for (const s of STAGES) {
      if ((s.actions as readonly string[]).includes(e.action)) {
        byStage.set(s.key, e) // keep the latest because entries are asc-ordered
      }
    }
  }

  // Furthest-reached stage index drives "active" state.
  let reached = -1
  STAGES.forEach((s, i) => {
    if (byStage.has(s.key)) reached = i
  })

  const decisionEntry = byStage.get("decided")
  const rejected = decisionEntry?.action === "rejected" || decision === "REJECTED"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stepper */}
        <div className="relative">
          {/* base rail */}
          <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-200 -z-0" />
          {/* progress rail */}
          <div
            className="absolute left-4 top-4 h-0.5 -z-0 transition-all"
            style={{
              width:
                reached <= 0
                  ? "0%"
                  : `calc((100% - 2rem) * ${reached / (STAGES.length - 1)})`,
              background: rejected ? "#e11d48" : "#1F88C9",
            }}
          />
          <ol className="relative z-10 grid grid-cols-4 gap-2">
            {STAGES.map((s, i) => {
              const entry = byStage.get(s.key)
              const isCompleted = i < reached || (i === reached && s.key !== "decided")
              const isCurrent = i === reached
              const isDecisionStage = s.key === "decided"
              const showAsRejected = isDecisionStage && rejected && entry
              const showAsApproved = isDecisionStage && entry && !rejected
              const dotBg = !entry
                ? "#e2e8f0"
                : showAsRejected
                ? "#e11d48"
                : "#1F88C9"
              const dotRing = !entry ? "ring-slate-200" : ""
              return (
                <li
                  key={s.key}
                  className="flex flex-col items-center text-center"
                >
                  <span
                    className={`size-8 rounded-full flex items-center justify-center text-white ring-4 ring-white shadow-sm ${dotRing}`}
                    style={{ background: dotBg }}
                  >
                    {entry ? (
                      showAsRejected ? (
                        <IconX className="size-4" />
                      ) : (
                        <IconCheck className="size-4" />
                      )
                    ) : (
                      <IconClockHour4 className="size-4 text-slate-500" />
                    )}
                  </span>
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      entry ? "text-[#0D2A41]" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {entry
                      ? formatDistanceToNow(entry.createdAt, { addSuffix: true })
                      : isCurrent
                      ? "Pending"
                      : "—"}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>

        {/* Details list */}
        <div className="border-t pt-5">
          <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-3">
            Activity
          </p>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {entries.map((t) => {
                const actorName = t.user?.name ?? "System"
                const orgName = t.user?.vendor?.name
                const roleLabel = t.actorRole ? ROLE_LABEL[t.actorRole] : null
                const actorSub = orgName ?? roleLabel ?? null
                const stage = STAGES.find((s) =>
                  (s.actions as readonly string[]).includes(t.action),
                )
                const isRejection = t.action === "rejected"
                const accent = isRejection ? "#e11d48" : "#1F88C9"
                return (
                  <li
                    key={t.id}
                    className="flex items-start gap-3 rounded-lg p-3 bg-slate-50/60 ring-1 ring-slate-200"
                  >
                    <span
                      className="mt-1 size-2 rounded-full shrink-0"
                      style={{ background: accent }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <p className="text-sm font-medium text-[#0D2A41] leading-snug">
                          {t.message}
                        </p>
                        <span className="text-[11px] text-slate-500 shrink-0 whitespace-nowrap">
                          {format(t.createdAt, "PP, p")}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 flex-wrap text-xs">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
                          style={{ background: "#eef4fb", color: "#0D2A41" }}
                        >
                          <span
                            className="size-1.5 rounded-full"
                            style={{ background: accent }}
                          />
                          {actorName}
                          {actorSub && (
                            <span className="text-[#0D2A41]/60">
                              · {actorSub}
                            </span>
                          )}
                        </span>
                        {stage && (
                          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                            {stage.label}
                          </span>
                        )}
                        <span className="text-slate-400">
                          ({formatDistanceToNow(t.createdAt, { addSuffix: true })})
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
