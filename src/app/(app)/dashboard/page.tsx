import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import {
  IconFileText,
  IconChecks,
  IconReceipt,
  IconFileInvoice,
  IconPlus,
  IconBuildingStore,
  IconScale,
  IconClipboardList,
} from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/common/status-badge"
import { getSessionUser, ROLE_LABELS } from "@/lib/rbac"
import { getDashboardData } from "@/lib/actions/dashboard"
import { formatCurrency } from "@/lib/money"

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) return null
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back, {user.name?.split(" ")[0] ?? "there"}.
          </h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {ROLE_LABELS[user.role]}.
          </p>
        </div>
        <QuickActions role={user.role} />
      </div>

      {user.role === "VENDOR" && user.vendorId ? (
        <VendorDashboard data={data as Extract<Data, { role: "VENDOR" }>} />
      ) : (
        <TeamDashboard data={data as Exclude<Data, { role: "VENDOR" }>} />
      )}
    </div>
  )
}

function QuickActions({ role }: { role: string }) {
  const actions = []
  if (role === "ADMIN" || role === "PROCUREMENT_OFFICER") {
    actions.push(
      <Button key="rfq" render={<Link href="/rfqs/new" />}>
        <IconPlus className="size-4" /> New RFQ
      </Button>,
      <Button
        key="vendor"
        variant="outline"
        render={<Link href="/vendors/new" />}
      >
        <IconBuildingStore className="size-4" /> Register vendor
      </Button>,
    )
  }
  if (role === "MANAGER") {
    actions.push(
      <Button key="approvals" render={<Link href="/approvals" />}>
        <IconChecks className="size-4" /> Open approvals
      </Button>,
    )
  }
  if (role === "VENDOR") {
    actions.push(
      <Button key="quotations" render={<Link href="/quotations" />}>
        <IconClipboardList className="size-4" /> My quotations
      </Button>,
    )
  }
  return <div className="flex gap-2">{actions}</div>
}

type Data = Awaited<ReturnType<typeof getDashboardData>>

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof IconFileText
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  )
}

function TeamDashboard({ data }: { data: Exclude<Data, { role: "VENDOR" }> }) {
  const d = data
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={IconScale}
          label="Spend this month"
          value={formatCurrency(d.cards.monthSpend)}
          hint="From sent + paid invoices"
        />
        <StatCard
          icon={IconFileText}
          label="Open RFQs"
          value={d.cards.openRfqs}
        />
        <StatCard
          icon={IconChecks}
          label="Pending approvals"
          value={d.cards.pendingApprovals}
        />
        <StatCard
          icon={IconReceipt}
          label="Active POs"
          value={d.cards.activePOs}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconChecks className="size-4" /> Pending approvals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.topApprovals.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No pending approvals.
              </p>
            )}
            {d.topApprovals.map((a) => (
              <Link
                key={a.id}
                href={`/approvals/${a.id}`}
                className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0 hover:bg-muted/40 -mx-2 px-2 rounded"
              >
                <div>
                  <p className="text-sm font-medium">
                    {a.quotation.rfq.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {a.quotation.vendor.name} · {a.quotation.code}
                  </p>
                </div>
                <p className="text-sm tabular-nums">
                  {formatCurrency(a.quotation.totalAmount)}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileText className="size-4" /> Active RFQs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.activeRfqs.length === 0 && (
              <p className="text-sm text-muted-foreground">No active RFQs.</p>
            )}
            {d.activeRfqs.map((r) => (
              <Link
                key={r.id}
                href={`/rfqs/${r.id}`}
                className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0 hover:bg-muted/40 -mx-2 px-2 rounded"
              >
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {r.code}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Due {formatDistanceToNow(r.deadline, { addSuffix: true })}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconReceipt className="size-4" /> Recent purchase orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.recentPOs.length === 0 && (
              <p className="text-sm text-muted-foreground">No POs yet.</p>
            )}
            {d.recentPOs.map((po) => (
              <Link
                key={po.id}
                href={`/purchase-orders/${po.id}`}
                className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0 hover:bg-muted/40 -mx-2 px-2 rounded"
              >
                <div>
                  <p className="text-sm font-medium">
                    {po.quotation.rfq.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {po.vendor.name} · {po.code}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm tabular-nums">
                    {formatCurrency(po.grandTotal)}
                  </p>
                  <StatusBadge status={po.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileInvoice className="size-4" /> Recent invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {d.recentInvoices.length === 0 && (
              <p className="text-sm text-muted-foreground">No invoices yet.</p>
            )}
            {d.recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0 hover:bg-muted/40 -mx-2 px-2 rounded"
              >
                <div>
                  <p className="text-sm font-medium font-mono">{inv.code}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.vendor.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm tabular-nums">
                    {formatCurrency(inv.grandTotal)}
                  </p>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

function VendorDashboard({ data }: { data: Extract<Data, { role: "VENDOR" }> }) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={IconFileText} label="Invitations" value={data.cards.invitations} />
        <StatCard icon={IconClipboardList} label="Active quotations" value={data.cards.quotations} />
        <StatCard icon={IconReceipt} label="Purchase orders" value={data.cards.pos} />
        <StatCard icon={IconFileInvoice} label="Invoices" value={data.cards.invoices} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My recent invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentRfqs.length === 0 && (
              <p className="text-sm text-muted-foreground">No invitations yet.</p>
            )}
            {data.recentRfqs.map((inv) => (
              <Link
                key={inv.id}
                href={`/rfqs/${inv.rfq.id}`}
                className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0 hover:bg-muted/40 -mx-2 px-2 rounded"
              >
                <div>
                  <p className="text-sm font-medium">{inv.rfq.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {inv.rfq.code}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Due {format(inv.rfq.deadline, "PP")}
                </p>
              </Link>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>My recent invoices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="flex items-center justify-between border-b last:border-b-0 pb-2 last:pb-0 hover:bg-muted/40 -mx-2 px-2 rounded"
              >
                <div>
                  <p className="text-sm font-medium font-mono">{inv.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm tabular-nums">
                    {formatCurrency(inv.grandTotal)}
                  </p>
                  <StatusBadge status={inv.status} />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
