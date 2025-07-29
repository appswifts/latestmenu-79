-- Add RLS policies for user_roles table to allow admin creation

-- Allow authenticated users to insert their own user_roles (needed for signup)
CREATE POLICY "Users can insert their own roles during signup" 
ON public.user_roles 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow system functions to manage user roles (for admin creation)
CREATE POLICY "System can manage user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (
  -- Allow if user is inserting their own role
  user_id = auth.uid() 
  OR 
  -- Allow if user is a super admin managing other roles
  user_has_permission(auth.uid(), 'system_admin')
);

-- Update existing policy to allow broader access for role management
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

CREATE POLICY "Users can view accessible roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  user_has_permission(auth.uid(), 'system_admin')
);