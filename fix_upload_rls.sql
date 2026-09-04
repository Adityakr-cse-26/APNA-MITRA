-- Allow authenticated users to upload new PDFs to the book bucket
DROP POLICY IF EXISTS "Authenticated users can upload books" ON storage.objects;
CREATE POLICY "Authenticated users can upload books" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'book');

-- Allow authenticated users to update existing PDFs in the book bucket
DROP POLICY IF EXISTS "Authenticated users can update books" ON storage.objects;
CREATE POLICY "Authenticated users can update books" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'book');

-- Allow authenticated users to delete PDFs from the book bucket
DROP POLICY IF EXISTS "Authenticated users can delete books" ON storage.objects;
CREATE POLICY "Authenticated users can delete books" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'book');
