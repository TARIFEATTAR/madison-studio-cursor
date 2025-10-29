-- Create klaviyo_connections table for encrypted API keys
CREATE TABLE IF NOT EXISTS public.klaviyo_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) NOT NULL UNIQUE,
  api_key_encrypted text NOT NULL,
  list_count integer DEFAULT 0,
  last_synced_at timestamptz,
  sync_status text DEFAULT 'idle' CHECK (sync_status IN ('idle', 'syncing', 'error')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.klaviyo_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only org admins/owners can manage Klaviyo connections
CREATE POLICY "Admins and owners can manage Klaviyo connections"
ON public.klaviyo_connections
FOR ALL
USING (
  has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR
  has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
);

-- Index for performance
CREATE INDEX idx_klaviyo_connections_org
ON public.klaviyo_connections(organization_id);

-- Trigger to update updated_at
CREATE TRIGGER update_klaviyo_connections_updated_at
BEFORE UPDATE ON public.klaviyo_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();