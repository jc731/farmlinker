-- The protect_profile_role_status trigger was blocking service-role updates
-- (admin API, seed scripts, internal trigger calls like maybe_auto_approve)
-- because auth.uid() is null in those contexts and the guard treated null as
-- "not an admin." Fix: allow all updates when there is no authenticated user
-- in the JWT context (i.e., the caller is service_role or an internal trigger).
create or replace function public.protect_profile_role_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- No JWT → service_role, internal trigger, or seed script. Allow all changes.
  if auth.uid() is null then
    return new;
  end if;

  -- Authenticated users who are not admins cannot change their own role/status.
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
