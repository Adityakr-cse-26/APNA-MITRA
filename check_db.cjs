const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://glytruwxtyhfkrstnygr.supabase.co',
  'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);

async function check() {
  const { data: books, error: booksErr } = await supabase.from('books').select('id, title, pdf_url');
  console.log("Books DB:", books);

  const { data: files, error: filesErr } = await supabase.storage.from('books').list();
  console.log("Storage Files:", files);
}

check();
