-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX MISSING TABLES
-- Run this in the Supabase SQL Editor if you're seeing 404 errors
-- ═══════════════════════════════════════════════════════════════════════════════

-- Product Packaging Table
CREATE TABLE IF NOT EXISTS public.product_packaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  container_type TEXT,
  container_material TEXT,
  container_color TEXT,
  container_capacity TEXT,
  closure_type TEXT,
  closure_material TEXT,
  box_required BOOLEAN DEFAULT false,
  box_material TEXT,
  box_dimensions JSONB,
  label_type TEXT,
  label_material TEXT,
  net_weight DECIMAL(10, 2),
  net_weight_unit TEXT DEFAULT 'g',
  gross_weight DECIMAL(10, 2),
  gross_weight_unit TEXT DEFAULT 'g',
  is_recyclable BOOLEAN,
  recycling_code TEXT,
  is_refillable BOOLEAN DEFAULT false,
  post_consumer_recycled_percent INTEGER,
  supplier_name TEXT,
  supplier_sku TEXT,
  unit_cost DECIMAL(10, 4),
  moq INTEGER,
  lead_time_days INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_packaging_product ON public.product_packaging(product_id);

-- Product SDS Table
CREATE TABLE IF NOT EXISTS public.product_sds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  version TEXT NOT NULL DEFAULT '1.0',
  revision_date DATE,
  file_url TEXT,
  file_name TEXT,
  ghs_classification TEXT[] DEFAULT '{}',
  signal_word TEXT,
  hazard_statements TEXT[] DEFAULT '{}',
  precautionary_statements TEXT[] DEFAULT '{}',
  ghs_pictograms TEXT[] DEFAULT '{}',
  physical_state TEXT,
  color TEXT,
  odor TEXT,
  ph DECIMAL(4, 2),
  flash_point TEXT,
  first_aid_inhalation TEXT,
  first_aid_skin TEXT,
  first_aid_eye TEXT,
  first_aid_ingestion TEXT,
  storage_conditions TEXT,
  shelf_life_months INTEGER,
  reaches_compliant BOOLEAN,
  tsca_compliant BOOLEAN,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'expired')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_product_sds_product ON public.product_sds(product_id);

-- Product Certifications Table
CREATE TABLE IF NOT EXISTS public.product_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  certification_type TEXT NOT NULL CHECK (certification_type IN (
    'cruelty_free', 'vegan', 'organic', 'natural', 'halal', 'kosher',
    'fair_trade', 'ecocert', 'cosmos', 'natrue', 'usda_organic',
    'leaping_bunny', 'peta', 'ewe', 'b_corp', 'climate_neutral', 'plastic_free', 'other'
  )),
  certifying_body TEXT,
  certificate_number TEXT,
  issued_date DATE,
  expiry_date DATE,
  certificate_url TEXT,
  status TEXT DEFAULT 'claimed' CHECK (status IN ('claimed', 'pending', 'certified', 'expired', 'revoked')),
  show_on_label BOOLEAN DEFAULT true,
  show_on_website BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_product_certification UNIQUE (product_id, certification_type)
);

CREATE INDEX IF NOT EXISTS idx_product_certifications_product ON public.product_certifications(product_id);

-- Product Hub Assets (for media)
CREATE TABLE IF NOT EXISTS public.product_hub_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES public.dam_assets(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'hero_image', 'gallery', 'lifestyle', 'detail', 'packaging',
    'ingredient', 'before_after', 'video', 'document', 'social', 'email', 'other'
  )),
  label TEXT,
  notes TEXT,
  position INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  external_url TEXT,
  external_provider TEXT CHECK (external_provider IN (
    'google_drive', 'dropbox', 'onedrive', 'box', 's3', 'cloudflare_r2', 'direct_url', 'other'
  )),
  external_thumbnail_url TEXT,
  external_filename TEXT,
  external_mime_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_product_hub_assets_product ON public.product_hub_assets(product_id);

-- Enable RLS
ALTER TABLE public.product_packaging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_hub_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Product Packaging
DROP POLICY IF EXISTS "product_packaging_select" ON public.product_packaging;
CREATE POLICY "product_packaging_select" ON public.product_packaging
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_packaging_insert" ON public.product_packaging;
CREATE POLICY "product_packaging_insert" ON public.product_packaging
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_packaging_update" ON public.product_packaging;
CREATE POLICY "product_packaging_update" ON public.product_packaging
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_packaging_delete" ON public.product_packaging;
CREATE POLICY "product_packaging_delete" ON public.product_packaging
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- RLS Policies for Product SDS
DROP POLICY IF EXISTS "product_sds_select" ON public.product_sds;
CREATE POLICY "product_sds_select" ON public.product_sds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_sds_insert" ON public.product_sds;
CREATE POLICY "product_sds_insert" ON public.product_sds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_sds_update" ON public.product_sds;
CREATE POLICY "product_sds_update" ON public.product_sds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_sds_delete" ON public.product_sds;
CREATE POLICY "product_sds_delete" ON public.product_sds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- RLS Policies for Product Certifications
DROP POLICY IF EXISTS "product_certifications_select" ON public.product_certifications;
CREATE POLICY "product_certifications_select" ON public.product_certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_certifications_insert" ON public.product_certifications;
CREATE POLICY "product_certifications_insert" ON public.product_certifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_certifications_update" ON public.product_certifications;
CREATE POLICY "product_certifications_update" ON public.product_certifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_certifications_delete" ON public.product_certifications;
CREATE POLICY "product_certifications_delete" ON public.product_certifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- RLS Policies for Product Hub Assets
DROP POLICY IF EXISTS "product_hub_assets_select" ON public.product_hub_assets;
CREATE POLICY "product_hub_assets_select" ON public.product_hub_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_hub_assets_insert" ON public.product_hub_assets;
CREATE POLICY "product_hub_assets_insert" ON public.product_hub_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_hub_assets_update" ON public.product_hub_assets;
CREATE POLICY "product_hub_assets_update" ON public.product_hub_assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

DROP POLICY IF EXISTS "product_hub_assets_delete" ON public.product_hub_assets;
CREATE POLICY "product_hub_assets_delete" ON public.product_hub_assets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- Success message
SELECT 'All missing tables created successfully!' as result;
