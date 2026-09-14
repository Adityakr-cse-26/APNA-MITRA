-- Run this SQL in the Supabase SQL Editor

-- 1. Add caretaker_id to push_subscriptions
ALTER TABLE public.push_subscriptions 
ADD COLUMN IF NOT EXISTS caretaker_id UUID;

-- 2. Optional but recommended: Add foreign key relationship
ALTER TABLE public.push_subscriptions 
DROP CONSTRAINT IF EXISTS fk_caretaker;

ALTER TABLE public.push_subscriptions 
ADD CONSTRAINT fk_caretaker 
FOREIGN KEY (caretaker_id) 
REFERENCES public.caretakers(id) 
ON DELETE CASCADE;

-- 3. CRITICAL: Reload PostgREST schema cache so the API recognizes the new column immediately
NOTIFY pgrst, 'reload schema';
