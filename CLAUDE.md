# Farmlinker — Claude Code Guide

## Commands

```bash
pnpm dev          # dev server → localhost:4321
pnpm build        # production build
pnpm typecheck    # astro check (run before committing)
pnpm supabase     # supabase CLI
pnpm seed:named    # create/skip 5 named dev accounts
pnpm seed:bulk     # create/skip 50 randomized seed users
pnpm seed:listings # create/skip ~22 approved listings for approved landowners
pnpm seed          # all three of the above
```

## Stack

- **Astro 5 SSR** — Node adapter, `output: 'server'`
- **Tailwind CSS v3** — utility-first, CSS variable theming
- **shadcn/ui** — new-york style, React islands via `@astrojs/react`
- **Supabase** — Auth, Postgres, Storage; project ref `klappqnnunjyasxuvxxo`
- **@supabase/ssr** — cookie-based sessions in SSR context

## Design conventions

- **Reach for a shadcn component before building anything custom.** If shadcn has it, use it.
- **Primary color:** green (CSS var `--primary`), defined in `src/styles/globals.css`
- **Admin header:** `bg-zinc-900 text-white` — intentionally distinct from the app
- **App layout:** `max-w-5xl` centered, white header with green logo
- **Spacing and type scale:** Tailwind defaults — don't introduce custom values unless there's a strong reason
- **Icons:** lucide-react only

## Architecture notes

- `src/middleware.ts` — runs on every request; creates Supabase client, fetches user + profile (with embedded farmer/landowner profile check), handles auth guards and onboarding redirect
- `src/lib/supabase/server.ts` — SSR client (cookie-based)
- `src/lib/supabase/client.ts` — browser client for React islands
- `src/lib/supabase/admin.ts` — service-role client, bypasses RLS; server-side only
- RLS helper functions (`is_admin()`, `is_approved()`, `has_role()`) are `SECURITY DEFINER` to avoid recursion on `profiles`

## Auth flow

Sign-up → `handle_new_user` DB trigger creates `profiles` row → middleware detects no profile extension → redirects to `/app/onboarding/[role]` → onboarding submit → auto-redirect to `/app`

## Dev accounts (password: `devpass123`)

| Email | Role | Status |
|---|---|---|
| `admin@farmlinker.dev` | admin | approved |
| `farmer-pending@farmlinker.dev` | farmer | pending |
| `farmer-approved@farmlinker.dev` | farmer | approved |
| `landowner-pending@farmlinker.dev` | landowner | pending |
| `landowner-approved@farmlinker.dev` | landowner | approved |
