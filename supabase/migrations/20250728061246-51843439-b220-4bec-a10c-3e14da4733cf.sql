-- Create admin user in Supabase Auth and assign proper roles
-- First, let's create a proper admin user migration

-- Insert the admin user into user_roles table with super_admin role
INSERT INTO user_roles (user_id, role, is_active, assigned_at)
VALUES 
  -- We'll need to create this user through auth.users first
  ('00000000-0000-0000-0000-000000000000'::uuid, 'super_admin', true, now())
ON CONFLICT (user_id, role) DO UPDATE SET 
  is_active = true,
  assigned_at = now();

-- Create a function to handle admin account creation
CREATE OR REPLACE FUNCTION public.create_admin_account(
  admin_email text,
  admin_password text,
  admin_role text DEFAULT 'admin'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- This function should only be called by super admins or during initial setup
  -- Insert into auth.users is not directly possible, so this function 
  -- will be used in conjunction with the auth.signUp process
  
  -- For now, we'll create a placeholder that can be updated when the user signs up
  INSERT INTO user_roles (user_id, role, is_active, assigned_at)
  VALUES (gen_random_uuid(), admin_role, false, now())
  RETURNING user_id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$;

-- Create a function to promote a user to admin
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(
  target_user_id uuid,
  admin_role text DEFAULT 'admin'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is a super admin
  IF NOT is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only super admins can promote users to admin roles';
  END IF;
  
  -- Insert or update the user role
  INSERT INTO user_roles (user_id, role, is_active, assigned_by, assigned_at)
  VALUES (target_user_id, admin_role, true, auth.uid(), now())
  ON CONFLICT (user_id, role) DO UPDATE SET
    is_active = true,
    assigned_by = auth.uid(),
    assigned_at = now();
    
  RETURN true;
END;
$$;