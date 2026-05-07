-- Allow anonymous (unauthenticated) visitors to view approved listings.
-- This enables the public /browse pages. Notes and owner contact info
-- are never exposed here — gating happens in the application layer.

-- ── listings ──────────────────────────────────────────────────────────────────

create policy "listings: anon see approved"
  on public.listings for select
  using (status = 'approved' and auth.role() = 'anon');

-- ── listing_media ─────────────────────────────────────────────────────────────

create policy "listing_media: anon see approved"
  on public.listing_media for select
  using (
    auth.role() = 'anon' and
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.status = 'approved'
    )
  );

-- ── grants ────────────────────────────────────────────────────────────────────

grant select on public.listings      to anon;
grant select on public.listing_media to anon;
