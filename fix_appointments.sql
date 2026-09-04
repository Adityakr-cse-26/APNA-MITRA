ALTER TABLE appointments ADD COLUMN IF NOT EXISTS hospital TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS patient_name TEXT;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check;
NOTIFY pgrst, 'reload schema';
