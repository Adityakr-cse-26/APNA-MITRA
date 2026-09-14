const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
let url = process.env.VITE_SUPABASE_URL || fallbackUrl;
let key = process.env.VITE_SUPABASE_ANON_KEY || fallbackKey;
const supabase = createClient(url, key);

async function run() {
  console.log(`
-- Run in Supabase SQL Editor to add fields and create emergency_alerts

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_relationship TEXT;

CREATE TABLE IF NOT EXISTS emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'SOS',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  status TEXT DEFAULT 'created',
  notification_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can insert own alerts" ON emergency_alerts
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view own alerts" ON emergency_alerts
  FOR SELECT USING (auth.uid() = patient_id);
`);
}
run();
