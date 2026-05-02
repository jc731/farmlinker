-- Rejection reason for admin → landowner communication
alter table public.listings
  add column rejection_reason text;

-- ── Supabase Storage bucket ───────────────────────────────────────────────────
-- listing-media: private bucket for listing photos

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-media',
  'listing-media',
  false,
  10485760,            -- 10 MB per file
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ── Storage RLS ───────────────────────────────────────────────────────────────
-- Path convention: {listing_id}/{uuid}.{ext}
-- First path segment is always the listing UUID.

create policy "listing storage: owner upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-media'
    and exists (
      select 1 from public.listings
      where id::text = (string_to_array(name, '/'))[1]
        and owner_profile_id = auth.uid()
    )
  );

-- Any authenticated user can view media for approved listings;
-- owners can always view their own listing's media.
create policy "listing storage: select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'listing-media'
    and (
      exists (
        select 1 from public.listings
        where id::text = (string_to_array(name, '/'))[1]
          and owner_profile_id = auth.uid()
      )
      or exists (
        select 1 from public.listings
        where id::text = (string_to_array(name, '/'))[1]
          and status = 'approved'
      )
      or public.is_admin()
    )
  );

create policy "listing storage: owner or admin delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-media'
    and (
      exists (
        select 1 from public.listings
        where id::text = (string_to_array(name, '/'))[1]
          and owner_profile_id = auth.uid()
      )
      or public.is_admin()
    )
  );
