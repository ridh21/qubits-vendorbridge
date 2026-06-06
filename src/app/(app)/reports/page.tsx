import { PageHeader } from "@/components/layout/page-header"
import { ReportsView } from "@/components/reports/reports-view"
import { getReportsData, type Granularity } from "@/lib/actions/reports"
import { requireRole } from "@/lib/rbac"

type SearchParams = {
  from?: string
  to?: string
  granularity?: string
}

const GRANULARITIES: Granularity[] = ["day", "week", "month", "quarter"]

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"])
  const sp = await searchParams
  const granularity = GRANULARITIES.includes(sp.granularity as Granularity)
    ? (sp.granularity as Granularity)
    : "month"
  const data = await getReportsData({
    from: sp.from,
    to: sp.to,
    granularity,
  })
  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Procurement statistics, spend trends, and vendor performance — filter by any date range."
      />
      <ReportsView data={data} />
    </div>
  )
}
