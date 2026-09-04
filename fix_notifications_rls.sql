-- Run this in your Supabase SQL Editor to ensure the notifications table exists and has correct RLS policies

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT,
    title TEXT,
    message TEXT,
    location TEXT,
    type TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any, to avoid conflicts
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON public.notifications;

-- Allow users to insert their own notifications
CREATE POLICY "Users can insert notifications" ON public.notifications
FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Allow users to view notifications related to them
CREATE POLICY "Users can view notifications" ON public.notifications
FOR SELECT USING (auth.uid() = patient_id);

-- Allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- Reload the API schema cache
NOTIFY pgrst, 'reload schema';
