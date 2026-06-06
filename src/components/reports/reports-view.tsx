"use client"

import { IconDownload } from "@tabler/icons-react"
import { format } from "date-fns"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fromPaise } from "@/lib/money"
import { toCsv, downloadCsv } from "@/lib/csv"

type Data = {
  monthlySpend: { month: string; total: number }[]
  spendByVendor: { vendorId: string; name: string; category: string; total: number }[]
  performance: {
    vendorId: string
    name: string
    category: string
    rating: number
    submitted: number
    awarded: number
    winRate: number
    avgDelivery: number
  }[]
  kpis: {
    totalRfqs: number
    awardedRfqs: number
    awardRate: number
    approvalRejectionRate: number
  }
}

const PIE_COLORS = [
  "#6366f1",
  "#22c55e",
  "#f97316",
  "#ef4444",
  "#06b6d4",
  "#a855f7",
  "#eab308",
  "#10b981",
  "#f43f5e",
  "#3b82f6",
]

const monthlyConfig = {
  total: { label: "Spend", color: "#6366f1" },
} satisfies ChartConfig

const vendorConfig = {
  total: { label: "Spend", color: "#22c55e" },
} satisfies ChartConfig

export function ReportsView({ data }: { data: Data }) {
  const monthlySeries = data.monthlySpend.map((m) => ({
    month: format(new Date(`${m.month}-01`), "MMM"),
    total: fromPaise(m.total),
  }))
  const vendorPie = data.spendByVendor.map((v) => ({
    name: v.name,
    value: fromPaise(v.total),
  }))

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total RFQs" value={data.kpis.totalRfqs} />
        <Kpi label="Awarded RFQs" value={data.kpis.awardedRfqs} />
        <Kpi label="Award rate" value={`${data.kpis.awardRate.toFixed(1)}%`} />
        <Kpi
          label="Approval rejection rate"
          value={`${data.kpis.approvalRejectionRate.toFixed(1)}%`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Monthly procurement spend</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                downloadCsv(
                  "monthly-spend.csv",
                  toCsv(
                    data.monthlySpend.map((m) => ({
                      month: m.month,
                      total_inr: fromPaise(m.total),
                    })),
                  ),
                )
              }
            >
              <IconDownload className="size-4" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyConfig} className="h-64 w-full">
              <BarChart data={monthlySeries}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={50} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Spend by vendor (top 10)</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                downloadCsv(
                  "spend-by-vendor.csv",
                  toCsv(
                    data.spendByVendor.map((v) => ({
                      vendor: v.name,
                      category: v.category,
                      total_inr: fromPaise(v.total),
                    })),
                  ),
                )
              }
            >
              <IconDownload className="size-4" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            {vendorPie.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No spend yet.
              </p>
            ) : (
              <ChartContainer config={vendorConfig} className="h-64 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={vendorPie}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                  >
                    {vendorPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendor performance</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              downloadCsv(
                "vendor-performance.csv",
                toCsv(
                  data.performance.map((p) => ({
                    vendor: p.name,
                    category: p.category,
                    rating: p.rating,
                    submitted: p.submitted,
                    awarded: p.awarded,
                    win_rate_pct: p.winRate.toFixed(1),
                    avg_delivery_days: p.avgDelivery.toFixed(1),
                  })),
                ),
              )
            }
          >
            <IconDownload className="size-4" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Quotations</TableHead>
                <TableHead className="text-right">Awarded</TableHead>
                <TableHead className="text-right">Win rate</TableHead>
                <TableHead className="text-right">Avg delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.performance.map((p) => (
                <TableRow key={p.vendorId}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right">{p.rating.toFixed(1)}</TableCell>
                  <TableCell className="text-right">{p.submitted}</TableCell>
                  <TableCell className="text-right">{p.awarded}</TableCell>
                  <TableCell className="text-right">{p.winRate.toFixed(0)}%</TableCell>
                  <TableCell className="text-right">{p.avgDelivery.toFixed(1)} d</TableCell>
                </TableRow>
              ))}
              {data.performance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No vendor performance data yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </CardContent>
    </Card>
  )
}

