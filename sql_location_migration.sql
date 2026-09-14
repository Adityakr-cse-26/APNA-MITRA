-- Add location fields to emergency_alerts
ALTER TABLE public.emergency_alerts 
ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMP WITH TIME ZONE;

-- Add RLS so guardians can view their patients' alerts
CREATE POLICY "Guardians can view patient alerts" ON public.emergency_alerts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = emergency_alerts.patient_id 
    AND profiles.guardian_id = auth.uid()
  )
);

NOTIFY pgrst, 'reload schema';
