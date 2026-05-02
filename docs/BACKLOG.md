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
| E6 | Listings CRUD | 🔜 next | Landowner creates/edits listings; approval flow |
| E7 | Admin — listings | 🔜 next | Review queue, approve/reject listings |
| E8 | Discovery | todo | Approved farmers browse and search listings |
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

### M5 — Listings 🔜
- [ ] `/app/listings` — landowner's listing index (their own listings)
- [ ] `/app/listings/new` — create listing form
- [ ] `/app/listings/[id]/edit` — edit draft or rejected listing
- [ ] Submit listing → `pending` status
- [ ] `/app/listings/[id]` — listing detail page
- [ ] Photo/media upload to Supabase Storage (up to 3 images)
- [ ] `/admin/review/listings` — admin approval queue
- [ ] Approve / reject listing API routes (reject requires reason)
- [ ] Approved listings visible to approved farmers at `/app/browse`

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
