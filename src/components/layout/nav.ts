import type { Role } from "@prisma/client"
import {
  IconLayoutDashboard,
  IconBuildingStore,
  IconFileText,
  IconClipboardList,
  IconChecks,
  IconReceipt,
  IconFileInvoice,
  IconHistory,
  IconChartBar,
  IconUsers,
  type Icon,
} from "@tabler/icons-react"

export type NavItem = {
  title: string
  href: string
  icon: Icon
  roles: Role[]
}

export const NAV: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER", "VENDOR"],
  },
  {
    title: "Vendors",
    href: "/vendors",
    icon: IconBuildingStore,
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"],
  },
  {
    title: "RFQs",
    href: "/rfqs",
    icon: IconFileText,
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER", "VENDOR"],
  },
  {
    title: "Quotations",
    href: "/quotations",
    icon: IconClipboardList,
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "VENDOR"],
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: IconChecks,
    roles: ["ADMIN", "MANAGER"],
  },
  {
    title: "Purchase Orders",
    href: "/purchase-orders",
    icon: IconReceipt,
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "VENDOR"],
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: IconFileInvoice,
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "VENDOR"],
  },
  {
    title: "Activity",
    href: "/activity",
    icon: IconHistory,
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER", "VENDOR"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: IconChartBar,
    roles: ["ADMIN", "PROCUREMENT_OFFICER", "MANAGER"],
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: IconUsers,
    roles: ["ADMIN"],
  },
]
