const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
let url = process.env.VITE_SUPABASE_URL || fallbackUrl;
let key = process.env.VITE_SUPABASE_ANON_KEY || fallbackKey;
const supabase = createClient(url, key);

async function check() {
  const email = 'test' + Date.now() + '@example.com';
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password: 'password123' });
  console.log("SignUp:", signUpError ? signUpError.message : "Success");
  
  const { data, error } = await supabase.storage.listBuckets();
  console.log("Buckets:", data?.map(b => ({ id: b.id, name: b.name })));
}
check();
