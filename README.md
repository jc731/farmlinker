# Farmlinker

Farmlinker connects farmers seeking land with landowners who have farmland available. Users submit profiles and listings; an admin approves them before they gain full visibility. Approved farmers can then browse listings and send inquiries to landowners.

---

## Project Purpose

Illinois has a significant gap between farmers seeking land and landowners willing to lease or sell farmland. Farmlinker bridges this gap with a structured, approval-gated matching workflow that prioritizes trust and stewardship.

---

## Architecture

```
Browser
  └── Astro SSR (pages + API routes)
        ├── Public pages (/, /about, auth flows)
        ├── App pages (/app/*) — requires authenticated + role-based access
        └── Admin pages (/admin/*) — requires admin role
              └── Supabase
                    ├── Auth (email/password + magic link)
                    ├── Postgres (data + RLS enforcement)
                    └── Storage (listing photos/maps)
```

All access control is enforced at the **Supabase RLS layer**, not just in UI logic.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Astro 5 (SSR mode) |
| Styling | Tailwind CSS |
| UI components | shadcn/ui (React) |
| Interactivity | React islands (only where needed) |
| Backend / Auth | Supabase (Auth, Postgres, Storage, RLS) |
| Server logic | Astro SSR routes + Supabase Edge Functions |
| Deployment | TBD (Netlify or Vercel) |

---

## Environment Setup

### Prerequisites
- Node.js 20+
- pnpm
- Supabase account / project

### Steps

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template
cp .env.example .env

# 3. Fill in Supabase credentials
#    SUPABASE_URL=...
#    SUPABASE_ANON_KEY=...
#    SUPABASE_SERVICE_ROLE_KEY=...  (server-side only)

# 4. Apply database migrations
#    Run SQL files in /supabase/migrations/ in order via Supabase dashboard or CLI

# 5. Start dev server
pnpm dev   # → localhost:4321
```

---

## Approval Workflow

### User approval

```
Sign up → pending
  └── Admin reviews profile → approved | rejected
        └── approved: full app access (browse listings, send inquiries)
        └── rejected: notified, can re-apply
```

- **Pending** users can edit their own profile but cannot view contact details or create inquiries.
- **Approved** users get full listing visibility and can submit inquiries.
- **Suspended** users lose access without deletion.

### Listing approval

```
Landowner creates listing → draft
  └── Landowner submits → pending
        └── Admin reviews → approved | rejected
              └── approved: visible to approved farmers
              └── rejected: landowner notified with reason
```

---

## Role & Status Model

### Roles (immutable after registration)
| Role | Description |
|---|---|
| `farmer` | Seeks farmland to lease or purchase |
| `landowner` | Has farmland to offer |
| `admin` | Platform moderator with full access |

### User status (admin-controlled)
| Status | Meaning |
|---|---|
| `pending` | Awaiting admin approval |
| `approved` | Full access granted |
| `rejected` | Application denied |
| `suspended` | Access revoked without deletion |

### Listing status
| Status | Meaning |
|---|---|
| `draft` | Saved but not yet submitted |
| `pending` | Submitted, awaiting admin approval |
| `approved` | Publicly visible to approved farmers |
| `rejected` | Denied by admin |
| `archived` | Removed from active search |

---

## Routes

| Path | Access |
|---|---|
| `/` | Public |
| `/about` | Public |
| `/auth/sign-up` | Public |
| `/auth/sign-in` | Public |
| `/auth/reset-password` | Public |
| `/app` | Authenticated |
| `/app/onboarding` | Authenticated, any status |
| `/app/profile` | Authenticated |
| `/app/listings` | Approved users |
| `/app/listings/[id]` | Approved users |
| `/app/search` | Approved users |
| `/app/inquiries` | Approved users |
| `/app/inquiries/[id]` | Approved users |
| `/admin` | Admin only |
| `/admin/review/users` | Admin only |
| `/admin/review/listings` | Admin only |

---

## Non-Goals (MVP)

- Swipe / card-stack matching UI
- Realtime chat
- Automated match scoring
- Payments or monetization
- Analytics dashboards

---

## Related Docs

- [`docs/BACKLOG.md`](docs/BACKLOG.md) — Epics, milestones, and feature backlog
- [`docs/data-model.md`](docs/data-model.md) — Full schema reference
- `supabase/migrations/` — Database migration files
