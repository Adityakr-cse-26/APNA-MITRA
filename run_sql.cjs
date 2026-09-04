const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const sql = `
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS guardian_id UUID REFERENCES auth.users(id);
    
    UPDATE public.profiles 
    SET guardian_id = (SELECT id FROM auth.users WHERE email = 'guardian@test.com')
    WHERE id = (SELECT id FROM auth.users WHERE email = 'adityakumar261006@gmail.com');
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  console.log("SQL execute error (expected if rpc missing):", error);
}
run();
