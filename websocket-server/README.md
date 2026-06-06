# vendorbridge-ws

Cloudflare Worker + Durable Object that powers real-time notifications for the VendorBridge app.

## Endpoints

| Method | Path     | Auth                  | Purpose                                                  |
|--------|----------|-----------------------|----------------------------------------------------------|
| GET    | `/health`| —                     | Health check                                             |
| GET    | `/ws`    | —                     | WebSocket upgrade; client then `subscribe` to topics     |
| POST   | `/notify`| `X-Webhook-Secret`    | Internal: Next.js app fans out an event to topics        |

### Topics

- `user:<userId>` — events delivered to one user (default fan-out target)
- `role:<ROLE>` — broadcast to all users of a given role

### Server messages

```
{ "type": "event",      "event": "notification.created", "data": {...} }
{ "type": "subscribed", "topics": [ "user:abc" ] }
{ "type": "pong" }
```

## Local development

```bash
cd websocket-server
pnpm install
pnpm dev          # wrangler dev — listens on http://localhost:8787
```

Then in the Next.js app set:

```env
NEXT_PUBLIC_WS_URL=ws://localhost:8787/ws
WS_WEBHOOK_URL=http://localhost:8787/notify
WS_WEBHOOK_SECRET=vb_dev_secret_change_me   # must match wrangler.toml [vars]
```

## Deploy

```bash
wrangler login
pnpm deploy
wrangler secret put WEBHOOK_SECRET   # rotate the dev secret in production
```

Set `NEXT_PUBLIC_WS_URL=wss://<worker-subdomain>.workers.dev/ws` and
`WS_WEBHOOK_URL=https://<worker-subdomain>.workers.dev/notify` in Vercel.
