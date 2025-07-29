-- Remove the automatic restaurant record creation function and trigger
DROP FUNCTION IF EXISTS public.ensure_restaurant_record_exists(uuid);

-- Remove the handle_new_user function that creates restaurant records
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;