import { PageHeader } from "@/components/layout/page-header"
import { VendorForm } from "@/components/vendors/vendor-form"
import { requireRole } from "@/lib/rbac"

export default async function NewVendorPage() {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER"])
  return (
    <div>
      <PageHeader
        title="Register vendor"
        description="Add a new supplier to your procurement network."
      />
      <VendorForm canEditStatus={user.role === "ADMIN"} />
    </div>
  )
}
