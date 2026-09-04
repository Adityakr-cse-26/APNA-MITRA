const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function check() {
  console.log("Checking 'English Books' bucket...");
  const { data: files, error: filesErr } = await supabase.storage.from('English Books').list();
  if (filesErr) console.error("Storage Error:", filesErr);
  else console.log("Storage Files:", files.map(f => f.name));
  
  const { data: books, error: booksErr } = await supabase.from('books').select('id, title, pdf_url, language').eq('language', 'English');
  if (booksErr) console.error("DB Error:", booksErr);
  else console.log("DB Books:", books);
}
check();
