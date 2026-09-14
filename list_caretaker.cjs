const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: cols } = await supabase.rpc('get_table_columns_dummy').select('*').limit(1).catch(() => ({}));
  const { data: policies, error: pErr } = await supabase.from('caretakers').select('*').limit(1);
  console.log("Caretakers columns from a row:", policies && policies.length ? Object.keys(policies[0]) : "No rows");
  
  // Try inserting dummy to see error
  const { data: iData, error: iErr } = await supabase.from('caretakers').insert({ patient_id: 'dummy', name: 'Test' }).select();
  console.log("Insert Error:", iErr);
}
run();
