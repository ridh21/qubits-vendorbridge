"use client"

import type { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export function StopPropagation({ children }: Props) {
  return <div onClick={(event) => event.stopPropagation()}>{children}</div>
}