-- Create publishing_history table for audit logging
CREATE TABLE IF NOT EXISTS public.publishing_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('derivative', 'master_content', 'prompt')),
  platform text NOT NULL CHECK (platform IN ('klaviyo', 'email', 'shopify', 'social')),
  external_id text,
  external_url text,
  published_at timestamptz NOT NULL DEFAULT now(),
  published_by uuid REFERENCES auth.users(id) NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'scheduled', 'cancelled')),
  metadata jsonb DEFAULT '{}',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.publishing_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Org members can view their publishing history
CREATE POLICY "Members can view their org's publishing history"
ON public.publishing_history
FOR SELECT
USING (is_organization_member(auth.uid(), organization_id));

-- System/edge functions can insert (executed as service role)
CREATE POLICY "Service role can insert publishing history"
ON public.publishing_history
FOR INSERT
WITH CHECK (auth.uid() = published_by);

-- Indexes for performance
CREATE INDEX idx_publishing_history_org_platform 
ON public.publishing_history(organization_id, platform, published_at DESC);

CREATE INDEX idx_publishing_history_content 
ON public.publishing_history(content_id, content_type);

CREATE INDEX idx_publishing_history_status 
ON public.publishing_history(organization_id, status);

-- Trigger to update updated_at (reuse existing function)
CREATE TRIGGER update_publishing_history_updated_at
BEFORE UPDATE ON public.publishing_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();