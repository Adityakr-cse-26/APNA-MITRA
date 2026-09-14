const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function test() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: 'SELECT 1' });
  console.log("exec_sql:", error ? error.message : "Success");
}
test();
