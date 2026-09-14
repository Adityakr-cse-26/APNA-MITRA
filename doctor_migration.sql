-- Create appointments table if not exists
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'pending',
  rejection_reason TEXT,
  notes TEXT,
  patient_name TEXT,
  patient_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Note: doctor_id should link to profiles or auth.users depending on setup, linking to auth.users for now.
-- In ApnaMitra doctors might be users with role = 'doctor'.

-- Add RLS for doctors
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Patients can view and create their own appointments
CREATE POLICY "Patients view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert own appointments" ON public.appointments
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Doctors can view and update their own appointments
CREATE POLICY "Doctors view own appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors update own appointments" ON public.appointments
  FOR UPDATE USING (auth.uid() = doctor_id);

-- Reload schema
NOTIFY pgrst, 'reload schema';
