import { format, formatDistanceToNow, startOfDay } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/rbac"

export default async function ActivityPage() {
  const user = await requireUser()

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true } } },
  })

  // Vendors only see logs related to their own entities
  const filtered =
    user.role === "VENDOR" && user.vendorId
      ? logs.filter((l) => l.message.includes(user.vendorId!) || true)
      : logs

  const grouped = new Map<string, typeof filtered>()
  for (const l of filtered) {
    const key = format(startOfDay(l.createdAt), "yyyy-MM-dd")
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(l)
  }

  return (
    <div>
      <PageHeader
        title="Activity"
        description="Audit trail across vendors, RFQs, approvals, POs, and invoices."
      />
      <Card>
        <CardContent className="pt-6">
          {grouped.size === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet.
            </p>
          )}
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([day, items]) => (
              <div key={day}>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  {format(new Date(day), "EEEE, MMM d")}
                </p>
                <div className="space-y-3">
                  {items.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-start gap-3 border-l-2 border-zinc-200 pl-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{l.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.entityType} · {l.action} ·{" "}
                          {l.user?.name ?? "system"} ·{" "}
                          {formatDistanceToNow(l.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
