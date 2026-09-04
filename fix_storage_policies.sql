-- In order to use TUS uploads, the user must have SELECT permissions 
-- on storage.objects in addition to INSERT and UPDATE.
-- This ensures the resumable upload can check existing chunks.

DROP POLICY IF EXISTS "Authenticated users can select objects" ON storage.objects;
CREATE POLICY "Authenticated users can select objects" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'books' AND auth.uid() IS NOT NULL);
