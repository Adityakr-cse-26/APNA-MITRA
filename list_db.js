import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://glytruwxtyhfkrstnygr.supabase.co',
  'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);

async function list() {
  const { data: dbBooks } = await supabase.from('books').select('*');
  console.log("DB Books:", dbBooks);
}

list();
