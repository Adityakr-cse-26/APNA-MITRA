-- ==============================================================================
-- APNA MITRA HEALTHCARE: MEDICATION REMINDER DATABASE SCHEMA & EXTENSIONS
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. ENHANCE PUSH SUBSCRIPTIONS TABLE
-- Stores browser push subscriptions, patient local timezone, and reminder preferences
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_uid UUID NOT NULL,
    caretaker_id UUID,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    reminders_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure all columns exist if table was already created
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata';
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS reminders_enabled BOOLEAN DEFAULT true;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS caretaker_id UUID;
ALTER TABLE push_subscriptions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'push_subscriptions' 
        AND policyname = 'Users can manage their own push subscriptions'
    ) THEN
        CREATE POLICY "Users can manage their own push subscriptions" 
        ON push_subscriptions 
        FOR ALL USING (auth.uid() = patient_uid);
    END IF;
END $$;

-- 2. MEDICATION REMINDER LOGS TABLE (DEDUPLICATION & AUDIT)
-- Prevents duplicate notifications for the same scheduled dose on the same day
CREATE TABLE IF NOT EXISTS medication_reminder_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    medication_id TEXT NOT NULL,
    patient_uid TEXT NOT NULL,
    dose_date DATE NOT NULL,
    dose_time TEXT NOT NULL, -- e.g. "08:00"
    status TEXT DEFAULT 'sent', -- 'sent', 'simulated', 'failed', 'pending'
    provider_id TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_medication_dose_per_day UNIQUE (medication_id, dose_date, dose_time)
);

ALTER TABLE medication_reminder_logs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'sent';
ALTER TABLE medication_reminder_logs ADD COLUMN IF NOT EXISTS provider_id TEXT;
ALTER TABLE medication_reminder_logs ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE medication_reminder_logs ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_med_reminder_logs_lookup 
ON medication_reminder_logs (medication_id, dose_date, dose_time);

CREATE INDEX IF NOT EXISTS idx_med_reminder_logs_patient 
ON medication_reminder_logs (patient_uid, dose_date);

ALTER TABLE medication_reminder_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'medication_reminder_logs' 
        AND policyname = 'Users can view their own medication reminder logs'
    ) THEN
        CREATE POLICY "Users can view their own medication reminder logs" 
        ON medication_reminder_logs 
        FOR SELECT USING (auth.uid()::text = patient_uid);
    END IF;
END $$;

-- 3. ENSURE MEDICATIONS TABLE HAS SCHEDULED TIME, FREQUENCY, AND SMS SETTINGS
ALTER TABLE medications ADD COLUMN IF NOT EXISTS scheduled_time TEXT;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS taken_today BOOLEAN DEFAULT false;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS instructions TEXT;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS timing TEXT DEFAULT 'Morning';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS frequency TEXT DEFAULT 'daily';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS date DATE;
ALTER TABLE medications ADD COLUMN IF NOT EXISTS reminder_status TEXT DEFAULT 'Scheduled';
ALTER TABLE medications ADD COLUMN IF NOT EXISTS sms_enabled BOOLEAN DEFAULT true;

-- Ensure profiles table has patient_id and sms_reminders_enabled
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS patient_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sms_reminders_enabled BOOLEAN DEFAULT true;

-- 4. RELOAD SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- ==============================================================================
-- 5. SCHEDULED SERVER-SIDE CRON JOB (SUPABASE pg_cron & pg_net)
-- Run this in Supabase if you wish to trigger the Edge Function every minute:
-- (Replace <PROJECT-REF> and <SERVICE_ROLE_KEY> with your Supabase credentials)
--
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- SELECT cron.schedule(
--   'check-due-medication-reminders-every-minute',
--   '* * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://glytruwxtyhfkrstnygr.supabase.co/functions/v1/send-medication-reminders',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl"}'::jsonb,
--     body := '{"action": "check_all"}'::jsonb
--   ) AS request_id;
--   $$
-- );
-- ==============================================================================
