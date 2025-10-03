-- Phase 1: Content Repurposing Engine Tables

-- Master Content (for repurposing)
CREATE TABLE public.master_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content_type text NOT NULL, -- 'blog', 'newsletter', 'announcement', 'guide', 'story'
  full_content text NOT NULL,
  word_count int,
  collection collection_type, -- references existing enum
  dip_week int CHECK (dip_week >= 1 AND dip_week <= 4),
  pillar_focus pillar_type, -- references existing enum
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.master_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for master_content
CREATE POLICY "Users can view their own master content"
ON public.master_content
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own master content"
ON public.master_content
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own master content"
ON public.master_content
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own master content"
ON public.master_content
FOR DELETE
USING (auth.uid() = created_by);

-- Derivative Assets (repurposed content)
CREATE TABLE public.derivative_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_content_id uuid REFERENCES public.master_content(id) ON DELETE CASCADE,
  asset_type text NOT NULL, -- 'email', 'instagram', 'twitter', 'product', 'sms', 'linkedin', 'ad'
  generated_content text,
  platform_specs jsonb DEFAULT '{}'::jsonb, -- {characterLimit: 280, slideCount: 5, subjectLines: [], etc}
  approval_status text DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  quality_rating int CHECK (quality_rating >= 1 AND quality_rating <= 5),
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.derivative_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for derivative_assets
CREATE POLICY "Users can view their own derivative assets"
ON public.derivative_assets
FOR SELECT
USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own derivative assets"
ON public.derivative_assets
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own derivative assets"
ON public.derivative_assets
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own derivative assets"
ON public.derivative_assets
FOR DELETE
USING (auth.uid() = created_by);

-- Repurposing Rules (transformation templates)
CREATE TABLE public.repurposing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL, -- 'blog', 'email', 'newsletter', etc
  target_type text NOT NULL, -- 'instagram', 'twitter', 'email', etc
  transformation_prompt text NOT NULL, -- Claude prompt for transformation
  platform_constraints jsonb DEFAULT '{}'::jsonb, -- {maxLength: 150, format: 'carousel', etc}
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (read-only for authenticated users)
ALTER TABLE public.repurposing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Repurposing rules are viewable by authenticated users"
ON public.repurposing_rules
FOR SELECT
TO authenticated
USING (true);

-- Add indexes for performance
CREATE INDEX idx_master_content_created_by ON public.master_content(created_by);
CREATE INDEX idx_master_content_created_at ON public.master_content(created_at DESC);
CREATE INDEX idx_derivative_assets_master_content_id ON public.derivative_assets(master_content_id);
CREATE INDEX idx_derivative_assets_created_by ON public.derivative_assets(created_by);

-- Add trigger for master_content updated_at
CREATE TABLE IF NOT EXISTS public.master_content_with_updated (
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.master_content ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

CREATE TRIGGER update_master_content_updated_at
BEFORE UPDATE ON public.master_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();