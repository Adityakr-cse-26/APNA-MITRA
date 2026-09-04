import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  'https://glytruwxtyhfkrstnygr.supabase.co',
  'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);
async function check() {
  const { data: dbBooks, error } = await supabase.from('books').select('id, title, pdf_url');
  console.log("DB Books:", dbBooks);
  console.log("Error:", error);
}
check();
