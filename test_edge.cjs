const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://glytruwxtyhfkrstnygr.supabase.co', 
  process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);

async function test() {
  console.log("Invoking edge function 'send-sos-sms'...");
  const { data, error } = await supabase.functions.invoke('send-sos-sms', {
    body: { alert_id: '00000000-0000-0000-0000-000000000000' }
  });
  console.log("Data:", data);
  console.log("Error:", error);
}
test();
