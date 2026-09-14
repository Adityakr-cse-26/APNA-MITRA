const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function run() {
  const { data, error } = await supabase.from('appointments').select('*').limit(1);
  console.log("Appointments query result:", data, error);
}
run();
