const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://glytruwxtyhfkrstnygr.supabase.co',
  'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);

async function check() {
  console.log("Fetching books from database...");
  const { data: dbBooks, error: dbErr } = await supabase.from('books').select('id, title, pdf_url');
  if (dbErr) {
    console.error("DB Error:", dbErr);
    return;
  }
  
  console.log("Fetching files from 'book' bucket...");
  const { data: storageFiles, error: storageErr } = await supabase.storage.from('book').list();
  if (storageErr) {
    console.error("Storage Error:", storageErr);
    return;
  }

  const fileNames = storageFiles.map(f => f.name);
  console.log(`Found ${fileNames.length} files in 'book' storage.`);
  
  console.log("\n--- Missing Files ---");
  let missingCount = 0;
  for (const book of dbBooks) {
    if (book.pdf_url) {
      let path = book.pdf_url;
      if (path.startsWith('http')) {
        const match = path.match(/\/object\/(?:public|sign)\/(?:book|books)\/(.+)$/);
        if (match) path = decodeURIComponent(match[1]);
        else {
          const parts = path.split('/');
          path = parts[parts.length - 1];
        }
      }
      if (path.startsWith('books/')) path = path.replace('books/', '');
      if (path.startsWith('book/')) path = path.replace('book/', '');
      
      // try decoding it just in case
      path = decodeURIComponent(path);

      if (!fileNames.includes(path)) {
        console.log(`Book "${book.title}" expects PDF "${path}", but it is MISSING in storage.`);
        missingCount++;
      }
    }
  }
  if (missingCount === 0) console.log("All books have matching files in storage!");
}

check();
