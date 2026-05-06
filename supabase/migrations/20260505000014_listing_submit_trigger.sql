-- Landowner onboarding now completes via first listing submission, not profile creation.
-- 1. Drop the landowner profile trigger (farmers keep theirs — profile submit = pending).
-- 2. Add a BEFORE UPDATE trigger on listings:
--    - Landowner is 'incomplete' → first listing submit promotes them to 'pending'
--    - Landowner is already 'approved' → listing auto-approves (no review needed)

DROP TRIGGER IF EXISTS on_landowner_profile_created ON public.landowner_profiles;

CREATE OR REPLACE FUNCTION public.handle_listing_submitted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _owner_status public.profile_status;
BEGIN
  -- Only act when transitioning into 'pending'
  IF NEW.status = 'pending' AND OLD.status IS DISTINCT FROM 'pending' THEN
    SELECT status INTO _owner_status
    FROM public.profiles
    WHERE id = NEW.owner_profile_id;

    IF _owner_status = 'approved' THEN
      -- Approved landowner — listing skips the queue
      NEW.status := 'approved';
    ELSIF _owner_status = 'incomplete' THEN
      -- First listing submitted — promote landowner into the review queue
      UPDATE public.profiles
      SET status = 'pending'
      WHERE id = NEW.owner_profile_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_listing_submitted
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_listing_submitted();
