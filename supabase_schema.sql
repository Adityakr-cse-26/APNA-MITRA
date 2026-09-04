-- 1. Add missing demographic and health columns to the profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS health_info TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lifestyle TEXT;

-- 2. CRITICAL: Reload the API schema cache so Supabase recognizes the new columns instantly
NOTIFY pgrst, 'reload schema';
