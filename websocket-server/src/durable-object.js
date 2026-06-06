/**
 * WebSocketHub Durable Object
 *
 * Topic-based pub/sub over WebSockets, using the Hibernation API so we don't
 * burn CPU while idle.
 *
 * Client → server messages:
 *   { type: "subscribe",   topics: ["user:abc", "role:ADMIN"] }
 *   { type: "unsubscribe", topics: ["..."] }
 *   { type: "ping" }
 *
 * Server → client messages:
 *   { type: "pong" }
 *   { type: "subscribed", topics: [...] }
 *   { type: "event", event: "<eventName>", data: <any> }
 *   { type: "error", message: "..." }
 */
export class WebSocketHub {
  constructor(ctx, env) {
    this.ctx = ctx
    this.env = env
    this.topics = new Map() // topic → Set<WebSocket>
  }

  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === "/notify" && request.method === "POST") {
      const { topics, event, data } = await request.json()
      // After hibernation, the in-memory map is gone — rebuild from attachments.
      this.rebuildTopics()
      let delivered = 0
      for (const topic of topics) {
        delivered += this.broadcast(topic, { type: "event", event, data })
      }
      return new Response(JSON.stringify({ success: true, delivered }), {
        headers: { "Content-Type": "application/json" },
      })
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    this.ctx.acceptWebSocket(server)
    server.serializeAttachment({ topics: [] })
    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws, message) {
    let msg
    try {
      msg =
        typeof message === "string"
          ? JSON.parse(message)
          : JSON.parse(new TextDecoder().decode(message))
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }))
      return
    }

    switch (msg.type) {
      case "ping":
        ws.send(JSON.stringify({ type: "pong" }))
        break

      case "subscribe": {
        if (!Array.isArray(msg.topics)) {
          ws.send(
            JSON.stringify({ type: "error", message: "topics must be an array" }),
          )
          return
        }
        const attachment = ws.deserializeAttachment() || { topics: [] }
        for (const topic of msg.topics) {
          if (typeof topic !== "string") continue
          if (!this.topics.has(topic)) this.topics.set(topic, new Set())
          this.topics.get(topic).add(ws)
          if (!attachment.topics.includes(topic)) attachment.topics.push(topic)
        }
        ws.serializeAttachment(attachment)
        ws.send(
          JSON.stringify({ type: "subscribed", topics: attachment.topics }),
        )
        break
      }

      case "unsubscribe": {
        if (!Array.isArray(msg.topics)) return
        const attachment = ws.deserializeAttachment() || { topics: [] }
        for (const topic of msg.topics) {
          const subs = this.topics.get(topic)
          if (subs) {
            subs.delete(ws)
            if (subs.size === 0) this.topics.delete(topic)
          }
          attachment.topics = attachment.topics.filter((t) => t !== topic)
        }
        ws.serializeAttachment(attachment)
        ws.send(
          JSON.stringify({ type: "subscribed", topics: attachment.topics }),
        )
        break
      }

      default:
        ws.send(
          JSON.stringify({
            type: "error",
            message: `Unknown message type: ${msg.type}`,
          }),
        )
    }
  }

  async webSocketClose(ws) {
    this.removeWebSocket(ws)
  }

  async webSocketError(ws) {
    this.removeWebSocket(ws)
  }

  rebuildTopics() {
    this.topics = new Map()
    for (const ws of this.ctx.getWebSockets()) {
      const attachment = ws.deserializeAttachment()
      if (attachment && attachment.topics) {
        for (const topic of attachment.topics) {
          if (!this.topics.has(topic)) this.topics.set(topic, new Set())
          this.topics.get(topic).add(ws)
        }
      }
    }
  }

  removeWebSocket(ws) {
    const attachment = ws.deserializeAttachment()
    if (attachment && attachment.topics) {
      for (const topic of attachment.topics) {
        const subs = this.topics.get(topic)
        if (subs) {
          subs.delete(ws)
          if (subs.size === 0) this.topics.delete(topic)
        }
      }
    }
  }

  broadcast(topic, payload) {
    const subs = this.topics.get(topic)
    if (!subs || subs.size === 0) return 0
    const message = JSON.stringify(payload)
    let count = 0
    for (const ws of subs) {
      try {
        ws.send(message)
        count++
      } catch {
        this.removeWebSocket(ws)
      }
    }
    return count
  }
}
