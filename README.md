# VendorBridge

Procurement & Vendor Management ERP built for the Odoo hackathon problem statement.

VendorBridge centralises vendor onboarding, RFQs, vendor quotations, comparison, approvals, purchase orders, and invoices (with PDF generation, print view, and email delivery) in one Next.js fullstack workspace.

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind v4**
- **shadcn/ui** (`base-nova` style, base-ui primitives, Tabler icons)
- **Prisma 6** + **Postgres** (Neon/Supabase/local)
- **Auth.js v5 (NextAuth)** — credentials provider, JWT sessions, role-based claims
- **Resend** + **@react-pdf/renderer** — emailed invoices with PDF attachments
- **Recharts** — analytics charts

## Roles

| Role | Capabilities |
|---|---|
| **Admin** | Manage users, vendors, view analytics, all officer + manager permissions |
| **Procurement Officer** | Create RFQs, compare quotations, generate POs, generate + send invoices |
| **Manager / Approver** | Approve or reject procurement requests, monitor workflows |
| **Vendor** | Submit quotations, track RFQ status, view POs + invoices |

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env` and set:
   - `DATABASE_URL` — Postgres connection string (Neon recommended for quick start)
   - `AUTH_SECRET` — run `openssl rand -base64 32`
   - `RESEND_API_KEY` (optional) — without it, emails are logged to the console
   - `EMAIL_FROM` — verified Resend sender, e.g. `VendorBridge <noreply@yourdomain.com>`
3. Push the schema and seed:
   ```bash
   pnpm db:push
   pnpm db:seed
   ```
4. Start the dev server:
   ```bash
   pnpm dev
   ```

## Demo accounts

All passwords: `demo1234`

| Email | Role |
|---|---|
| `admin@yopmail.com` | Admin |
| `officer@yopmail.com` | Procurement Officer |
| `manager@yopmail.com` | Manager / Approver |
| `vendor@yopmail.com` | Vendor (linked to Acme Steel Co.) |

## Demo flow

1. Log in as **officer** → `/dashboard`. Create a new vendor at `/vendors/new`.
2. Create a new RFQ at `/rfqs/new` — add items, pick a deadline, invite vendors, publish.
3. Log in as **vendor** → `/quotations` → open the invitation → enter prices and submit.
4. Back as **officer** → `/rfqs/[id]/compare` → review side-by-side with lowest-price highlights → **Shortlist** + **Send for approval**.
5. Log in as **manager** → `/approvals` → open the request → review the timeline → **Approve** with remarks.
6. Back as officer → the PO is auto-generated → open `/purchase-orders/[id]` → **Generate invoice**.
7. From `/invoices/[id]` → **PDF** to download, **Print** to print, **Send invoice** to email via Resend.
8. `/activity` shows the full audit trail; the bell in the topbar surfaces notifications for each role.
9. `/reports` shows monthly spend, top vendors, vendor performance, and KPIs — each tile has CSV export.

## Project layout

```
src/
  app/
    (auth)/         # login, signup, forgot, reset
    (app)/          # protected shell — sidebar + topbar
      dashboard/
      vendors/
      rfqs/[id]/compare/
      quotations/
      approvals/
      purchase-orders/
      invoices/[id]/{page,print}
      activity/
      reports/
      admin/users/
    api/
      auth/[...nextauth]/
      invoices/[id]/pdf/
  components/
    ui/             # shadcn base-nova primitives
    layout/         # sidebar, topbar, notifications bell
    {vendors,rfqs,quotations,approvals,invoices,reports,admin,common}/
    pdf/invoice-pdf.tsx
  lib/
    auth.ts         # NextAuth v5 config
    prisma.ts       # singleton client
    rbac.ts         # session + permission map
    money.ts        # paise/cents helpers
    codes.ts        # auto-numbering (RFQ-/QT-/PO-/INV-)
    compare.ts      # quotation comparison helper
    csv.ts          # CSV export
    pdf.tsx         # PDF rendering
    email.ts        # Resend wrapper (dev fallback logs to console)
    activity.ts     # logActivity + notify fan-out
    actions/        # server actions per module
    validation/     # zod schemas
  middleware.ts     # route protection by role
prisma/
  schema.prisma
  seed.ts
```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Run Next.js dev server with Turbopack |
| `pnpm build` | Production build |
| `pnpm start` | Run the production server |
| `pnpm db:generate` | Regenerate the Prisma client |
| `pnpm db:push` | Push the Prisma schema to the DB (no migration history) |
| `pnpm db:migrate` | Create + apply a migration |
| `pnpm db:reset` | Drop + recreate + seed |
| `pnpm db:seed` | Re-run the seed script |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm lint` | ESLint |
