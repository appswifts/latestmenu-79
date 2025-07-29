-- Simplified Restaurant QR Code System Database Schema
-- No menu management - restaurants handle menus via WhatsApp

-- Create subscription status enum
CREATE TYPE subscription_status AS ENUM ('pending', 'active', 'expired', 'cancelled');

-- Create payment status enum  
CREATE TYPE payment_status AS ENUM ('pending', 'verified', 'rejected');

-- Create admin role enum
CREATE TYPE admin_role AS ENUM ('super_admin', 'admin');

-- Restaurants table
CREATE TABLE public.restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    whatsapp_number VARCHAR(20) NOT NULL, -- For receiving orders
    logo_url VARCHAR(500),
    subscription_status subscription_status DEFAULT 'pending',
    subscription_start_date DATE,
    subscription_end_date DATE,
    monthly_fee DECIMAL(10,2) DEFAULT 29.99,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on restaurants
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

-- Tables/QR codes table
CREATE TABLE public.restaurant_tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_number VARCHAR(50) NOT NULL,
    table_name VARCHAR(100), -- Optional: "Window Table", "Patio Table 1", etc.
    qr_code_url VARCHAR(500), -- Generated QR code image URL
    qr_code_data VARCHAR(500) NOT NULL, -- The actual URL/data in the QR code
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(restaurant_id, table_number)
);

-- Enable RLS on restaurant_tables
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Payment records for manual subscription tracking
CREATE TABLE public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50), -- 'bank_transfer', 'cash', 'mobile_money', etc.
    payment_reference VARCHAR(255), -- Transaction reference or receipt number
    payment_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    status payment_status DEFAULT 'pending',
    notes TEXT,
    verified_by VARCHAR(255), -- Admin who verified the payment
    verified_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on subscription_payments
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- QR scan tracking (optional - for analytics)
CREATE TABLE public.qr_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES public.restaurant_tables(id) ON DELETE SET NULL,
    scan_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ip_address VARCHAR(45), -- For basic analytics
    user_agent TEXT -- For device type analytics
);

-- Enable RLS on qr_scans
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;

-- System admins table
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role admin_role DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Indexes for better performance
CREATE INDEX idx_restaurants_subscription_status ON public.restaurants(subscription_status);
CREATE INDEX idx_restaurants_email ON public.restaurants(email);
CREATE INDEX idx_restaurant_tables_restaurant_id ON public.restaurant_tables(restaurant_id);
CREATE INDEX idx_subscription_payments_restaurant_id ON public.subscription_payments(restaurant_id);
CREATE INDEX idx_subscription_payments_status ON public.subscription_payments(status);
CREATE INDEX idx_qr_scans_restaurant_id ON public.qr_scans(restaurant_id);
CREATE INDEX idx_qr_scans_timestamp ON public.qr_scans(scan_timestamp);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for restaurants table
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON public.restaurants
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for restaurants
CREATE POLICY "Restaurants can view their own data" 
ON public.restaurants FOR SELECT 
USING (auth.uid()::text = id::text);

CREATE POLICY "Restaurants can update their own data" 
ON public.restaurants FOR UPDATE 
USING (auth.uid()::text = id::text);

-- RLS Policies for restaurant_tables
CREATE POLICY "Restaurants can view their own tables" 
ON public.restaurant_tables FOR SELECT 
USING (restaurant_id::text = auth.uid()::text);

CREATE POLICY "Restaurants can create their own tables" 
ON public.restaurant_tables FOR INSERT 
WITH CHECK (restaurant_id::text = auth.uid()::text);

CREATE POLICY "Restaurants can update their own tables" 
ON public.restaurant_tables FOR UPDATE 
USING (restaurant_id::text = auth.uid()::text);

CREATE POLICY "Restaurants can delete their own tables" 
ON public.restaurant_tables FOR DELETE 
USING (restaurant_id::text = auth.uid()::text);

-- Public access to tables for QR code scanning
CREATE POLICY "Anyone can view active tables for QR scanning"
ON public.restaurant_tables FOR SELECT
USING (is_active = true);

-- RLS Policies for subscription_payments
CREATE POLICY "Restaurants can view their own payments" 
ON public.subscription_payments FOR SELECT 
USING (restaurant_id::text = auth.uid()::text);

CREATE POLICY "Restaurants can create their own payments" 
ON public.subscription_payments FOR INSERT 
WITH CHECK (restaurant_id::text = auth.uid()::text);

-- RLS Policies for qr_scans
CREATE POLICY "Restaurants can view their own scans" 
ON public.qr_scans FOR SELECT 
USING (restaurant_id::text = auth.uid()::text);

-- Public access to create scan records
CREATE POLICY "Anyone can create scan records"
ON public.qr_scans FOR INSERT
WITH CHECK (true);

-- Sample data for testing
INSERT INTO public.restaurants (id, name, email, phone, address, whatsapp_number, subscription_status, password_hash) 
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'Sample Restaurant', 
    'test@restaurant.com', 
    '+1234567890', 
    '123 Main St', 
    '+1234567890', 
    'active',
    '$2a$10$placeholder_hash'
);

INSERT INTO public.restaurant_tables (restaurant_id, table_number, table_name, qr_code_data) 
VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    'T1',
    'Main Hall Table 1',
    'https://yourdomain.com/order/sample-restaurant-id/table-1'
);