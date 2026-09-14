-- Fix the caretakers table schema and RLS policies

-- 1. Remove the incorrect UNIQUE constraint on patient_id so a patient can have multiple caretakers
ALTER TABLE public.caretakers DROP CONSTRAINT IF EXISTS caretakers_patient_id_key;

-- 2. Enable RLS on caretakers if not already enabled
ALTER TABLE public.caretakers ENABLE ROW LEVEL SECURITY;

-- 3. Drop all existing caretaker policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can insert their own caretakers" ON public.caretakers;
DROP POLICY IF EXISTS "Users can select their own caretakers" ON public.caretakers;
DROP POLICY IF EXISTS "Users can update their own caretakers" ON public.caretakers;
DROP POLICY IF EXISTS "Users can delete their own caretakers" ON public.caretakers;

-- 4. Create proper policies covering all CRUD actions
-- SELECT policy
CREATE POLICY "Users can select their own caretakers"
  ON public.caretakers
  FOR SELECT
  TO authenticated
  USING (auth.uid() = patient_id);

-- INSERT policy
CREATE POLICY "Users can insert their own caretakers"
  ON public.caretakers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = patient_id);

-- UPDATE policy
CREATE POLICY "Users can update their own caretakers"
  ON public.caretakers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- DELETE policy
CREATE POLICY "Users can delete their own caretakers"
  ON public.caretakers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = patient_id);

-- 5. Reload schema cache just in case
NOTIFY pgrst, 'reload schema';
