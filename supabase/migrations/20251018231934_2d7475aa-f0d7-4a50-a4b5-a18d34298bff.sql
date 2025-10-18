-- Add brand consistency score to master_content and derivative_assets
ALTER TABLE master_content
ADD COLUMN brand_consistency_score INTEGER,
ADD COLUMN brand_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN last_brand_check_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE derivative_assets
ADD COLUMN brand_consistency_score INTEGER,
ADD COLUMN brand_analysis JSONB DEFAULT '{}'::jsonb,
ADD COLUMN last_brand_check_at TIMESTAMP WITH TIME ZONE;

-- Create brand_health table to track organization-wide brand completeness
CREATE TABLE public.brand_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  completeness_score INTEGER NOT NULL DEFAULT 0,
  gap_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on brand_health
ALTER TABLE public.brand_health ENABLE ROW LEVEL SECURITY;

-- RLS policies for brand_health
CREATE POLICY "Members can view their organization's brand health"
  ON public.brand_health
  FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Admins and owners can update brand health"
  ON public.brand_health
  FOR ALL
  USING (
    has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR
    has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
  );

-- Add trigger for updated_at
CREATE TRIGGER update_brand_health_updated_at
  BEFORE UPDATE ON public.brand_health
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();