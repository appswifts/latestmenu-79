-- Enhanced RBAC System Implementation
-- First, ensure we have proper role management

-- Update user_roles table to be more comprehensive
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_at timestamp with time zone DEFAULT now();

-- Create permissions table for fine-grained access control
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  resource text NOT NULL, -- e.g., 'restaurants', 'users', 'payments'
  action text NOT NULL,   -- e.g., 'read', 'write', 'delete', 'manage'
  created_at timestamp with time zone DEFAULT now()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Enable RLS on new tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

-- Insert core permissions
INSERT INTO permissions (name, description, resource, action) VALUES
  ('read_restaurants', 'View restaurant data', 'restaurants', 'read'),
  ('write_restaurants', 'Create and update restaurants', 'restaurants', 'write'),
  ('delete_restaurants', 'Delete restaurants', 'restaurants', 'delete'),
  ('manage_restaurants', 'Full restaurant management', 'restaurants', 'manage'),
  ('read_users', 'View user data', 'users', 'read'),
  ('write_users', 'Create and update users', 'users', 'write'),
  ('delete_users', 'Delete users', 'users', 'delete'),
  ('manage_users', 'Full user management', 'users', 'manage'),
  ('read_payments', 'View payment data', 'payments', 'read'),
  ('write_payments', 'Process payments', 'payments', 'write'),
  ('manage_payments', 'Full payment management', 'payments', 'manage'),
  ('read_subscriptions', 'View subscription data', 'subscriptions', 'read'),
  ('manage_subscriptions', 'Manage subscriptions', 'subscriptions', 'manage'),
  ('system_admin', 'Full system administration', 'system', 'manage')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role, permission_id)
SELECT 'super_admin', id FROM permissions
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', p.id FROM permissions p 
WHERE p.name IN ('read_restaurants', 'write_restaurants', 'read_users', 'read_payments', 'manage_subscriptions')
ON CONFLICT (role, permission_id) DO NOTHING;

INSERT INTO role_permissions (role, permission_id)
SELECT 'restaurant', p.id FROM permissions p 
WHERE p.name IN ('read_restaurants', 'write_restaurants')
ON CONFLICT (role, permission_id) DO NOTHING;

-- Enhanced permission checking functions
CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id uuid, _permission_name text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role = ur.role
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id 
      AND ur.is_active = true
      AND p.name = _permission_name
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_role_permission(_user_id uuid, _role text, _resource text, _action text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role = ur.role
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id 
      AND ur.is_active = true
      AND ur.role = _role
      AND p.resource = _resource
      AND p.action = _action
  );
$$;

-- Enhanced admin checking with proper permissions
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT user_has_permission(_user_id, 'system_admin');
$$;

-- RLS Policies for new tables
CREATE POLICY "Super admins can manage permissions" ON permissions
FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view permissions" ON permissions
FOR SELECT USING (true);

CREATE POLICY "Super admins can manage role permissions" ON role_permissions
FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view role permissions" ON role_permissions
FOR SELECT USING (true);

-- Update existing RLS policies to use new permission system
DROP POLICY IF EXISTS "Admins can manage all subscription orders" ON subscription_orders;
CREATE POLICY "Admins can manage subscription orders" ON subscription_orders
FOR ALL USING (user_has_permission(auth.uid(), 'manage_subscriptions'));

DROP POLICY IF EXISTS "Admins can manage all payments" ON subscription_payments;
CREATE POLICY "Admins can manage payments" ON subscription_payments
FOR ALL USING (user_has_permission(auth.uid(), 'manage_payments'));

DROP POLICY IF EXISTS "Admins can manage packages" ON packages;
CREATE POLICY "Admins can manage packages" ON packages
FOR ALL USING (user_has_permission(auth.uid(), 'manage_subscriptions'));

DROP POLICY IF EXISTS "Admins can manage payment methods" ON payment_methods;
CREATE POLICY "Admins can manage payment methods" ON payment_methods
FOR ALL USING (user_has_permission(auth.uid(), 'manage_payments'));

DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
CREATE POLICY "Admins can manage system settings" ON system_settings
FOR ALL USING (user_has_permission(auth.uid(), 'system_admin'));