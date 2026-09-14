const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function run() {
  const { data, error } = await supabase.from('appointments').select('*').limit(1);
  const { data: d2, error: e2 } = await supabase.rpc('exec_sql', { sql: 'SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'appointments\'' });
  console.log("Cols:", d2, e2);
}
run();
