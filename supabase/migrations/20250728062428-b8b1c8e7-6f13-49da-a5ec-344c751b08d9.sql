-- Insert admin user into auth.users table
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'upworkwinner@gmail.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Get the user ID and assign super_admin role
INSERT INTO public.user_roles (user_id, role, is_active, assigned_at)
SELECT 
  id, 
  'super_admin',
  true,
  now()
FROM auth.users 
WHERE email = 'upworkwinner@gmail.com'
ON CONFLICT (user_id, role) DO UPDATE SET
  is_active = true,
  assigned_at = now();