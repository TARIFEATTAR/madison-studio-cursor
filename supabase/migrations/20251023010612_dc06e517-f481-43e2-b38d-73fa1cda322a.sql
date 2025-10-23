-- Create shopify_connections table to store Shopify credentials per organization
CREATE TABLE public.shopify_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'idle',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on shopify_connections
ALTER TABLE public.shopify_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Admins and owners can manage Shopify connections
CREATE POLICY "Admins and owners can manage Shopify connections"
ON public.shopify_connections
FOR ALL
USING (
  has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR 
  has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
);

-- Add Shopify sync columns to brand_products
ALTER TABLE public.brand_products
ADD COLUMN shopify_product_id TEXT UNIQUE,
ADD COLUMN shopify_variant_id TEXT,
ADD COLUMN shopify_sync_status TEXT DEFAULT 'synced',
ADD COLUMN last_shopify_sync TIMESTAMP WITH TIME ZONE;

-- Create index on shopify_product_id for faster lookups
CREATE INDEX idx_brand_products_shopify_id ON public.brand_products(shopify_product_id);

-- Create shopify_publish_log table to track publishing history
CREATE TABLE public.shopify_publish_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.brand_products(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  published_content JSONB NOT NULL DEFAULT '{}'::jsonb,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on shopify_publish_log
ALTER TABLE public.shopify_publish_log ENABLE ROW LEVEL SECURITY;

-- Policy: Members can view their org's publish history
CREATE POLICY "Members can view their org's Shopify publish history"
ON public.shopify_publish_log
FOR SELECT
USING (is_organization_member(auth.uid(), organization_id));

-- Policy: Members can insert publish logs
CREATE POLICY "Members can insert Shopify publish logs"
ON public.shopify_publish_log
FOR INSERT
WITH CHECK (
  auth.uid() = published_by AND 
  is_organization_member(auth.uid(), organization_id)
);

-- Add updated_at trigger to shopify_connections
CREATE TRIGGER update_shopify_connections_updated_at
BEFORE UPDATE ON public.shopify_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();