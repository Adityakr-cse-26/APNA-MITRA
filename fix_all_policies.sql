-- 1. Read Policy (So patients can open the PDFs)
DROP POLICY IF EXISTS "Anyone can select books" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can select objects" ON storage.objects;
CREATE POLICY "Anyone can select books" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'book');

-- 2. Upload Policy (So admins can upload new PDFs)
DROP POLICY IF EXISTS "Authenticated users can upload books" ON storage.objects;
CREATE POLICY "Authenticated users can upload books" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'book');

-- 3. Update Policy (So admins can overwrite PDFs)
DROP POLICY IF EXISTS "Authenticated users can update books" ON storage.objects;
CREATE POLICY "Authenticated users can update books" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'book');

-- 4. Delete Policy (So admins can delete PDFs)
DROP POLICY IF EXISTS "Authenticated users can delete books" ON storage.objects;
CREATE POLICY "Authenticated users can delete books" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'book');
