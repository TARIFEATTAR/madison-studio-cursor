-- LinkedIn Integration Schema
-- This migration creates the necessary tables for LinkedIn OAuth and publishing

-- 1. Create linkedin_connections table for OAuth tokens and page info
CREATE TABLE IF NOT EXISTS public.linkedin_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- LinkedIn identifiers
  linkedin_user_id TEXT NOT NULL,
  linkedin_user_name TEXT,
  linkedin_email TEXT,
  profile_picture_url TEXT,
  -- Organization/Page info (if connected to a company page)
  linkedin_org_id TEXT,
  linkedin_org_name TEXT,
  linkedin_org_vanity_name TEXT,
  linkedin_org_logo_url TEXT,
  -- Encrypted tokens
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  -- Scopes granted
  scopes TEXT[] DEFAULT '{}',
  -- Connection metadata
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_post_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  connection_type TEXT DEFAULT 'personal' CHECK (connection_type IN ('personal', 'organization')),
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  -- Ensure one connection per org
  UNIQUE(organization_id)
);

-- 2. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_org_id ON linkedin_connections(organization_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_user_id ON linkedin_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_connections_linkedin_user ON linkedin_connections(linkedin_user_id);

-- 3. Enable RLS on linkedin_connections
ALTER TABLE linkedin_connections ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for linkedin_connections
-- Users can view their own organization's LinkedIn connection
DROP POLICY IF EXISTS "Users can view their organization's LinkedIn connection" ON linkedin_connections;
CREATE POLICY "Users can view their organization's LinkedIn connection"
  ON linkedin_connections FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins/owners can manage LinkedIn connections
DROP POLICY IF EXISTS "Admins can manage LinkedIn connections" ON linkedin_connections;
CREATE POLICY "Admins can manage LinkedIn connections"
  ON linkedin_connections FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- 5. Create function to update timestamp
CREATE OR REPLACE FUNCTION update_linkedin_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for updated_at
DROP TRIGGER IF EXISTS linkedin_connection_updated_at ON linkedin_connections;
CREATE TRIGGER linkedin_connection_updated_at
  BEFORE UPDATE ON linkedin_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_linkedin_connection_timestamp();

-- 7. Create OAuth state table for CSRF protection
CREATE TABLE IF NOT EXISTS public.linkedin_oauth_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  state TEXT NOT NULL UNIQUE,
  redirect_url TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for fast state lookup
CREATE INDEX IF NOT EXISTS idx_linkedin_oauth_states_state ON linkedin_oauth_states(state);

-- RLS for OAuth states
ALTER TABLE linkedin_oauth_states ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their LinkedIn OAuth states" ON linkedin_oauth_states;
CREATE POLICY "Users can manage their LinkedIn OAuth states"
  ON linkedin_oauth_states FOR ALL
  USING (user_id = auth.uid());

-- 8. Create linkedin_posts table to track published content
CREATE TABLE IF NOT EXISTS public.linkedin_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_connection_id UUID NOT NULL REFERENCES linkedin_connections(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  -- Source content reference
  content_id UUID, -- Can reference master_content, derivative_assets, etc.
  content_table TEXT, -- 'master_content', 'derivative_assets', 'outputs'
  -- LinkedIn post details
  linkedin_post_id TEXT,
  linkedin_post_urn TEXT,
  post_url TEXT,
  -- Post content
  post_text TEXT NOT NULL,
  media_urls TEXT[],
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  error_message TEXT,
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  published_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for linkedin_posts
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_connection ON linkedin_posts(linkedin_connection_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_org ON linkedin_posts(organization_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_posts_status ON linkedin_posts(status);

-- RLS for linkedin_posts
ALTER TABLE linkedin_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their organization's LinkedIn posts" ON linkedin_posts;
CREATE POLICY "Users can view their organization's LinkedIn posts"
  ON linkedin_posts FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can manage their organization's LinkedIn posts" ON linkedin_posts;
CREATE POLICY "Users can manage their organization's LinkedIn posts"
  ON linkedin_posts FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- 9. Clean up expired OAuth states function
CREATE OR REPLACE FUNCTION cleanup_expired_linkedin_oauth_states()
RETURNS void AS $$
BEGIN
  DELETE FROM linkedin_oauth_states WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'LinkedIn integration schema created successfully!';
END $$;



