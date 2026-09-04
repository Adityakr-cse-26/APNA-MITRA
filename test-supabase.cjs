const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://glytruwxtyhfkrstnygr.supabase.co', 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
async function test() {
  try {
    const { data, error } = await supabase.from('books').select('*');
    console.log("Data:", data, "Error:", error);
  } catch (err) {
    console.error("Caught error:", err);
  }
}
test();
