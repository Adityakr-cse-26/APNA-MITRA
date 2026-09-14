const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const { data, error } = await supabase.from('emergency_alerts').select('*').limit(1);
  console.log(data, error);
}
run();
