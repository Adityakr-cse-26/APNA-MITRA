const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
let url = process.env.VITE_SUPABASE_URL || fallbackUrl;
let key = process.env.VITE_SUPABASE_ANON_KEY || fallbackKey;
const supabase = createClient(url, key);

async function check() {
  const { data: { session } } = await supabase.auth.getSession();
  console.log("Session?", !!session);
  const { data, error } = await supabase.storage.from('book').upload('test.txt', 'hello', { upsert: true });
  console.log("Upload result:", data, error);
}
check();
