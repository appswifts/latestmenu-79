-- Create packages table for subscription plans
CREATE TABLE public.packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price integer NOT NULL, -- Price in cents/smallest currency unit
  currency text NOT NULL DEFAULT 'RWF',
  max_tables integer,
  max_menu_items integer,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS to packages table
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Anyone can view active packages (for pricing page)
CREATE POLICY "Anyone can view active packages" ON public.packages
  FOR SELECT
  USING (is_active = true);

-- Only admins can manage packages
CREATE POLICY "Admins can manage packages" ON public.packages
  FOR ALL
  USING (has_system_role(auth.uid(), 'admin') OR has_system_role(auth.uid(), 'super_admin'));

-- Insert default packages
INSERT INTO public.packages (name, description, price, max_tables, max_menu_items, features, display_order) VALUES
('Basic', 'Perfect for small restaurants', 2900000, 10, 100, '["Up to 10 tables", "Basic menu management", "WhatsApp integration", "QR code generation", "Email support"]', 1),
('Premium', 'Ideal for growing restaurants', 9900000, 50, 500, '["Up to 50 tables", "Advanced menu management", "WhatsApp integration", "Custom QR designs", "Analytics dashboard", "Priority support", "Multi-location support"]', 2),
('Enterprise', 'For restaurant chains', 19900000, NULL, NULL, '["Unlimited tables", "Full menu customization", "WhatsApp integration", "Custom branding", "Advanced analytics", "24/7 phone support", "API access", "Custom integrations"]', 3);

-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public) VALUES ('menu-images', 'menu-images', true);

-- Create policies for menu images bucket
CREATE POLICY "Anyone can view menu images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Restaurants can upload their own menu images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Restaurants can update their own menu images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

CREATE POLICY "Restaurants can delete their own menu images" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images' AND auth.role() = 'authenticated');

-- Update restaurants table to add package_id
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS package_id uuid REFERENCES public.packages(id);

-- Create trigger to update updated_at column for packages
CREATE TRIGGER update_packages_updated_at
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();