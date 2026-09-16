import { createClient } from '@supabase/supabase-js';

export let isRecoveryMode = false;
if (typeof window !== 'undefined') {
  if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
    isRecoveryMode = true;
  }
}

const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || fallbackUrl;
if (supabaseUrl) supabaseUrl = supabaseUrl.replace(/^["']|["']$/g, '').trim().replace(/\/$/, '');
if (supabaseUrl && !supabaseUrl.startsWith('http')) supabaseUrl = 'https://' + supabaseUrl;

let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackKey;
if (supabaseAnonKey) supabaseAnonKey = supabaseAnonKey.replace(/^["']|["']$/g, '').trim();

export const hasSupabaseConfig = !!(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseConfig) {
  console.warn("Supabase URL or Anon Key is missing.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

if (typeof window !== 'undefined') {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      isRecoveryMode = true;
    }
  });
}
