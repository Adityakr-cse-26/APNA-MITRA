const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function test() {
  const { data, error } = await supabase.from('health_checks').insert([{ invalid_col: 1 }]).select();
  console.log(error);
}
test();
