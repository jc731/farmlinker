-- Wire up the 'incomplete' status: change the default, update the signup trigger,
-- and add triggers that auto-promote to 'pending' when onboarding completes.

-- 1. New signups start as incomplete
ALTER TABLE public.profiles ALTER COLUMN status SET DEFAULT 'incomplete';

-- 2. Update handle_new_user to explicitly set 'incomplete' (don't rely on column default)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _roles public.user_role[];
BEGIN
  BEGIN
    SELECT array_agg(elem::public.user_role)
    INTO _roles
    FROM jsonb_array_elements_text(
      CASE
        WHEN new.raw_user_meta_data ? 'roles'
          THEN new.raw_user_meta_data->'roles'
        WHEN new.raw_user_meta_data ? 'role'
          THEN jsonb_build_array(new.raw_user_meta_data->>'role')
        ELSE '["farmer"]'::jsonb
      END
    ) elem;
  EXCEPTION WHEN OTHERS THEN
    _roles := NULL;
  END;

  IF _roles IS NULL OR cardinality(_roles) = 0 THEN
    _roles := ARRAY['farmer'::public.user_role];
  END IF;

  INSERT INTO public.profiles (id, roles, first_name, last_name, terms_accepted, status)
  VALUES (
    new.id,
    _roles,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE((new.raw_user_meta_data->>'terms_accepted')::boolean, false),
    'incomplete'
  );

  RETURN new;
END;
$$;

-- 3. Auto-promote incomplete → pending when onboarding profile row is inserted.
--    Only promotes if still 'incomplete' — won't touch approved/rejected users
--    who update their profile later.
CREATE OR REPLACE FUNCTION public.handle_onboarding_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET status = 'pending'
  WHERE id = NEW.profile_id
    AND status = 'incomplete';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_farmer_profile_created
  AFTER INSERT ON public.farmer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_onboarding_complete();

CREATE TRIGGER on_landowner_profile_created
  AFTER INSERT ON public.landowner_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_onboarding_complete();
