const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://glytruwxtyhfkrstnygr.supabase.co',
  'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);

async function check() {
  const { data: dbBooks } = await supabase.from('books').select('id, title, pdf_url');
  console.log("DB Books:");
  dbBooks.forEach(b => console.log(`- ${b.title}: ${b.pdf_url}`));
  
  const { data: storageFiles } = await supabase.storage.from('book').list();
  console.log("\nStorage Files in 'book' bucket:");
  if (storageFiles) {
    storageFiles.forEach(f => console.log(`- ${f.name} (size: ${f.metadata?.size})`));
  } else {
    console.log("None or error fetching");
  }
}

check();
