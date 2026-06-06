/**
 * VendorBridge — Cloudflare Worker + Durable Object WebSocket Hub
 *
 * Routes:
 *  GET  /health                — liveness probe
 *  GET  /ws                    — WebSocket upgrade (client subscribes to topics)
 *  POST /notify                — internal webhook fired by the Next.js app
 *                                Authenticated via `X-Webhook-Secret`.
 *
 * Topic conventions:
 *  "user:<userId>"    — events for one user (notification fan-out target)
 *  "role:<ROLE>"      — broadcasts to all users currently online with that role
 */

export { WebSocketHub } from "./durable-object.js"

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || ""
  const allowed = (env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
  const allowOrigin =
    allowed.includes("*") || allowed.includes(origin) ? origin : ""
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Webhook-Secret",
    "Access-Control-Max-Age": "86400",
  }
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  })
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const cors = corsHeaders(request, env)

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors })
    }

    if (url.pathname === "/health") {
      return json({ status: "ok" }, 200, cors)
    }

    if (url.pathname === "/ws") {
      if (request.headers.get("Upgrade") !== "websocket") {
        return json({ error: "Expected WebSocket upgrade" }, 426, cors)
      }
      const id = env.WS_HUB.idFromName("hub")
      const stub = env.WS_HUB.get(id)
      return stub.fetch(request)
    }

    if (url.pathname === "/notify" && request.method === "POST") {
      const secret = request.headers.get("X-Webhook-Secret")
      if (secret !== env.WEBHOOK_SECRET) {
        return json({ error: "Unauthorized" }, 401, cors)
      }

      let body
      try {
        body = await request.json()
      } catch {
        return json({ error: "Invalid JSON" }, 400, cors)
      }

      // body: { topic | topics, event, data? }
      const topics = Array.isArray(body.topics)
        ? body.topics
        : body.topic
          ? [body.topic]
          : []
      if (topics.length === 0 || !body.event) {
        return json({ error: "Missing topic(s) or event" }, 400, cors)
      }

      const id = env.WS_HUB.idFromName("hub")
      const stub = env.WS_HUB.get(id)
      const doRes = await stub.fetch(
        new Request("https://do/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topics, event: body.event, data: body.data }),
        }),
      )
      const result = await doRes.json()
      return json(result, doRes.status, cors)
    }

    return json({ error: "Not found" }, 404, cors)
  },
}
