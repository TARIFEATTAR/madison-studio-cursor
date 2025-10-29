-- Ensure competitive_insights table exists with required columns
CREATE TABLE IF NOT EXISTS public.competitive_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL,
  competitor_name text NOT NULL,
  insight_type text NOT NULL,
  finding text NOT NULL,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add missing columns if they don't exist
ALTER TABLE public.competitive_insights
  ADD COLUMN IF NOT EXISTS source_url text;

-- Enable RLS
ALTER TABLE public.competitive_insights ENABLE ROW LEVEL SECURITY;

-- Policies for org members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='competitive_insights' AND policyname='Members can view their org insights'
  ) THEN
    CREATE POLICY "Members can view their org insights"
    ON public.competitive_insights
    FOR SELECT
    USING (is_organization_member(auth.uid(), organization_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='competitive_insights' AND policyname='Members can update their org insights'
  ) THEN
    CREATE POLICY "Members can update their org insights"
    ON public.competitive_insights
    FOR UPDATE
    USING (is_organization_member(auth.uid(), organization_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='competitive_insights' AND policyname='Members can delete their org insights'
  ) THEN
    CREATE POLICY "Members can delete their org insights"
    ON public.competitive_insights
    FOR DELETE
    USING (is_organization_member(auth.uid(), organization_id));
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_comp_insights_org_discovered
  ON public.competitive_insights (organization_id, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_comp_insights_org_read
  ON public.competitive_insights (organization_id, is_read);
