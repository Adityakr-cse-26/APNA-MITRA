DROP POLICY IF EXISTS "Authenticated users can view books" ON public.books;
CREATE POLICY "Authenticated users can view books"
ON public.books
FOR SELECT
TO authenticated
USING (true);

-- Enable RLS on the books table if not already enabled
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
