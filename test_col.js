import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function run() {
  const { data, error } = await supabase.from('caretakers').select('nonexistent').eq('id', '00000000-0000-0000-0000-000000000000');
  console.log(error);
}
run();
