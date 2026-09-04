-- Run this in your Supabase SQL Editor to allow patients to insert SOS alerts

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own SOS alerts
CREATE POLICY "Users can insert their own SOS alerts" 
ON public.sos_alerts
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

-- Allow users to view their own SOS alerts
CREATE POLICY "Users can view their own SOS alerts" 
ON public.sos_alerts
FOR SELECT 
USING (auth.uid() = patient_id);

-- Alternatively, if you just want to allow authenticated users to insert:
-- CREATE POLICY "Authenticated users can insert sos_alerts" ON public.sos_alerts FOR INSERT TO authenticated WITH CHECK (true);
