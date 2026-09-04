-- Run this in your Supabase SQL Editor to force-confirm the test guardian and create their profile

-- 1. Confirm the email address
UPDATE auth.users 
SET email_confirmed_at = now() 
WHERE email = 'guardian@test.com';

-- 2. Insert the Guardian profile (bypassing RLS because it's run as a superuser)
INSERT INTO public.profiles (id, full_name, role)
SELECT id, 'Test Guardian', 'guardian' 
FROM auth.users 
WHERE email = 'guardian@test.com'
ON CONFLICT (id) DO UPDATE 
SET full_name = 'Test Guardian', role = 'guardian';
