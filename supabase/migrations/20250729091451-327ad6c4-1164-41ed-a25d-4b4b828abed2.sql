-- Create admin user and assign role
-- First, let's check if we have the required roles table setup
INSERT INTO roles (name, description, is_system_role, hierarchy_level) 
VALUES 
  ('super_admin', 'Super Administrator with full system access', true, 100),
  ('admin', 'Administrator with management access', true, 50)
ON CONFLICT (name) DO NOTHING;

-- Create permissions for admin roles
INSERT INTO permissions (name, resource, action, description)
VALUES 
  ('manage_users', 'users', 'all', 'Manage all user accounts'),
  ('manage_restaurants', 'restaurants', 'all', 'Manage restaurant accounts'),
  ('manage_subscriptions', 'subscriptions', 'all', 'Manage subscription orders'),
  ('manage_payments', 'payments', 'all', 'Manage payment methods and transactions'),
  ('manage_roles', 'roles', 'all', 'Manage user roles and permissions'),
  ('manage_permissions', 'permissions', 'all', 'Manage system permissions'),
  ('system_admin', 'system', 'all', 'Full system administration access')
ON CONFLICT (name) DO NOTHING;

-- Link permissions to roles
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name IN ('manage_users', 'manage_restaurants', 'manage_subscriptions', 'manage_payments')
ON CONFLICT DO NOTHING;

-- Note: The actual user creation needs to be done through Supabase Auth
-- This sets up the role structure for when the admin signs up