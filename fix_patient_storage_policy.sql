-- Drop the public read policy if it exists to respect privacy
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;

-- Allow ANY authenticated user (including patients) to read/download from the books bucket
DROP POLICY IF EXISTS "Authenticated users can select objects" ON storage.objects;
CREATE POLICY "Authenticated users can select objects" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'books' AND auth.uid() IS NOT NULL);
