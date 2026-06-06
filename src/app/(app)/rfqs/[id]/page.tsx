import Link from "next/link"
import { notFound } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { IconScale, IconX } from "@tabler/icons-react"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClickableTableRow } from "@/components/common/clickable-table-row"
import { StopPropagation } from "@/components/common/stop-propagation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/common/status-badge"
import { PublishRfqButton } from "@/components/rfqs/publish-rfq-button"
import { getRfq } from "@/lib/actions/rfqs"
import { requireUser } from "@/lib/rbac"
import { formatCurrency } from "@/lib/money"

export default async function RfqDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const rfq = await getRfq(id)
  if (!rfq) notFound()

  const isOfficer = user.role === "ADMIN" || user.role === "PROCUREMENT_OFFICER"
  const submittedCount = rfq.quotations.filter(
    (q) => q.status === "SUBMITTED" || q.status === "SHORTLISTED" || q.status === "AWARDED",
  ).length

  return (
    <div>
      <PageHeader
        title={rfq.title}
        description={
          <span className="flex items-center gap-2 text-sm">
            <code className="font-mono">{rfq.code}</code>
            <span>·</span>
            <span>by {rfq.createdBy.name}</span>
            <span>·</span>
            <span>Deadline {format(rfq.deadline, "PP")}</span>
          </span>
        }
        actions={
          <>
            <StatusBadge status={rfq.status} />
            {isOfficer && rfq.status === "DRAFT" && <PublishRfqButton id={rfq.id} />}
            {isOfficer && submittedCount >= 1 && (
              <Button render={<Link href={`/rfqs/${rfq.id}/compare`} />}>
                <IconScale className="size-4" />
                Compare quotations
              </Button>
            )}
            {user.role === "VENDOR" && (
              <Button render={<Link href={`/quotations`} />}>
                Submit quotation
              </Button>
            )}
          </>
        }
      />

      {rfq.description && (
        <Card className="mb-4">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {rfq.description}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Items</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfq.items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>
                      <div className="font-medium">{it.name}</div>
                      {it.description && (
                        <div className="text-xs text-muted-foreground">
                          {it.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{it.quantity}</TableCell>
                    <TableCell>{it.unit}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invited vendors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfq.vendors.map((rv) => {
                  const q = rfq.quotations.find((q) => q.vendorId === rv.vendorId)
                  return (
                    <ClickableTableRow key={rv.id} href={`/vendors/${rv.vendor.id}`}>
                      <TableCell>
                        <StopPropagation>
                          <Link
                            href={`/vendors/${rv.vendor.id}`}
                            className="font-medium hover:underline"
                          >
                            {rv.vendor.name}
                          </Link>
                        </StopPropagation>
                      </TableCell>
                      <TableCell>
                        {q ? (
                          <StatusBadge status={q.status} />
                        ) : (
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                            <IconX className="size-3" /> Awaiting
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(rv.invitedAt, { addSuffix: true })}
                      </TableCell>
                    </ClickableTableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {rfq.quotations.length > 0 && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Quotations received</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rfq.quotations.map((q) => (
                  <ClickableTableRow key={q.id} href={`/quotations/${q.id}`}>
                    <TableCell className="font-mono text-xs">{q.code}</TableCell>
                    <TableCell>{q.vendor.name}</TableCell>
                    <TableCell>{q.deliveryDays}d</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(q.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={q.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {q.submittedAt
                        ? formatDistanceToNow(q.submittedAt, { addSuffix: true })
                        : "—"}
                    </TableCell>
                  </ClickableTableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
