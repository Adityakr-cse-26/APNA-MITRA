const { createClient } = require('@supabase/supabase-js');
const url = 'https://glytruwxtyhfkrstnygr.supabase.co';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(url, key);

async function run() {
  const email = `test_rls_${Date.now()}@example.com`;
  const { data: authData } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  const uid = authData.user.id;
  
  // Try to insert
  const { error: e1 } = await supabase.from('caretakers').insert({ patient_id: uid, name: 'test' });
  console.log("Insert 1:", e1?.message);

  // Try to insert without patient_id
  const { error: e2 } = await supabase.from('caretakers').insert({ name: 'test' });
  console.log("Insert 2:", e2?.message);
}
run();
