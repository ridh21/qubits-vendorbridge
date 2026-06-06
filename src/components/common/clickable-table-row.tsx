"use client"

import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

type Props = {
  href: string
  children: ReactNode
  className?: string
}

export function ClickableTableRow({ href, children, className }: Props) {
  const router = useRouter()

  return (
    <TableRow
      tabIndex={0}
      role="link"
      data-href={href}
      className={cn("cursor-pointer", className)}
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          router.push(href)
        }
      }}
    >
      {children}
    </TableRow>
  )
}