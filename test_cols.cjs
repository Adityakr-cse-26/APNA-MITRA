const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function test() {
  const { data, error } = await supabase.from('health_checks').select('*').limit(1);
  if (data && data.length > 0) {
    console.log(Object.keys(data[0]));
  } else {
    console.log("No data, try insert error parsing", error);
  }
}
test();
