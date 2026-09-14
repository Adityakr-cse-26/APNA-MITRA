const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function test() {
  const tables = ['vital_readings', 'patient_vitals', 'health_vitals'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    console.log(t + ":", error ? error.message : "Exists!");
  }
}
test();
