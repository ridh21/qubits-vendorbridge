"use client"

import { useEffect, useRef } from "react"

type ServerMessage =
  | { type: "event"; event: string; data: NotificationPayload }
  | { type: "subscribed"; topics: string[] }
  | { type: "pong" }
  | { type: "error"; message: string }

export type NotificationPayload = {
  type: string
  title: string
  body: string
  link: string | null
  createdAt: string
}

type Options = {
  userId: string | null | undefined
  onEvent: (payload: NotificationPayload) => void
}

/**
 * Opens a WebSocket to the realtime worker, subscribes to `user:<userId>`,
 * and routes `notification.created` events back to the caller via `onEvent`.
 *
 * - Reconnects with exponential backoff
 * - Keeps the socket warm with a 25s ping
 * - Honours `prefers-reduced-motion` callers via just-not-firing audio elsewhere
 *
 * Set NEXT_PUBLIC_WS_URL in the environment, e.g.
 *   ws://localhost:8787/ws    (local wrangler dev)
 *   wss://vendorbridge-ws.workers.dev/ws  (production)
 */
export function useRealtimeNotifications({ userId, onEvent }: Options) {
  const handlerRef = useRef(onEvent)
  handlerRef.current = onEvent

  useEffect(() => {
    if (!userId) return
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    if (!wsUrl) {
      console.warn(
        "[realtime] NEXT_PUBLIC_WS_URL not set — realtime disabled",
      )
      return
    }

    let ws: WebSocket | null = null
    let pingTimer: number | undefined
    let reconnectTimer: number | undefined
    let attempt = 0
    let disposed = false

    const connect = () => {
      if (disposed) return
      try {
        ws = new WebSocket(wsUrl)
      } catch (err) {
        console.warn("[realtime] WebSocket constructor threw", err)
        scheduleReconnect()
        return
      }

      ws.addEventListener("open", () => {
        attempt = 0
        ws?.send(
          JSON.stringify({
            type: "subscribe",
            topics: [`user:${userId}`],
          }),
        )
        pingTimer = window.setInterval(() => {
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }))
          }
        }, 25_000)
      })

      ws.addEventListener("message", (e) => {
        let msg: ServerMessage
        try {
          msg = JSON.parse(e.data) as ServerMessage
        } catch {
          return
        }
        if (msg.type === "event" && msg.event === "notification.created") {
          handlerRef.current(msg.data)
        }
      })

      ws.addEventListener("close", () => {
        if (pingTimer) window.clearInterval(pingTimer)
        scheduleReconnect()
      })

      ws.addEventListener("error", () => {
        // close event will follow — let it handle reconnect
        ws?.close()
      })
    }

    const scheduleReconnect = () => {
      if (disposed) return
      attempt += 1
      const delay = Math.min(30_000, 1000 * 2 ** Math.min(attempt, 5))
      reconnectTimer = window.setTimeout(connect, delay)
    }

    connect()

    return () => {
      disposed = true
      if (pingTimer) window.clearInterval(pingTimer)
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      ws?.close()
    }
  }, [userId])
}

/**
 * Browser desktop notification helper.
 *  - Lazily requests permission the first time `show()` is called
 *  - No-ops gracefully when the API is unavailable or denied
 */
export const browserNotify = {
  permission(): NotificationPermission | null {
    if (typeof Notification === "undefined") return null
    return Notification.permission
  },

  async ensurePermission(): Promise<NotificationPermission | null> {
    if (typeof Notification === "undefined") return null
    if (Notification.permission === "granted") return "granted"
    if (Notification.permission === "denied") return "denied"
    try {
      return await Notification.requestPermission()
    } catch {
      return null
    }
  },

  show(
    title: string,
    options?: NotificationOptions & { onClick?: () => void },
  ) {
    if (typeof Notification === "undefined") return
    if (Notification.permission !== "granted") return
    try {
      const n = new Notification(title, {
        icon: "/logo.png",
        badge: "/logo.png",
        ...options,
      })
      if (options?.onClick) {
        n.onclick = () => {
          window.focus()
          options.onClick?.()
          n.close()
        }
      }
    } catch (err) {
      console.warn("[realtime] Notification show failed", err)
    }
  },
}
