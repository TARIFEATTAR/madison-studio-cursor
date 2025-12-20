-- ═══════════════════════════════════════════════════════════════════════════════
-- APPLY TEAM ROLES AND CAPABILITIES
-- Run this in the Supabase SQL Editor to enable role-based views
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create team_role enum for functional roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'team_role') THEN
    CREATE TYPE public.team_role AS ENUM (
      'founder',      -- Executive/Owner view - sees everything, pipeline focus
      'creative',     -- Design/Content team - content queue, visual assets
      'compliance',   -- Regulatory team - SDS, certifications, ingredients
      'marketing',    -- Marketing team - social, email, campaigns
      'operations',   -- Operations - inventory, packaging, shipping
      'finance',      -- Finance - pricing, costs, billing
      'general'       -- Default - balanced view
    );
  END IF;
END $$;

-- Add team_role column to organization_members
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS team_role public.team_role DEFAULT 'general';

-- Set existing owners to 'founder' role
UPDATE public.organization_members 
SET team_role = 'founder' 
WHERE role = 'owner' AND (team_role IS NULL OR team_role = 'general');

-- Create role_capabilities table
CREATE TABLE IF NOT EXISTS public.role_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_role public.team_role NOT NULL,
  
  -- Product Hub Section Access
  section_info TEXT DEFAULT 'full' CHECK (section_info IN ('full', 'view', 'hidden')),
  section_media TEXT DEFAULT 'full' CHECK (section_media IN ('full', 'view', 'hidden')),
  section_formulation TEXT DEFAULT 'view' CHECK (section_formulation IN ('full', 'view', 'hidden')),
  section_ingredients TEXT DEFAULT 'view' CHECK (section_ingredients IN ('full', 'view', 'hidden')),
  section_compliance TEXT DEFAULT 'view' CHECK (section_compliance IN ('full', 'view', 'hidden')),
  section_packaging TEXT DEFAULT 'view' CHECK (section_packaging IN ('full', 'view', 'hidden')),
  section_marketing TEXT DEFAULT 'view' CHECK (section_marketing IN ('full', 'view', 'hidden')),
  section_analytics TEXT DEFAULT 'view' CHECK (section_analytics IN ('full', 'view', 'hidden')),
  
  default_expanded_sections TEXT[] DEFAULT '{}',
  dashboard_widgets TEXT[] DEFAULT '{}',
  priority_focus TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_role_capabilities UNIQUE (team_role)
);

-- Seed default capabilities
INSERT INTO public.role_capabilities (
  team_role,
  section_info, section_media, section_formulation, section_ingredients,
  section_compliance, section_packaging, section_marketing, section_analytics,
  default_expanded_sections, dashboard_widgets, priority_focus
) VALUES
  ('founder', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full',
   ARRAY['info', 'analytics'],
   ARRAY['pipeline_overview', 'brand_health', 'revenue_metrics', 'team_activity'],
   'business_growth'),
   
  ('creative', 'view', 'full', 'view', 'view', 'hidden', 'view', 'full', 'view',
   ARRAY['media', 'marketing'],
   ARRAY['content_queue', 'review_needed', 'asset_library', 'inspiration'],
   'content_creation'),
   
  ('compliance', 'view', 'view', 'full', 'full', 'full', 'full', 'hidden', 'view',
   ARRAY['ingredients', 'compliance', 'packaging'],
   ARRAY['sds_status', 'expiring_certs', 'allergen_alerts', 'regulatory_updates'],
   'regulatory_compliance'),
   
  ('marketing', 'view', 'full', 'hidden', 'view', 'hidden', 'view', 'full', 'full',
   ARRAY['marketing', 'analytics'],
   ARRAY['scheduled_posts', 'platform_sync', 'campaign_performance', 'audience_growth'],
   'marketing_campaigns'),
   
  ('operations', 'view', 'view', 'view', 'view', 'view', 'full', 'hidden', 'view',
   ARRAY['packaging', 'info'],
   ARRAY['inventory_status', 'supplier_orders', 'production_schedule', 'shipping'],
   'operations'),
   
  ('finance', 'view', 'hidden', 'view', 'view', 'view', 'view', 'hidden', 'full',
   ARRAY['info', 'analytics'],
   ARRAY['revenue_metrics', 'cost_analysis', 'margin_tracking', 'billing'],
   'financial_health'),
   
  ('general', 'view', 'view', 'view', 'view', 'view', 'view', 'view', 'view',
   ARRAY['info'],
   ARRAY['recent_activity', 'quick_links', 'team_updates'],
   'general')
   
ON CONFLICT (team_role) DO UPDATE SET
  section_info = EXCLUDED.section_info,
  section_media = EXCLUDED.section_media,
  section_formulation = EXCLUDED.section_formulation,
  section_ingredients = EXCLUDED.section_ingredients,
  section_compliance = EXCLUDED.section_compliance,
  section_packaging = EXCLUDED.section_packaging,
  section_marketing = EXCLUDED.section_marketing,
  section_analytics = EXCLUDED.section_analytics,
  default_expanded_sections = EXCLUDED.default_expanded_sections,
  dashboard_widgets = EXCLUDED.dashboard_widgets,
  priority_focus = EXCLUDED.priority_focus,
  updated_at = NOW();

-- Enable RLS
ALTER TABLE public.role_capabilities ENABLE ROW LEVEL SECURITY;

-- Everyone can read capabilities
DROP POLICY IF EXISTS "role_capabilities_select" ON public.role_capabilities;
CREATE POLICY "role_capabilities_select" ON public.role_capabilities
  FOR SELECT TO authenticated USING (true);

-- Create index
CREATE INDEX IF NOT EXISTS idx_org_members_team_role 
ON public.organization_members(team_role);

-- Success message
SELECT 'Team roles and capabilities applied successfully!' as result;
