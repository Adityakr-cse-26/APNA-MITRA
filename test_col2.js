import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function run() {
  const { data, error } = await supabase.from('caretakers').select('patient_id').limit(1);
  console.log(error);
}
run();
