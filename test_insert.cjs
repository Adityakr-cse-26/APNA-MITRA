const { createClient } = require('@supabase/supabase-js');
const url = 'https://glytruwxtyhfkrstnygr.supabase.co';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(url, key);

async function run() {
  const email = `test_${Date.now()}@example.com`;
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  if (authErr) {
    console.log("Auth Error:", authErr);
    return;
  }
  
  console.log("Signed up user:", authData.user.id);
  
  const insertData = {
     patient_id: authData.user.id,
     name: 'Test Caretaker',
     phone: '1234567890',
     is_primary: true
  };
  
  console.log("Attempting insert:", insertData);
  const { data: iData, error: iErr } = await supabase.from('caretakers').insert([insertData]).select();
  
  if (iErr) {
    console.log("Insert failed with error:", iErr);
  } else {
    console.log("Insert succeeded:", iData);
  }
}
run();
