const { createClient } = require('@supabase/supabase-js');
const url = 'https://glytruwxtyhfkrstnygr.supabase.co';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', { query: "SELECT * FROM pg_policies WHERE tablename = 'caretakers';" });
  console.log(data, error);
}
run();
