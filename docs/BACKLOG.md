# Farmlinker — Backlog

Last updated: 2026-04-28

---

## Epics

| # | Epic | Description |
|---|---|---|
| E1 | Project foundation | Repo, README, docs, Astro + Supabase scaffold |
| E2 | Database schema | All tables, enums, RLS policies, migrations |
| E3 | Auth & identity | Supabase Auth integration, profile bootstrap |
| E4 | Onboarding flow | Role-specific profile forms → pending status |
| E5 | Admin — users | Review queue, approve/reject/suspend users |
| E6 | Listings CRUD | Landowner creates/edits listings; approval flow |
| E7 | Admin — listings | Review queue, approve/reject listings |
| E8 | Discovery | Approved farmers browse and search listings |
| E9 | Inquiries | Farmer → landowner non-realtime messaging |
| E10 | Polish & launch prep | Error states, email notifications, deploy config |

---

## MVP Milestones

### M1 — Foundation (current)
- [x] README.md written
- [x] BACKLOG.md created
- [ ] Astro project initialized with Tailwind + shadcn/ui
- [ ] Supabase project created and `.env.example` documented
- [ ] `supabase/migrations/` directory established

### M2 — Database & Auth
- [ ] All enums defined in Postgres
- [ ] `profiles` table + RLS
- [ ] `farmer_profiles` table + RLS
- [ ] `farmer_demographics` table + RLS (admin-only)
- [ ] `landowner_profiles` table + RLS
- [ ] `landowner_demographics` table + RLS (admin-only)
- [ ] `listings` table + RLS
- [ ] `listing_media` table + RLS
- [ ] `inquiries` table + RLS
- [ ] `inquiry_messages` table + RLS
- [ ] Supabase Auth configured (email/password)
- [ ] Profile auto-created on sign-up (trigger or edge function)

### M3 — Onboarding
- [ ] `/auth/sign-up` — role selection + basic info
- [ ] `/auth/sign-in`
- [ ] `/auth/reset-password`
- [ ] `/app/onboarding` — farmer profile form (multi-step)
- [ ] `/app/onboarding` — landowner profile form
- [ ] Status set to `pending` on onboarding completion
- [ ] Pending state gate: redirect pending users away from restricted routes

### M4 — Admin: User Review
- [ ] `/admin` dashboard stub
- [ ] `/admin/review/users` — pending user queue
- [ ] Approve / reject / suspend actions with confirmation
- [ ] Approved users gain full access
- [ ] Email notification on status change (basic)

### M5 — Listings
- [ ] `/app/listings` — landowner creates draft listing
- [ ] Listing form — all required fields per schema
- [ ] Photo/media upload to Supabase Storage
- [ ] Submit listing → `pending` status
- [ ] `/admin/review/listings` — admin approval queue
- [ ] Approved listings visible to approved farmers
- [ ] `/app/listings/[id]` — listing detail page

### M6 — Discovery & Inquiries
- [ ] `/app/search` — listing search with county/acreage filters
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

## Feature Backlog

### E1 — Foundation
| Item | Status | Notes |
|---|---|---|
| Init Astro SSR project | todo | `pnpm create astro` with Node adapter |
| Add Tailwind CSS | todo | |
| Add shadcn/ui | todo | React integration for interactive components |
| Create `.env.example` | todo | |
| Create `supabase/migrations/` directory | todo | |
| Write `docs/data-model.md` | todo | Schema reference from master prompt |

### E2 — Database Schema
| Item | Status | Notes |
|---|---|---|
| Define role + status enums | todo | Postgres custom types |
| `profiles` table + RLS | todo | Base user record; auto-created on auth sign-up |
| `farmer_profiles` table + RLS | todo | |
| `farmer_demographics` table + RLS | todo | Admin-only read; no user access |
| `landowner_profiles` table + RLS | todo | |
| `landowner_demographics` table + RLS | todo | Admin-only read |
| `listings` table + RLS | todo | Visible only when `approved` + viewer is approved |
| `listing_media` table + RLS | todo | |
| `inquiries` table + RLS | todo | Participants only; no cross-inquiry visibility |
| `inquiry_messages` table + RLS | todo | |

### E3 — Auth & Identity
| Item | Status | Notes |
|---|---|---|
| Supabase Auth client setup | todo | Browser + server clients |
| Sign-up page (custom UI) | todo | Captures role at registration |
| Sign-in page | todo | |
| Reset password flow | todo | |
| Profile bootstrap trigger | todo | DB trigger or Edge Function on auth.users insert |
| Session middleware for Astro | todo | Redirect unauthenticated users |

### E4 — Onboarding
| Item | Status | Notes |
|---|---|---|
| Farmer onboarding form | todo | Multi-step; saves to `farmer_profiles` |
| Landowner onboarding form | todo | Saves to `landowner_profiles` |
| Terms acceptance gate | todo | `terms_accepted` must be true to proceed |
| Set status `pending` on submit | todo | |
| Pending user dashboard | todo | "Your profile is under review" holding page |

### E5 — Admin: Users
| Item | Status | Notes |
|---|---|---|
| Admin route guard | todo | RLS + Astro middleware check for admin role |
| Pending user list view | todo | |
| User detail view for review | todo | Show full profile; demographics visible to admin |
| Approve action | todo | Updates `profiles.status` |
| Reject action | todo | Updates status + optionally stores reason |
| Suspend action | todo | |

### E6 — Listings CRUD
| Item | Status | Notes |
|---|---|---|
| Create listing form | todo | Landowner only; saves as `draft` |
| Edit listing | todo | Only while `draft` or `rejected` |
| Submit for review | todo | Status → `pending` |
| Media upload | todo | Supabase Storage; up to 3 images per listing |
| Listing detail page | todo | Public fields only; contact hidden until inquiry |

### E7 — Admin: Listings
| Item | Status | Notes |
|---|---|---|
| Pending listings queue | todo | |
| Listing review detail view | todo | |
| Approve / reject listing | todo | Rejection requires reason |

### E8 — Discovery
| Item | Status | Notes |
|---|---|---|
| Listings index (approved only) | todo | Approved farmers only |
| County filter | todo | |
| Acreage range filter | todo | |
| Basic keyword search | todo | Property name, notes |

### E9 — Inquiries
| Item | Status | Notes |
|---|---|---|
| Send inquiry from listing page | todo | Creates `inquiries` row |
| Inquiry thread view | todo | Both parties see messages |
| Reply message form | todo | |
| Close / block inquiry | todo | Either party; admin can block |

---

## Dependencies & Sequencing

```
E1 (foundation)
  → E2 (schema)
      → E3 (auth)
          → E4 (onboarding)
              → E5 (admin users)   ← required before E6/E8 are useful
              → E6 (listings)
                  → E7 (admin listings)
                      → E8 (discovery)
                          → E9 (inquiries)
```

E5 must be done early so the admin can unblock the first test farmers and landowners to validate downstream flows.

---

## Cleanup / Polish Notes

| Item | Priority | Notes |
|---|---|---|
| Remove `/auth/` prefix from auth routes | low | `/auth/sign-in` → `/sign-in`, etc. Clean URLs, no urgency |
| Move onboarding forms from `/onboarding/*` to `/app/onboarding/*` | medium | Forms are at public path for dev preview; move and wire auth when ready |
| Profile edit page (`/app/profile`) | medium | Users complete onboarding in one go; edit individual fields from profile page after |

---

## Out of Scope (MVP)

- Swipe / card-stack UI
- Realtime WebSocket chat
- Automated compatibility scoring
- Payments
- Analytics / reporting dashboards
- Social login (Google, Facebook)
