CREATE POLICY "Caretakers can view patient alerts" ON emergency_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM caretakers
      WHERE caretakers.patient_id = emergency_alerts.patient_id
      AND caretakers.id = auth.uid()
    )
  );
