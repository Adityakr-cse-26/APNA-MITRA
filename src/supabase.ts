import { createClient } from '@supabase/supabase-js';

export let isRecoveryMode = false;
if (typeof window !== 'undefined') {
  if (window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery')) {
    isRecoveryMode = true;
  }
}

const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';

export function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return fallbackUrl;
  let url = rawUrl.replace(/^["']|["']$/g, '').trim();
  if (!url) return fallbackUrl;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);
    return parsed.origin;
  } catch {
    return url.replace(/\/rest\/v1\/?$/, '').replace(/\/storage\/v1\/?$/, '').replace(/\/auth\/v1\/?$/, '').replace(/\/+$/, '');
  }
}

export function sanitizeSupabaseKey(rawKey?: string): string {
  if (!rawKey) return fallbackKey;
  const cleaned = rawKey.replace(/^["']|["']$/g, '').trim();
  return cleaned || fallbackKey;
}

const rawEnvUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) 
  || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) 
  || fallbackUrl;

const rawEnvKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) 
  || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) 
  || fallbackKey;

export const supabaseUrl = sanitizeSupabaseUrl(rawEnvUrl);
export const supabaseAnonKey = sanitizeSupabaseKey(rawEnvKey);

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
