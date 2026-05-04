# Farmlinker

Farmlinker connects farmers seeking land with landowners who have farmland available in Illinois. Profiles and listings go through an admin approval step before gaining full visibility — keeping the platform trusted on both sides.

---

## What you can do here

**As a farmer** — create a profile describing your operation, get approved by an admin, browse approved farmland listings, and send inquiries directly to landowners.

**As a landowner** — create a profile, list your farmland with details about acreage, infrastructure, and lease terms, get approved, and respond to farmer inquiries.

**As an admin** — review and approve/reject user profiles and listings, monitor all inquiry threads, and intervene when needed.

---

## Screenshots

> _Screenshots coming — add `.png` files to `docs/screenshots/` and uncomment below._

<!-- ![Browse listings](docs/screenshots/browse.png) -->
<!-- *Browse page — approved farmland listings with featured images and key stats* -->

<!-- ![Listing detail](docs/screenshots/listing-detail.png) -->
<!-- *Listing detail — smart photo gallery (1 / 2 / 3+ layout), stats strip, and inquiry CTA* -->

<!-- ![Inquiry thread](docs/screenshots/inquiry-thread.png) -->
<!-- *Inquiry thread — chat-bubble layout showing farmer ↔ landowner conversation* -->

<!-- ![Admin dashboard](docs/screenshots/admin-dashboard.png) -->
<!-- *Admin dashboard — pending user/listing counts, quick action links* -->

<!-- ![Dev toolbar](docs/screenshots/dev-toolbar.png) -->
<!-- *Dev toolbar — breakpoint indicator, current user, one-click account switching* -->

---

## Trying it out (dev)

### 1. Start the dev server

```bash
pnpm install
pnpm dev       # → http://localhost:4321
```

Set up `.env` first (see [Environment setup](#environment-setup) below).

### 2. Use the dev toolbar

A persistent toolbar appears at the bottom of every page in development. It won't appear in production builds.

| Section | What it shows |
|---|---|
| Breakpoint pill | Current Tailwind breakpoint — **xs / sm / md / lg / xl / 2xl** — updates live as you resize |
| Current user | Name · role / status (green = approved, yellow = pending, red = suspended) |
| Switch buttons | One-click login as any of the 5 named dev accounts — page reloads instantly |
| Sign out | Signs out and sends you to the sign-in page |

The toolbar collapses to a thin strip; state is saved in `localStorage`.

### 3. Named dev accounts (password: `devpass123`)

Run `pnpm seed` to create these if they don't exist yet.

| Account | Role | Status | What you can test |
|---|---|---|---|
| `admin@farmlinker.dev` | admin | approved | Full admin panel — review queues, all user/listing detail, inquiry oversight |
| `farmer-approved@farmlinker.dev` | farmer | approved | Browse listings, send inquiries, view threads |
| `farmer-pending@farmlinker.dev` | farmer | pending | Onboarding flow, restricted access (can't browse or inquire) |
| `landowner-approved@farmlinker.dev` | landowner | approved | Manage listings, respond to inquiries |
| `landowner-pending@farmlinker.dev` | landowner | pending | Onboarding flow, restricted access |

### 4. Suggested walkthrough

1. **Switch to `farmer-approved`** → go to `/app/browse` → open a listing → click **Send inquiry** → write a message
2. **Switch to `landowner-approved`** → go to `/app/inquiries` → open the thread → reply
3. **Switch back to `farmer-approved`** → open the same thread → see the reply
4. **Switch to `admin`** → go to `/admin/inquiries` → view the thread, send an admin message, or block it
5. **Switch to `landowner-approved`** → go to `/app/listings` → create a new listing → submit it
6. **Switch to `admin`** → go to `/admin/review/listings` → approve or reject with a reason
7. **Switch to `farmer-pending`** → confirm browse and inquiry are inaccessible until approved

---

## How the approval workflow works

### User approval

```
Sign up → profile created (pending)
  └── Admin reviews at /admin/review/users
        ├── Approved → full app access: browse listings, send inquiries
        └── Rejected → account locked; admin can reactivate later
```

Pending users complete onboarding (profile details, farming info) but cannot browse listings or send inquiries until approved.

### Listing approval

```
Landowner creates listing → draft (visible only to owner)
  └── Landowner submits for review → pending
        └── Admin reviews at /admin/review/listings
              ├── Approved → visible to all approved farmers on /app/browse
              └── Rejected → reason shown to landowner; can edit and resubmit
```

### Inquiries

```
Approved farmer sends inquiry on a listing → thread created (open)
  └── Landowner replies in /app/inquiries/[id]
  └── Farmer replies back
  └── Either party can close the thread
  └── Admin can view, message, or block any thread at /admin/inquiries
```

---

## Role & status reference

### Roles

| Role | Description |
|---|---|
| `farmer` | Seeks farmland to lease or purchase |
| `landowner` | Has farmland to offer |
| `admin` | Platform moderator — full access to all data and review queues |

### User status

| Status | Meaning |
|---|---|
| `pending` | Awaiting admin approval — onboarding visible, browse/inquire locked |
| `approved` | Full access |
| `rejected` | Application denied — admin can reactivate |
| `suspended` | Access revoked without deleting the account |

### Listing status

| Status | Meaning |
|---|---|
| `draft` | Saved by landowner, not submitted |
| `pending` | Submitted, awaiting admin review |
| `approved` | Visible to all approved farmers |
| `rejected` | Denied — rejection reason shown to landowner |
| `archived` | Hidden from browse without deletion |

---

## Routes

| Path | Who can access |
|---|---|
| `/` | Public |
| `/auth/sign-in` `/auth/sign-up` | Public |
| `/auth/reset-password` | Public |
| `/app` | Any authenticated user |
| `/app/onboarding/farmer` `/app/onboarding/landowner` | Authenticated (pre-completion redirect) |
| `/app/browse` | Approved users |
| `/app/browse/[id]` | Approved users |
| `/app/listings` | Landowners (any status) |
| `/app/listings/new` `/app/listings/[id]/edit` | Landowners |
| `/app/inquiries` `/app/inquiries/[id]` | Approved users |
| `/admin` | Admin only |
| `/admin/review/users` | Admin only |
| `/admin/users` `/admin/users/[id]` | Admin only |
| `/admin/review/listings` | Admin only |
| `/admin/listings/[id]` | Admin only |
| `/admin/inquiries` `/admin/inquiries/[id]` | Admin only |

---

## Seed data

```bash
pnpm seed            # run all three scripts below
pnpm seed:named      # 5 named dev accounts (see table above)
pnpm seed:bulk       # 50 randomized IL farmers + landowners (25 each, 5 pending / 20 approved)
pnpm seed:listings   # ~22 approved listings spread across approved landowners
```

All scripts are idempotent — safe to run multiple times.

---

## Environment setup

### Prerequisites

- Node.js 20+
- pnpm
- Supabase project (free tier works)

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in your Supabase credentials
cp .env.example .env

# 3. Apply migrations (Supabase dashboard → SQL editor, run in order)
#    or: supabase db push  (if using Supabase CLI linked to the project)

# 4. Seed dev data
pnpm seed

# 5. Start dev server
pnpm dev    # → http://localhost:4321
```

### Required env vars

| Variable | Where to find it |
|---|---|
| `PUBLIC_SUPABASE_URL` | Supabase dashboard → Project Settings → API |
| `PUBLIC_SUPABASE_ANON_KEY` | Same page — "anon public" key |
| `SUPABASE_SERVICE_ROLE_KEY` | Same page — "service_role" key (keep secret) |

---

## Architecture

```
Browser
  └── Astro 5 SSR (Node adapter)
        ├── Public pages  /  /auth/*
        ├── App pages     /app/*    — auth + role guards in middleware
        └── Admin pages   /admin/*  — admin-role guard
              └── Supabase
                    ├── Auth     — email/password sessions via @supabase/ssr
                    ├── Postgres — RLS enforced at DB layer (not just UI)
                    └── Storage  — private listing-media bucket, signed URLs
```

### Key files

| File | Purpose |
|---|---|
| `src/middleware.ts` | Runs on every request — creates Supabase client, fetches profile, enforces auth/onboarding redirects |
| `src/lib/supabase/server.ts` | SSR client (cookie-based session) |
| `src/lib/supabase/admin.ts` | Service-role client — bypasses RLS, server-side only |
| `src/components/DevToolbar.astro` | Dev-only toolbar (stripped from production builds) |
| `scripts/seed-*.ts` | Idempotent seed scripts using Supabase Auth Admin API |
| `supabase/migrations/` | Ordered SQL migrations — schema, RLS, triggers |

### Tech stack

| Layer | Technology |
|---|---|
| Framework | Astro 5 (SSR, Node adapter) |
| Styling | Tailwind CSS v3 |
| UI components | shadcn/ui (React islands) |
| Auth + DB + Storage | Supabase |
| TypeScript runner | tsx (seed scripts) |

---

## Related docs

- [`docs/BACKLOG.md`](docs/BACKLOG.md) — Epics, milestones, feature status
- `supabase/migrations/` — Full database schema and RLS policies
