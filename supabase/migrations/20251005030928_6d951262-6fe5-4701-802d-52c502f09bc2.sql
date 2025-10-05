-- Create scheduled_content table to store all scheduled content items
CREATE TABLE public.scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.master_content(id) ON DELETE SET NULL,
  derivative_id UUID REFERENCES public.derivative_assets(id) ON DELETE SET NULL,
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL,
  platform TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  dip_week INTEGER,
  pillar TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'cancelled')),
  notes TEXT,
  google_event_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create google_calendar_sync table for user sync settings
CREATE TABLE public.google_calendar_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  calendar_id TEXT,
  sync_enabled BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create dip_week_calendar table for DIP week reference data
CREATE TABLE public.dip_week_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pillar TEXT NOT NULL,
  visual_world TEXT NOT NULL,
  core_lexicon TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(week_number, start_date)
);

-- Create calendar_settings table for platform-specific timing
CREATE TABLE public.calendar_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  optimal_times TIME[],
  timezone TEXT DEFAULT 'UTC',
  auto_suggest BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, platform)
);

-- Enable RLS on all new tables
ALTER TABLE public.scheduled_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_calendar_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dip_week_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scheduled_content
CREATE POLICY "Users can view their own scheduled content"
  ON public.scheduled_content FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled content"
  ON public.scheduled_content FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled content"
  ON public.scheduled_content FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled content"
  ON public.scheduled_content FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for google_calendar_sync
CREATE POLICY "Users can view their own sync settings"
  ON public.google_calendar_sync FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync settings"
  ON public.google_calendar_sync FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync settings"
  ON public.google_calendar_sync FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync settings"
  ON public.google_calendar_sync FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for dip_week_calendar (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view DIP week calendar"
  ON public.dip_week_calendar FOR SELECT
  USING (auth.role() = 'authenticated');

-- RLS Policies for calendar_settings
CREATE POLICY "Users can view their own calendar settings"
  ON public.calendar_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar settings"
  ON public.calendar_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar settings"
  ON public.calendar_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar settings"
  ON public.calendar_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_scheduled_content_updated_at
  BEFORE UPDATE ON public.scheduled_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_google_calendar_sync_updated_at
  BEFORE UPDATE ON public.google_calendar_sync
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_settings_updated_at
  BEFORE UPDATE ON public.calendar_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();