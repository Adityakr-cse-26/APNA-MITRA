const { createClient } = require('@supabase/supabase-js');
const url = 'https://glytruwxtyhfkrstnygr.supabase.co';
const key = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(url, key);

async function run() {
  const email = `test_sel_${Date.now()}@example.com`;
  const { data: authData } = await supabase.auth.signUp({
    email,
    password: 'password123'
  });
  
  const { data, error } = await supabase.from('caretakers').select('*');
  console.log("SELECT:", data, error);
}
run();
