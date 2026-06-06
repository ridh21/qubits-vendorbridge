"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { IconBell } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { listMyNotifications, markAllRead } from "@/lib/actions/notifications"

type Notif = {
  id: string
  title: string
  body: string
  link: string | null
  readAt: Date | null
  createdAt: Date
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const [pending, start] = useTransition()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastTopIdRef = useRef<string | null>(null)
  const seededRef = useRef(false)

  const playPing = () => {
    const a = audioRef.current
    if (!a) return
    try {
      a.currentTime = 0
      void a.play().catch(() => {})
    } catch {}
  }

  const refresh = () =>
    listMyNotifications(15).then((d) => {
      const next = d.items as Notif[]
      const topId = next[0]?.id ?? null

      if (!seededRef.current) {
        // First load: don't play, just record current top id.
        seededRef.current = true
      } else if (topId && topId !== lastTopIdRef.current && d.unread > 0) {
        playPing()
      }
      lastTopIdRef.current = topId

      setItems(next)
      setUnread(d.unread)
    })

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3")
    audioRef.current.preload = "auto"
    audioRef.current.volume = 0.6

    refresh()
    const id = window.setInterval(refresh, 15000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) refresh()
      }}
    >
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <span className="relative inline-flex">
              <IconBell className="size-5" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 size-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </span>
          </Button>
        }
      />
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending || unread === 0}
            onClick={() =>
              start(async () => {
                await markAllRead()
                refresh()
              })
            }
          >
            Mark all read
          </Button>
        </div>
        <ScrollArea className="max-h-96">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground p-6 text-center">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={
                    n.readAt ? "" : "bg-blue-50/40"
                  }
                >
                  {n.link ? (
                    <Link
                      href={n.link}
                      className="block p-3 hover:bg-muted/60"
                      onClick={() => setOpen(false)}
                    >
                      <NotifBody n={n} />
                    </Link>
                  ) : (
                    <div className="p-3">
                      <NotifBody n={n} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

function NotifBody({ n }: { n: Notif }) {
  return (
    <>
      <p className="text-sm font-medium">{n.title}</p>
      <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
      <p className="text-[11px] text-muted-foreground mt-1">
        {formatDistanceToNow(n.createdAt, { addSuffix: true })}
      </p>
    </>
  )
}
