const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);
async function run() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
  console.log('Profiles:', profiles, pError);
  const { data: doctors, error: dError } = await supabase.from('doctors').select('*').limit(1);
  console.log('Doctors:', doctors, dError);
  const { data: appts, error: aError } = await supabase.from('appointments').select('*').limit(1);
  console.log('Appointments:', appts, aError);
}
run();
