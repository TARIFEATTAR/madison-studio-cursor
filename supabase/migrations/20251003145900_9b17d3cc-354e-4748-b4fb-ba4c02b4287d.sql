-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for type safety
CREATE TYPE content_type AS ENUM ('product', 'email', 'social', 'visual');
CREATE TYPE collection_type AS ENUM ('cadence', 'reserve', 'purity', 'sacred_space');
CREATE TYPE scent_family AS ENUM ('warm', 'floral', 'fresh', 'woody');
CREATE TYPE pillar_type AS ENUM ('identity', 'memory', 'remembrance', 'cadence');
CREATE TYPE visual_world AS ENUM ('silk_road', 'maritime_voyage', 'imperial_garden', 'royal_court');

-- Create vocabulary_library table
CREATE TABLE public.vocabulary_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term TEXT NOT NULL,
  pillar pillar_type NOT NULL,
  is_forbidden BOOLEAN DEFAULT false,
  suggested_alternatives TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create prompts table
CREATE TABLE public.prompts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content_type content_type NOT NULL,
  collection collection_type NOT NULL,
  scent_family scent_family,
  dip_week INTEGER CHECK (dip_week >= 1 AND dip_week <= 4),
  pillar_focus pillar_type,
  prompt_text TEXT NOT NULL,
  meta_instructions JSONB DEFAULT '{}',
  transparency_statement TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER DEFAULT 1,
  parent_prompt_id UUID REFERENCES public.prompts(id)
);

-- Create outputs table
CREATE TABLE public.outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_id UUID REFERENCES public.prompts(id) ON DELETE CASCADE,
  generated_content TEXT NOT NULL,
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  usage_context TEXT,
  performance_metrics JSONB DEFAULT '{}',
  iteration_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create calendar_schedule table
CREATE TABLE public.calendar_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_number INTEGER CHECK (week_number >= 1 AND week_number <= 4) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pillar pillar_type NOT NULL,
  visual_world visual_world NOT NULL,
  core_lexicon TEXT[],
  prompts_scheduled UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.vocabulary_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vocabulary_library (readable by all authenticated users)
CREATE POLICY "Vocabulary is viewable by authenticated users"
  ON public.vocabulary_library FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for prompts
CREATE POLICY "Users can view their own prompts"
  ON public.prompts FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own prompts"
  ON public.prompts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own prompts"
  ON public.prompts FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own prompts"
  ON public.prompts FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for outputs
CREATE POLICY "Users can view their own outputs"
  ON public.outputs FOR SELECT
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own outputs"
  ON public.outputs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own outputs"
  ON public.outputs FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own outputs"
  ON public.outputs FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);

-- RLS Policies for calendar_schedule
CREATE POLICY "Users can view calendar schedules"
  ON public.calendar_schedule FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert calendar schedules"
  ON public.calendar_schedule FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update calendar schedules"
  ON public.calendar_schedule FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete calendar schedules"
  ON public.calendar_schedule FOR DELETE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_schedule_updated_at
  BEFORE UPDATE ON public.calendar_schedule
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default vocabulary data
INSERT INTO public.vocabulary_library (term, pillar, is_forbidden, suggested_alternatives) VALUES
-- Identity Pillar - Approved Terms
('anchor', 'identity', false, NULL),
('self-anchoring', 'identity', false, NULL),
('grounding', 'identity', false, NULL),
('core presence', 'identity', false, NULL),
('rooted', 'identity', false, NULL),
-- Memory Pillar - Approved Terms
('gathering', 'memory', false, NULL),
('story', 'memory', false, NULL),
('journey', 'memory', false, NULL),
('companion', 'memory', false, NULL),
('vessel', 'memory', false, NULL),
-- Remembrance Pillar - Approved Terms
('ritual', 'remembrance', false, NULL),
('preservation', 'remembrance', false, NULL),
('ceremony', 'remembrance', false, NULL),
('reverence', 'remembrance', false, NULL),
-- Cadence Pillar - Approved Terms
('rhythm', 'cadence', false, NULL),
('presence', 'cadence', false, NULL),
('measured', 'cadence', false, NULL),
('deliberate', 'cadence', false, NULL),
-- Forbidden Terms
('perfume', 'identity', true, ARRAY['fragrance oil', 'attar', 'companion']),
('cologne', 'identity', true, ARRAY['fragrance oil', 'attar', 'essence']),
('synthetics', 'identity', true, ARRAY['aromachemicals', 'modern ingredients']),
('loud', 'identity', true, ARRAY['bold', 'expressive', 'distinct']),
('broadcast', 'identity', true, ARRAY['whisper', 'intimate', 'personal']);