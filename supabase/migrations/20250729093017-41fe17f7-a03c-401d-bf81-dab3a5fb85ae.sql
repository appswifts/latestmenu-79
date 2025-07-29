-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_restaurants_email ON restaurants(email);
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_id ON menu_items(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_restaurant_id ON restaurant_tables(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_restaurant_id ON qr_scans(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_timestamp ON qr_scans(scan_timestamp);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_restaurant_id ON subscription_payments(restaurant_id);

-- Standardize data types from character varying to text
ALTER TABLE restaurants 
  ALTER COLUMN name TYPE text,
  ALTER COLUMN email TYPE text,
  ALTER COLUMN phone TYPE text,
  ALTER COLUMN whatsapp_number TYPE text,
  ALTER COLUMN logo_url TYPE text,
  ALTER COLUMN password_hash TYPE text,
  ALTER COLUMN brand_primary_color TYPE text,
  ALTER COLUMN brand_secondary_color TYPE text,
  ALTER COLUMN menu_background_color TYPE text,
  ALTER COLUMN menu_background_type TYPE text;

ALTER TABLE restaurant_tables
  ALTER COLUMN table_number TYPE text,
  ALTER COLUMN table_name TYPE text,
  ALTER COLUMN qr_code_url TYPE text,
  ALTER COLUMN qr_code_data TYPE text;

ALTER TABLE subscription_payments
  ALTER COLUMN payment_method TYPE text,
  ALTER COLUMN payment_reference TYPE text,
  ALTER COLUMN verified_by TYPE text;

ALTER TABLE qr_scans
  ALTER COLUMN ip_address TYPE text;

-- Fix monthly_fee precision for currency (convert from integer to decimal)
ALTER TABLE restaurants 
  ALTER COLUMN monthly_fee TYPE decimal(10,2);

-- Add missing unique constraint
ALTER TABLE restaurant_tables 
  ADD CONSTRAINT unique_restaurant_table_number 
  UNIQUE (restaurant_id, table_number);

-- Add email validation constraint
ALTER TABLE restaurants 
  ADD CONSTRAINT valid_email_format 
  CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add phone number format validation (basic international format)
ALTER TABLE restaurants 
  ADD CONSTRAINT valid_phone_format 
  CHECK (phone IS NULL OR phone ~* '^\+?[1-9]\d{1,14}$');

ALTER TABLE restaurants 
  ADD CONSTRAINT valid_whatsapp_format 
  CHECK (whatsapp_number ~* '^\+?[1-9]\d{1,14}$');

-- Add soft delete capability
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;

-- Add hierarchical structure to menu categories
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES menu_categories(id);

-- Create index for hierarchical queries
CREATE INDEX IF NOT EXISTS idx_menu_categories_parent_id ON menu_categories(parent_id);

-- Add allergen information to menu items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens text[];
CREATE INDEX IF NOT EXISTS idx_menu_items_allergens ON menu_items USING GIN(allergens);

-- Performance optimization: Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_menu_items_restaurant_category ON menu_items(restaurant_id, category_id) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_active ON restaurant_tables(restaurant_id) WHERE is_active = true;