DROP POLICY IF EXISTS "Authenticated users can select objects" ON storage.objects;
CREATE POLICY "Authenticated users can select objects" 
ON storage.objects 
FOR SELECT 
TO authenticated
USING (bucket_id = 'book');
