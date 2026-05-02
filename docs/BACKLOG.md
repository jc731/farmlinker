# Farmlinker — Backlog

Last updated: 2026-05-02

---

## Epics

| # | Epic | Status | Description |
|---|---|---|---|
| E1 | Project foundation | ✅ done | Repo, README, docs, Astro + Supabase scaffold |
| E2 | Database schema | ✅ done | All tables, enums, RLS policies, migrations |
| E3 | Auth & identity | ✅ done | Supabase Auth integration, profile bootstrap |
| E4 | Onboarding flow | ✅ done | Role-specific profile forms, wired to /app/onboarding/* |
| E5 | Admin — users | ✅ done | Review queue, approve/reject/suspend/reactivate |
| E6 | Listings CRUD | ✅ done | Landowner creates/edits listings; approval flow |
| E7 | Admin — listings | ✅ done | Review queue, approve/reject listings |
| E8 | Discovery | 🔜 next | Approved farmers browse and search listings |
| E9 | Inquiries | todo | Farmer → landowner non-realtime messaging |
| E10 | Polish & launch prep | todo | Error states, email notifications, deploy config |

---

## MVP Milestones

### M1 — Foundation ✅
- [x] README.md written
- [x] BACKLOG.md created
- [x] Astro project initialized with Tailwind + shadcn/ui
- [x] Supabase project created and `.env.example` documented
- [x] `supabase/migrations/` directory established

### M2 — Database & Auth ✅
- [x] All enums defined in Postgres
- [x] `profiles` table + RLS
- [x] `farmer_profiles` table + RLS
- [x] `farmer_demographics` table + RLS (admin-only)
- [x] `landowner_profiles` table + RLS
- [x] `landowner_demographics` table + RLS (admin-only)
- [x] `listings` table + RLS
- [x] `listing_media` table + RLS
- [x] `inquiries` table + RLS
- [x] `inquiry_messages` table + RLS
- [x] Supabase Auth configured (email/password)
- [x] Profile auto-created on sign-up (`handle_new_user` trigger)

### M3 — Onboarding ✅
- [x] `/auth/sign-up` — role selection + basic info
- [x] `/auth/sign-in`
- [x] `/auth/reset-password`
- [x] `/app/onboarding/farmer` — multi-step farmer profile form
- [x] `/app/onboarding/landowner` — landowner profile form
- [x] Status set to `pending` on onboarding completion
- [x] Middleware redirects unauthenticated and incomplete users

### M4 — Admin: User Review ✅
- [x] `/admin` dashboard with stat cards
- [x] `/admin/review/users` — pending user queue with inline approve/reject
- [x] `/admin/users` — all users table with status filter
- [x] `/admin/users/[id]` — full user detail with profile/demographics
- [x] Approve / reject / suspend / reactivate API routes
- [x] Fix: protect trigger now allows service-role status changes
- [x] Dev seed: 5 named accounts + 50 bulk users (`pnpm seed`)

### M5 — Listings ✅
- [x] `/app/listings` — landowner's listing index (all statuses)
- [x] `/app/listings/new` — 3-step create form (saves as draft)
- [x] `/app/listings/[id]/edit` — pre-filled edit form (draft/rejected only)
- [x] Submit listing → `pending` status; resubmit clears rejection_reason
- [x] `/app/listings/[id]` — detail: fields, status, rejection reason, photos
- [x] Photo upload to Supabase Storage `listing-media` bucket (up to 3)
- [x] `/admin/review/listings` — admin pending queue
- [x] `/admin/listings/[id]` — full review detail with owner info and photos
- [x] Approve / reject API routes (reject persists reason shown to landowner)

### M6 — Discovery & Inquiries
- [ ] `/app/browse` — listing search (county, acreage, keyword filters)
- [ ] `/app/inquiries` — farmer sends inquiry on a listing
- [ ] `/app/inquiries/[id]` — threaded message view
- [ ] Landowner can reply; both parties see thread
- [ ] Inquiry status: open / closed / blocked

### M7 — Polish & Deploy
- [ ] 404 and error pages
- [ ] Loading states and empty states
- [ ] Mobile-responsive audit
- [ ] Deploy config (Netlify or Vercel)
- [ ] Environment variable documentation finalized

---

## Cleanup / Polish Notes

| Item | Priority | Status |
|---|---|---|
| Remove `/auth/` prefix from auth routes | low | todo |
| Profile edit page (`/app/profile`) | medium | todo — blocked by M5 (establish pattern first) |

---

## Out of Scope (MVP)

- Swipe / card-stack UI
- Realtime WebSocket chat
- Automated compatibility scoring
- Payments
- Analytics / reporting dashboards
- Social login (Google, Facebook)
