-- Stamp updated_at on every row change
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_listings_updated_at
  before update on public.listings
  for each row execute function public.set_updated_at();

-- Auto-create a profiles row when a user signs up.
-- Role and name come from raw_user_meta_data passed at sign-up time.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _role public.user_role;
begin
  begin
    _role := (new.raw_user_meta_data->>'role')::public.user_role;
  exception when invalid_text_representation then
    _role := 'farmer';
  end;

  insert into public.profiles (id, role, first_name, last_name)
  values (
    new.id,
    coalesce(_role, 'farmer'),
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent non-admins from changing their own role or status.
-- These fields are admin-only; this trigger silently resets them on user updates.
create or replace function public.protect_profile_role_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ) then
    new.role   := old.role;
    new.status := old.status;
  end if;
  return new;
end;
$$;

create trigger protect_profile_role_status
  before update on public.profiles
  for each row execute function public.protect_profile_role_status();
