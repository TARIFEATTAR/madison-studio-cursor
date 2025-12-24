-- Etsy Integration Schema
-- This migration creates the necessary tables and fields for Etsy OAuth and listing sync

-- 1. Create etsy_connections table for OAuth tokens and shop info
CREATE TABLE IF NOT EXISTS public.etsy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  shop_id TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  shop_url TEXT,
  -- Encrypted tokens (use pgcrypto for encryption)
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  -- Connection metadata
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  -- Default settings for listings
  default_shipping_profile_id BIGINT,
  default_who_made TEXT DEFAULT 'i_did' CHECK (default_who_made IN ('i_did', 'someone_else', 'collective')),
  default_when_made TEXT DEFAULT 'made_to_order',
  default_is_supply BOOLEAN DEFAULT false,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure one connection per org
  UNIQUE(organization_id)
);

-- 2. Add Etsy-specific fields to marketplace_listings if they don't exist
DO $$
BEGIN
  -- Add etsy_listing_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' AND column_name = 'etsy_listing_id'
  ) THEN
    ALTER TABLE marketplace_listings ADD COLUMN etsy_listing_id BIGINT;
  END IF;
  
  -- Add etsy_state
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' AND column_name = 'etsy_state'
  ) THEN
    ALTER TABLE marketplace_listings ADD COLUMN etsy_state TEXT;
  END IF;
  
  -- Add last_etsy_sync
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' AND column_name = 'last_etsy_sync'
  ) THEN
    ALTER TABLE marketplace_listings ADD COLUMN last_etsy_sync TIMESTAMP WITH TIME ZONE;
  END IF;
  
  -- Add etsy_sync_error
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' AND column_name = 'etsy_sync_error'
  ) THEN
    ALTER TABLE marketplace_listings ADD COLUMN etsy_sync_error TEXT;
  END IF;
  
  -- Add external_url for linking to Etsy listing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'marketplace_listings' AND column_name = 'external_url'
  ) THEN
    ALTER TABLE marketplace_listings ADD COLUMN external_url TEXT;
  END IF;
END $$;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_etsy_connections_org_id ON etsy_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_etsy_connections_user_id ON etsy_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_etsy_id ON marketplace_listings(etsy_listing_id) WHERE etsy_listing_id IS NOT NULL;

-- 4. Enable RLS on etsy_connections
ALTER TABLE etsy_connections ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for etsy_connections
-- Users can view their own organization's Etsy connection
CREATE POLICY "Users can view their organization's Etsy connection"
  ON etsy_connections FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins/owners can insert/update/delete Etsy connections
CREATE POLICY "Admins can manage Etsy connections"
  ON etsy_connections FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- 6. Create function to update timestamp
CREATE OR REPLACE FUNCTION update_etsy_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for updated_at
DROP TRIGGER IF EXISTS etsy_connection_updated_at ON etsy_connections;
CREATE TRIGGER etsy_connection_updated_at
  BEFORE UPDATE ON etsy_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_etsy_connection_timestamp();

-- 8. Create OAuth state table for CSRF protection
CREATE TABLE IF NOT EXISTS public.etsy_oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  code_verifier TEXT NOT NULL, -- For PKCE
  redirect_url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast state lookup
CREATE INDEX IF NOT EXISTS idx_etsy_oauth_states_state ON etsy_oauth_states(state);

-- RLS for OAuth states
ALTER TABLE etsy_oauth_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their OAuth states"
  ON etsy_oauth_states FOR ALL
  USING (user_id = auth.uid());

-- 9. Clean up expired OAuth states (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM etsy_oauth_states WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Etsy integration schema created successfully!';
END $$;
































