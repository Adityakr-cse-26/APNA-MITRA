import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  'https://glytruwxtyhfkrstnygr.supabase.co',
  'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl'
);

async function check() {
  const path = 'The-Gift-Of-The-Magi-by-O.-Henry-Book-PDF-httpslearnenglish-new.com__1787504641692.pdf';
  const { data, error } = await supabase.storage.from('book').createSignedUrl(path, 3600);
  console.log("Signed URL:", data?.signedUrl);
  console.log("Error:", error);
}

check();
