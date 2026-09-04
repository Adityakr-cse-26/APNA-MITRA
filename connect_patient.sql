-- Run this in your Supabase SQL Editor to enable the new "Connect Patient via Email" feature
CREATE OR REPLACE FUNCTION connect_patient_by_email(p_guardian_id UUID, p_patient_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_patient_id UUID;
BEGIN
  IF auth.uid() != p_guardian_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Find the user by email in auth.users
  SELECT id INTO v_patient_id FROM auth.users WHERE email = p_patient_email LIMIT 1;
  
  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Patient not found with that email address';
  END IF;

  -- Verify the found user is registered as a patient (or not a guardian)
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_patient_id AND (role IS NULL OR role = 'patient')) THEN
    RAISE EXCEPTION 'User found but is not registered as a Patient';
  END IF;

  -- Update patient profile
  UPDATE public.profiles
  SET guardian_id = p_guardian_id
  WHERE id = v_patient_id;

  RETURN v_patient_id;
END;
$$;
GRANT EXECUTE ON FUNCTION connect_patient_by_email TO authenticated;
