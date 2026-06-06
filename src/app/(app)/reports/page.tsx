import { PageHeader } from "@/components/layout/page-header"
import { ReportsView } from "@/components/reports/reports-view"
import { getReportsData } from "@/lib/actions/reports"
import { requireRole } from "@/lib/rbac"

export default async function ReportsPage() {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"])
  const data = await getReportsData()
  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Procurement statistics, monthly trends, and vendor performance."
      />
      <ReportsView data={data} />
    </div>
  )
}
