import { PageHeader } from "@/components/layout/page-header"
import { RfqForm } from "@/components/rfqs/rfq-form"
import { listActiveVendors } from "@/lib/actions/rfqs"
import { requireRole } from "@/lib/rbac"

export default async function NewRfqPage() {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  const vendors = await listActiveVendors()
  return (
    <div>
      <PageHeader
        title="Create RFQ"
        description="Define items, set a deadline, and invite vendors to quote."
      />
      <RfqForm vendors={vendors} />
    </div>
  )
}
