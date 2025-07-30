-- Make email and password_hash nullable since restaurants are now owned by users
ALTER TABLE public.restaurants 
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN password_hash DROP NOT NULL;

-- Update the unique constraint on email to allow nulls
DROP INDEX IF EXISTS restaurants_email_key;
CREATE UNIQUE INDEX restaurants_email_key ON public.restaurants (email) WHERE email IS NOT NULL;