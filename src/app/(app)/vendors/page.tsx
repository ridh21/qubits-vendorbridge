import Link from "next/link"
import { IconPlus, IconSearch } from "@tabler/icons-react"
import type { VendorStatus } from "@prisma/client"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ClickableTableRow } from "@/components/common/clickable-table-row"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { VENDOR_CATEGORIES } from "@/lib/validation/vendor"
import { listVendors } from "@/lib/actions/vendors"
import { requireRole } from "@/lib/rbac"

type Search = Promise<{
  q?: string
  category?: string
  status?: VendorStatus | "all"
}>

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Search
}) {
  await requireRole(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"])
  const sp = await searchParams
  const vendors = await listVendors({
    q: sp.q,
    category: sp.category,
    status: sp.status && sp.status !== "all" ? (sp.status as VendorStatus) : undefined,
  })

  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Manage vendor accounts, categories, and onboarding status."
        actions={
          <Button render={<Link href="/vendors/new" />}>
            <IconPlus className="size-4" />
            New vendor
          </Button>
        }
      />

      <form className="mb-4 flex flex-col gap-2 sm:flex-row" action="/vendors">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search by name, GST, or email…"
            className="pl-9"
          />
        </div>
        <Select name="category" defaultValue={sp.category ?? "all"}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {VENDOR_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name="status" defaultValue={sp.status ?? "all"}>
          <SelectTrigger className="sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit" variant="secondary">
          Apply
        </Button>
      </form>

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>GST</TableHead>
              <TableHead className="text-right">Quotations</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No vendors match your filters.
                </TableCell>
              </TableRow>
            )}
            {vendors.map((v) => (
              <ClickableTableRow key={v.id} href={`/vendors/${v.id}`}>
                <TableCell>
                  <div className="font-medium">{v.name}</div>
                </TableCell>
                <TableCell>{v.category}</TableCell>
                <TableCell className="text-sm">
                  <div>{v.contactName}</div>
                  <div className="text-muted-foreground text-xs">
                    {v.contactEmail}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {v.gstNumber ?? "—"}
                </TableCell>
                <TableCell className="text-right">{v._count.quotations}</TableCell>
                <TableCell>
                  <StatusBadge status={v.status} />
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
