-- Revise RLS to match the two-tier access model:
--
--   pending  → can browse approved listing summaries; no contact info; no inquiries
--   approved → full access including contact info and inquiries
--
-- Contact info (phone, address) is never exposed by RLS — that filtering
-- happens in the application layer based on the viewer's status.

-- ── listings ──────────────────────────────────────────────────────────────────
-- All authenticated users (pending or approved) can see approved listings.

drop policy if exists "listings: approved users see approved" on public.listings;

create policy "listings: authenticated see approved"
  on public.listings for select
  using (status = 'approved' and auth.role() = 'authenticated');

-- ── farmer_profiles ───────────────────────────────────────────────────────────
-- All authenticated users can see approved farmers' profiles.
-- (Contact info filtered in app layer.)

drop policy if exists "farmer_profiles: approved users select" on public.farmer_profiles;

create policy "farmer_profiles: authenticated select"
  on public.farmer_profiles for select
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.profiles
      where id = profile_id and status = 'approved'
    )
  );

-- ── landowner_profiles ────────────────────────────────────────────────────────

drop policy if exists "landowner_profiles: approved users select" on public.landowner_profiles;

create policy "landowner_profiles: authenticated select"
  on public.landowner_profiles for select
  using (
    auth.role() = 'authenticated' and
    exists (
      select 1 from public.profiles
      where id = profile_id and status = 'approved'
    )
  );

-- ── inquiries ─────────────────────────────────────────────────────────────────
-- Only approved farmers can open inquiries.
-- Tighten the insert check to also verify the farmer role.

drop policy if exists "inquiries: approved farmer insert" on public.inquiries;

create policy "inquiries: approved farmer insert"
  on public.inquiries for insert
  with check (
    auth.uid() = from_profile_id
    and public.is_approved()
    and public.has_role('farmer')
  );
