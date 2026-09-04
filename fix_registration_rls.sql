-- =================================================================================
-- FIX FOR PROFILE CREATION ERROR (42501) - ROW LEVEL SECURITY
-- =================================================================================
-- Run this entire script in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- This creates a database trigger to securely handle user registration.

-- 1. Enable Row Level Security (RLS) on the tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caretakers ENABLE ROW LEVEL SECURITY;

-- 2. Add SELECT and UPDATE policies for authenticated users
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view caretakers" ON public.caretakers;
CREATE POLICY "Users can view caretakers" 
ON public.caretakers FOR SELECT 
USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "Users can update caretakers" ON public.caretakers;
CREATE POLICY "Users can update caretakers" 
ON public.caretakers FOR UPDATE 
USING (auth.uid() = patient_id);

-- 3. THE SECURE TRIGGER FOR REGISTRATION
-- (This is required because when Email Confirmation is ON, the user is not fully 
-- authenticated during registration, so standard INSERT policies fail).

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'role'
  )
  ON CONFLICT (id) DO UPDATE 
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone;
  
  -- Insert into caretakers if guardian data exists
  IF new.raw_user_meta_data->>'guardian_name' IS NOT NULL THEN
    INSERT INTO public.caretakers (patient_id, name, phone)
    VALUES (
      new.id,
      new.raw_user_meta_data->>'guardian_name',
      new.raw_user_meta_data->>'guardian_phone'
    )
    ON CONFLICT (patient_id) DO UPDATE
    SET name = EXCLUDED.name,
        phone = EXCLUDED.phone;
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Attach the trigger to Supabase Auth
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

