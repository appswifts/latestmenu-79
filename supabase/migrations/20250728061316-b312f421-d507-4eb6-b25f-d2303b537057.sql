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
  -- Check if the calling user is a super admin or if this is the first admin (no existing super admins)
  IF NOT (is_super_admin(auth.uid()) OR NOT EXISTS(SELECT 1 FROM user_roles WHERE role = 'super_admin' AND is_active = true)) THEN
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

-- Create a function to handle the first admin setup
CREATE OR REPLACE FUNCTION public.setup_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Check if this is a valid user and if there are no existing super admins
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  IF EXISTS(SELECT 1 FROM user_roles WHERE role = 'super_admin' AND is_active = true) THEN
    RAISE EXCEPTION 'Super admin already exists';
  END IF;
  
  -- Make the current user a super admin
  INSERT INTO user_roles (user_id, role, is_active, assigned_at)
  VALUES (current_user_id, 'super_admin', true, now())
  ON CONFLICT (user_id, role) DO UPDATE SET
    is_active = true,
    assigned_at = now();
    
  RETURN true;
END;
$$;