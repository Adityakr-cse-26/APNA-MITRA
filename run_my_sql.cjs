const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
const supabase = createClient(fallbackUrl, fallbackKey);

async function run() {
  const sql = `
    ALTER TABLE public.push_subscriptions ADD COLUMN IF NOT EXISTS caretaker_id UUID;
    ALTER TABLE public.push_subscriptions DROP CONSTRAINT IF EXISTS fk_caretaker;
    ALTER TABLE public.push_subscriptions ADD CONSTRAINT fk_caretaker FOREIGN KEY (caretaker_id) REFERENCES public.caretakers(id) ON DELETE CASCADE;
    NOTIFY pgrst, 'reload schema';
  `;
  const { data, error } = await supabase.rpc('exec_sql', { sql });
  console.log("SQL execute result:", data, error);
}
run();
