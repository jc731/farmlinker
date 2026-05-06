# Farmlinker — Backlog

Last updated: 2026-05-06

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
| E8 | Discovery | ✅ done | Approved farmers browse and search listings |
| E9 | Inquiries | ✅ done | Farmer → landowner non-realtime messaging |
| E10 | Polish & launch prep | ✅ done | Homepage, error pages, mobile audit, deploy config — email notifications deferred |
| E11 | White-label / config | todo | Admin-controlled field sets, branding, org settings |

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

### M6 — Discovery & Inquiries ✅
- [x] `/app/browse` — listing card grid with featured images, placeholder SVG
- [x] `/app/browse/[id]` — listing detail with smart gallery (1/2/3+ photo layouts)
- [x] `/app/inquiries` — farmer sends inquiry on a listing
- [x] `/app/inquiries/[id]` — threaded message view
- [x] Landowner can reply; both parties see thread
- [x] Inquiry status: open / closed / blocked
- [x] Admin can view all threads, send messages, block inquiries
- [ ] Search/filter on browse (county, acreage, keyword) — post-MVP stretch

### M7 — Polish & Deploy ✅
- [x] Profile edit page (`/app/profile`) — contact info + role-specific fields
- [x] **Homepage** — hero, how it works, stats strip, trust band, FAQ accordion, dual CTA
- [x] 404 and error pages — `404.astro` and `500.astro` served automatically by Netlify SSR adapter
- [x] Mobile-responsive audit — app nav collapses contextual links below sm; homepage stat/trust grids responsive
- [x] Deploy config (Netlify) — `netlify.toml` with build config and preview/branch dev tools flag
- [ ] Email notifications (approval, inquiry received) — see E10 notes (post-launch)
- [x] SSR data freshness audit — confirmed correct, no action needed (see note below)
- [ ] Environment variable documentation finalized

---

## E10 — Polish & Launch Notes

### Email notifications
Supabase has built-in email templates for auth events (confirm email, password reset). For
product emails (approval granted, new inquiry, new message) we need either:
- **Supabase Edge Functions** triggered by DB webhooks (preferred — stays in-stack)
- **Resend / Postmark** for transactional email via API routes

Defer until post-deploy — can launch without email and add reactively.

### SSR data freshness (hydration audit)
**Status: Confirmed correct — no action needed now, document for clarity.**

Farmlinker runs as **Astro SSR** (`output: 'server'`, Node adapter). This means:
- Every page request hits the Node server and fetches fresh data from Supabase
- There is no static HTML build that would cache stale data
- Profile edits, listing approvals, new inquiries — all reflect immediately on next page load
- No client-side hydration gap to worry about for data (React islands are UI-only, not data-fetching)

The only thing to verify at deploy time: confirm the hosting platform runs the Node adapter
in server mode (not edge/static fallback). Netlify + `@astrojs/netlify` or Vercel + `@astrojs/vercel`
both support this. **Document in deploy config.**

---

## E11 — White-label / Admin-configurable Fields (Post-MVP)

**Goal:** Allow an admin to toggle which profile fields are shown, required, or hidden —
so the platform can be re-skinned for different organizations or regions without code changes.

### Scope of configurable items (candidates)
| Section | Configurable items |
|---|---|
| Farmer profile | Counties list (region-specific), acreage ranges, tenure options, crop types, livestock types, farming methods, infrastructure options, experience options |
| Landowner profile | Referral source options, additional custom fields |
| Demographics | Show/hide entire section; which fields are required vs optional |
| Branding | Organization name, primary color, logo, contact info shown in footer |
| Onboarding | Step titles, helper text, field labels |

### Implementation approach (when prioritized)
1. `org_config` table in Supabase — JSON blob of field overrides per organization
2. Admin UI to edit config (toggle fields on/off, reorder, rename)
3. Onboarding/profile pages read config at render time instead of hardcoded option arrays
4. Single `FARMLINKER_ORG_ID` env var selects which org config to use

**Effort:** Medium-large. Not blocking MVP launch. Backlog until a second org/client is ready.

---

## Remaining Priorities (ordered)

### M7 complete ✅ (2026-05-06)
All immediate and short-term pre-launch items shipped:
- Homepage (hero, how it works, stats, trust band, FAQ accordion, dual CTA, contact email)
- 404 + 500 error pages served by Netlify SSR adapter automatically
- Mobile audit complete — nav collapses contextual links; grid layouts responsive
- Netlify deploy config (`netlify.toml`), preview/branch dev tools flag
- SSR data freshness confirmed: every request hits Supabase fresh

### Short-term — Post-launch
1. **Browse search/filter** — county + acreage filter on `/app/browse` (high value, stretch)

### Post-launch
7. **Email notifications** — approval granted, inquiry received, new message
8. **Automated / end-to-end testing** — no test suite exists yet. Candidates: Playwright for critical user journeys (farmer onboard → approve → browse → inquire; landowner onboard → listing approve → receive inquiry), Vitest for API route unit tests. Should cover the 11 UX gaps surfaced in the May 2026 concept-testing session before those flows are considered production-ready.
9. **Admin rejection reason for users** — user rejections currently have no reason field (unlike listings). Would need a `rejection_reason` column on `profiles`, a UI input on the reject action (modal or inline), and a display on the user's dashboard. Deferred: not blocking MVP, low volume, contact email is the fallback.
10. **Per-listing re-approval toggle** — currently approved landowners' new listings auto-approve (skip the queue). Add an admin-configurable setting to require re-approval for every listing regardless of landowner status.
10. **E11 white-label config** — when second org/client is engaged
9. **Listing archival UX** — landowner can archive their own listing
10. **Farmer profile visibility** — landowners can see approved farmer profiles (currently one-directional)

---

## Cleanup / Polish Notes

| Item | Priority | Status |
|---|---|---|
| Remove `/auth/` prefix from auth routes | low | todo |
| Browse search/filter (county, acreage) | medium | todo — post-MVP stretch |
| Dashboard quick-links outdated (points to /app/search) | low | ✅ fixed — role-aware cards, no /search link |

---

## Out of Scope (MVP)

- Swipe / card-stack UI
- Realtime WebSocket chat
- Automated compatibility scoring
- Payments
- Analytics / reporting dashboards
- Social login (Google, Facebook)
