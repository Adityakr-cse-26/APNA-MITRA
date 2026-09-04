ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
NOTIFY pgrst, 'reload schema';
