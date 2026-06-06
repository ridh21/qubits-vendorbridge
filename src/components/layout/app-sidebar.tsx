"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconBuildingStore } from "@tabler/icons-react"
import type { Role } from "@prisma/client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NAV } from "@/components/layout/nav"
import { ROLE_LABELS } from "@/lib/rbac"

export function AppSidebar({
  role,
  user,
}: {
  role: Role
  user: { name: string; email: string }
}) {
  const pathname = usePathname()
  const items = NAV.filter((n) => n.roles.includes(role))

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/dashboard" />}>
              <div className="bg-zinc-950 text-white flex aspect-square size-8 items-center justify-center rounded-lg">
                <IconBuildingStore className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">VendorBridge</span>
                <span className="truncate text-xs text-muted-foreground">
                  {ROLE_LABELS[role]}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/")
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="bg-muted text-foreground flex aspect-square size-8 items-center justify-center rounded-full text-xs font-medium">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
