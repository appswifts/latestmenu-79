-- Create subscription_orders table
CREATE TABLE IF NOT EXISTS public.subscription_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL,
  restaurant_name TEXT NOT NULL,
  restaurant_email TEXT NOT NULL,
  restaurant_phone TEXT NULL,
  package_id UUID NULL,
  plan_type TEXT NOT NULL DEFAULT 'monthly',
  amount INTEGER NOT NULL,
  currency TEXT NULL DEFAULT 'RWF',
  status TEXT NULL DEFAULT 'pending',
  payment_method TEXT NULL,
  payment_reference TEXT NULL,
  notes TEXT NULL,
  approved_by UUID NULL,
  approved_at TIMESTAMP WITH TIME ZONE NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
  payment_method_id UUID NULL,
  CONSTRAINT subscription_orders_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_orders_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE,
  CONSTRAINT subscription_orders_package_id_fkey FOREIGN KEY (package_id) REFERENCES packages (id),
  CONSTRAINT subscription_orders_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES payment_methods (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_orders_restaurant_id ON public.subscription_orders USING btree (restaurant_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status ON public.subscription_orders USING btree (status);

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_orders_updated_at 
  BEFORE UPDATE ON subscription_orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.subscription_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscription_orders
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
USING (has_system_role(auth.uid(), 'admin'::text) OR has_system_role(auth.uid(), 'super_admin'::text));

-- Check if subscription_payments table already exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscription_payments') THEN
    CREATE TABLE public.subscription_payments (
      id UUID NOT NULL DEFAULT gen_random_uuid(),
      restaurant_id UUID NOT NULL,
      amount INTEGER NOT NULL,
      payment_method CHARACTER VARYING(50) NULL,
      payment_reference CHARACTER VARYING(255) NULL,
      payment_date DATE NOT NULL,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      status payment_status NULL DEFAULT 'pending',
      notes TEXT NULL,
      verified_by CHARACTER VARYING(255) NULL,
      verified_at TIMESTAMP WITH TIME ZONE NULL,
      created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
      currency TEXT NULL DEFAULT 'RWF',
      CONSTRAINT subscription_payments_pkey PRIMARY KEY (id),
      CONSTRAINT subscription_payments_restaurant_id_fkey FOREIGN KEY (restaurant_id) REFERENCES restaurants (id) ON DELETE CASCADE
    );

    -- Create indexes
    CREATE INDEX idx_subscription_payments_restaurant_id ON public.subscription_payments USING btree (restaurant_id);
    CREATE INDEX idx_subscription_payments_status ON public.subscription_payments USING btree (status);

    -- Enable RLS
    ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies for subscription_payments
    CREATE POLICY "Restaurants can view their own payments" 
    ON public.subscription_payments 
    FOR SELECT 
    USING (restaurant_id::text = auth.uid()::text);

    CREATE POLICY "Admins can manage all payments" 
    ON public.subscription_payments 
    FOR ALL 
    USING (has_system_role(auth.uid(), 'admin'::text) OR has_system_role(auth.uid(), 'super_admin'::text));
  END IF;
END
$$;