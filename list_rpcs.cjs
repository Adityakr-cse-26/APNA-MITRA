const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function test() {
  // PostgREST doesn't expose a list of RPCs to anon, but we can try to hit the root to get the OpenAPI spec using fetch
  const res = await fetch('https://glytruwxtyhfkrstnygr.supabase.co/rest/v1/', {
    headers: { 'apikey': 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl' }
  });
  const text = await res.text();
  console.log(text.substring(0, 100));
}
test();
