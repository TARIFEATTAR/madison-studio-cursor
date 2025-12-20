-- ═══════════════════════════════════════════════════════════════════════════════
-- TEAM ROLES AND CAPABILITIES
-- Week 12: Role-Based Views Implementation
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: TEAM ROLE ENUM (Functional/Department Roles)
-- These are SEPARATE from permission roles (owner/admin/member)
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: ADD TEAM_ROLE TO ORGANIZATION_MEMBERS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add team_role column to organization_members
ALTER TABLE public.organization_members 
ADD COLUMN IF NOT EXISTS team_role public.team_role DEFAULT 'general';

-- Set existing owners to 'founder' role
UPDATE public.organization_members 
SET team_role = 'founder' 
WHERE role = 'owner' AND team_role = 'general';

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: ROLE CAPABILITIES TABLE
-- Defines what each role can see/edit in different sections
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.role_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_role public.team_role NOT NULL,
  
  -- Product Hub Section Access
  -- 'full' = read + write, 'view' = read only, 'hidden' = not visible
  section_info TEXT DEFAULT 'full' CHECK (section_info IN ('full', 'view', 'hidden')),
  section_media TEXT DEFAULT 'full' CHECK (section_media IN ('full', 'view', 'hidden')),
  section_formulation TEXT DEFAULT 'view' CHECK (section_formulation IN ('full', 'view', 'hidden')),
  section_ingredients TEXT DEFAULT 'view' CHECK (section_ingredients IN ('full', 'view', 'hidden')),
  section_compliance TEXT DEFAULT 'view' CHECK (section_compliance IN ('full', 'view', 'hidden')),
  section_packaging TEXT DEFAULT 'view' CHECK (section_packaging IN ('full', 'view', 'hidden')),
  section_marketing TEXT DEFAULT 'view' CHECK (section_marketing IN ('full', 'view', 'hidden')),
  section_analytics TEXT DEFAULT 'view' CHECK (section_analytics IN ('full', 'view', 'hidden')),
  
  -- Default expanded sections (comma-separated list)
  default_expanded_sections TEXT[] DEFAULT '{}',
  
  -- Dashboard widgets to show
  dashboard_widgets TEXT[] DEFAULT '{}',
  
  -- Priority indicators
  priority_focus TEXT, -- What this role cares most about
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_role_capabilities UNIQUE (team_role)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: SEED DEFAULT CAPABILITIES
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.role_capabilities (
  team_role,
  section_info, section_media, section_formulation, section_ingredients,
  section_compliance, section_packaging, section_marketing, section_analytics,
  default_expanded_sections, dashboard_widgets, priority_focus
) VALUES
  -- Founder: Full access, pipeline/brand health focus
  ('founder', 'full', 'full', 'full', 'full', 'full', 'full', 'full', 'full',
   ARRAY['info', 'analytics'],
   ARRAY['pipeline_overview', 'brand_health', 'revenue_metrics', 'team_activity'],
   'business_growth'),
   
  -- Creative: Media/Content focus
  ('creative', 'view', 'full', 'view', 'view', 'hidden', 'view', 'full', 'view',
   ARRAY['media', 'marketing'],
   ARRAY['content_queue', 'review_needed', 'asset_library', 'inspiration'],
   'content_creation'),
   
  -- Compliance: Regulatory/Safety focus
  ('compliance', 'view', 'view', 'full', 'full', 'full', 'full', 'hidden', 'view',
   ARRAY['ingredients', 'compliance', 'packaging'],
   ARRAY['sds_status', 'expiring_certs', 'allergen_alerts', 'regulatory_updates'],
   'regulatory_compliance'),
   
  -- Marketing: Campaigns/Social focus
  ('marketing', 'view', 'full', 'hidden', 'view', 'hidden', 'view', 'full', 'full',
   ARRAY['marketing', 'analytics'],
   ARRAY['scheduled_posts', 'platform_sync', 'campaign_performance', 'audience_growth'],
   'marketing_campaigns'),
   
  -- Operations: Packaging/Logistics focus
  ('operations', 'view', 'view', 'view', 'view', 'view', 'full', 'hidden', 'view',
   ARRAY['packaging', 'info'],
   ARRAY['inventory_status', 'supplier_orders', 'production_schedule', 'shipping'],
   'operations'),
   
  -- Finance: Pricing/Costs focus
  ('finance', 'view', 'hidden', 'view', 'view', 'view', 'view', 'hidden', 'full',
   ARRAY['info', 'analytics'],
   ARRAY['revenue_metrics', 'cost_analysis', 'margin_tracking', 'billing'],
   'financial_health'),
   
  -- General: Balanced view
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Get user's team role for an organization
CREATE OR REPLACE FUNCTION public.get_user_team_role(_org_id UUID, _user_id UUID)
RETURNS public.team_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _team_role public.team_role;
BEGIN
  SELECT team_role INTO _team_role
  FROM public.organization_members
  WHERE organization_id = _org_id AND user_id = _user_id;
  
  RETURN COALESCE(_team_role, 'general');
END;
$$;

-- Get capabilities for a team role
CREATE OR REPLACE FUNCTION public.get_role_capabilities(_team_role public.team_role)
RETURNS TABLE (
  section_info TEXT,
  section_media TEXT,
  section_formulation TEXT,
  section_ingredients TEXT,
  section_compliance TEXT,
  section_packaging TEXT,
  section_marketing TEXT,
  section_analytics TEXT,
  default_expanded_sections TEXT[],
  dashboard_widgets TEXT[],
  priority_focus TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.section_info,
    rc.section_media,
    rc.section_formulation,
    rc.section_ingredients,
    rc.section_compliance,
    rc.section_packaging,
    rc.section_marketing,
    rc.section_analytics,
    rc.default_expanded_sections,
    rc.dashboard_widgets,
    rc.priority_focus
  FROM public.role_capabilities rc
  WHERE rc.team_role = _team_role;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 6: ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.role_capabilities ENABLE ROW LEVEL SECURITY;

-- Everyone can read capabilities (they're not secret)
CREATE POLICY "role_capabilities_select" ON public.role_capabilities
  FOR SELECT TO authenticated USING (true);

-- Only super admins can modify capabilities
CREATE POLICY "role_capabilities_modify" ON public.role_capabilities
  FOR ALL USING (public.is_super_admin(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 7: INDEXES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_org_members_team_role 
ON public.organization_members(team_role);

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_user_team_role(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_capabilities(public.team_role) TO authenticated;

-- Success message
SELECT 'Team roles and capabilities created successfully!' as result;
