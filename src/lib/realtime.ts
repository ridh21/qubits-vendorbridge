/**
 * Server-side helper to fan out events to the Cloudflare Worker WebSocket hub.
 *
 * Fire-and-forget: if the worker is unreachable, the failure is logged but the
 * caller continues. Notifications are still persisted in the DB by the regular
 * `notify` flow.
 */

const WEBHOOK_URL = process.env.WS_WEBHOOK_URL
const WEBHOOK_SECRET = process.env.WS_WEBHOOK_SECRET

type Payload = {
  topics: string[]
  event: string
  data?: unknown
}

export async function publishRealtime(payload: Payload): Promise<void> {
  if (!WEBHOOK_URL || !WEBHOOK_SECRET) {
    // Not configured (e.g. local dev without the worker running) — silent no-op.
    return
  }
  if (payload.topics.length === 0) return

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify(payload),
      // Don't keep the server action waiting on a slow worker.
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) {
      console.warn(
        `[realtime] webhook returned ${res.status}: ${await res.text()}`,
      )
    }
  } catch (err) {
    console.warn(
      "[realtime] failed to publish:",
      err instanceof Error ? err.message : err,
    )
  }
}

export function userTopic(userId: string) {
  return `user:${userId}`
}

export function roleTopic(role: string) {
  return `role:${role}`
}
