const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const sql = `
    ALTER TABLE public.emergency_alerts 
    ADD COLUMN IF NOT EXISTS location_lat DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS location_lng DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMP WITH TIME ZONE;
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  console.log("SQL execute result:", { data, error });
}
run();
