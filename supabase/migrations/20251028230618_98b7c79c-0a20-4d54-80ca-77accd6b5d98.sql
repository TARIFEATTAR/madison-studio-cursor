-- Create agent_preferences table
CREATE TABLE IF NOT EXISTS public.agent_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  competitive_intelligence_enabled boolean DEFAULT false,
  scan_frequency text DEFAULT 'weekly',
  last_scan_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id)
);

-- Create competitor_watchlist table
CREATE TABLE IF NOT EXISTS public.competitor_watchlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  competitor_name text NOT NULL,
  competitor_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create competitive_insights table
CREATE TABLE IF NOT EXISTS public.competitive_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  competitor_name text NOT NULL,
  insight_type text NOT NULL,
  finding text NOT NULL,
  discovered_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitive_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agent_preferences
CREATE POLICY "Users can view their organization's agent preferences"
  ON public.agent_preferences FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can update their organization's agent preferences"
  ON public.agent_preferences FOR UPDATE
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert their organization's agent preferences"
  ON public.agent_preferences FOR INSERT
  WITH CHECK (is_organization_member(auth.uid(), organization_id));

-- RLS Policies for competitor_watchlist
CREATE POLICY "Users can view their organization's competitors"
  ON public.competitor_watchlist FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can insert competitors for their organization"
  ON public.competitor_watchlist FOR INSERT
  WITH CHECK (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can update their organization's competitors"
  ON public.competitor_watchlist FOR UPDATE
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can delete their organization's competitors"
  ON public.competitor_watchlist FOR DELETE
  USING (is_organization_member(auth.uid(), organization_id));

-- RLS Policies for competitive_insights
CREATE POLICY "Users can view their organization's insights"
  ON public.competitive_insights FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can update their organization's insights"
  ON public.competitive_insights FOR UPDATE
  USING (is_organization_member(auth.uid(), organization_id));

-- Add updated_at triggers
CREATE TRIGGER set_agent_preferences_updated_at
  BEFORE UPDATE ON public.agent_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_competitor_watchlist_updated_at
  BEFORE UPDATE ON public.competitor_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_competitive_insights_updated_at
  BEFORE UPDATE ON public.competitive_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();