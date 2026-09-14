const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('push_subscriptions').select('*').limit(1);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No rows, inserting dummy...");
    const { data: iData, error: iErr } = await supabase.from('push_subscriptions').insert({ patient_uid: '123e4567-e89b-12d3-a456-426614174000', endpoint: 'dummy' }).select();
    if(iData && iData.length) {
       console.log("Inserted columns:", Object.keys(iData[0]));
       await supabase.from('push_subscriptions').delete().eq('id', iData[0].id);
    } else {
       console.log("Insert Error:", iErr);
    }
  }
}
run();
