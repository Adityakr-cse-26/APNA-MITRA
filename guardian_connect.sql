-- 1. Create a secure RPC to allow a patient to look up a guardian by email
CREATE OR REPLACE FUNCTION connect_guardian_by_email(p_patient_id UUID, p_guardian_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_guardian_id UUID;
BEGIN
  -- Validate patient exists and is the one calling (optional extra security if using RLS, but Security Definer bypasses RLS)
  IF auth.uid() != p_patient_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Find the user by email in auth.users
  SELECT id INTO v_guardian_id FROM auth.users WHERE email = p_guardian_email LIMIT 1;
  
  IF v_guardian_id IS NULL THEN
    RAISE EXCEPTION 'Guardian not found with that email address';
  END IF;

  -- Verify the found user is registered as a guardian
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_guardian_id AND role = 'guardian') THEN
    RAISE EXCEPTION 'User found but is not registered as a Guardian';
  END IF;

  -- Update patient profile
  UPDATE public.profiles
  SET guardian_id = v_guardian_id
  WHERE id = p_patient_id;

  RETURN v_guardian_id;
END;
$$;
