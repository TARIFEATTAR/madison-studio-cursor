-- Create ESP connections table for webhook persistence
CREATE TABLE IF NOT EXISTS public.esp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  esp_type TEXT NOT NULL CHECK (esp_type IN ('klaviyo', 'mailchimp', 'sendinblue', 'constantcontact')),
  webhook_url TEXT NOT NULL,
  connection_name TEXT,
  is_active BOOLEAN DEFAULT true,
  last_tested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, esp_type, webhook_url)
);

-- Enable RLS
ALTER TABLE public.esp_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Organization members can view their ESP connections"
  ON public.esp_connections
  FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Organization members can insert ESP connections"
  ON public.esp_connections
  FOR INSERT
  WITH CHECK (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Organization members can update their ESP connections"
  ON public.esp_connections
  FOR UPDATE
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Organization members can delete their ESP connections"
  ON public.esp_connections
  FOR DELETE
  USING (is_organization_member(auth.uid(), organization_id));

-- Add trigger for updated_at
CREATE TRIGGER update_esp_connections_updated_at
  BEFORE UPDATE ON public.esp_connections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();