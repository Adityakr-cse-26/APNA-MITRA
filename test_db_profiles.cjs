const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function test() {
  const { data, error } = await supabase.from('profiles').insert({id: '00000000-0000-0000-0000-000000000000'}).select();
  console.log(error);
}
test();
