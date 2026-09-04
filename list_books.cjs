const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listBooks() {
  const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: true });
  if (error) {
    console.error('Error fetching books:', error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
listBooks();
