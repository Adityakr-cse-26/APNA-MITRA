const { createClient } = require('@supabase/supabase-js');
const fallbackUrl = 'https://glytruwxtyhfkrstnygr.supabase.co';
const fallbackKey = 'sb_publishable_byfMleW13TD9Ogqd35j9Hg__jYHhWBl';
let url = process.env.VITE_SUPABASE_URL || fallbackUrl;
let key = process.env.VITE_SUPABASE_ANON_KEY || fallbackKey;
const supabase = createClient(url, key);

async function setup() {
  // Creating tables might fail without a service role key if RLS is strict,
  // but we can try to use standard queries or generate SQL text for the user.
  console.log(`
-- Run this in Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  game_id TEXT NOT NULL,
  difficulty TEXT,
  score INTEGER,
  points_earned INTEGER,
  content_id TEXT,
  accuracy NUMERIC,
  completion_status BOOLEAN DEFAULT true,
  played_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own game results" ON game_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game results" ON game_results FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS user_points (
  user_id UUID PRIMARY KEY,
  total_points INTEGER DEFAULT 0,
  current_level TEXT DEFAULT 'Bronze',
  games_completed INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ
);

ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own points" ON user_points FOR SELECT USING (auth.uid() = user_id);
-- Insert/update policies might need trigger or allow upsert
CREATE POLICY "Users can insert own points" ON user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own points" ON user_points FOR UPDATE USING (auth.uid() = user_id);
`);
}
setup();
