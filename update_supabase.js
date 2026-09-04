import fs from 'fs';

const code = `import { createClient } from '@supabase/supabase-js';

// EDIT THESE VALUES WITH YOUR SUPABASE PROJECT DETAILS
const SUPABASE_URL = "https://glytruwxtyhfkrstnygr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
`;

fs.writeFileSync('src/supabase.ts', code);
console.log("Updated supabase.ts");
