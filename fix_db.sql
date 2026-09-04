ALTER TABLE profiles RENAME COLUMN name TO full_name;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;
NOTIFY pgrst, 'reload schema';
