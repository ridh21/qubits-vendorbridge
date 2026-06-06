# 🏗️ VendorBridge

### *From the first RFQ to the final paid invoice — structured, automated, and fully audited.*

**A production-grade, full-stack Procurement & Vendor Management ERP built for organizations that want to replace WhatsApp approvals, Excel tenders, and gut-feel vendor selection with a single, structured, role-driven platform.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Workers](https://img.shields.io/badge/Realtime-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)

[**Live Demo**](#) · [**Excalidraw Mockup**](https://app.excalidraw.com/l/65VNwvy7c4X/5ywnm0v3qhK) · [**Problem Statement**](#-problem-statement)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [What VendorBridge Does](#-what-vendorbridge-does)
- [Architecture](#️-architecture)
- [Tech Stack](#-tech-stack)
- [Data Model](#️-data-model)
- [User Roles & Permissions](#-user-roles--permissions)
- [Complete User Workflow](#-complete-user-workflow)
  - [Admin](#41-admin)
  - [Procurement Officer](#42-procurement-officer)
  - [Vendor](#43-vendor)
  - [Manager / Approver](#44-manager--approver)
- [Screens & Features](#-screens--features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Database Seeding](#-database-seeding)
- [End-to-End Demo Script](#-end-to-end-demo-script)
- [Cross-Cutting Features](#-cross-cutting-features)
- [Roadmap](#️-roadmap)

---

## 🎯 Problem Statement

Most procurement in SMEs and enterprises still runs on:

- 📧 **Zero audit trails** — Who approved what? Nobody knows.
- 📊 **No bid comparison** — Cheapest vendor? Just a gut feeling.
- 🕐 **Manual bottlenecks** — Purchase orders taking days to generate instead of seconds.
- 💸 **No spend visibility** — Finance teams flying blind.

**VendorBridge** digitizes the *entire* procurement lifecycle — structured, secure, and automated from the first RFQ to the final paid invoice, with every action tracked in an immutable audit log.

---

## ✨ What VendorBridge Does

> One platform. Eight modules. Zero manual errors.

| # | Module | What It Does |
|---|--------|-------------|
| 🏢 | **Vendor Registry** | Register suppliers with GST details, categories, contact info, and performance tracking |
| 📋 | **Smart RFQ Engine** | Draft multi-item tenders, attach files, set deadlines, and dispatch to selected vendors |
| 💬 | **Quotation Portal** | Vendors submit itemized bids with unit prices, delivery timelines, and notes |
| ⚖️ | **Bid Comparison Matrix** | Side-by-side price and delivery analysis — lowest bid auto-highlighted per line item |
| ✅ | **Approval Workflows** | Multi-step manager approval pipelines with full remark history and timeline |
| 📦 | **Purchase Order Gen** | Auto-numbered POs (PO-YYYY-NNNN) generated instantly on approval |
| 🧾 | **Invoice Engine** | GST-aware tax invoices with subtotals, PDF download, print support, and email delivery |
| 📡 | **Live Notifications** | Real-time WebSocket alerts for every procurement state change, per-role |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│              🖥️  Client — Next.js 16 + React 19              │
│        Role-Based UI · shadcn/ui · Tailwind v4 · Recharts    │
└─────────────┬─────────────────────────────┬─────────────────┘
              │ Server Actions (RSC)         │ WebSocket
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────────┐
│  ⚙️  Next.js App Server  │   │  📡 Cloudflare Workers WS   │
│  Auth (NextAuth v5)     │   │  Durable Objects (WS_HUB)   │
│  Prisma ORM             │   │  Real-time fan-out          │
│  RBAC Middleware        │   └─────────────────────────────┘
│  PDF Renderer           │
│  Email (Resend)         │
└─────────────┬───────────┘
              │
              ▼
┌─────────────────────────┐
│   💾 PostgreSQL          │
│   (Supabase / any PG)   │
└─────────────────────────┘
```

### End-to-End Procurement Flow

```
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │  Admin   │   │ Officer  │   │  Vendor  │   │ Manager  │
  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
       │              │              │              │
       │ Manage       │              │              │
       │ users &      │              │              │
       │ vendors      │              │              │
       │              │ 1. Create    │              │
       │              │    Vendor    │              │
       │              │              │              │
       │              │ 2. Create &  │              │
       │              │    Publish   │              │
       │              │    RFQ  ────►│              │
       │              │              │              │
       │              │              │ 3. Submit    │
       │              │              │    Quotation │
       │              │◄─────────────│              │
       │              │              │              │
       │              │ 4. Compare   │              │
       │              │    Quotations│              │
       │              │              │              │
       │              │ 5. Shortlist │              │
       │              │    & Send    │              │
       │              │    for       │              │
       │              │    Approval ─┼─────────────►│
       │              │              │              │
       │              │              │              │ 6. Approve /
       │              │              │              │    Reject
       │              │◄─────────────┼──────────────│
       │              │              │              │
       │              │ 7. PO Auto-  │              │
       │              │    Generated │              │
       │              │              │              │
       │              │ 8. Invoice   │              │
       │              │    + PDF     │              │
       │              │    + Email  ─┼─────────────►│
```

### Entity State Machines

| Entity | States |
|--------|--------|
| RFQ | `DRAFT → OPEN → CLOSED → AWARDED` (or `CANCELLED`) |
| RfqVendor | `INVITED → SUBMITTED → SHORTLISTED → AWARDED` / `REJECTED` |
| Quotation | `DRAFT → SUBMITTED → SHORTLISTED → AWARDED` / `REJECTED` |
| Approval | `PENDING → APPROVED` / `REJECTED` |
| PurchaseOrder | `ISSUED → FULFILLED` (or `CANCELLED`) |
| Invoice | `DRAFT → SENT → PAID` (or `OVERDUE`) |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.2 | Full-stack React framework (App Router + Server Actions) |
| React | 19 | UI library |
| TypeScript | 5 | Type safety across the entire codebase |
| Tailwind CSS | v4 | Utility-first styling |
| shadcn/ui | latest | Accessible component library built on Radix UI |
| Recharts | 3.8 | Procurement analytics charts |
| @react-pdf/renderer | 4.5 | Client & server PDF generation |
| Motion | 12 | Animations (GSAP + Framer Motion) |
| React Hook Form + Zod | 7.x / 3.x | Form management & schema validation |
| next-themes | 0.4 | Dark / light mode |
| sonner | 2.0 | Toast notifications |

### Backend & Data
| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js Server Actions | — | API layer (no separate Express server) |
| NextAuth v5 | 5.0-beta | Authentication, session management, JWT |
| Prisma | 6.19 | ORM, schema management, migrations |
| PostgreSQL | any | Primary relational database (Supabase recommended) |
| bcryptjs | 3.x | Password hashing |
| Nodemailer | 7.x | Email delivery |
| nanoid | 5.x | Unique ID generation |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Cloudflare Workers + Durable Objects | Real-time WebSocket hub for live notifications |
| Resend | Transactional email (invoice delivery, password reset, RFQ invites) |
| Vercel | Frontend + serverless deployment |

---

## 🗄️ Data Model

VendorBridge uses a fully relational PostgreSQL schema managed by Prisma.

```
roles ──────────────── users
                         │
              ┌──────────┼──────────────────┐
              │          │                  │
           rfqs      approvals       notifications
              │
    ┌─────────┼───────────┐
    │         │           │
rfq_items  rfq_vendors  quotations
                            │
                   ┌────────┼────────┐
                   │        │        │
           quotation_items approval  purchase_orders
                                          │
                                       invoices
```

### Key Models

| Model | Description |
|-------|-------------|
| `User` | All platform users with role, optional vendor link, disabled flag |
| `Vendor` | Supplier records with GST, category, contact info, status |
| `Rfq` | Request for Quotation with items, deadline, file attachments |
| `RfqVendor` | Join table tracking each vendor's invitation + response status |
| `Quotation` | Vendor's price response with line items, delivery days, notes |
| `Approval` | Single approval round per shortlisted quotation |
| `PurchaseOrder` | Auto-numbered PO generated on approval (`PO-YYYY-NNNN`) |
| `Invoice` | GST-aware invoice from a PO (`INV-YYYY-NNNN`), with sent/paid tracking |
| `ActivityLog` | Immutable audit record for every system mutation |
| `Notification` | Per-user inbox entries with deep-link references |
| `CodeSequence` | Auto-increment sequences per prefix per year (RFQ, QT, PO, INV) |

---

## 🔐 User Roles & Permissions

RBAC is enforced at **middleware level** on every route and at **server action level** on every mutation — not just the UI.

```
ADMIN > PROCUREMENT_OFFICER > MANAGER > VENDOR
```

| Permission | Admin | Officer | Manager | Vendor |
|------------|:-----:|:-------:|:-------:|:------:|
| Manage users & roles | ✅ | ❌ | ❌ | ❌ |
| Disable / enable users | ✅ | ❌ | ❌ | ❌ |
| Register & manage vendors | ✅ | ✅ | ❌ | ❌ |
| Create & publish RFQs | ✅ | ✅ | ❌ | ❌ |
| Invite vendors to RFQs | ✅ | ✅ | ❌ | ❌ |
| Submit quotations | ❌ | ❌ | ❌ | ✅ |
| View bid comparison matrix | ✅ | ✅ | ❌ | ❌ |
| Shortlist a quotation | ✅ | ✅ | ❌ | ❌ |
| Initiate approval workflow | ✅ | ✅ | ❌ | ❌ |
| Approve / reject workflows | ✅ | ❌ | ✅ | ❌ |
| Generate Purchase Orders | ✅ | ✅ | ❌ | ❌ |
| Generate invoices | ✅ | ✅ | ❌ | ❌ |
| Send invoice via email | ✅ | ✅ | ❌ | ❌ |
| View own POs & invoices | ✅ | ✅ | ✅ | ✅ |
| View reports & analytics | ✅ | ✅ | ✅ | ❌ |
| Full audit log access | ✅ | ❌ | ❌ | ❌ |

---

## 🔄 Complete User Workflow

### 4.1 Admin

**Purpose:** Bootstrap the workspace, manage user accounts, view global analytics.

1. **Log in** at `/login`.
2. **Open `/admin/users`** — full user list with role, vendor link, status, and join date.
   - Click **New user** to create officers, managers, or vendor users.
   - When creating a `VENDOR` role user, the dialog forces selection of the linked `Vendor` record.
   - Use **Edit** to change name / role / linked vendor / reset password.
   - Use **Disable / Enable** to revoke access without deleting history.
3. **Open `/vendors`** — create and manage vendor records.
4. **Open `/reports`** — monthly trends, top vendors, vendor performance, KPIs. Export any tile as CSV.
5. **Open `/activity`** — full immutable audit log across the entire workspace.

**Exclusive admin powers:** Create / edit / disable users, change user roles, link vendor users to `Vendor` records.

---

### 4.2 Procurement Officer

**Purpose:** The main driver of the procurement lifecycle — onboards vendors, creates RFQs, compares quotations, generates POs and invoices.

#### Step 1 — Onboard a Vendor

1. Go to `/vendors` → **New vendor**.
2. Fill the form:
   - `name`, `category` (IT / Office Supplies / Logistics / Services / Other)
   - `gstNumber` (15-character GST regex validated)
   - `contactName`, `contactEmail` (receives RFQ invites and invoice emails)
   - `contactPhone`, `address`
   - `status` = `ACTIVE` (only ACTIVE vendors are available in RFQs)
3. Save. The vendor appears in the table; search and filter work on name, GST, category, and status.

#### Step 2 — Create & Publish an RFQ

1. Go to `/rfqs` → **New RFQ**.
2. Fill the form:
   - **Title**, **description**, **deadline** (date picker)
   - **Items** (repeating rows): `name`, `description`, `quantity`, `unit`
   - **Attachments**: upload supporting files (specs, drawings, terms)
   - **Invite vendors**: multi-select from active vendors
3. Click **Save as draft** to keep working, or **Publish** to transition the RFQ to `OPEN`.
4. On publish:
   - Every invited vendor's `RfqVendor` row becomes `INVITED`
   - A notification and activity log entry fires for each invited vendor user
   - The RFQ appears on each vendor's `/quotations` invitations list

#### Step 3 — Monitor Responses

- `/rfqs/[id]` shows live response status per vendor: `Awaiting`, `Submitted`, `Shortlisted`, `Awarded`
- The dashboard "Active RFQs" card shows deadline countdowns
- The bell notifies the officer each time a vendor submits

#### Step 4 — Compare Quotations

1. Once 2+ vendors have submitted, open `/rfqs/[id]/compare`.
2. The side-by-side matrix shows:
   - Rows = RFQ items, columns = vendors
   - Per row, the cheapest unit price is highlighted in green
   - Footer: subtotal, delivery days, vendor rating, submission timestamp
3. Sort by total / delivery / rating; filter vendors above a price cap.

#### Step 5 — Shortlist & Send for Approval

1. In the compare view, click **Shortlist** on the chosen vendor's column → quotation moves to `SHORTLISTED`.
2. Click **Send for approval** → creates an `Approval` row (`PENDING`), assigns to all `MANAGER` and `ADMIN` users, fires notifications.

#### Step 6 — Wait for Manager Decision *(see 4.4)*

#### Step 7 — Purchase Order

When the manager approves:
- Quotation → `AWARDED`, RFQ → `AWARDED`
- A `PurchaseOrder` is automatically created with status `ISSUED` and an auto-number `PO-YYYY-NNNN`
- Officer opens `/purchase-orders/[id]` to review

#### Step 8 — Invoice + PDF + Email

1. From the PO detail page, click **Generate invoice** → creates `INV-YYYY-NNNN` at `DRAFT` status with 18% GST applied.
2. Open `/invoices/[id]`:
   - **Download PDF** — streams a real PDF via `/api/invoices/[id]/pdf`
   - **Print** — opens `/invoices/[id]/print` with print-optimized layout
   - **Send invoice** — renders PDF to buffer and emails it to the vendor's `contactEmail`; status moves to `SENT`, `sentAt` is stamped
   - **Mark as paid** — moves to `PAID` and logs activity

---

### 4.3 Vendor

**Purpose:** Respond to RFQ invitations, track quotation status, receive resulting POs and invoices.

> A vendor user is **linked to exactly one Vendor record** via `user.vendorId`. All queries are scoped to that vendor — a vendor can never see another vendor's data.

1. **Log in**. Dashboard shows invitations, submitted quotations, and recent POs/invoices.
2. **Open `/quotations`** — the invitations list. Each row links to one of three flows:
   - **Submit** — quotation does not yet exist
   - **Edit** — draft exists, editable until the deadline
   - **View** — submitted (read-only once `SUBMITTED`)
3. **Open `/quotations/[id]`** for one invitation:
   - Enter `unitPrice` per RFQ item (line totals and grand total auto-compute)
   - Enter `deliveryDays` and free-form `notes`
   - **Save as draft** (`DRAFT`) or **Submit** (`SUBMITTED`) — fires notification to the officer
4. **Track status** on the quotations list:
   - `SUBMITTED` — officer is reviewing
   - `SHORTLISTED` — chosen for approval
   - `AWARDED` — approved; a PO has been issued
   - `REJECTED` — officer chose a different vendor
5. **View resulting PO** at `/purchase-orders` and **invoice** at `/invoices`.
6. **Receive invoice email** with attached PDF at the vendor's `contactEmail`.

**What a vendor cannot do:** See other vendors' quotations or pricing, edit a quotation after the deadline or after `SHORTLISTED`/`AWARDED`, approve anything, or access the comparison matrix.

---

### 4.4 Manager / Approver

**Purpose:** Review the officer's shortlisted quotation and make the final approve / reject call.

1. **Log in**. Dashboard surfaces **Pending approvals** count and top 5 items.
2. **Open `/approvals`** — queue of all pending approvals (RFQ code, vendor, quotation total, requested by, requested at).
3. **Open `/approvals/[id]`**:
   - Read-only snapshot of the quotation (items, prices, delivery days, vendor rating)
   - RFQ context (title, deadline, other invited vendors)
   - **Approval timeline** from `ActivityLog` — created → reviewed → decided
4. **Decide:**
   - **Approve** → dialog for `remarks` → Approval `APPROVED`, Quotation → `AWARDED`, RFQ → `AWARDED`, PO auto-created, notifications fire to officer + vendor
   - **Reject** → dialog for `remarks` → Approval `REJECTED`, Quotation → `REJECTED`, RFQ stays `OPEN` so officer can shortlist a different vendor, notification fires to officer with remarks

**What a manager cannot do:** Create RFQs, vendors, quotations, POs, or invoices. Edit a decision once stamped.

---

## 📱 Screens & Features

| Route | Role Access | Purpose |
|-------|------------|---------|
| `/` | Public | Landing page with feature overview and role previews |
| `/login` | Public | Email + password authentication |
| `/forgot-password` | Public | Sends a signed reset-token email |
| `/reset-password` | Public | Sets new password from token link |
| `/dashboard` | All | Role-aware KPI cards, recent activity, pending approvals |
| `/vendors` | Admin, Officer | Vendor list with search, filter, category, status |
| `/vendors/new` | Admin, Officer | Vendor registration form (GST validated) |
| `/vendors/[id]` | Admin, Officer | Vendor detail, edit, status toggle |
| `/rfqs` | Admin, Officer | RFQ list with status filters and deadline tracking |
| `/rfqs/new` | Admin, Officer | Multi-item RFQ form with file upload and vendor multi-select |
| `/rfqs/[id]` | Admin, Officer | RFQ detail + per-vendor response status |
| `/rfqs/[id]/compare` | Admin, Officer | Side-by-side bid comparison matrix |
| `/quotations` | Vendor | Invitations list + submit/edit/view flows |
| `/quotations/[id]` | Vendor | Itemized quotation form with auto-computed totals |
| `/approvals` | Admin, Manager | Pending approval queue |
| `/approvals/[id]` | Admin, Manager | Approval detail + approve/reject with remarks |
| `/purchase-orders` | All | PO list, scoped by role/vendor |
| `/purchase-orders/[id]` | All | PO detail + generate invoice action |
| `/invoices` | All | Invoice list with status tracking |
| `/invoices/[id]` | All | Invoice detail + PDF download + send email + mark paid |
| `/invoices/[id]/print` | All | Print-optimized invoice layout |
| `/activity` | All | Filterable, exportable audit timeline |
| `/reports` | Admin, Officer, Manager | Analytics: spend, top vendors, trends, KPIs |
| `/admin/users` | Admin | Full user management (create, edit, disable, role-assign) |
| `/profile` | All | Update own name and password |

---

## 📁 Project Structure

```
qubits-vendorbridge/
├── prisma/
│   ├── schema.prisma           # 14 models, enums, relations
│   ├── seed.ts                 # Demo data: 4 roles, 5 vendors, 4 RFQs, sample POs & invoices
│   └── migrations/             # Prisma migration history
│
├── src/
│   ├── middleware.ts            # Route-level RBAC (blocks /admin/*, /approvals/*, etc.)
│   │
│   ├── app/
│   │   ├── page.tsx             # Landing page
│   │   ├── globals.css          # Tailwind v4 global styles
│   │   │
│   │   ├── (auth)/              # Unauthenticated pages
│   │   │   ├── login/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   │
│   │   ├── (app)/               # Authenticated app shell
│   │   │   ├── dashboard/
│   │   │   ├── vendors/         # list · new · [id]
│   │   │   ├── rfqs/            # list · new · [id] · [id]/compare
│   │   │   ├── quotations/      # list · [id]
│   │   │   ├── approvals/       # list · [id]
│   │   │   ├── purchase-orders/ # list · [id]
│   │   │   ├── invoices/        # list · [id] · [id]/print
│   │   │   ├── reports/
│   │   │   ├── activity/
│   │   │   ├── profile/
│   │   │   └── admin/users/
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # NextAuth v5 handler
│   │       └── invoices/[id]/pdf/   # PDF stream endpoint
│   │
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── layout/              # AppSidebar, AppTopbar, NotificationsBell, Nav
│   │   ├── landing/             # Hero, FeaturesBento, Workflow, FAQ, GlassNav
│   │   ├── auth/                # LoginForm, ForgotPasswordForm, ResetPasswordForm
│   │   ├── vendors/             # VendorForm
│   │   ├── rfqs/                # RfqForm, PublishRfqButton
│   │   ├── quotations/          # QuotationForm
│   │   ├── approvals/           # ApprovalTimeline, ApprovalDecisionButtons
│   │   ├── invoices/            # InvoiceSendForm, InvoiceMarkPaidButton, PrintTrigger
│   │   ├── reports/             # ReportsView (Recharts)
│   │   ├── pdf/                 # InvoicePDF (@react-pdf/renderer document)
│   │   ├── common/              # StatusBadge, VendorMultiSelect, ClickableTableRow
│   │   └── admin/               # UserDialog, ToggleUserButton
│   │
│   └── hooks/
│       ├── use-mobile.ts
│       └── use-realtime-notifications.ts   # WebSocket → bell updates
│
├── websocket-server/            # Cloudflare Workers real-time hub
│   ├── src/index.js             # Durable Object (WS_HUB) — WebSocket fan-out
│   └── wrangler.toml            # Cloudflare deployment config
│
├── package.json
├── next.config.ts
├── tsconfig.json
└── components.json              # shadcn/ui config
```

---

## ⚡ Quick Start

> Get the full ERP running locally in under 5 minutes.

### Prerequisites

- Node.js ≥ 18
- pnpm (`npm install -g pnpm`)
- PostgreSQL instance — [Supabase free tier](https://supabase.com) works perfectly
- Resend account (free tier) for email — or skip for local console logging

### 1 · Clone & Install

```bash
git clone https://github.com/your-org/qubits-vendorbridge.git
cd qubits-vendorbridge
pnpm install
```

### 2 · Configure Environment

Create a `.env` file in the root:

```env
# Database (Supabase or any PostgreSQL)
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
AUTH_SECRET="your_auth_secret_here"

# Email (Resend) — optional; logs to console if unset
RESEND_API_KEY="re_xxxxxxxxxxxx"
EMAIL_FROM="VendorBridge <noreply@yourdomain.com>"

# WebSocket server (Cloudflare Workers) — optional for local dev
NEXT_PUBLIC_WS_URL="wss://vendorbridge-ws.your-subdomain.workers.dev"
WS_WEBHOOK_SECRET="vb_dev_secret_change_me"
```

### 3 · Set Up the Database

```bash
# Push the schema to your database
pnpm db:push

# Seed with demo data (4 roles, 5 vendors, 4 RFQs, sample POs & invoices)
pnpm db:seed
```

### 4 · Run the Application

```bash
pnpm dev
# → http://localhost:3000
```

### 5 · (Optional) Run the WebSocket Server

```bash
cd websocket-server
npm install
npx wrangler dev
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|:--------:|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `AUTH_SECRET` | ✅ | NextAuth signing secret (min 32 chars) |
| `RESEND_API_KEY` | ⚠️ | Resend API key for email — logs to console if unset |
| `EMAIL_FROM` | ⚠️ | From address for outbound email |
| `NEXT_PUBLIC_WS_URL` | ⚠️ | Cloudflare Workers WebSocket URL for real-time notifications |
| `WS_WEBHOOK_SECRET` | ⚠️ | Shared secret between Next.js and the WS worker |

---

## 🌱 Database Seeding

Running `pnpm db:seed` creates a ready-to-use demo workspace:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@yopmail.com` | `demo1234` |
| Procurement Officer | `officer@yopmail.com` | `demo1234` |
| Manager | `manager@yopmail.com` | `demo1234` |
| Vendor | `vendor@yopmail.com` | `demo1234` |

> 💡 All demo emails use `@yopmail.com` — inspect any outbound mail at [yopmail.com](https://yopmail.com) without creating an account.

The seed also creates 5 vendors, 4 RFQs in various states, sample quotations, purchase orders, and invoices so every screen has data immediately.

---

## 🎭 End-to-End Demo Script

Run VendorBridge through every role in one sitting to exercise all features:

```
1.  Reseed           →  pnpm db:reset  (fresh state)
2.  Officer          →  /vendors/new   →  Create "Acme Steel" (Logistics, valid GST)
3.  Officer          →  /rfqs/new      →  "Q2 Steel Procurement", 2 items, deadline +7 days,
                                          invite Acme + 1 seeded vendor → Publish
4.  Vendor           →  /quotations    →  Open invitation → enter prices + delivery → Submit
5.  (Repeat step 4 for the second vendor using that vendor's credentials)
6.  Officer          →  /rfqs/[id]/compare  →  See green highlights → Shortlist cheapest
                                              → Send for approval
7.  Manager          →  /approvals/[id]     →  Review timeline → Approve with remarks
8.  Officer          →  PO auto-created     →  /purchase-orders/[id] → Generate invoice
9.  Officer          →  /invoices/[id]      →  Download PDF · Print · Send invoice (email
                                              lands at vendor's @yopmail.com inbox)
10. Anyone           →  /activity           →  Full audit chain visible
11. Admin            →  /reports            →  Spend, top vendors, KPIs → Export CSV
12. Admin            →  /admin/users        →  Create a fresh officer → log in works
```

All four roles, all PDF features, and the complete 8-step procurement workflow are exercised by step 12.

---

## ⚙️ Cross-Cutting Features

### Auto-Numbering

`lib/codes.ts → nextCode(prefix)` uses a `CodeSequence` row per prefix per year, producing clean sequential codes that survive reseeds:

- `RFQ-YYYY-NNNN`
- `QT-YYYY-NNNN`
- `PO-YYYY-NNNN`
- `INV-YYYY-NNNN`

### Money Handling

All amounts are stored in **paise** (integer math) in the database via `lib/money.ts`:

- `toPaise(rupees)` — entry point from user input
- `computeLineTotal({ quantity, unitPrice })`
- `computeTotals({ lines, taxRate })` → `{ subtotal, taxAmount, grandTotal }`
- `formatCurrency(paise)` — display formatting at the edge

This prevents floating-point drift when summing tax across many line items.

### Notifications & Activity

Every server action calls both `logActivity` and `notify`:

- **ActivityLog** — immutable, queryable at `/activity`, exportable to CSV by admins
- **Notification** — per-user inbox in the topbar bell; click any row to deep-link to the entity

Fan-out rules:
| Event | Notified |
|-------|---------|
| RFQ published | All invited vendor users |
| Quotation submitted | Officer who created the RFQ |
| Sent for approval | All managers + admins |
| Approval decided | Originating officer + the vendor |
| Invoice sent | Vendor |

### PDF & Email

- `components/pdf/invoice-pdf.tsx` — `@react-pdf/renderer` document component
- `app/api/invoices/[id]/pdf/route.ts` — streams the PDF on demand
- `lib/email.ts → sendInvoiceEmail` — renders PDF to a buffer, attaches it, sends via Resend. Falls back to console logging if `RESEND_API_KEY` is unset.

### RBAC

- `middleware.ts` blocks route groups by role: `/admin/*` → ADMIN only, `/approvals/*` → MANAGER/ADMIN, etc.
- `lib/rbac.ts → requireRole([roles])` is called at the top of every protected server action
- The sidebar reads `useSessionRole` to hide links the current user cannot access

---

## 🛣️ Roadmap

- [ ] **Vendor self-registration portal** — suppliers onboard themselves
- [ ] **Multi-level approval thresholds** — auto-route by PO value
- [ ] **Bulk RFQ import** — CSV/Excel line-item upload
- [ ] **Mobile PWA** — offline-ready for field procurement agents
- [ ] **Webhook integrations** — ERP connectors (SAP, Tally, Zoho Books)
- [ ] **Spend forecasting** — ML-based procurement trend predictions
- [ ] **Vendor portal** — dedicated external-facing portal for supplier management

---

## 🤝 Contributing

```bash
# Fork the repo, then:
git checkout -b feature/your-feature-name
git commit -m "feat: describe your change"
git push origin feature/your-feature-name
# Open a Pull Request
```

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

MIT © 2026 Team Qubits

---

**Built with 🔥 for the VendorBridge Hackathon**

*If this project helped you, drop a ⭐ — it means the world to us.*
