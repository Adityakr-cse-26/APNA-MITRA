CREATE TABLE IF NOT EXISTS public.vitals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid NOT NULL,
  type text NOT NULL,
  value text NOT NULL,
  unit text NOT NULL,
  timestamp text NOT NULL,
  status text NOT NULL,
  note text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own vitals"
  ON public.vitals FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own vitals"
  ON public.vitals FOR INSERT
  WITH CHECK (auth.uid() = patient_id);
  
CREATE POLICY "Patients can update own vitals"
  ON public.vitals FOR UPDATE
  USING (auth.uid() = patient_id);
  
CREATE POLICY "Patients can delete own vitals"
  ON public.vitals FOR DELETE
  USING (auth.uid() = patient_id);

-- Guardian access if needed, though they usually view notifications.
-- Just general select policy for guardians using the profile table could be complex. 

NOTIFY pgrst, 'reload schema';
