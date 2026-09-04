import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://glytruwxtyhfkrstnygr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: books, error: booksErr } = await supabase.from('books').select('id, title, pdf_url');
  console.log("Books DB:", books);

  const { data: files, error: filesErr } = await supabase.storage.from('books').list();
  console.log("Storage Files:", files);
}

check();
