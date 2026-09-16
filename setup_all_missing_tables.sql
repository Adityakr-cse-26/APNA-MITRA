-- Medications Table
CREATE TABLE IF NOT EXISTS public.medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT NOT NULL,
    timing TEXT NOT NULL,
    taken_today BOOLEAN DEFAULT false,
    instructions TEXT,
    scheduled_time TEXT,
    remaining_pills INTEGER,
    total_pills INTEGER,
    critical BOOLEAN DEFAULT false,
    snoozed_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Daily Checkins Table
CREATE TABLE IF NOT EXISTS public.daily_checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    mood TEXT NOT NULL,
    sleep_hours INTEGER,
    pain_level INTEGER,
    energy_level TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Health Checks Table
CREATE TABLE IF NOT EXISTS public.health_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    score INTEGER NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Game Results Table
CREATE TABLE IF NOT EXISTS public.game_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    time_taken INTEGER NOT NULL,
    pairs_found INTEGER NOT NULL,
    played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User Points Table
CREATE TABLE IF NOT EXISTS public.user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialty TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- Policies for Doctors (Public read)
CREATE POLICY "Anyone can view doctors" ON public.doctors FOR SELECT USING (true);


-- Policies for Medications
CREATE POLICY "Users can view their own medications" ON public.medications FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert their own medications" ON public.medications FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update their own medications" ON public.medications FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete their own medications" ON public.medications FOR DELETE USING (auth.uid() = patient_id);

-- Policies for Daily Checkins
CREATE POLICY "Users can view their own checkins" ON public.daily_checkins FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert their own checkins" ON public.daily_checkins FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update their own checkins" ON public.daily_checkins FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete their own checkins" ON public.daily_checkins FOR DELETE USING (auth.uid() = patient_id);

-- Policies for Health Checks
CREATE POLICY "Users can view their own health checks" ON public.health_checks FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "Users can insert their own health checks" ON public.health_checks FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Users can update their own health checks" ON public.health_checks FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "Users can delete their own health checks" ON public.health_checks FOR DELETE USING (auth.uid() = patient_id);

-- Policies for Game Results
CREATE POLICY "Users can view their own game results" ON public.game_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own game results" ON public.game_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for User Points
CREATE POLICY "Users can view their own points" ON public.user_points FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own points" ON public.user_points FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own points" ON public.user_points FOR UPDATE USING (auth.uid() = user_id);

NOTIFY pgrst, 'reload schema';
