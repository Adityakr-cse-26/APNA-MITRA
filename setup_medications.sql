-- Create the medications table
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    timing TEXT NOT NULL,
    taken_today BOOLEAN DEFAULT false,
    instructions TEXT,
    scheduled_time TEXT,
    remaining_pills INTEGER,
    total_pills INTEGER,
    critical BOOLEAN DEFAULT false,
    snoozed_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own medications
CREATE POLICY "Users can view their own medications" 
ON public.medications FOR SELECT 
USING (auth.uid() = patient_id);

-- Allow users to insert their own medications
CREATE POLICY "Users can insert their own medications" 
ON public.medications FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

-- Allow users to update their own medications
CREATE POLICY "Users can update their own medications" 
ON public.medications FOR UPDATE 
USING (auth.uid() = patient_id);

-- Allow users to delete their own medications
CREATE POLICY "Users can delete their own medications" 
ON public.medications FOR DELETE 
USING (auth.uid() = patient_id);

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
