-- Create payment methods table for extensible payment system
CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'manual', -- 'manual', 'stripe', 'paypal', 'mobile_money', etc.
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Admin can manage payment methods
CREATE POLICY "Admins can manage payment methods" 
ON public.payment_methods FOR ALL 
USING (has_system_role(auth.uid(), 'admin') OR has_system_role(auth.uid(), 'super_admin'));

-- Everyone can view active payment methods
CREATE POLICY "Anyone can view active payment methods" 
ON public.payment_methods FOR SELECT 
USING (is_active = true);

-- Insert default manual payment method
INSERT INTO public.payment_methods (name, type, is_default, is_active) 
VALUES ('Manual Payment', 'manual', true, true);

-- Add payment method reference to subscription orders
ALTER TABLE public.subscription_orders ADD COLUMN payment_method_id UUID REFERENCES public.payment_methods(id);

-- Create system settings table for global configuration
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Admin can manage system settings
CREATE POLICY "Admins can manage system settings" 
ON public.system_settings FOR ALL 
USING (has_system_role(auth.uid(), 'admin') OR has_system_role(auth.uid(), 'super_admin'));

-- Insert default domain setting
INSERT INTO public.system_settings (key, value, description) 
VALUES ('domain_url', '"https://your-domain.com"', 'Base domain URL for QR code generation');

-- Create updated_at trigger for payment_methods
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON public.payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for system_settings  
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();