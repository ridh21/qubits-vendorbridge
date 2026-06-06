import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/rbac"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { AppTopbar } from "@/components/layout/app-topbar"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const display = {
    name: user.name ?? "User",
    email: user.email ?? "",
  }

  return (
    <SidebarProvider>
      <AppSidebar role={user.role} user={display} />
      <SidebarInset>
        <AppTopbar user={display} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
