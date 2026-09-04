const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', '5cb21821-fa11-4b62-84a4-fab1a4b45b7c');
  console.log("Profile data:", data);
}
run();
