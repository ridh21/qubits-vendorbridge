"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"

export type Granularity = "day" | "week" | "month" | "quarter"

export type ReportsFilters = {
  from?: string // YYYY-MM-DD
  to?: string // YYYY-MM-DD
  granularity?: Granularity
}

export type ReportsData = Awaited<ReturnType<typeof getReportsData>>

const DAY = 86_400_000

function parseFilters(input: ReportsFilters) {
  const granularity: Granularity = input.granularity ?? "month"

  let to = input.to ? new Date(input.to) : new Date()
  if (isNaN(to.getTime())) to = new Date()
  to.setHours(23, 59, 59, 999)

  let from = input.from ? new Date(input.from) : null
  if (!from || isNaN(from.getTime())) {
    from = new Date(to)
    from.setMonth(from.getMonth() - 11)
    from.setDate(1)
  }
  from.setHours(0, 0, 0, 0)

  return { from, to, granularity }
}

function bucketKey(d: Date, granularity: Granularity): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  switch (granularity) {
    case "day":
      return `${y}-${m}-${String(d.getDate()).padStart(2, "0")}`
    case "week": {
      // ISO week: Monday-start.
      const tmp = new Date(d)
      const day = (tmp.getDay() + 6) % 7 // 0 = Monday
      tmp.setDate(tmp.getDate() - day)
      return `${tmp.getFullYear()}-${String(tmp.getMonth() + 1).padStart(2, "0")}-${String(tmp.getDate()).padStart(2, "0")}`
    }
    case "month":
      return `${y}-${m}`
    case "quarter":
      return `${y}-Q${Math.floor(d.getMonth() / 3) + 1}`
  }
}

function* bucketsBetween(
  from: Date,
  to: Date,
  granularity: Granularity,
): Generator<{ key: string; label: string; start: Date }> {
  const cursor = new Date(from)
  cursor.setHours(0, 0, 0, 0)
  while (cursor <= to) {
    const key = bucketKey(cursor, granularity)
    const label = labelFor(cursor, granularity)
    yield { key, label, start: new Date(cursor) }
    switch (granularity) {
      case "day":
        cursor.setDate(cursor.getDate() + 1)
        break
      case "week":
        cursor.setDate(cursor.getDate() + 7)
        break
      case "month":
        cursor.setMonth(cursor.getMonth() + 1)
        break
      case "quarter":
        cursor.setMonth(cursor.getMonth() + 3)
        break
    }
  }
}

function labelFor(d: Date, granularity: Granularity) {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]
  switch (granularity) {
    case "day":
      return `${d.getDate()} ${months[d.getMonth()]}`
    case "week":
      return `W of ${d.getDate()} ${months[d.getMonth()]}`
    case "month":
      return `${months[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`
    case "quarter":
      return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`
  }
}

export async function getReportsData(rawFilters: ReportsFilters = {}) {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"])

  const { from, to, granularity } = parseFilters(rawFilters)

  const [invoices, allQuotations, rfqs, awardedRfqs, approvalCounts, allVendors] =
    await Promise.all([
      prisma.invoice.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: {
          createdAt: true,
          grandTotal: true,
          vendorId: true,
          status: true,
          vendor: { select: { name: true, category: true } },
        },
      }),
      prisma.quotation.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: {
          vendorId: true,
          status: true,
          deliveryDays: true,
          submittedAt: true,
          createdAt: true,
          rfq: { select: { createdAt: true, status: true } },
        },
      }),
      prisma.rfq.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: { id: true, status: true, createdAt: true, updatedAt: true },
      }),
      prisma.rfq.findMany({
        where: { createdAt: { gte: from, lte: to }, status: "AWARDED" },
        select: { createdAt: true, updatedAt: true },
      }),
      prisma.approval.groupBy({
        by: ["status"],
        where: { createdAt: { gte: from, lte: to } },
        _count: { status: true },
      }),
      prisma.vendor.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          rating: true,
          status: true,
        },
      }),
    ])

  // ───────── Time series — spend + RFQ + invoice counts per bucket ─────────
  const buckets = Array.from(bucketsBetween(from, to, granularity))
  const seriesMap = new Map(
    buckets.map((b) => [
      b.key,
      { bucket: b.key, label: b.label, spend: 0, invoices: 0, rfqs: 0 },
    ]),
  )

  for (const inv of invoices) {
    const k = bucketKey(inv.createdAt, granularity)
    const row = seriesMap.get(k)
    if (row) {
      row.spend += inv.grandTotal
      row.invoices += 1
    }
  }
  for (const r of rfqs) {
    const k = bucketKey(r.createdAt, granularity)
    const row = seriesMap.get(k)
    if (row) row.rfqs += 1
  }
  const timeSeries = Array.from(seriesMap.values())

  // ───────── Spend by vendor (top 10) ─────────
  const byVendor = new Map<string, { name: string; total: number }>()
  for (const inv of invoices) {
    const cur = byVendor.get(inv.vendorId) ?? {
      name: inv.vendor.name,
      total: 0,
    }
    cur.total += inv.grandTotal
    byVendor.set(inv.vendorId, cur)
  }
  const spendByVendor = Array.from(byVendor.entries())
    .map(([id, v]) => ({ vendorId: id, name: v.name, total: v.total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // ───────── Spend by category ─────────
  const byCategory = new Map<string, number>()
  for (const inv of invoices) {
    const cat = inv.vendor.category || "Uncategorised"
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + inv.grandTotal)
  }
  const spendByCategory = Array.from(byCategory.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)

  // ───────── Vendor performance ─────────
  type Perf = {
    submitted: number
    awarded: number
    deliveryDays: number[]
    responseDays: number[]
  }
  const perfMap = new Map<string, Perf>()
  for (const q of allQuotations) {
    const e =
      perfMap.get(q.vendorId) ??
      ({ submitted: 0, awarded: 0, deliveryDays: [], responseDays: [] } as Perf)
    if (q.submittedAt) {
      e.submitted++
      const ms = q.submittedAt.getTime() - q.rfq.createdAt.getTime()
      if (ms > 0) e.responseDays.push(ms / DAY)
    }
    if (q.status === "AWARDED") e.awarded++
    if (q.deliveryDays > 0) e.deliveryDays.push(q.deliveryDays)
    perfMap.set(q.vendorId, e)
  }
  const performance = allVendors
    .map((v) => {
      const p = perfMap.get(v.id)
      const avg = (arr: number[]) =>
        arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
      return {
        vendorId: v.id,
        name: v.name,
        category: v.category,
        rating: v.rating,
        submitted: p?.submitted ?? 0,
        awarded: p?.awarded ?? 0,
        winRate: p && p.submitted > 0 ? (p.awarded / p.submitted) * 100 : 0,
        avgDelivery: avg(p?.deliveryDays ?? []),
        avgResponse: avg(p?.responseDays ?? []),
      }
    })
    .sort((a, b) => b.winRate - a.winRate || b.submitted - a.submitted)

  // ───────── KPIs ─────────
  const totalSpend = invoices.reduce((s, i) => s + i.grandTotal, 0)
  const invoiceCount = invoices.length
  const totalRfqs = rfqs.length
  const awardedCount = awardedRfqs.length
  const activeVendorIds = new Set(invoices.map((i) => i.vendorId))
  const activeVendors = activeVendorIds.size

  // Average cycle: RFQ.createdAt → updatedAt for AWARDED status (assumes status flip touches updatedAt)
  const cycleSamples = awardedRfqs
    .map((r) => (r.updatedAt.getTime() - r.createdAt.getTime()) / DAY)
    .filter((d) => d >= 0)
  const avgCycleDays =
    cycleSamples.length > 0
      ? cycleSamples.reduce((a, b) => a + b, 0) / cycleSamples.length
      : 0

  const totalApprovals = approvalCounts.reduce(
    (s, a) => s + a._count.status,
    0,
  )
  const rejected =
    approvalCounts.find((a) => a.status === "REJECTED")?._count.status ?? 0
  const approvalRejectionRate =
    totalApprovals > 0 ? (rejected / totalApprovals) * 100 : 0

  return {
    range: {
      from: from.toISOString().slice(0, 10),
      to: to.toISOString().slice(0, 10),
      granularity,
    },
    timeSeries,
    spendByVendor,
    spendByCategory,
    performance,
    kpis: {
      totalSpend,
      invoiceCount,
      activeVendors,
      totalRfqs,
      awardedRfqs: awardedCount,
      awardRate: totalRfqs > 0 ? (awardedCount / totalRfqs) * 100 : 0,
      approvalRejectionRate,
      avgCycleDays,
    },
  }
}
