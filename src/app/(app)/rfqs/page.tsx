import Link from "next/link"
import { IconPlus } from "@tabler/icons-react"
import { format, formatDistanceToNow } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ClickableTableRow } from "@/components/common/clickable-table-row"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { listRfqs } from "@/lib/actions/rfqs"
import { requireUser } from "@/lib/rbac"

export default async function RfqsPage() {
  const user = await requireUser()
  const rfqs = await listRfqs(
    user.role === "VENDOR" && user.vendorId
      ? { vendorId: user.vendorId }
      : {},
  )
  const canCreate = user.role === "ADMIN" || user.role === "PROCUREMENT_OFFICER"

  return (
    <div>
      <PageHeader
        title="Request for Quotations"
        description={
          user.role === "VENDOR"
            ? "RFQs you've been invited to."
            : "Initiate and track procurement requests."
        }
        actions={
          canCreate && (
            <Button render={<Link href="/rfqs/new" />}>
              <IconPlus className="size-4" />
              New RFQ
            </Button>
          )
        }
      />

      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Vendors</TableHead>
              <TableHead className="text-right">Quotations</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfqs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  No RFQs yet.
                </TableCell>
              </TableRow>
            )}
            {rfqs.map((r) => (
              <ClickableTableRow key={r.id} href={`/rfqs/${r.id}`}>
                <TableCell className="font-mono text-xs">{r.code}</TableCell>
                <TableCell>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    by {r.createdBy.name}
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <div>{format(r.deadline, "PP")}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(r.deadline, { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell className="text-right">{r._count.vendors}</TableCell>
                <TableCell className="text-right">{r._count.quotations}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
              </ClickableTableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
