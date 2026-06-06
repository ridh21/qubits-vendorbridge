import Link from "next/link"
import { notFound } from "next/navigation"
import { IconArrowLeft } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { VendorForm } from "@/components/vendors/vendor-form"
import { getVendor } from "@/lib/actions/vendors"
import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/money"

export default async function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireRole(["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"])
  const { id } = await params
  const vendor = await getVendor(id)
  if (!vendor) notFound()

  const activity = await prisma.activityLog.findMany({
    where: { entityType: "Vendor", entityId: id },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  const canEdit = user.role === "ADMIN" || user.role === "PROCUREMENT_OFFICER"
  const canEditStatus = user.role === "ADMIN"

  return (
    <div>
      <PageHeader
        title={vendor.name}
        description={`${vendor.category} · Joined ${formatDistanceToNow(vendor.createdAt, { addSuffix: true })}`}
        actions={
          <>
            <StatusBadge status={vendor.status} />
            <Button variant="ghost" render={<Link href="/vendors" />}>
              <IconArrowLeft className="size-4" />
              Back
            </Button>
          </>
        }
      />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="rfqs">RFQs ({vendor.invitations.length})</TabsTrigger>
          <TabsTrigger value="quotations">
            Quotations ({vendor.quotations.length})
          </TabsTrigger>
          <TabsTrigger value="pos">POs ({vendor.purchaseOrders.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {canEdit ? (
            <VendorForm
              id={vendor.id}
              canEditStatus={canEditStatus}
              defaultValues={{
                name: vendor.name,
                category: vendor.category as VendorCategory,
                gstNumber: vendor.gstNumber ?? "",
                contactName: vendor.contactName,
                contactEmail: vendor.contactEmail,
                contactPhone: vendor.contactPhone ?? "",
                address: vendor.address ?? "",
                status: vendor.status,
              }}
            />
          ) : (
            <ReadonlyProfile vendor={vendor} />
          )}
        </TabsContent>

        <TabsContent value="rfqs">
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendor.invitations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No RFQ invitations yet.
                    </TableCell>
                  </TableRow>
                )}
                {vendor.invitations.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-xs">
                      <Link href={`/rfqs/${i.rfq.id}`} className="hover:underline">
                        {i.rfq.code}
                      </Link>
                    </TableCell>
                    <TableCell>{i.rfq.title}</TableCell>
                    <TableCell>
                      <StatusBadge status={i.rfq.status} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(i.invitedAt, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="quotations">
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>RFQ</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendor.quotations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No quotations submitted.
                    </TableCell>
                  </TableRow>
                )}
                {vendor.quotations.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-mono text-xs">{q.code}</TableCell>
                    <TableCell>
                      <Link
                        href={`/rfqs/${q.rfq.id}`}
                        className="hover:underline"
                      >
                        {q.rfq.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={q.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(q.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="pos">
          <Card className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Grand total</TableHead>
                  <TableHead>Issued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendor.purchaseOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No purchase orders yet.
                    </TableCell>
                  </TableRow>
                )}
                {vendor.purchaseOrders.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-mono text-xs">
                      <Link
                        href={`/purchase-orders/${po.id}`}
                        className="hover:underline"
                      >
                        {po.code}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={po.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(po.grandTotal)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDistanceToNow(po.issuedAt, { addSuffix: true })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No activity yet.
                </p>
              )}
              {activity.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 text-sm border-l-2 border-zinc-200 pl-3"
                >
                  <div className="flex-1">
                    <p className="font-medium">{a.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.action} ·{" "}
                      {formatDistanceToNow(a.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

import type { VendorInput } from "@/lib/validation/vendor"
type VendorCategory = VendorInput["category"]

function ReadonlyProfile({
  vendor,
}: {
  vendor: NonNullable<Awaited<ReturnType<typeof getVendor>>>
}) {
  const fields = [
    ["Name", vendor.name],
    ["Category", vendor.category],
    ["GST", vendor.gstNumber ?? "—"],
    ["Contact", vendor.contactName],
    ["Email", vendor.contactEmail],
    ["Phone", vendor.contactPhone ?? "—"],
    ["Address", vendor.address ?? "—"],
  ]
  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-x-6 gap-y-3 pt-6 text-sm">
        {fields.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {k}
            </p>
            <p className="font-medium">{v}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
