-- First, let's update the restaurants table to support multiple restaurants per user
ALTER TABLE public.restaurants 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_user_id ON public.restaurants(user_id);
CREATE INDEX IF NOT EXISTS idx_restaurants_slug ON public.restaurants(slug);

-- Create menu groups table
CREATE TABLE IF NOT EXISTS public.menu_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on menu_groups
ALTER TABLE public.menu_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for menu_groups
CREATE POLICY "Restaurant owners can manage their menu groups" 
ON public.menu_groups FOR ALL 
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Anonymous users can view menu groups for active restaurants" 
ON public.menu_groups FOR SELECT 
USING (is_active = true AND EXISTS (
  SELECT 1 FROM public.restaurants 
  WHERE id = menu_groups.restaurant_id 
  AND subscription_status = 'active'
));

-- Add group_id to menu_items if it doesn't exist
ALTER TABLE public.menu_items 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.menu_groups(id) ON DELETE SET NULL;

-- Update the restaurants policies to support multiple restaurants per user
DROP POLICY IF EXISTS "Users can view their own restaurant" ON public.restaurants;
DROP POLICY IF EXISTS "Users can update their own restaurant" ON public.restaurants;

CREATE POLICY "Users can view their own restaurants" 
ON public.restaurants FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own restaurants" 
ON public.restaurants FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can create restaurants" 
ON public.restaurants FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Update menu_items and menu_categories policies to work with the new structure
DROP POLICY IF EXISTS "Restaurants can manage their own menu items" ON public.menu_items;
DROP POLICY IF EXISTS "Restaurants can manage their own menu categories" ON public.menu_categories;

CREATE POLICY "Users can manage menu items for their restaurants" 
ON public.menu_items FOR ALL 
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage menu categories for their restaurants" 
ON public.menu_categories FOR ALL 
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

-- Update restaurant_tables policies
DROP POLICY IF EXISTS "Restaurants can view their own tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Restaurants can create their own tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Restaurants can update their own tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Restaurants can delete their own tables" ON public.restaurant_tables;

CREATE POLICY "Users can manage tables for their restaurants" 
ON public.restaurant_tables FOR ALL 
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

-- Update QR scans policy
DROP POLICY IF EXISTS "Restaurants can view their own scans" ON public.qr_scans;

CREATE POLICY "Users can view scans for their restaurants" 
ON public.qr_scans FOR SELECT 
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

-- Update subscription_orders policy  
DROP POLICY IF EXISTS "Restaurants can view their own subscription orders" ON public.subscription_orders;
DROP POLICY IF EXISTS "Restaurants can create their own subscription orders" ON public.subscription_orders;

CREATE POLICY "Users can view subscription orders for their restaurants" 
ON public.subscription_orders FOR SELECT 
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

CREATE POLICY "Users can create subscription orders for their restaurants" 
ON public.subscription_orders FOR INSERT 
WITH CHECK (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

-- Update subscription_payments policy
DROP POLICY IF EXISTS "Restaurants can view their own payments" ON public.subscription_payments;

CREATE POLICY "Users can view payments for their restaurants" 
ON public.subscription_payments FOR SELECT 
USING (restaurant_id IN (SELECT id FROM public.restaurants WHERE user_id = auth.uid()));

-- Create user profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile" 
ON public.user_profiles FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" 
ON public.user_profiles FOR UPDATE 
USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" 
ON public.user_profiles FOR ALL 
USING (user_has_permission(auth.uid(), 'manage_users'));

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at trigger for tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS update_menu_groups_updated_at ON public.menu_groups;
CREATE TRIGGER update_menu_groups_updated_at
    BEFORE UPDATE ON public.menu_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();