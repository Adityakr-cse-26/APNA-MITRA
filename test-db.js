import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function run() {
  const { data: caretakers, error: caretakersErr } = await supabase.from('caretakers').select('*').limit(1);
  console.log("Caretakers:", caretakers, caretakersErr);
  const { data: subs, error: subsErr } = await supabase.from('push_subscriptions').select('*').limit(1);
  console.log("Push Subs:", subs, subsErr);
}
run();
