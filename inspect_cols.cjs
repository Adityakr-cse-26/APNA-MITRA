const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const { data, error } = await supabase.from('emergency_alerts').insert([{ bogus_column: 1 }]);
  console.log(error);
}
run();
