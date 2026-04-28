-- Replace single-value role with a roles array so a user can be
-- both farmer and landowner (or any combination).
-- No data exists yet so this is a clean column swap.

alter table public.profiles
  drop column role;

alter table public.profiles
  add column roles public.user_role[] not null default '{}'
    constraint profiles_has_role check (cardinality(roles) > 0);

-- Update the sign-up trigger to write an array
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

  insert into public.profiles (id, roles, first_name, last_name)
  values (
    new.id,
    array[coalesce(_role, 'farmer'::public.user_role)],
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', '')
  );

  return new;
end;
$$;

-- Update role/status guard trigger
create or replace function public.protect_profile_role_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and 'admin' = any(roles)
  ) then
    new.roles  := old.roles;
    new.status := old.status;
  end if;
  return new;
end;
$$;

-- Update helper functions to use the array
create or replace function public.is_admin()
returns boolean
language sql
security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and 'admin' = any(roles)
  );
$$;

create or replace function public.is_approved()
returns boolean
language sql
security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and status = 'approved'
  );
$$;

-- Generic role check — use in RLS policies and server routes
create or replace function public.has_role(_role public.user_role)
returns boolean
language sql
security definer stable set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and _role = any(roles)
  );
$$;

grant execute on function public.has_role(public.user_role) to authenticated;
