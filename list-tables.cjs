const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
let url = process.env.VITE_SUPABASE_URL || fallbackUrl;
let key = process.env.VITE_SUPABASE_ANON_KEY || fallbackKey;
const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles working:", !!data);
  // Let's create game_results and game_content_usage tables using RPC or just we'll assume we need to provide a SQL snippet for the user.
}
check();
