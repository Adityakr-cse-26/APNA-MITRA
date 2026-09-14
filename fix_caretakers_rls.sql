-- Enable RLS on caretakers if not already enabled
ALTER TABLE public.caretakers ENABLE ROW LEVEL SECURITY;

-- Drop existing INSERT policy if it exists (so we don't get duplicates)
DROP POLICY IF EXISTS "Users can insert their own caretakers" ON public.caretakers;

-- Create the INSERT policy
-- This allows authenticated users to insert records where the patient_id matches their own auth.uid()
CREATE POLICY "Users can insert their own caretakers" 
  ON public.caretakers
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = patient_id);
