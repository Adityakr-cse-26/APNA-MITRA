import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  'https://glytruwxtyhfkrstnygr.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
); // Wait, I don't have service_role here. Let me use an email/password if I had one. Or just query the books table without RLS if possible.
