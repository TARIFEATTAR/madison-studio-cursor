-- Create marketplace_listings table
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES brand_products(id) ON DELETE SET NULL,
  
  -- Platform info
  platform TEXT NOT NULL,
  platform_data JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  title TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  
  -- External sync
  external_id TEXT,
  external_url TEXT,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Soft delete
  is_archived BOOLEAN DEFAULT false,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_marketplace_listings_org ON marketplace_listings(organization_id);
CREATE INDEX idx_marketplace_listings_product ON marketplace_listings(product_id);
CREATE INDEX idx_marketplace_listings_platform ON marketplace_listings(platform);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);

-- RLS Policies
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's listings"
  ON marketplace_listings FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can create listings for their org"
  ON marketplace_listings FOR INSERT
  WITH CHECK (
    auth.uid() = created_by 
    AND is_organization_member(auth.uid(), organization_id)
  );

CREATE POLICY "Users can update their org's listings"
  ON marketplace_listings FOR UPDATE
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Users can delete their org's listings"
  ON marketplace_listings FOR DELETE
  USING (is_organization_member(auth.uid(), organization_id));

-- Trigger for updated_at
CREATE TRIGGER update_marketplace_listings_updated_at
  BEFORE UPDATE ON marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();