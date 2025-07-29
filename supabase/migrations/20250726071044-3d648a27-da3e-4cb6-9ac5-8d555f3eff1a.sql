-- Add menu management tables
CREATE TABLE public.menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Price in RWF cents (e.g., 1000 = 10.00 RWF)
  currency TEXT DEFAULT 'RWF',
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add subscription orders table for admin management
CREATE TABLE public.subscription_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  restaurant_name TEXT NOT NULL,
  restaurant_email TEXT NOT NULL,
  restaurant_phone TEXT,
  plan_type TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  amount INTEGER NOT NULL, -- Amount in RWF cents
  currency TEXT DEFAULT 'RWF',
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  payment_method TEXT, -- 'bank_transfer', 'mobile_money', 'cash'
  payment_reference TEXT,
  notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_categories
CREATE POLICY "Restaurants can manage their own menu categories" 
ON public.menu_categories 
FOR ALL 
USING (restaurant_id::text = auth.uid()::text);

CREATE POLICY "Anyone can view active menu categories" 
ON public.menu_categories 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for menu_items
CREATE POLICY "Restaurants can manage their own menu items" 
ON public.menu_items 
FOR ALL 
USING (restaurant_id::text = auth.uid()::text);

CREATE POLICY "Anyone can view available menu items" 
ON public.menu_items 
FOR SELECT 
USING (is_available = true);

-- RLS Policies for subscription_orders
CREATE POLICY "Restaurants can view their own subscription orders" 
ON public.subscription_orders 
FOR SELECT 
USING (restaurant_id::text = auth.uid()::text);

CREATE POLICY "Restaurants can create their own subscription orders" 
ON public.subscription_orders 
FOR INSERT 
WITH CHECK (restaurant_id::text = auth.uid()::text);

CREATE POLICY "Admins can manage all subscription orders" 
ON public.subscription_orders 
FOR ALL 
USING (public.has_system_role(auth.uid(), 'admin') OR public.has_system_role(auth.uid(), 'super_admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_menu_categories_updated_at
    BEFORE UPDATE ON public.menu_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON public.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_orders_updated_at
    BEFORE UPDATE ON public.subscription_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing tables to use RWF currency
UPDATE public.restaurants SET monthly_fee = monthly_fee * 100 WHERE monthly_fee IS NOT NULL; -- Convert to cents
ALTER TABLE public.restaurants ALTER COLUMN monthly_fee TYPE INTEGER USING (monthly_fee::INTEGER);
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'RWF';

UPDATE public.subscription_payments SET amount = amount * 100 WHERE amount IS NOT NULL; -- Convert to cents  
ALTER TABLE public.subscription_payments ALTER COLUMN amount TYPE INTEGER USING (amount::INTEGER);
ALTER TABLE public.subscription_payments ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'RWF';

-- Add indexes for better performance
CREATE INDEX idx_menu_categories_restaurant_id ON public.menu_categories(restaurant_id);
CREATE INDEX idx_menu_categories_active ON public.menu_categories(is_active);
CREATE INDEX idx_menu_items_restaurant_id ON public.menu_items(restaurant_id);
CREATE INDEX idx_menu_items_category_id ON public.menu_items(category_id);
CREATE INDEX idx_menu_items_available ON public.menu_items(is_available);
CREATE INDEX idx_subscription_orders_restaurant_id ON public.subscription_orders(restaurant_id);
CREATE INDEX idx_subscription_orders_status ON public.subscription_orders(status);