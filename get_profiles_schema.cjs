const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://glytruwxtyhfkrstnygr.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.log("Error:", error);
  } else {
    if (data.length > 0) {
      console.log("Profiles columns:", Object.keys(data[0]));
    } else {
      console.log("Profiles has 0 rows. Fetching a fake row to see the error.");
      const { error: insErr } = await supabase.from('profiles').insert([{fake_col: 1}]);
      console.log("Error:", insErr);
    }
  }
}
run();
