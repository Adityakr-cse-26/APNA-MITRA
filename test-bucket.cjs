const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function check() {
  const { data: bucket, error } = await supabase.storage.getBucket('English Books');
  console.log("Bucket:", bucket);
  console.log("Error:", error);
}
check();
