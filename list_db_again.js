import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://glytruwxtyhfkrstnygr.supabase.co',
  'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);

async function check() {
  const { data: storageFiles, error } = await supabase.storage.from('book').list();
  console.log("Files:", storageFiles);
  console.log("Error:", error);
}

check();
