const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
let url = process.env.VITE_SUPABASE_URL || fallbackUrl;
let key = process.env.VITE_SUPABASE_ANON_KEY || fallbackKey;
const supabase = createClient(url, key);

async function check() {
  const email = 'test' + Date.now() + '@example.com';
  await supabase.auth.signUp({ email, password: 'password123' });
  const { data, error } = await supabase.from('books').select('*');
  console.log("Books DB:", data?.map(b => ({id: b.id, title: b.title, lang: b.language})));
}
check();
