"use client"

import { useMemo, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { format, differenceInDays } from "date-fns"
import {
  IconCalendarEvent,
  IconChevronDown,
  IconLoader2,
} from "@tabler/icons-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import type { Granularity } from "@/lib/actions/reports"

type Props = {
  from: string
  to: string
  granularity: Granularity
}

const GRANULARITY_OPTIONS: { label: string; value: Granularity }[] = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
  { label: "Quarter", value: "quarter" },
]

type Preset = { label: string; build: () => { from: Date; to: Date } }

const PRESETS: Preset[] = [
  {
    label: "Last 7 days",
    build: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 6)
      return { from, to }
    },
  },
  {
    label: "Last 30 days",
    build: () => {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - 29)
      return { from, to }
    },
  },
  {
    label: "Last 3 months",
    build: () => {
      const to = new Date()
      const from = new Date()
      from.setMonth(from.getMonth() - 2)
      from.setDate(1)
      return { from, to }
    },
  },
  {
    label: "Last 6 months",
    build: () => {
      const to = new Date()
      const from = new Date()
      from.setMonth(from.getMonth() - 5)
      from.setDate(1)
      return { from, to }
    },
  },
  {
    label: "Last 12 months",
    build: () => {
      const to = new Date()
      const from = new Date()
      from.setMonth(from.getMonth() - 11)
      from.setDate(1)
      return { from, to }
    },
  },
  {
    label: "Year to date",
    build: () => {
      const to = new Date()
      const from = new Date(to.getFullYear(), 0, 1)
      return { from, to }
    },
  },
  {
    label: "All time",
    build: () => {
      const to = new Date()
      const from = new Date(2024, 0, 1)
      return { from, to }
    },
  },
]

function fmtParam(d: Date) {
  return d.toISOString().slice(0, 10)
}

function presetLabelFor(from: string, to: string): string | null {
  for (const p of PRESETS) {
    const built = p.build()
    if (fmtParam(built.from) === from && fmtParam(built.to) === to) {
      return p.label
    }
  }
  return null
}

export function ReportsFilters({ from, to, granularity }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [pending, start] = useTransition()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>({
    from: new Date(from),
    to: new Date(to),
  })

  const push = (next: { from?: Date; to?: Date; granularity?: Granularity }) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next.from) params.set("from", fmtParam(next.from))
    if (next.to) params.set("to", fmtParam(next.to))
    if (next.granularity) params.set("granularity", next.granularity)
    start(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const applyPreset = (preset: Preset) => {
    const r = preset.build()
    setDraft({ from: r.from, to: r.to })
    push(r)
    setOpen(false)
  }

  const applyDraft = () => {
    if (draft?.from && draft?.to) {
      push({ from: draft.from, to: draft.to })
      setOpen(false)
    }
  }

  const fromDate = new Date(from)
  const toDate = new Date(to)
  const daysSpan = differenceInDays(toDate, fromDate) + 1
  const activePresetLabel = useMemo(
    () => presetLabelFor(from, to),
    [from, to],
  )
  const displayLabel = activePresetLabel ?? "Custom range"

  return (
    <div className="mb-5 flex items-center justify-between gap-3 flex-wrap rounded-xl border border-border bg-card/60 p-2 shadow-sm">
      {/* Left — date range trigger */}
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (o) {
            setDraft({ from: new Date(from), to: new Date(to) })
          }
        }}
      >
        <PopoverTrigger
          render={
            <button
              type="button"
              disabled={pending}
              className="group flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors disabled:opacity-60"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-[#086AA5]/10 text-[#086AA5]">
                <IconCalendarEvent className="size-4" />
              </span>
              <span className="flex flex-col items-start text-left leading-tight">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
                  {displayLabel}
                </span>
                <span className="text-sm font-semibold text-foreground tabular-nums">
                  {format(fromDate, "d MMM yyyy")}
                  <span className="text-muted-foreground mx-1.5">→</span>
                  {format(toDate, "d MMM yyyy")}
                </span>
              </span>
              <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {daysSpan} day{daysSpan === 1 ? "" : "s"}
              </span>
              <IconChevronDown className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          }
        />
        <PopoverContent
          align="start"
          className="w-auto p-0 max-w-[min(720px,calc(100vw-2rem))]"
        >
          <div className="flex flex-col md:flex-row">
            {/* Preset rail */}
            <div className="md:w-44 md:border-r border-b md:border-b-0 bg-muted/30 p-2">
              <p className="px-2 py-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-semibold">
                Quick ranges
              </p>
              <ul className="space-y-0.5">
                {PRESETS.map((p) => {
                  const built = p.build()
                  const isActive =
                    fmtParam(built.from) === from && fmtParam(built.to) === to
                  return (
                    <li key={p.label}>
                      <button
                        type="button"
                        onClick={() => applyPreset(p)}
                        className={`w-full text-left rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                          isActive
                            ? "bg-[#086AA5] text-white"
                            : "hover:bg-background text-foreground"
                        }`}
                      >
                        {p.label}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Calendar */}
            <div className="flex flex-col">
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={draft}
                onSelect={setDraft}
                defaultMonth={draft?.from ?? new Date()}
                className="p-3"
              />
              <div className="flex items-center justify-between gap-2 border-t p-3">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {draft?.from
                    ? format(draft.from, "d MMM yyyy")
                    : "Pick start"}
                  <span className="mx-1.5">→</span>
                  {draft?.to ? format(draft.to, "d MMM yyyy") : "Pick end"}
                </span>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyDraft}
                    disabled={!draft?.from || !draft?.to}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Right — granularity segmented + loading indicator */}
      <div className="flex items-center gap-3">
        {pending && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <IconLoader2 className="size-3.5 animate-spin" />
            Updating…
          </span>
        )}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-semibold">
            Group by
          </span>
          <div className="inline-flex items-center rounded-lg bg-muted p-0.5">
            {GRANULARITY_OPTIONS.map((g) => {
              const isActive = g.value === granularity
              return (
                <button
                  key={g.value}
                  onClick={() => push({ granularity: g.value })}
                  disabled={pending}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {g.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
