-- Update handle_new_user to support the roles array passed from the sign-up
-- form, and to also capture terms_accepted from metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  _roles public.user_role[];
begin
  -- Accept either a 'roles' JSON array or a single 'role' string in metadata
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

  insert into public.profiles (id, roles, first_name, last_name, terms_accepted)
  values (
    new.id,
    _roles,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce((new.raw_user_meta_data->>'terms_accepted')::boolean, false)
  );

  return new;
end;
$$;
