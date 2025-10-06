-- Create brand_collections table for organization-specific collections
CREATE TABLE public.brand_collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  transparency_statement TEXT,
  color_theme TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, name)
);

-- Enable RLS
ALTER TABLE public.brand_collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_collections
CREATE POLICY "Members can view their organization's collections"
ON public.brand_collections
FOR SELECT
USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Admins and owners can insert collections"
ON public.brand_collections
FOR INSERT
WITH CHECK (
  has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR 
  has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
);

CREATE POLICY "Admins and owners can update collections"
ON public.brand_collections
FOR UPDATE
USING (
  has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR 
  has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
);

CREATE POLICY "Owners can delete collections"
ON public.brand_collections
FOR DELETE
USING (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role));

-- Trigger for updated_at
CREATE TRIGGER update_brand_collections_updated_at
BEFORE UPDATE ON public.brand_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed collections for Tarife Attar's organizations
INSERT INTO public.brand_collections (organization_id, name, description, sort_order) VALUES
  ('79789c68-bacd-420b-924b-e559a2d83ebb', 'Cadence Collection', 'Rhythmic and flowing narratives', 1),
  ('79789c68-bacd-420b-924b-e559a2d83ebb', 'Reserve Collection', 'Exclusive and refined content', 2),
  ('79789c68-bacd-420b-924b-e559a2d83ebb', 'Purity Collection', 'Clean and authentic storytelling', 3),
  ('79789c68-bacd-420b-924b-e559a2d83ebb', 'Sacred Space', 'Intimate and meaningful expressions', 4),
  ('516a4c8f-8451-4ccf-8bbd-5ec38dadf70a', 'Cadence Collection', 'Rhythmic and flowing narratives', 1),
  ('516a4c8f-8451-4ccf-8bbd-5ec38dadf70a', 'Reserve Collection', 'Exclusive and refined content', 2),
  ('516a4c8f-8451-4ccf-8bbd-5ec38dadf70a', 'Purity Collection', 'Clean and authentic storytelling', 3),
  ('516a4c8f-8451-4ccf-8bbd-5ec38dadf70a', 'Sacred Space', 'Intimate and meaningful expressions', 4);

-- Update organizations table to add custom_week_names to settings
-- Set custom week names for Tarife Attar's organizations (Scriptora's style)
UPDATE public.organizations 
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{custom_week_names}',
  '{"1": "Silk Road", "2": "Maritime", "3": "Imperial Court", "4": "Royal Court"}'::jsonb
)
WHERE id IN ('79789c68-bacd-420b-924b-e559a2d83ebb', '516a4c8f-8451-4ccf-8bbd-5ec38dadf70a');

-- For Jordan's organization, set default week names
UPDATE public.organizations 
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{custom_week_names}',
  '{"1": "Week 1", "2": "Week 2", "3": "Week 3", "4": "Week 4"}'::jsonb
)
WHERE id = '79c923b3-91e5-4f0a-ad50-9806131107b3';