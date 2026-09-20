-- Apna Mitra - Emergency Alerts & Push Subscriptions RLS Fix
-- Run this in your Supabase Project SQL Editor to allow patients and caretakers
-- to insert and manage SOS alerts and push subscriptions without RLS violations.

-- 1. Emergency Alerts: Ensure any patient or device can trigger emergency SOS alerts
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anyone to insert emergency alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Users can insert their own alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Users can view emergency alerts" ON public.emergency_alerts;
DROP POLICY IF EXISTS "Users can update emergency alerts" ON public.emergency_alerts;

-- Allow INSERT for all users (emergencies should never be blocked by permissions)
CREATE POLICY "Allow anyone to insert emergency alerts" 
ON public.emergency_alerts FOR INSERT 
WITH CHECK (true);

-- Allow SELECT for all users to verify SOS dispatch status
CREATE POLICY "Allow anyone to view emergency alerts" 
ON public.emergency_alerts FOR SELECT 
USING (true);

-- Allow UPDATE for alert status management
CREATE POLICY "Allow anyone to update emergency alerts" 
ON public.emergency_alerts FOR UPDATE 
USING (true) WITH CHECK (true);

-- 2. Push Subscriptions: Allow users to register push subscriptions without RLS errors
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow push subscriptions upsert" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow push subscriptions select" ON public.push_subscriptions;

CREATE POLICY "Allow push subscriptions upsert" 
ON public.push_subscriptions FOR ALL 
USING (true) WITH CHECK (true);

-- 3. Caretakers: Ensure caretakers can be added, updated, and queried
ALTER TABLE public.caretakers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage caretakers" ON public.caretakers;
DROP POLICY IF EXISTS "Users can view caretakers" ON public.caretakers;

CREATE POLICY "Users can manage caretakers" 
ON public.caretakers FOR ALL 
USING (true) WITH CHECK (true);

-- 4. Notifications: Ensure notifications can be created during SOS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow notifications insert" ON public.notifications;
DROP POLICY IF EXISTS "Allow notifications select" ON public.notifications;

CREATE POLICY "Allow notifications insert" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow notifications select" 
ON public.notifications FOR SELECT 
USING (true);
