"use server"

import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/rbac"

export async function getDashboardData() {
  const user = await requireUser()

  if (user.role === "VENDOR") {
    if (!user.vendorId) {
      return {
        role: user.role,
        cards: { invitations: 0, quotations: 0, pos: 0, invoices: 0 },
        recentRfqs: [],
        recentInvoices: [],
      }
    }

    const [invitations, quotations, pos, invoices] = await Promise.all([
      prisma.rfqVendor.count({ where: { vendorId: user.vendorId } }),
      prisma.quotation.count({
        where: { vendorId: user.vendorId, status: { in: ["SUBMITTED", "SHORTLISTED"] } },
      }),
      prisma.purchaseOrder.count({ where: { vendorId: user.vendorId } }),
      prisma.invoice.count({ where: { vendorId: user.vendorId } }),
    ])

    const [recentRfqs, recentInvoices] = await Promise.all([
      prisma.rfqVendor.findMany({
        where: { vendorId: user.vendorId },
        orderBy: { invitedAt: "desc" },
        take: 5,
        include: {
          rfq: { select: { id: true, code: true, title: true, deadline: true, status: true } },
        },
      }),
      prisma.invoice.findMany({
        where: { vendorId: user.vendorId },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ])

    return {
      role: user.role,
      cards: { invitations, quotations, pos, invoices },
      recentRfqs,
      recentInvoices,
    }
  }

  const [openRfqs, pendingApprovals, activePOs, invoicesSent, spendAgg] =
    await Promise.all([
      prisma.rfq.count({ where: { status: "OPEN" } }),
      prisma.approval.count({ where: { status: "PENDING" } }),
      prisma.purchaseOrder.count({ where: { status: "ISSUED" } }),
      prisma.invoice.count({ where: { status: { in: ["SENT", "PAID"] } } }),
      prisma.invoice.aggregate({
        where: {
          status: { in: ["SENT", "PAID"] },
          createdAt: { gte: startOfMonth() },
        },
        _sum: { grandTotal: true },
      }),
    ])

  const [topApprovals, recentPOs, recentInvoices, activeRfqs] = await Promise.all([
    prisma.approval.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        quotation: {
          include: {
            vendor: { select: { name: true } },
            rfq: { select: { id: true, code: true, title: true } },
          },
        },
      },
    }),
    prisma.purchaseOrder.findMany({
      orderBy: { issuedAt: "desc" },
      take: 5,
      include: {
        vendor: { select: { name: true } },
        quotation: { include: { rfq: { select: { title: true } } } },
      },
    }),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { vendor: { select: { name: true } } },
    }),
    prisma.rfq.findMany({
      where: { status: "OPEN" },
      orderBy: { deadline: "asc" },
      take: 5,
    }),
  ])

  return {
    role: user.role,
    cards: {
      openRfqs,
      pendingApprovals,
      activePOs,
      invoicesSent,
      monthSpend: spendAgg._sum.grandTotal ?? 0,
    },
    topApprovals,
    recentPOs,
    recentInvoices,
    activeRfqs,
  }
}

function startOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1)
}
