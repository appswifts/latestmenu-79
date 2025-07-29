-- Add plan column to restaurants table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'plan') THEN
        ALTER TABLE public.restaurants ADD COLUMN plan TEXT DEFAULT 'paid';
    END IF;
END $$;

-- Create user_roles table for system role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'restaurant',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add updated_at trigger to user_roles
DROP TRIGGER IF EXISTS update_user_roles_updated_at ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at
    BEFORE UPDATE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Update RLS policies for restaurant authentication
DROP POLICY IF EXISTS "Restaurants can create their own account" ON public.restaurants;
CREATE POLICY "Restaurants can create their own account" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add RLS policy for restaurant signup (public access for signup)
DROP POLICY IF EXISTS "Enable restaurant signup" ON public.restaurants;
CREATE POLICY "Enable restaurant signup" ON public.restaurants
  FOR INSERT WITH CHECK (true);

-- Helper functions for admin and role checks
CREATE OR REPLACE FUNCTION public.has_system_role(_user_id uuid, _role TEXT)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;