const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
let env = fs.readFileSync('.env.example', 'utf8');
let supabaseUrl = env.match(/VITE_SUPABASE_URL=(.*)/)[1];
let supabaseKey = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)[1];
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log(error || data);
}
run();
