-- Ensure patient_id has a unique constraint to support upsert onConflict
ALTER TABLE caretakers DROP CONSTRAINT IF EXISTS caretakers_patient_id_key;
ALTER TABLE caretakers ADD CONSTRAINT caretakers_patient_id_key UNIQUE (patient_id);

NOTIFY pgrst, 'reload schema';
