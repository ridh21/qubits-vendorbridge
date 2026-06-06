import { format } from "date-fns"

import { PageHeader } from "@/components/layout/page-header"
import { Card } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserDialog } from "@/components/admin/user-dialog"
import { ToggleUserButton } from "@/components/admin/toggle-user-button"
import { listUsers, listVendorsForLink } from "@/lib/actions/users"
import { requireRole, ROLE_LABELS } from "@/lib/rbac"

export default async function AdminUsersPage() {
  await requireRole(["ADMIN"])
  const [users, vendors] = await Promise.all([listUsers(), listVendorsForLink()])

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage workspace accounts and role assignments."
        actions={<UserDialog mode="create" vendors={vendors} />}
      />
      <Card className="p-0 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Vendor link</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{ROLE_LABELS[u.role]}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.vendor?.name ?? "—"}
                </TableCell>
                <TableCell>
                  {u.disabled ? (
                    <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
                      DISABLED
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                      ACTIVE
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {format(u.createdAt, "PP")}
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <UserDialog
                    mode="edit"
                    vendors={vendors}
                    user={{
                      id: u.id,
                      name: u.name,
                      email: u.email,
                      role: u.role,
                      vendorId: u.vendorId,
                    }}
                  />
                  <ToggleUserButton id={u.id} disabled={u.disabled} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
