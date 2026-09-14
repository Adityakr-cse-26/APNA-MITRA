const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://glytruwxtyhfkrstnygr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error: insErr } = await supabase.from('profiles').insert([{gender: 'Male'}]);
  console.log("Error:", insErr);
}
run();
