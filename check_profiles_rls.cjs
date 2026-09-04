const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'guardian@test.com',
    password: 'Guardian@12345'
  });
  if (error) {
    console.error("SignIn Error:", error.message);
    return;
  }
  
  const user = data.user;
  
  const { data: profiles, error: pErr } = await supabase
    .from('profiles')
    .select('*');
    
  console.log("Profiles visible to guardian:", profiles, pErr);
}
run();
