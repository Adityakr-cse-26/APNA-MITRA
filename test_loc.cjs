const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const { data, error } = await supabase.from('emergency_alerts').insert([{ 
      patient_id: '00000000-0000-0000-0000-000000000000',
      location_lat: 1.23,
      location_lng: 4.56,
      location_accuracy: 10
  }]);
  console.log(error);
}
run();
