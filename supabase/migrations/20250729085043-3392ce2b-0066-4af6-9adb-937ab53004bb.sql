-- Drop all dependent policies first
DROP POLICY IF EXISTS "Admins can manage subscription orders" ON subscription_orders;
DROP POLICY IF EXISTS "Admins can manage payments" ON subscription_payments;
DROP POLICY IF EXISTS "Admins can manage packages" ON packages;
DROP POLICY IF EXISTS "Admins can manage payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
DROP POLICY IF EXISTS "System can manage user roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view accessible roles" ON user_roles;

-- Now drop functions with CASCADE
DROP FUNCTION IF EXISTS user_has_permission(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS user_has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_super_admin(uuid) CASCADE;
DROP FUNCTION IF EXISTS has_system_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Clear all existing user data
DELETE FROM user_roles;
DELETE FROM restaurants WHERE id IS NOT NULL;
DELETE FROM auth.users;

-- Drop and recreate RBAC tables
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_permission_overrides CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Create comprehensive RBAC system

-- 1. Permissions table - defines what actions can be performed
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Roles table - dynamic role creation
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  hierarchy_level INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Role permissions mapping
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- 4. User roles - users can have multiple roles
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- 5. User permission overrides
CREATE TABLE user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL,
  reason TEXT,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, permission_id)
);

-- 6. User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
  last_login_at TIMESTAMP WITH TIME ZONE,
  last_activity_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. User activity log
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
('system_admin', 'Full system administration access', 'system', 'admin'),
('manage_users', 'Manage user accounts', 'users', 'manage'),
('manage_roles', 'Create and manage roles', 'roles', 'manage'),
('manage_permissions', 'Assign permissions', 'permissions', 'manage'),
('manage_subscriptions', 'Manage subscriptions', 'subscriptions', 'manage'),
('manage_payments', 'Manage payments', 'payments', 'manage');

-- Insert default roles
INSERT INTO roles (name, description, is_system_role, hierarchy_level) VALUES
('super_admin', 'Super Administrator with full system access', true, 100),
('admin', 'System Administrator', true, 90),
('restaurant_manager', 'Restaurant Manager', true, 50),
('customer', 'Customer User', true, 10);

-- Create RBAC functions
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = user_uuid 
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
      AND p.name = permission_name
  );
$$;

CREATE OR REPLACE FUNCTION user_has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = user_uuid 
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
      AND r.name = role_name
      AND r.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT user_has_role(user_uuid, 'admin') OR user_has_role(user_uuid, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT user_has_role(user_uuid, 'super_admin');
$$;

-- Assign all permissions to super_admin
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'super_admin';

-- Enable RLS
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Super admins can manage permissions" ON permissions FOR ALL USING (is_super_admin(auth.uid()));
CREATE POLICY "Users can view permissions" ON permissions FOR SELECT USING (true);

CREATE POLICY "Admins can manage roles" ON roles FOR ALL USING (user_has_permission(auth.uid(), 'manage_roles'));
CREATE POLICY "Users can view active roles" ON roles FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage role permissions" ON role_permissions FOR ALL USING (user_has_permission(auth.uid(), 'manage_permissions'));
CREATE POLICY "Users can view role permissions" ON role_permissions FOR SELECT USING (true);

CREATE POLICY "Admins can manage user roles" ON user_roles FOR ALL USING (user_has_permission(auth.uid(), 'manage_users'));
CREATE POLICY "Users can view their own roles" ON user_roles FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can manage all profiles" ON user_profiles FOR ALL USING (user_has_permission(auth.uid(), 'manage_users'));

-- Recreate policies for existing tables
CREATE POLICY "Admins can manage subscription orders" ON subscription_orders FOR ALL USING (user_has_permission(auth.uid(), 'manage_subscriptions'));
CREATE POLICY "Admins can manage payments" ON subscription_payments FOR ALL USING (user_has_permission(auth.uid(), 'manage_payments'));
CREATE POLICY "Admins can manage packages" ON packages FOR ALL USING (user_has_permission(auth.uid(), 'manage_subscriptions'));
CREATE POLICY "Admins can manage payment methods" ON payment_methods FOR ALL USING (user_has_permission(auth.uid(), 'manage_payments'));
CREATE POLICY "Admins can manage system settings" ON system_settings FOR ALL USING (user_has_permission(auth.uid(), 'system_admin'));

-- Create user profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, first_name, last_name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );
  
  INSERT INTO user_roles (user_id, role_id)
  SELECT NEW.id, r.id FROM roles r WHERE r.name = COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();