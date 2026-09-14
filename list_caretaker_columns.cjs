const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('caretakers').select('*').limit(1);
  console.log("Error:", error);
  if (data && data.length > 0) {
    console.log("Columns:", Object.keys(data[0]));
  } else {
    console.log("No rows, trying to insert a dummy row and rollback, or just inserting a dummy and deleting it.");
    const { data: iData, error: iError } = await supabase.from('caretakers').insert({ patient_id: '123e4567-e89b-12d3-a456-426614174000', name: 'Test' }).select();
    console.log("Insert result:", iData, iError);
    if(iData && iData.length) {
       console.log("Inserted columns:", Object.keys(iData[0]));
       await supabase.from('caretakers').delete().eq('id', iData[0].id);
    }
  }
}
run();
