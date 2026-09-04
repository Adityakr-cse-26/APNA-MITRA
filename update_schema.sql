ALTER TABLE profiles RENAME COLUMN full_name TO name;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS guardian_phone TEXT;
NOTIFY pgrst, 'reload schema';
