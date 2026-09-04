-- Create books table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    language TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    pdf_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
DROP POLICY IF EXISTS "Authenticated users can manage books" ON public.books;

-- Allow public read access to books
CREATE POLICY "Anyone can view books" ON public.books
FOR SELECT USING (true);

-- Allow authenticated users (Admins) to insert/update/delete books
CREATE POLICY "Authenticated users can manage books" ON public.books
FOR ALL USING (auth.uid() IS NOT NULL);

-- Insert requested initial books if they don't exist
INSERT INTO public.books (title, author, language, description)
SELECT 'Pather Panchali', 'Bibhutibhushan Bandyopadhyay', 'Bengali', 'Classic Bengali novel.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Pather Panchali' AND language = 'Bengali');

INSERT INTO public.books (title, author, language, description)
SELECT 'Chander Pahar', 'Bibhutibhushan Bandyopadhyay', 'Bengali', 'Classic Bengali adventure novel.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Chander Pahar' AND language = 'Bengali');

INSERT INTO public.books (title, author, language, description)
SELECT 'Thakumar Jhuli', 'Dakshinaranjan Mitra Majumder', 'Bengali', 'Collection of Bengali folk tales and fairy tales.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Thakumar Jhuli' AND language = 'Bengali');

INSERT INTO public.books (title, author, language, description)
SELECT 'Mahabharata', 'Vyasa', 'Bengali', 'The great Indian epic in Bengali.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Mahabharata' AND language = 'Bengali');

INSERT INTO public.books (title, author, language, description)
SELECT 'Chronicles of the Faith in Bong', 'Unknown', 'Bengali', 'A chronicle of faith.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Chronicles of the Faith in Bong' AND language = 'Bengali');

INSERT INTO public.books (title, author, language, description)
SELECT 'Gitanjali', 'Rabindranath Tagore', 'Bengali', 'Collection of poems by Rabindranath Tagore.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Gitanjali' AND language = 'Bengali');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 1', 'Vyasa', 'English', 'Volume 1 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 1' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 2', 'Vyasa', 'English', 'Volume 2 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 2' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 3', 'Vyasa', 'English', 'Volume 3 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 3' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 4', 'Vyasa', 'English', 'Volume 4 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 4' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 5', 'Vyasa', 'English', 'Volume 5 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 5' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 6', 'Vyasa', 'English', 'Volume 6 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 6' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 7', 'Vyasa', 'English', 'Volume 7 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 7' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 8', 'Vyasa', 'English', 'Volume 8 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 8' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 9', 'Vyasa', 'English', 'Volume 9 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 9' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 10', 'Vyasa', 'English', 'Volume 10 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 10' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 11', 'Vyasa', 'English', 'Volume 11 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 11' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Mahabharata Vol. 12', 'Vyasa', 'English', 'Volume 12 of the great Indian epic.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Mahabharata Vol. 12' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'Chronicles of the Faith', 'Unknown', 'English', 'A chronicle of faith.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Chronicles of the Faith' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Lottery (1948)', 'Shirley Jackson', 'English', 'A classic short story.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Lottery (1948)' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Yellow Wallpaper', 'Charlotte Perkins Gilman', 'English', 'An important early work of American feminist literature.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Yellow Wallpaper' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Lady with the Little Dog', 'Anton Chekhov', 'English', 'A classic short story.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Lady with the Little Dog' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Snows of Kilimanjaro', 'Ernest Hemingway', 'English', 'A short story by Ernest Hemingway.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Snows of Kilimanjaro' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Tell-Tale Heart', 'Edgar Allan Poe', 'English', 'A classic horror short story.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Tell-Tale Heart' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'The Gift of Magic', 'Unknown', 'English', 'A magical tale.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'The Gift of Magic' AND language = 'English');

INSERT INTO public.books (title, author, language, description)
SELECT 'Mahabharata in Hindi', 'Vyasa', 'Hindi', 'The great Indian epic translated in Hindi.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Mahabharata in Hindi' AND language = 'Hindi');

INSERT INTO public.books (title, author, language, description)
SELECT 'Chronicles of the Faith in Hindi', 'Unknown', 'Hindi', 'A chronicle of faith.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Chronicles of the Faith in Hindi' AND language = 'Hindi');

INSERT INTO public.books (title, author, language, description)
SELECT 'Godan', 'Munshi Premchand', 'Hindi', 'A classic Hindi novel.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Godan' AND language = 'Hindi');

INSERT INTO public.books (title, author, language, description)
SELECT 'Godan 2', 'Munshi Premchand', 'Hindi', 'Part 2 of the classic Hindi novel.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Godan 2' AND language = 'Hindi');

INSERT INTO public.books (title, author, language, description)
SELECT 'Yama', 'Mahadevi Varma', 'Hindi', 'A collection of poems.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Yama' AND language = 'Hindi');

INSERT INTO public.books (title, author, language, description)
SELECT 'Madhushala', 'Harivansh Rai Bachchan', 'Hindi', 'A famous book of poetry.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Madhushala' AND language = 'Hindi');

INSERT INTO public.books (title, author, language, description)
SELECT 'Gunahon Ka Devta', 'Dharamvir Bharati', 'Hindi', 'A classic Hindi novel.'
WHERE NOT EXISTS (SELECT 1 FROM public.books WHERE title = 'Gunahon Ka Devta' AND language = 'Hindi');

NOTIFY pgrst, 'reload schema';
