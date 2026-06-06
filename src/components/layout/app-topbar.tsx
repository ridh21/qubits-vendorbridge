"use client"

import { IconLogout, IconUser } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationsBell } from "@/components/layout/notifications-bell"
import { signOutAction } from "@/lib/actions/session"

export function AppTopbar({
  user,
}: {
  user: { id: string; name: string; email: string }
}) {
  return (
    <header className="flex h-14 items-center gap-2 border-b bg-background px-4 sticky top-0 z-30">
      <SidebarTrigger />
      <div className="ml-auto flex items-center gap-1">
        <NotificationsBell userId={user.id} />
        <DropdownMenu>
          <DropdownMenuTrigger className="size-9 rounded-full bg-muted text-sm font-medium flex items-center justify-center hover:opacity-90">
            {user.name.slice(0, 1).toUpperCase()}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {user.email}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconUser className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await signOutAction()
              }}
            >
              <IconLogout className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
