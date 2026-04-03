
-- Workout performance tracking
CREATE TABLE public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 0,
  training_day TEXT NOT NULL DEFAULT 'Day 1',
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workout logs" ON public.workout_logs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own workout logs" ON public.workout_logs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workout logs" ON public.workout_logs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own workout logs" ON public.workout_logs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- AI-generated meal plans
CREATE TABLE public.ai_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  goal TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own meal plans" ON public.ai_meal_plans
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own meal plans" ON public.ai_meal_plans
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own meal plans" ON public.ai_meal_plans
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Add training_day to exercises
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS training_day TEXT DEFAULT 'General';
