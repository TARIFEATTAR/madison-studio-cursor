-- Create brand_health_history table to track score changes over time
CREATE TABLE IF NOT EXISTS public.brand_health_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  completeness_score INTEGER NOT NULL,
  gap_analysis JSONB NOT NULL DEFAULT '{}'::jsonb,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brand_health_history ENABLE ROW LEVEL SECURITY;

-- Create policies for brand_health_history
CREATE POLICY "Members can view their organization's brand health history"
  ON public.brand_health_history
  FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Admins and owners can insert brand health history"
  ON public.brand_health_history
  FOR INSERT
  WITH CHECK (
    has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR 
    has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
  );

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_brand_health_history_org_date 
  ON public.brand_health_history(organization_id, analyzed_at DESC);