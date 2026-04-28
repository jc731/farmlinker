-- Helper functions (SECURITY DEFINER bypasses RLS on profiles, avoiding recursion)

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_approved()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

grant execute on function public.is_admin()    to authenticated;
grant execute on function public.is_approved() to authenticated;

-- ── profiles ─────────────────────────────────────────────────────────────────

alter table public.profiles enable row level security;

-- Users can read and update their own row
create policy "profiles: own select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: own update"
  on public.profiles for update
  using (auth.uid() = id);

-- Admin has full access to all rows
create policy "profiles: admin all"
  on public.profiles for all
  using (public.is_admin());

-- ── farmer_profiles ───────────────────────────────────────────────────────────

alter table public.farmer_profiles enable row level security;

create policy "farmer_profiles: own all"
  on public.farmer_profiles for all
  using (auth.uid() = profile_id);

-- Approved users can read other approved farmers' profiles
-- (contact details are filtered in the application layer)
create policy "farmer_profiles: approved users select"
  on public.farmer_profiles for select
  using (
    public.is_approved() and
    exists (
      select 1 from public.profiles
      where id = profile_id and status = 'approved'
    )
  );

create policy "farmer_profiles: admin all"
  on public.farmer_profiles for all
  using (public.is_admin());

-- ── farmer_demographics ───────────────────────────────────────────────────────
-- Write-only for the profile owner; read access is admin-only.

alter table public.farmer_demographics enable row level security;

create policy "farmer_demographics: own insert"
  on public.farmer_demographics for insert
  with check (auth.uid() = profile_id);

create policy "farmer_demographics: own update"
  on public.farmer_demographics for update
  using (auth.uid() = profile_id);

create policy "farmer_demographics: admin all"
  on public.farmer_demographics for all
  using (public.is_admin());

-- ── landowner_profiles ────────────────────────────────────────────────────────

alter table public.landowner_profiles enable row level security;

create policy "landowner_profiles: own all"
  on public.landowner_profiles for all
  using (auth.uid() = profile_id);

create policy "landowner_profiles: approved users select"
  on public.landowner_profiles for select
  using (
    public.is_approved() and
    exists (
      select 1 from public.profiles
      where id = profile_id and status = 'approved'
    )
  );

create policy "landowner_profiles: admin all"
  on public.landowner_profiles for all
  using (public.is_admin());

-- ── landowner_demographics ────────────────────────────────────────────────────

alter table public.landowner_demographics enable row level security;

create policy "landowner_demographics: own insert"
  on public.landowner_demographics for insert
  with check (auth.uid() = profile_id);

create policy "landowner_demographics: own update"
  on public.landowner_demographics for update
  using (auth.uid() = profile_id);

create policy "landowner_demographics: admin all"
  on public.landowner_demographics for all
  using (public.is_admin());

-- ── listings ──────────────────────────────────────────────────────────────────

alter table public.listings enable row level security;

-- Landowner can always see their own listings regardless of status
create policy "listings: owner select"
  on public.listings for select
  using (auth.uid() = owner_profile_id);

create policy "listings: owner insert"
  on public.listings for insert
  with check (auth.uid() = owner_profile_id);

-- Owner can only edit while draft or rejected
create policy "listings: owner update draft/rejected"
  on public.listings for update
  using (
    auth.uid() = owner_profile_id
    and status in ('draft'::public.listing_status, 'rejected'::public.listing_status)
  );

-- Approved users can see approved listings
create policy "listings: approved users see approved"
  on public.listings for select
  using (status = 'approved' and public.is_approved());

create policy "listings: admin all"
  on public.listings for all
  using (public.is_admin());

-- ── listing_media ─────────────────────────────────────────────────────────────

alter table public.listing_media enable row level security;

-- Visibility mirrors the parent listing
create policy "listing_media: select mirrors listing"
  on public.listing_media for select
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id
        and (
          l.owner_profile_id = auth.uid()
          or (l.status = 'approved' and public.is_approved())
        )
    )
  );

create policy "listing_media: owner manage"
  on public.listing_media for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and l.owner_profile_id = auth.uid()
    )
  );

create policy "listing_media: admin all"
  on public.listing_media for all
  using (public.is_admin());

-- ── inquiries ─────────────────────────────────────────────────────────────────

alter table public.inquiries enable row level security;

create policy "inquiries: participants select"
  on public.inquiries for select
  using (auth.uid() = from_profile_id or auth.uid() = to_profile_id);

-- Only approved farmers can open an inquiry
create policy "inquiries: approved farmer insert"
  on public.inquiries for insert
  with check (auth.uid() = from_profile_id and public.is_approved());

-- Either participant can update status (close); admin can block via admin policy
create policy "inquiries: participants update"
  on public.inquiries for update
  using (auth.uid() = from_profile_id or auth.uid() = to_profile_id);

create policy "inquiries: admin all"
  on public.inquiries for all
  using (public.is_admin());

-- ── inquiry_messages ──────────────────────────────────────────────────────────

alter table public.inquiry_messages enable row level security;

create policy "inquiry_messages: participants select"
  on public.inquiry_messages for select
  using (
    exists (
      select 1 from public.inquiries i
      where i.id = inquiry_id
        and (i.from_profile_id = auth.uid() or i.to_profile_id = auth.uid())
    )
  );

-- Only inquiry participants can send messages; inquiry must be open
create policy "inquiry_messages: participants insert"
  on public.inquiry_messages for insert
  with check (
    auth.uid() = sender_profile_id
    and exists (
      select 1 from public.inquiries i
      where i.id = inquiry_id
        and (i.from_profile_id = auth.uid() or i.to_profile_id = auth.uid())
        and i.status = 'open'
    )
  );

-- Messages are immutable — no update or delete for users
create policy "inquiry_messages: admin all"
  on public.inquiry_messages for all
  using (public.is_admin());

-- ── grants ────────────────────────────────────────────────────────────────────
-- RLS enforces actual access; grants are the ceiling that allows PostgREST to route requests.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.profiles           to authenticated;
grant select, insert, update, delete on public.farmer_profiles    to authenticated;
grant        insert, update          on public.farmer_demographics to authenticated;
grant select                         on public.farmer_demographics to authenticated; -- RLS restricts to admin
grant select, insert, update, delete on public.landowner_profiles  to authenticated;
grant        insert, update          on public.landowner_demographics to authenticated;
grant select                         on public.landowner_demographics to authenticated; -- RLS restricts to admin
grant select, insert, update, delete on public.listings            to authenticated;
grant select, insert, update, delete on public.listing_media       to authenticated;
grant select, insert, update, delete on public.inquiries           to authenticated;
grant select, insert                 on public.inquiry_messages    to authenticated;
