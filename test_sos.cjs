const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://glytruwxtyhfkrstnygr.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);

async function test() {
  const { data, error } = await supabase.from('sos_alerts').select('*').limit(1);
  if (error) {
    console.log("Error:", error);
  } else {
    if (data.length > 0) {
      console.log("Columns:", Object.keys(data[0]));
    } else {
      console.log("No data, but table exists!");
      // Let's insert a row with missing column to get schema error
      const { error: insErr } = await supabase.from('sos_alerts').insert([{fake_col: 1}]);
      console.log("Schema error:", insErr);
    }
  }
}
test();
