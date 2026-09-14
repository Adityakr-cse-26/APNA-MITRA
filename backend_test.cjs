const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const supabaseKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
  console.log("--- STARTING BACKEND TEST ---");
  
  // 1. We'll check if the emergency_alerts table exists and works by fetching a record
  const { data: alerts, error: fetchError } = await supabase.from('emergency_alerts').select('*').limit(1);
  if (fetchError) {
    console.log("Error querying emergency_alerts:", fetchError.message);
  } else {
    console.log("✅ emergency_alerts table is accessible.");
  }
  
  // 2. We'll check if the Edge Function is deployed
  console.log("Checking Edge Function status...");
  const { data, error } = await supabase.functions.invoke('send-sos-sms', {
    body: { alert_id: 'test' }
  });
  
  if (error && error.context && error.context.status === 404) {
    console.log("❌ Edge Function returned 404. It is NOT deployed.");
  } else if (error) {
    console.log("✅ Edge Function is deployed but returned error (expected without auth/valid ID):", error.message || error.context?.status);
  } else {
    console.log("✅ Edge Function responded successfully.");
  }
}

runTest();
