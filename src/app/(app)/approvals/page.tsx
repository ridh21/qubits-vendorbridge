import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { Card } from "@/components/ui/card"
import { ClickableTableRow } from "@/components/common/clickable-table-row"
import { StopPropagation } from "@/components/common/stop-propagation"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { listAllApprovals, listPendingApprovals } from "@/lib/actions/approvals"
import { requireRole } from "@/lib/rbac"
import { formatCurrency } from "@/lib/money"

export default async function ApprovalsPage() {
  await requireRole(["ADMIN", "MANAGER"])
  const [pending, all] = await Promise.all([
    listPendingApprovals(),
    listAllApprovals(),
  ])

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Review procurement requests submitted by procurement officers."
      />
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="all">All ({all.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="p-0 overflow-hidden">
            <ApprovalsTable rows={pending} />
          </Card>
        </TabsContent>
        <TabsContent value="all">
          <Card className="p-0 overflow-hidden">
            <ApprovalsTable rows={all} showApprover />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

type Row = Awaited<ReturnType<typeof listPendingApprovals>>[number] & {
  approver?: { name: string } | null
}

function ApprovalsTable({
  rows,
  showApprover,
}: {
  rows: Row[]
  showApprover?: boolean
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Quotation</TableHead>
          <TableHead>RFQ</TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
          {showApprover && <TableHead>Decided by</TableHead>}
          <TableHead>Requested</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={showApprover ? 7 : 6}
              className="text-center py-12 text-muted-foreground"
            >
              Nothing here.
            </TableCell>
          </TableRow>
        )}
        {rows.map((r) => (
          <ClickableTableRow key={r.id} href={`/approvals/${r.id}`}>
            <TableCell className="font-mono text-xs">{r.quotation.code}</TableCell>
            <TableCell>
                <StopPropagation>
                  <Link
                    href={`/rfqs/${r.quotation.rfq.id}`}
                    className="hover:underline"
                  >
                    {r.quotation.rfq.title}
                  </Link>
                </StopPropagation>
            </TableCell>
            <TableCell>{r.quotation.vendor.name}</TableCell>
            <TableCell className="text-right">
              {formatCurrency(r.quotation.totalAmount)}
            </TableCell>
            <TableCell>
              <StatusBadge status={r.status} />
            </TableCell>
            {showApprover && (
              <TableCell className="text-sm text-muted-foreground">
                {r.approver?.name ?? "—"}
              </TableCell>
            )}
            <TableCell className="text-xs text-muted-foreground">
              {formatDistanceToNow(r.createdAt, { addSuffix: true })}
            </TableCell>
          </ClickableTableRow>
        ))}
      </TableBody>
    </Table>
  )
}
