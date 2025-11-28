-- Create brand_scans table to store scan results
-- This is the source of truth for brand audit reports

CREATE TABLE IF NOT EXISTS public.brand_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  domain_id UUID REFERENCES public.domains(id) ON DELETE SET NULL, -- Optional reference to domains table
  scan_type TEXT NOT NULL DEFAULT 'brand_dna', -- 'brand_dna', 'website_scrape', 'full_audit', 'quick_scan'
  scan_data JSONB NOT NULL DEFAULT '{}'::jsonb, -- Full BrandReport JSON
  status TEXT NOT NULL DEFAULT 'completed', -- 'pending', 'processing', 'completed', 'failed'
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Scan metadata (duration, extraction methods, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create domains table for domain management
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  domain TEXT NOT NULL, -- Normalized domain (e.g., "example.com")
  display_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- firstScannedAt, lastScannedAt, scanCount, notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- One domain per organization (can be updated)
  UNIQUE(organization_id, domain)
);

-- Create indexes for performance
CREATE INDEX idx_brand_scans_org_id ON public.brand_scans(organization_id);
CREATE INDEX idx_brand_scans_domain ON public.brand_scans(domain);
CREATE INDEX idx_brand_scans_domain_id ON public.brand_scans(domain_id);
CREATE INDEX idx_brand_scans_created_at ON public.brand_scans(created_at DESC);
CREATE INDEX idx_brand_scans_org_domain ON public.brand_scans(organization_id, domain);
CREATE INDEX idx_brand_scans_status ON public.brand_scans(status);
CREATE INDEX idx_brand_scans_scan_type ON public.brand_scans(scan_type);

CREATE INDEX idx_domains_org_id ON public.domains(organization_id);
CREATE INDEX idx_domains_domain ON public.domains(domain);

-- Enable RLS
ALTER TABLE public.brand_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- RLS Policies for brand_scans
CREATE POLICY "Members can view their organization's scans"
  ON public.brand_scans
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_scans.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create scans for their organization"
  ON public.brand_scans
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_scans.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and owners can update scans"
  ON public.brand_scans
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = brand_scans.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- RLS Policies for domains
CREATE POLICY "Members can view their organization's domains"
  ON public.domains
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = domains.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can create domains for their organization"
  ON public.domains
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = domains.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and owners can update domains"
  ON public.domains
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = domains.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_brand_scans_updated_at
  BEFORE UPDATE ON public.brand_scans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON public.domains
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get latest scan for a domain
CREATE OR REPLACE FUNCTION public.get_latest_scan(p_org_id UUID, p_domain TEXT)
RETURNS TABLE (
  id UUID,
  organization_id UUID,
  domain TEXT,
  scan_type TEXT,
  scan_data JSONB,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.id,
    bs.organization_id,
    bs.domain,
    bs.scan_type,
    bs.scan_data,
    bs.status,
    bs.created_at
  FROM public.brand_scans bs
  WHERE bs.organization_id = p_org_id
    AND bs.domain = p_domain
    AND bs.status = 'completed'
  ORDER BY bs.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

