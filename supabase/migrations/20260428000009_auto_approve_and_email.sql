-- Add email to profiles so admin views don't need a separate auth.users lookup
alter table public.profiles
  add column email text;

-- Backfill from auth.users (safe on empty table; guards for future re-runs)
update public.profiles p
set email = u.email
from auth.users u
where u.id = p.id and p.email is null;

-- Update handle_new_user to also capture email
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _roles public.user_role[];
begin
  begin
    select array_agg(elem::public.user_role)
    into _roles
    from jsonb_array_elements_text(
      case
        when new.raw_user_meta_data ? 'roles'
          then new.raw_user_meta_data->'roles'
        when new.raw_user_meta_data ? 'role'
          then jsonb_build_array(new.raw_user_meta_data->>'role')
        else '["farmer"]'::jsonb
      end
    ) elem;
  exception when others then
    _roles := null;
  end;

  if _roles is null or cardinality(_roles) = 0 then
    _roles := array['farmer'::public.user_role];
  end if;

  insert into public.profiles (id, email, roles, first_name, last_name, terms_accepted)
  values (
    new.id,
    new.email,
    _roles,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'terms_accepted')::boolean, false)
  );

  return new;
end;
$$;

-- Auto-approve: fires when farmer_profiles or landowner_profiles is inserted.
-- If site_config.auto_approve_profiles is true, immediately approve the user.
create or replace function public.maybe_auto_approve()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if (select auto_approve_profiles from public.site_config limit 1) then
    update public.profiles
    set status = 'approved'
    where id = new.profile_id and status = 'pending';
  end if;
  return new;
end;
$$;

create trigger auto_approve_on_farmer_profile
  after insert on public.farmer_profiles
  for each row execute function public.maybe_auto_approve();

create trigger auto_approve_on_landowner_profile
  after insert on public.landowner_profiles
  for each row execute function public.maybe_auto_approve();
