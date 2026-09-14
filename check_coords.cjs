const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function run() {
  const { data, error } = await supabase.from('emergency_alerts').select('id, alert_type, location_lat, location_lng').order('created_at', { ascending: false }).limit(5);
  console.log(data, error);
}
run();
