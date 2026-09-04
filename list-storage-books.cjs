const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
let url = process.env.VITE_SUPABASE_URL || fallbackUrl;
let key = process.env.VITE_SUPABASE_ANON_KEY || fallbackKey;
const supabase = createClient(url, key);

async function check() {
  const buckets = ['English Books', 'Bengali Books', 'book'];
  for (const bucket of buckets) {
     const { data } = await supabase.storage.from(bucket).list();
     console.log(`Bucket ${bucket}:`, data?.map(f => f.name));
  }
}
check();
