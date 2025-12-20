-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - EXTERNAL ASSET URL SUPPORT
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Allows products to reference external URLs (Google Drive, Dropbox, etc.)
-- as an alternative to uploading to the DAM
--
-- Created: December 20, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: EXTEND PRODUCT_HUB_ASSETS FOR EXTERNAL URLS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add external URL support to product_hub_assets
-- asset_id can now be NULL if external_url is provided
ALTER TABLE public.product_hub_assets 
  ALTER COLUMN asset_id DROP NOT NULL;

-- Add external URL fields
ALTER TABLE public.product_hub_assets
  ADD COLUMN IF NOT EXISTS external_url TEXT,
  ADD COLUMN IF NOT EXISTS external_provider TEXT CHECK (external_provider IN (
    'google_drive',
    'dropbox',
    'onedrive',
    'box',
    's3',
    'cloudflare_r2',
    'direct_url',
    'other'
  )),
  ADD COLUMN IF NOT EXISTS external_thumbnail_url TEXT,
  ADD COLUMN IF NOT EXISTS external_filename TEXT,
  ADD COLUMN IF NOT EXISTS external_mime_type TEXT;

-- Add constraint: must have either asset_id OR external_url
ALTER TABLE public.product_hub_assets
  DROP CONSTRAINT IF EXISTS asset_or_external_required;
  
ALTER TABLE public.product_hub_assets
  ADD CONSTRAINT asset_or_external_required 
  CHECK (asset_id IS NOT NULL OR external_url IS NOT NULL);

-- Update unique constraint to allow same external URL for different relationship types
ALTER TABLE public.product_hub_assets
  DROP CONSTRAINT IF EXISTS unique_product_asset;

-- Create new unique constraint that handles both DAM and external
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_hub_assets_unique_dam 
  ON public.product_hub_assets(product_id, asset_id, relationship_type) 
  WHERE asset_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_hub_assets_unique_external 
  ON public.product_hub_assets(product_id, external_url, relationship_type) 
  WHERE external_url IS NOT NULL;

-- Index for external URL queries
CREATE INDEX IF NOT EXISTS idx_product_hub_assets_external 
  ON public.product_hub_assets(product_id, external_url) 
  WHERE external_url IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: ADD DIRECT EXTERNAL URL FIELDS TO PRODUCT_HUBS
-- ═══════════════════════════════════════════════════════════════════════════════
-- For quick external hero/gallery without using the linking table

ALTER TABLE public.product_hubs
  ADD COLUMN IF NOT EXISTS hero_image_external_url TEXT,
  ADD COLUMN IF NOT EXISTS gallery_external_urls TEXT[] DEFAULT '{}';

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: HELPER FUNCTION TO GET EFFECTIVE IMAGE URL
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_product_hero_image_url(p_product_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url TEXT;
BEGIN
  -- Priority 1: External URL set directly on product
  SELECT hero_image_external_url INTO v_url
  FROM public.product_hubs
  WHERE id = p_product_id AND hero_image_external_url IS NOT NULL;
  
  IF v_url IS NOT NULL THEN
    RETURN v_url;
  END IF;
  
  -- Priority 2: DAM asset linked as hero_image
  SELECT COALESCE(da.thumbnail_url, da.file_url) INTO v_url
  FROM public.product_hub_assets pha
  JOIN public.dam_assets da ON da.id = pha.asset_id
  WHERE pha.product_id = p_product_id 
    AND pha.relationship_type = 'hero_image'
    AND pha.is_primary = true
  LIMIT 1;
  
  IF v_url IS NOT NULL THEN
    RETURN v_url;
  END IF;
  
  -- Priority 3: External URL in product_hub_assets
  SELECT external_url INTO v_url
  FROM public.product_hub_assets
  WHERE product_id = p_product_id 
    AND relationship_type = 'hero_image'
    AND is_primary = true
    AND external_url IS NOT NULL
  LIMIT 1;
  
  RETURN v_url;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON COLUMN public.product_hub_assets.external_url IS 'External URL for assets not in DAM (Google Drive, Dropbox, etc.)';
COMMENT ON COLUMN public.product_hub_assets.external_provider IS 'Provider type for external URL';
COMMENT ON COLUMN public.product_hub_assets.external_thumbnail_url IS 'Thumbnail URL for external asset preview';
COMMENT ON COLUMN public.product_hubs.hero_image_external_url IS 'Direct external URL for hero image (bypasses DAM)';
COMMENT ON COLUMN public.product_hubs.gallery_external_urls IS 'Array of external URLs for gallery images';
COMMENT ON FUNCTION public.get_product_hero_image_url IS 'Returns the effective hero image URL from DAM or external source';
