"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"

export async function getReportsData() {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"])

  // Monthly spend for last 12 months
  const since = new Date()
  since.setMonth(since.getMonth() - 11)
  since.setDate(1)
  since.setHours(0, 0, 0, 0)

  const invoices = await prisma.invoice.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, grandTotal: true, vendorId: true },
  })

  const monthly = new Map<string, number>()
  for (let i = 0; i < 12; i++) {
    const d = new Date(since.getFullYear(), since.getMonth() + i, 1)
    monthly.set(monthKey(d), 0)
  }
  for (const inv of invoices) {
    const key = monthKey(inv.createdAt)
    if (monthly.has(key)) {
      monthly.set(key, (monthly.get(key) ?? 0) + inv.grandTotal)
    }
  }
  const monthlySpend = Array.from(monthly.entries()).map(([month, total]) => ({
    month,
    total,
  }))

  // Spend by vendor (top 10)
  const byVendor = new Map<string, number>()
  for (const inv of invoices) {
    byVendor.set(inv.vendorId, (byVendor.get(inv.vendorId) ?? 0) + inv.grandTotal)
  }
  const vendorIds = Array.from(byVendor.keys())
  const vendors = await prisma.vendor.findMany({
    where: { id: { in: vendorIds } },
    select: { id: true, name: true, category: true, rating: true },
  })
  const vendorMap = new Map(vendors.map((v) => [v.id, v]))

  const spendByVendor = vendorIds
    .map((id) => ({
      vendorId: id,
      name: vendorMap.get(id)?.name ?? "—",
      category: vendorMap.get(id)?.category ?? "—",
      total: byVendor.get(id) ?? 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)

  // Vendor performance (quotation win rate)
  const allQuotations = await prisma.quotation.findMany({
    select: {
      vendorId: true,
      status: true,
      deliveryDays: true,
      submittedAt: true,
      createdAt: true,
    },
  })
  const perfMap = new Map<
    string,
    { submitted: number; awarded: number; deliveryDays: number[] }
  >()
  for (const q of allQuotations) {
    const entry = perfMap.get(q.vendorId) ?? {
      submitted: 0,
      awarded: 0,
      deliveryDays: [],
    }
    if (q.submittedAt) entry.submitted++
    if (q.status === "AWARDED") entry.awarded++
    if (q.deliveryDays > 0) entry.deliveryDays.push(q.deliveryDays)
    perfMap.set(q.vendorId, entry)
  }
  const allVendors = await prisma.vendor.findMany({
    select: { id: true, name: true, category: true, rating: true },
  })
  const performance = allVendors
    .map((v) => {
      const p = perfMap.get(v.id)
      return {
        vendorId: v.id,
        name: v.name,
        category: v.category,
        rating: v.rating,
        submitted: p?.submitted ?? 0,
        awarded: p?.awarded ?? 0,
        winRate: p && p.submitted > 0 ? (p.awarded / p.submitted) * 100 : 0,
        avgDelivery:
          p && p.deliveryDays.length > 0
            ? p.deliveryDays.reduce((a, b) => a + b, 0) / p.deliveryDays.length
            : 0,
      }
    })
    .sort((a, b) => b.winRate - a.winRate)

  // KPIs
  const [rfqCount, awardedCount, approvalCounts] = await Promise.all([
    prisma.rfq.count(),
    prisma.rfq.count({ where: { status: "AWARDED" } }),
    prisma.approval.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ])
  const totalApprovals = approvalCounts.reduce((s, a) => s + a._count.status, 0)
  const rejected =
    approvalCounts.find((a) => a.status === "REJECTED")?._count.status ?? 0
  const rejectionRate = totalApprovals > 0 ? (rejected / totalApprovals) * 100 : 0

  return {
    monthlySpend,
    spendByVendor,
    performance,
    kpis: {
      totalRfqs: rfqCount,
      awardedRfqs: awardedCount,
      awardRate: rfqCount > 0 ? (awardedCount / rfqCount) * 100 : 0,
      approvalRejectionRate: rejectionRate,
    },
  }
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}
