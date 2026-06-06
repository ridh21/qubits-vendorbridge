"use client"

import { useState } from "react"
import { IconDownload, IconTrendingUp } from "@tabler/icons-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
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
import { ReportsFilters } from "@/components/reports/reports-filters"
import type { ReportsData } from "@/lib/actions/reports"

const PIE_COLORS = [
  "#086AA5",
  "#0D2A41",
  "#3B86B0",
  "#1E40AF",
  "#4338CA",
  "#7C3AED",
  "#0E7490",
  "#475569",
  "#64748B",
  "#94A3B8",
]

const trendsConfig = {
  spend: { label: "Spend (₹)", color: "#086AA5" },
  rfqs: { label: "RFQs", color: "#0D2A41" },
  invoices: { label: "Invoices", color: "#5BA3CC" },
} satisfies ChartConfig

const vendorConfig = {
  total: { label: "Spend", color: "#086AA5" },
} satisfies ChartConfig

const categoryConfig = {
  total: { label: "Spend", color: "#086AA5" },
} satisfies ChartConfig

function fmtINR(paise: number) {
  return `₹${fromPaise(paise).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`
}

export function ReportsView({ data }: { data: ReportsData }) {
  const [chartMode, setChartMode] = useState<"spend" | "activity">("spend")

  const trendSeries = data.timeSeries.map((b) => ({
    label: b.label,
    spend: Math.round(fromPaise(b.spend)),
    rfqs: b.rfqs,
    invoices: b.invoices,
  }))

  const categoryPie = data.spendByCategory.map((c) => ({
    name: c.category,
    value: fromPaise(c.total),
  }))

  return (
    <div className="space-y-6">
      <ReportsFilters
        from={data.range.from}
        to={data.range.to}
        granularity={data.range.granularity}
      />

      {/* KPI tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total spend" value={fmtINR(data.kpis.totalSpend)} />
        <Kpi label="Invoices issued" value={data.kpis.invoiceCount} />
        <Kpi label="Active vendors" value={data.kpis.activeVendors} />
        <Kpi label="Total RFQs" value={data.kpis.totalRfqs} />
        <Kpi label="Awarded RFQs" value={data.kpis.awardedRfqs} />
        <Kpi
          label="Award rate"
          value={`${data.kpis.awardRate.toFixed(1)}%`}
        />
        <Kpi
          label="Avg RFQ → award"
          value={`${data.kpis.avgCycleDays.toFixed(1)} d`}
        />
        <Kpi
          label="Approval rejection"
          value={`${data.kpis.approvalRejectionRate.toFixed(1)}%`}
        />
      </div>

      {/* Trends chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="size-5 text-[#086AA5]" />
              Procurement trends
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {data.range.granularity === "day"
                ? "Daily"
                : data.range.granularity === "week"
                  ? "Weekly"
                  : data.range.granularity === "month"
                    ? "Monthly"
                    : "Quarterly"}{" "}
              breakdown for the selected range.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md ring-1 ring-border overflow-hidden">
              {(["spend", "activity"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setChartMode(mode)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize ${
                    chartMode === mode
                      ? "bg-foreground text-background"
                      : "bg-background text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                downloadCsv(
                  `trends-${data.range.from}_${data.range.to}.csv`,
                  toCsv(
                    data.timeSeries.map((b) => ({
                      bucket: b.bucket,
                      label: b.label,
                      spend_inr: fromPaise(b.spend),
                      rfqs: b.rfqs,
                      invoices: b.invoices,
                    })),
                  ),
                )
              }
            >
              <IconDownload className="size-4" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={trendsConfig} className="h-72 w-full">
            <ComposedChart data={trendSeries}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={60}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {chartMode === "spend" ? (
                <Bar
                  dataKey="spend"
                  fill="var(--color-spend)"
                  radius={4}
                  name="Spend (₹)"
                />
              ) : (
                <>
                  <Bar
                    dataKey="rfqs"
                    fill="var(--color-rfqs)"
                    radius={4}
                    name="RFQs"
                  />
                  <Line
                    dataKey="invoices"
                    stroke="var(--color-invoices)"
                    strokeWidth={2}
                    dot
                    name="Invoices"
                  />
                </>
              )}
            </ComposedChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Spend by vendor + category */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Spend by vendor (top 10)</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                downloadCsv(
                  `spend-by-vendor-${data.range.from}_${data.range.to}.csv`,
                  toCsv(
                    data.spendByVendor.map((v) => ({
                      vendor: v.name,
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
            {data.spendByVendor.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No spend in this range.
              </p>
            ) : (
              <ChartContainer config={vendorConfig} className="h-72 w-full">
                <BarChart
                  data={data.spendByVendor.map((v) => ({
                    name: v.name,
                    total: fromPaise(v.total),
                  }))}
                  layout="vertical"
                  margin={{ left: 8, right: 12 }}
                >
                  <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tickLine={false}
                    axisLine={false}
                    width={130}
                    tick={{ fontSize: 11 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="total"
                    fill="var(--color-total)"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Spend by category</CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={() =>
                downloadCsv(
                  `spend-by-category-${data.range.from}_${data.range.to}.csv`,
                  toCsv(
                    data.spendByCategory.map((c) => ({
                      category: c.category,
                      total_inr: fromPaise(c.total),
                    })),
                  ),
                )
              }
            >
              <IconDownload className="size-4" /> CSV
            </Button>
          </CardHeader>
          <CardContent>
            {categoryPie.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No category spend in this range.
              </p>
            ) : (
              <ChartContainer config={categoryConfig} className="h-72 w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Pie
                    data={categoryPie}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label={({ name }) => name ?? ""}
                  >
                    {categoryPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Vendor performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Vendor performance</CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              downloadCsv(
                `vendor-performance-${data.range.from}_${data.range.to}.csv`,
                toCsv(
                  data.performance.map((p) => ({
                    vendor: p.name,
                    category: p.category,
                    rating: p.rating,
                    submitted: p.submitted,
                    awarded: p.awarded,
                    win_rate_pct: p.winRate.toFixed(1),
                    avg_response_days: p.avgResponse.toFixed(1),
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
                <TableHead className="text-right">Avg response</TableHead>
                <TableHead className="text-right">Avg delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.performance.map((p) => (
                <TableRow key={p.vendorId}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right">
                    {p.rating.toFixed(1)}
                  </TableCell>
                  <TableCell className="text-right">{p.submitted}</TableCell>
                  <TableCell className="text-right">{p.awarded}</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`inline-block min-w-[3rem] px-2 py-0.5 rounded-full text-[11px] font-medium ${
                        p.winRate >= 60
                          ? "bg-[#086AA5]/12 text-[#086AA5]"
                          : p.winRate >= 30
                            ? "bg-slate-100 text-slate-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {p.winRate.toFixed(0)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    {p.avgResponse > 0 ? `${p.avgResponse.toFixed(1)} d` : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.avgDelivery > 0 ? `${p.avgDelivery.toFixed(1)} d` : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {data.performance.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No vendor performance data in this range.
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
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold text-[#0D2A41]">
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
      </CardContent>
    </Card>
  )
}
