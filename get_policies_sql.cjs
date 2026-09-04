const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const { data, error } = await supabase.from('profiles').insert([{ id: '00000000-0000-0000-0000-000000000000', full_name: 'test' }]);
  console.log(error ? error.message : "inserted");
}
run();
