-- Drop the unique constraint on email and make email/password_hash nullable
ALTER TABLE public.restaurants 
DROP CONSTRAINT restaurants_email_key,
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN password_hash DROP NOT NULL;

-- Create a partial unique index on email to allow nulls
CREATE UNIQUE INDEX restaurants_email_key ON public.restaurants (email) WHERE email IS NOT NULL;