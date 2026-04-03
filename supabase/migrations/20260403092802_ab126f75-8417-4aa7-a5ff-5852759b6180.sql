
-- Create exercises table
CREATE TABLE public.exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  video_url TEXT,
  instructions TEXT,
  muscle_group TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_nutrition table
CREATE TABLE public.user_nutrition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_time TEXT NOT NULL DEFAULT 'Breakfast',
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_progress_photos table
CREATE TABLE public.user_progress_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create articles table
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  link TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for progress photos
INSERT INTO storage.buckets (id, name, public) VALUES ('progress-photos', 'progress-photos', true);

-- RLS on exercises (public read)
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read exercises" ON public.exercises FOR SELECT USING (true);

-- RLS on articles (public read)
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read articles" ON public.articles FOR SELECT USING (true);

-- RLS on user_nutrition
ALTER TABLE public.user_nutrition ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own nutrition" ON public.user_nutrition FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition" ON public.user_nutrition FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition" ON public.user_nutrition FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own nutrition" ON public.user_nutrition FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS on user_progress_photos
ALTER TABLE public.user_progress_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own photos" ON public.user_progress_photos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own photos" ON public.user_progress_photos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.user_progress_photos FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Storage RLS for progress-photos bucket
CREATE POLICY "Users can upload own photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can view own photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'progress-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Enable realtime for user_nutrition
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_nutrition;
