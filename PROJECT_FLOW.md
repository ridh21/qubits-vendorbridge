# VendorBridge — Project Flow

Complete end-to-end flow for the VendorBridge procurement ERP. This document walks through every screen each role touches, the data each action produces, and the order in which the eight-step procurement workflow plays out.

---

## 1. High-level workflow

VendorBridge implements an eight-step procurement lifecycle. Every step is owned by a specific role and produces an artefact (RFQ, Quotation, Approval, PO, Invoice) that drives the next step.

```
  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
  │  Admin   │   │ Officer  │   │  Vendor  │   │ Manager  │
  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
       │              │              │              │
       │ seed users   │              │              │
       │ + vendors    │              │              │
       │─────────────▶│              │              │
       │              │ 1. Create    │              │
       │              │    Vendor    │              │
       │              │              │              │
       │              │ 2. Create &  │              │
       │              │    publish   │              │
       │              │    RFQ ─────▶│              │
       │              │              │              │
       │              │              │ 3. Submit    │
       │              │              │    Quotation │
       │              │◀─────────────│              │
       │              │              │              │
       │              │ 4. Compare   │              │
       │              │    quotations│              │
       │              │              │              │
       │              │ 5. Shortlist │              │
       │              │    & send    │              │
       │              │    for       │              │
       │              │    approval ───────────────▶│
       │              │              │              │
       │              │              │              │ 6. Approve /
       │              │              │              │    Reject
       │              │◀──────────────────────────  │
       │              │              │              │
       │              │ 7. PO        │              │
       │              │    auto-     │              │
       │              │    generated │              │
       │              │              │              │
       │              │ 8. Invoice   │              │
       │              │    generated │              │
       │              │    +         │              │
       │              │    PDF/Email │──────────────│
       │              │              │              │
```

State transitions per entity:

| Entity        | States                                                      |
|---------------|-------------------------------------------------------------|
| RFQ           | `DRAFT → OPEN → CLOSED → AWARDED` (or `CANCELLED`)          |
| RfqVendor     | `INVITED → SUBMITTED → SHORTLISTED → AWARDED` / `REJECTED`  |
| Quotation     | `DRAFT → SUBMITTED → SHORTLISTED → AWARDED` / `REJECTED`    |
| Approval      | `PENDING → APPROVED` / `REJECTED`                           |
| PurchaseOrder | `ISSUED → FULFILLED` (or `CANCELLED`)                       |
| Invoice       | `DRAFT → SENT → PAID` (or `OVERDUE`)                        |

---

## 2. First-time setup

These steps prepare the workspace before any role logs in.

1. **Install** dependencies: `pnpm install`.
2. **Configure** `.env` with `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`.
3. **Push schema**: `pnpm db:push`.
4. **Seed**: `pnpm db:seed` — creates admin/officer/manager/vendor accounts, 5 vendors, 4 RFQs, sample quotations + POs + invoices.
5. **Run**: `pnpm dev` and open `http://localhost:3000`.

All seeded accounts use password `demo1234`. Emails use `@yopmail.com` so every outbound mail can be inspected at https://yopmail.com.

---

## 3. Shared screens (all roles)

These screens are role-aware but available to every authenticated user.

| Route               | Purpose                                                              |
|---------------------|----------------------------------------------------------------------|
| `/login`            | Email + password login.                                              |
| `/signup`           | Self-registration. New users default to `PROCUREMENT_OFFICER`.       |
| `/forgot-password`  | Sends a Resend reset email with signed token (logs to console if no key). |
| `/reset-password`   | Sets a new password using the token from the email.                  |
| `/dashboard`        | Role-aware homepage with KPI cards + recent activity.                |
| `/activity`         | Filterable audit timeline.                                           |
| Topbar bell         | Per-user notifications, click to deep-link.                          |
| Topbar avatar       | Profile + sign out.                                                  |

---

## 4. Role-by-role flow

### 4.1 Admin (`admin@yopmail.com`)

**Purpose**: bootstrap the workspace, manage user accounts, see global analytics.

**Order of operations:**

1. **Log in** at `/login`.
2. **Open `/admin/users`** — full user list with role, vendor link, status, joined date.
   - Click **New user** to create officers, managers, or vendor users.
   - When creating a `VENDOR` role user, the dialog forces selection of the linked `Vendor` record (so the session has `vendorId`).
   - Use **Edit** to change name / role / linked vendor / reset password.
   - Use **Disable** / **Enable** to revoke access without deleting history.
3. **Open `/vendors`** — admin can also create + edit vendor records (same screen procurement officers use).
4. **Open `/reports`** — monthly trends, top vendors, vendor performance, KPIs. Export any tile as CSV.
5. **Open `/activity`** — full immutable audit log across the whole workspace.

**What only Admin can do:**
- Create / edit / disable users.
- Change a user's role.
- Link a vendor user to a `Vendor` record.

---

### 4.2 Procurement Officer (`officer@yopmail.com`)

**Purpose**: the main driver of the workflow — onboards vendors, creates RFQs, compares quotations, generates POs + invoices.

**Order of operations:**

#### Step 1 — Onboard a vendor (only if a new supplier is needed)

1. Go to `/vendors` → **New vendor**.
2. Fill the form:
   - `name`, `category` (IT / Office Supplies / Logistics / Services / Other),
   - `gstNumber` (15-char GST regex validated),
   - `contactName`, `contactEmail` (this is the address that will receive RFQ invites + invoices),
   - `contactPhone`, `address`,
   - `status` = `ACTIVE` (only ACTIVE vendors are pickable in RFQs).
3. Save. The vendor appears in the table; search + filter work on name, GST, category, status.

#### Step 2 — Create + publish an RFQ

1. Go to `/rfqs` → **New RFQ**.
2. Fill the form:
   - **Title**, **description**, **deadline** (date picker).
   - **Items** (repeating rows): `name`, `description`, `quantity`, `unit`. Add as many as needed.
   - **Attachments**: upload supporting files (specs, drawings).
   - **Invite vendors**: multi-select from active vendors.
3. Click **Save as draft** to keep working, or **Publish** to transition the RFQ from `DRAFT → OPEN`.
4. On publish:
   - Every invited vendor's `RfqVendor` row is `INVITED`.
   - A notification + activity log entry fires for each invited vendor user.
   - The RFQ appears on each vendor's `/quotations` invitations list.

#### Step 3 — Wait for quotations

- `/rfqs/[id]` shows the live response status per vendor: `Awaiting`, `Submitted`, `Shortlisted`, `Awarded`.
- The dashboard's "Active RFQs" card surfaces deadline countdowns.
- The bell notifies the officer each time a vendor submits.

#### Step 4 — Compare quotations

1. Once 2+ vendors have submitted, open `/rfqs/[id]/compare`.
2. The side-by-side matrix shows:
   - Rows = RFQ items, columns = vendors.
   - Per row, the cheapest unit price gets a green highlight.
   - Footer: subtotal, delivery days, vendor rating, submitted-at.
3. Sort by total / delivery / rating; filter to hide vendors above a price cap.

#### Step 5 — Shortlist + send for approval

1. In the compare view, click **Shortlist** on the chosen vendor's column → quotation moves to `SHORTLISTED`.
2. Click **Send for approval** → creates an `Approval` row (`PENDING`), assigns to all `MANAGER` + `ADMIN` users, fires notifications.
3. The RFQ now waits for a manager decision.

#### Step 6 — Wait for approval (handled by Manager — see 4.4)

#### Step 7 — Purchase Order

- When the manager **approves**, the system automatically:
  - Sets the quotation to `AWARDED`, the RFQ to `AWARDED`.
  - Creates a `PurchaseOrder` (`PO-YYYY-NNNN`, status `ISSUED`).
- Officer opens `/purchase-orders/[id]` to review the PO.

#### Step 8 — Invoice + PDF + Email

1. From the PO detail page, click **Generate invoice** → creates an `Invoice` (`INV-YYYY-NNNN`, status `DRAFT`, 18% GST default).
2. Open `/invoices/[id]`. The page exposes:
   - **PDF** — downloads a real PDF via `/api/invoices/[id]/pdf` (rendered with `@react-pdf/renderer`).
   - **Print** — opens `/invoices/[id]/print` with print-optimised layout.
   - **Send invoice** — POSTs to the send action which renders the PDF to a buffer and emails it to the vendor's `contactEmail` via Resend. Status moves to `SENT`, `sentAt` is stamped.
   - **Mark as paid** — moves to `PAID` and logs activity.

#### Anytime

- `/activity` shows the entire audit trail.
- `/reports` shows spend, top vendors, KPIs — exportable as CSV.

---

### 4.3 Vendor (`vendor@yopmail.com`)

**Purpose**: respond to RFQ invitations, track status of own quotations, see resulting POs + invoices.

The vendor user is **linked to one Vendor record** via `user.vendorId`. All vendor-scoped queries filter by that ID — a vendor can never see another vendor's data.

**Order of operations:**

1. **Log in** at `/login`. Dashboard shows:
   - "My invitations" (open RFQs awaiting a quote),
   - "My quotations" (submitted),
   - "My POs" + "My invoices".
2. **Open `/quotations`** — the invitations list. Each row links to one of three flows:
   - **Submit** — quotation does not yet exist.
   - **Edit** — draft exists, editable until deadline.
   - **View** — submitted (read-only once `SUBMITTED`, unless the RFQ is reopened).
3. **Open `/quotations/[id]`** for one invitation:
   - For each RFQ item, enter `unitPrice`. The page auto-computes line totals and grand total.
   - Enter `deliveryDays` and free-form `notes`.
   - **Save as draft** (status `DRAFT`) or **Submit** (status `SUBMITTED`, fires notification to the officer).
4. **Track status**:
   - `SUBMITTED` — officer has not yet decided.
   - `SHORTLISTED` — officer has chosen this quote and sent it for manager approval.
   - `AWARDED` — manager has approved; a PO has been issued.
   - `REJECTED` — manager rejected or officer chose a different vendor.
5. **View resulting PO** on `/purchase-orders` (filtered to your vendor) and **Invoice** on `/invoices`.
6. **Receive invoice email** at the vendor's `contactEmail` (a `@yopmail.com` inbox during the demo) with the PDF attached.

**What a vendor cannot do:**
- See other vendors' quotations or pricing.
- Edit a quotation after the RFQ deadline OR after it is `SHORTLISTED` / `AWARDED`.
- Approve anything.
- See the comparison matrix.

---

### 4.4 Manager / Approver (`manager@yopmail.com`)

**Purpose**: review the officer's shortlisted quotation and make the final approve/reject call.

**Order of operations:**

1. **Log in**. Dashboard surfaces "Pending approvals" with the count and the top 5.
2. **Open `/approvals`** — queue of all pending approvals across the workspace (RFQ code, vendor, quotation total, requested by, requested at).
3. **Open `/approvals/[id]`**:
   - Read-only snapshot of the quotation (items, prices, delivery days, vendor rating).
   - RFQ context (title, deadline, other invited vendors).
   - **Approval timeline** built from `ActivityLog` — created → reviewed → decided.
4. **Decide**:
   - **Approve** opens a dialog for `remarks` → on confirm:
     - Approval row → `APPROVED`, `decidedAt` stamped.
     - Quotation → `AWARDED`.
     - RFQ → `AWARDED`.
     - PO auto-created (kicks off step 7 for the officer).
     - Notifications fire to the officer + vendor.
   - **Reject** opens a dialog for `remarks` → on confirm:
     - Approval row → `REJECTED`.
     - Quotation → `REJECTED`.
     - RFQ stays `OPEN` so the officer can shortlist a different vendor.
     - Notification fires to the officer with the remarks.
5. **Monitor** ongoing work via `/activity` and `/reports`.

**What a manager cannot do:**
- Create RFQs, vendors, quotations, POs, or invoices.
- Edit a decision once stamped (a new approval has to be submitted).

---

## 5. Cross-cutting flows

### 5.1 Notifications + Activity

Every server-action mutation calls `logActivity` and `notify`:
- **ActivityLog** — immutable, queryable on `/activity`, exportable to CSV by admins.
- **Notification** — per-user inbox surfaced by the topbar bell. Click any row to deep-link to the entity.

Fan-out rules:
- RFQ published → all invited vendor users.
- Quotation submitted → the officer who created the RFQ.
- Sent for approval → all managers + admins.
- Approval decided → the originating officer + the vendor.
- Invoice sent → the vendor.

### 5.2 Auto-numbering

`lib/codes.ts → nextCode(prefix)` uses a `CodeSequence` row per prefix per year:
- `RFQ-YYYY-NNNN`
- `QT-YYYY-NNNN`
- `PO-YYYY-NNNN`
- `INV-YYYY-NNNN`

The seed primes the sequences so codes continue cleanly after a reseed.

### 5.3 Money

All amounts live in **paise** (integer math) inside the DB and `lib/money.ts`:
- `toPaise(rupees)` — entry into the system.
- `computeLineTotal({ quantity, unitPrice })`
- `computeTotals({ lines, taxRate })` → `{ subtotal, taxAmount, grandTotal }`.
- `formatCurrency(paise)` — render at the edge.

This prevents floating-point drift when adding tax across many lines.

### 5.4 RBAC

- `middleware.ts` blocks routes by role prefix (`/admin/*` → ADMIN, `/approvals/*` → MANAGER/ADMIN, etc.).
- `lib/rbac.ts → requireRole([roles])` is called at the top of every protected server action.
- The sidebar reads `useSessionRole` to hide links the user cannot use.

### 5.5 PDF + Email

- `components/pdf/invoice-pdf.tsx` — `@react-pdf/renderer` document.
- `app/api/invoices/[id]/pdf/route.ts` — streams the PDF on demand.
- `lib/email.ts → sendInvoiceEmail` — renders the PDF to a buffer, attaches it, sends via Resend. When `RESEND_API_KEY` is unset, logs to console instead so local development still works.

---

## 6. End-to-end demo script

Run the workspace through every role in one sitting:

1. **Reseed**: `pnpm db:reset` → fresh state.
2. **Officer** (`officer@yopmail.com`) → `/vendors/new` → create "Acme Steel" (Logistics, valid GST).
3. **Officer** → `/rfqs/new` → "Q2 Steel Procurement", 2 items, deadline +7 days, invite Acme + 1 seeded vendor → Publish.
4. **Vendor** (`vendor@yopmail.com`) → `/quotations` → open invitation → enter prices + delivery → Submit.
5. **Repeat step 4** for a second vendor (use the vendor user linked to that vendor record).
6. **Officer** → `/rfqs/[id]/compare` → see lowest-price highlights → Shortlist cheapest → Send for approval.
7. **Manager** (`manager@yopmail.com`) → `/approvals/[id]` → review timeline → Approve with remarks.
8. **Officer** → PO auto-created → `/purchase-orders/[id]` → **Generate invoice**.
9. **Officer** → `/invoices/[id]` → **PDF** (downloads), **Print** (opens print view), **Send invoice** (vendor's `@yopmail.com` inbox receives the PDF).
10. **Anyone** → `/activity` shows the full chain; the bell shows per-role notifications.
11. **Admin** (`admin@yopmail.com`) → `/reports` → confirm the spend, vendor, and KPIs reflect the run → export CSV.
12. **Admin** → `/admin/users` → create a fresh officer → log in works.

Every one of the ten PDF features and all four roles are exercised by the end of step 12.
