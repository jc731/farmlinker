-- Singleton config table for per-instance settings.
-- Enforce one row via the check constraint on id.
-- Extend with new columns (branding, theming, etc.) as the platform grows.
create table public.site_config (
  id                    integer primary key default 1 check (id = 1),
  auto_approve_profiles boolean     not null default false,
  site_name             text        not null default 'Farmlinker',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

insert into public.site_config default values;

create trigger set_site_config_updated_at
  before update on public.site_config
  for each row execute function public.set_updated_at();

alter table public.site_config enable row level security;

-- Any authenticated user can read config (needed to drive UI behavior)
create policy "site_config: authenticated read"
  on public.site_config for select
  to authenticated
  using (true);

-- Only admin can update
create policy "site_config: admin update"
  on public.site_config for update
  using (public.is_admin());

grant select, update on public.site_config to authenticated;
