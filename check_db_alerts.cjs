const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const { data, error } = await supabase
    .from('emergency_alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3);
  console.log("Recent alerts:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
run();
