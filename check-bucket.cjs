const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function check() {
  const { data: b1, error: e1 } = await supabase.storage.getBucket('Bengali Books');
  console.log("Bengali Books:", b1 ? 'exists' : e1);
  const { data: b2, error: e2 } = await supabase.storage.getBucket('English Books');
  console.log("English Books:", b2 ? 'exists' : e2);
  const { data: b3, error: e3 } = await supabase.storage.getBucket('book');
  console.log("book:", b3 ? 'exists' : e3);
  const { data: b4, error: e4 } = await supabase.storage.getBucket('Book');
  console.log("Book:", b4 ? 'exists' : e4);
}
check();
