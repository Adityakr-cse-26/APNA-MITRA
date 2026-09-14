const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || 'https://glytruwxtyhfkrstnygr.supabase.co', process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
supabase.rpc('get_columns', { table_name: 'caretakers' }).then(r => console.log(r)).catch(() => {});
// alternatively just insert a dummy to see error
supabase.from('caretakers').insert([{patient_id: '00000000-0000-0000-0000-000000000000', invalid_col: 1}]).then(r => console.log(r.error.message));
