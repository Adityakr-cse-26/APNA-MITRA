const { createClient } = require('@supabase/supabase-js');
const url = 'https://glytruwxtyhfkrstnygr.supabase.co';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(url, key);

async function run() {
  // Let's sign in as an existing user? Wait, I don't have existing user credentials.
  // Can I query as anon?
  const { data, error } = await supabase.from('caretakers').select('*').limit(1);
  console.log("ANON SELECT:", data, error);
}
run();
