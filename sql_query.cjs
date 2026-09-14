const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL || 'https://glytruwxtyhfkrstnygr.supabase.co', process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl');
supabase.from('emergency_alerts').insert([{patient_id: '00000000-0000-0000-0000-000000000000', patient_name: 'test'}]).then(r => console.log(r.error?.message));
