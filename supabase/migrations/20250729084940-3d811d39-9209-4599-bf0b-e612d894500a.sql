-- Fix migration by dropping existing functions first
DROP FUNCTION IF EXISTS user_has_permission(uuid, text);
DROP FUNCTION IF EXISTS user_has_role(uuid, text);
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_super_admin(uuid);
DROP FUNCTION IF EXISTS has_system_role(uuid, text);
DROP FUNCTION IF EXISTS handle_new_user();

-- Continue with the previous migration...
-- COMPLETE USER SYSTEM RESTRUCTURE
-- Delete all existing user data and rebuild with proper RBAC

-- First, clear all existing user data
DELETE FROM user_roles;
DELETE FROM restaurants;

-- Clear auth users (this will cascade and clean up everything)
DELETE FROM auth.users;

-- Drop existing constraints and recreate tables with proper structure
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;

-- Create comprehensive RBAC system

-- 1. Permissions table - defines what actions can be performed
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  resource TEXT NOT NULL, -- e.g., 'users', 'restaurants', 'subscriptions'
  action TEXT NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Roles table - dynamic role creation
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- true for built-in roles
  is_active BOOLEAN DEFAULT true,
  hierarchy_level INTEGER DEFAULT 0, -- for role hierarchy
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
  expires_at TIMESTAMP WITH TIME ZONE, -- optional role expiration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- 5. User permission overrides - individual user permission overrides
CREATE TABLE user_permission_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN NOT NULL, -- true = grant, false = deny
  reason TEXT,
  assigned_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, permission_id)
);

-- 6. User profiles - extended user information
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
-- System administration
('system_admin', 'Full system administration access', 'system', 'admin'),
('manage_users', 'Manage user accounts', 'users', 'manage'),
('manage_roles', 'Create and manage roles', 'roles', 'manage'),
('manage_permissions', 'Assign permissions', 'permissions', 'manage'),

-- User management
('users_create', 'Create new users', 'users', 'create'),
('users_read', 'View user information', 'users', 'read'),
('users_update', 'Update user information', 'users', 'update'),
('users_delete', 'Delete users', 'users', 'delete'),
('users_suspend', 'Suspend/unsuspend users', 'users', 'suspend'),

-- Role management
('roles_create', 'Create new roles', 'roles', 'create'),
('roles_read', 'View roles', 'roles', 'read'),
('roles_update', 'Update roles', 'roles', 'update'),
('roles_delete', 'Delete roles', 'roles', 'delete'),
('roles_assign', 'Assign roles to users', 'roles', 'assign'),

-- Restaurant management
('restaurants_create', 'Create restaurants', 'restaurants', 'create'),
('restaurants_read', 'View restaurants', 'restaurants', 'read'),
('restaurants_update', 'Update restaurants', 'restaurants', 'update'),
('restaurants_delete', 'Delete restaurants', 'restaurants', 'delete'),
('restaurants_approve', 'Approve restaurant applications', 'restaurants', 'approve'),

-- Subscription management
('subscriptions_manage', 'Manage subscriptions', 'subscriptions', 'manage'),
('subscriptions_activate', 'Activate subscriptions', 'subscriptions', 'activate'),
('subscriptions_deactivate', 'Deactivate subscriptions', 'subscriptions', 'deactivate'),
('payments_verify', 'Verify payments', 'payments', 'verify'),
('payments_process', 'Process payments', 'payments', 'process'),

-- Menu management
('menus_create', 'Create menus', 'menus', 'create'),
('menus_read', 'View menus', 'menus', 'read'),
('menus_update', 'Update menus', 'menus', 'update'),
('menus_delete', 'Delete menus', 'menus', 'delete'),

-- QR Code management
('qr_codes_generate', 'Generate QR codes', 'qr_codes', 'generate'),
('qr_codes_manage', 'Manage QR codes', 'qr_codes', 'manage'),

-- Analytics and reporting
('analytics_view', 'View analytics', 'analytics', 'read'),
('reports_generate', 'Generate reports', 'reports', 'generate');

-- Insert default roles
INSERT INTO roles (name, description, is_system_role, hierarchy_level) VALUES
('super_admin', 'Super Administrator with full system access', true, 100),
('admin', 'System Administrator', true, 90),
('restaurant_manager', 'Restaurant Manager', true, 50),
('restaurant_staff', 'Restaurant Staff Member', true, 30),
('customer', 'Customer User', true, 10);

-- Assign permissions to super_admin role (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'super_admin';

-- Assign permissions to admin role (most permissions except system_admin)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
AND p.name != 'system_admin';

-- Assign permissions to restaurant_manager role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'restaurant_manager'
AND p.name IN (
  'menus_create', 'menus_read', 'menus_update', 'menus_delete',
  'qr_codes_generate', 'qr_codes_manage',
  'analytics_view', 'restaurants_read', 'restaurants_update'
);

-- Assign permissions to restaurant_staff role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'restaurant_staff'
AND p.name IN ('menus_read', 'qr_codes_manage', 'analytics_view');

-- Create new RBAC functions

-- Function to check if user has specific permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    -- Check through roles
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = user_uuid 
      AND ur.is_active = true
      AND (ur.expires_at IS NULL OR ur.expires_at > now())
      AND p.name = permission_name
  ) OR EXISTS (
    -- Check direct permission overrides (grants only)
    SELECT 1
    FROM user_permission_overrides upo
    JOIN permissions p ON p.id = upo.permission_id
    WHERE upo.user_id = user_uuid
      AND p.name = permission_name
      AND upo.is_granted = true
      AND (upo.expires_at IS NULL OR upo.expires_at > now())
  );
$$;

-- Function to check if user has specific role
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

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT user_has_role(user_uuid, 'admin') OR user_has_role(user_uuid, 'super_admin');
$$;

-- Function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT user_has_role(user_uuid, 'super_admin');
$$;

-- Trigger to create user profile when user is created
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
  
  -- Assign default role based on metadata
  INSERT INTO user_roles (user_id, role_id)
  SELECT NEW.id, r.id
  FROM roles r
  WHERE r.name = COALESCE(NEW.raw_user_meta_data->>'role', 'customer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Set up RLS policies

-- Enable RLS on all tables
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permission_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Permissions table policies
CREATE POLICY "Super admins can manage permissions" ON permissions
  FOR ALL USING (is_super_admin(auth.uid()));

CREATE POLICY "Users can view permissions" ON permissions
  FOR SELECT USING (true);

-- Roles table policies
CREATE POLICY "Admins can manage roles" ON roles
  FOR ALL USING (user_has_permission(auth.uid(), 'manage_roles'));

CREATE POLICY "Users can view active roles" ON roles
  FOR SELECT USING (is_active = true);

-- Role permissions policies
CREATE POLICY "Admins can manage role permissions" ON role_permissions
  FOR ALL USING (user_has_permission(auth.uid(), 'manage_permissions'));

CREATE POLICY "Users can view role permissions" ON role_permissions
  FOR SELECT USING (true);

-- User roles policies
CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (user_has_permission(auth.uid(), 'manage_users'));

CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

-- User permission overrides policies
CREATE POLICY "Admins can manage permission overrides" ON user_permission_overrides
  FOR ALL USING (user_has_permission(auth.uid(), 'manage_permissions'));

CREATE POLICY "Users can view their own overrides" ON user_permission_overrides
  FOR SELECT USING (user_id = auth.uid());

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON user_profiles
  FOR ALL USING (user_has_permission(auth.uid(), 'manage_users'));

-- User activity log policies
CREATE POLICY "Admins can view all activity" ON user_activity_log
  FOR SELECT USING (user_has_permission(auth.uid(), 'manage_users'));

CREATE POLICY "Users can view their own activity" ON user_activity_log
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can insert activity logs" ON user_activity_log
  FOR INSERT WITH CHECK (true);