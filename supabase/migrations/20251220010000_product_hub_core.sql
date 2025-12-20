-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - PRODUCT HUB CORE STRUCTURE
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Week 5: Product Hub - Core Structure
-- Expands product_hubs with formulations, commerce, variants, and linking tables
--
-- Tables created:
--   - product_formulations: Recipe/formulation details
--   - product_commerce: E-commerce data (Shopify, pricing tiers, inventory)
--   - product_variants: Size, color, scent variants
--   - product_hub_assets: Links products to DAM assets
--   - product_hub_content: Links products to content pieces
--
-- Created: December 20, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: PRODUCT FORMULATIONS
-- Recipe/formula details for cosmetic products
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_formulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- Formulation Identity
  formula_code TEXT, -- Internal formula reference (e.g., "SKN-2024-001")
  formula_name TEXT, -- "Vitamin C Brightening Serum Formula"
  version INTEGER DEFAULT 1,
  
  -- Status
  status TEXT DEFAULT 'development' CHECK (status IN (
    'development',   -- In R&D
    'testing',       -- Being tested
    'approved',      -- Approved for production
    'production',    -- Currently in production
    'archived'       -- No longer in use
  )),
  
  -- Formulation Type
  formulation_type TEXT, -- emulsion, serum, gel, cream, oil, powder, etc.
  base_type TEXT, -- water-based, oil-based, anhydrous, etc.
  
  -- Key Formulation Data
  total_percentage DECIMAL(5, 2) DEFAULT 100.00, -- Should sum to 100%
  ph_target DECIMAL(3, 1),
  ph_range_min DECIMAL(3, 1),
  ph_range_max DECIMAL(3, 1),
  viscosity_target TEXT, -- "Light", "Medium", "Heavy" or cP value
  
  -- Stability & Testing
  stability_notes TEXT,
  shelf_life_months INTEGER,
  preservative_system TEXT,
  challenge_test_passed BOOLEAN DEFAULT false,
  
  -- Manufacturing
  batch_size_default DECIMAL(10, 2),
  batch_size_unit TEXT DEFAULT 'kg',
  manufacturing_notes TEXT,
  equipment_needed TEXT[] DEFAULT '{}',
  
  -- Cost
  cost_per_unit DECIMAL(10, 4), -- Raw material cost per unit
  cost_currency TEXT DEFAULT 'USD',
  
  -- Regulatory
  compliant_regions TEXT[] DEFAULT '{}', -- EU, US, CN, etc.
  regulatory_notes TEXT,
  
  -- Documentation
  sds_url TEXT, -- Safety Data Sheet
  spec_sheet_url TEXT,
  coa_template_url TEXT, -- Certificate of Analysis template
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for product_formulations
CREATE INDEX IF NOT EXISTS idx_product_formulations_product ON public.product_formulations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_formulations_status ON public.product_formulations(status);
CREATE INDEX IF NOT EXISTS idx_product_formulations_code ON public.product_formulations(formula_code);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: PRODUCT COMMERCE
-- E-commerce, pricing, and inventory data
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_commerce (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- Pricing Tiers
  retail_price DECIMAL(10, 2),
  wholesale_price DECIMAL(10, 2),
  msrp DECIMAL(10, 2), -- Manufacturer's Suggested Retail Price
  currency TEXT DEFAULT 'USD',
  
  -- Cost & Margins
  cost_of_goods DECIMAL(10, 2), -- COGS
  target_margin_percent DECIMAL(5, 2),
  
  -- Inventory
  track_inventory BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  backorder_allowed BOOLEAN DEFAULT false,
  
  -- Inventory Locations (for multi-warehouse)
  inventory_locations JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"location_id": "...", "name": "Main Warehouse", "quantity": 100}]
  
  -- Fulfillment
  weight_for_shipping DECIMAL(10, 2),
  weight_unit TEXT DEFAULT 'oz',
  requires_hazmat BOOLEAN DEFAULT false,
  shipping_class TEXT, -- standard, oversized, fragile, etc.
  
  -- Shopify Sync
  shopify_product_id TEXT,
  shopify_variant_id TEXT,
  shopify_inventory_item_id TEXT,
  shopify_synced_at TIMESTAMPTZ,
  shopify_sync_enabled BOOLEAN DEFAULT false,
  
  -- Other Platforms
  amazon_asin TEXT,
  etsy_listing_id TEXT,
  woocommerce_id TEXT,
  
  -- Platform-specific data
  platform_data JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "shopify": { "handle": "vitamin-c-serum", "template": "product.serum" },
  --   "amazon": { "category_id": "...", "bullet_points": [...] }
  -- }
  
  -- Sales Data (cached/computed)
  total_sold INTEGER DEFAULT 0,
  total_revenue DECIMAL(12, 2) DEFAULT 0,
  last_sold_at TIMESTAMPTZ,
  
  -- Availability
  available_for_sale BOOLEAN DEFAULT true,
  available_date TIMESTAMPTZ, -- For pre-orders
  discontinued_date TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for product_commerce
CREATE INDEX IF NOT EXISTS idx_product_commerce_product ON public.product_commerce(product_id);
CREATE INDEX IF NOT EXISTS idx_product_commerce_shopify ON public.product_commerce(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_product_commerce_available ON public.product_commerce(available_for_sale);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: PRODUCT VARIANTS
-- Size, color, scent, and other product variations
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- Variant Identity
  name TEXT NOT NULL, -- "30ml", "Travel Size", "Rose Scent"
  sku TEXT, -- Variant-specific SKU
  barcode TEXT,
  
  -- Variant Options (flexible)
  option1_name TEXT, -- "Size"
  option1_value TEXT, -- "30ml"
  option2_name TEXT, -- "Scent"
  option2_value TEXT, -- "Unscented"
  option3_name TEXT, -- "Color"
  option3_value TEXT, -- "Clear"
  
  -- Pricing (can override product pricing)
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  cost_per_unit DECIMAL(10, 2),
  
  -- Inventory
  stock_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  
  -- Physical
  weight DECIMAL(10, 4),
  weight_unit TEXT DEFAULT 'oz',
  
  -- Media
  image_id UUID REFERENCES public.dam_assets(id),
  image_ids UUID[] DEFAULT '{}',
  
  -- Status
  is_default BOOLEAN DEFAULT false, -- Is this the default variant?
  is_active BOOLEAN DEFAULT true,
  position INTEGER DEFAULT 0, -- Sort order
  
  -- Platform IDs
  shopify_variant_id TEXT,
  shopify_inventory_item_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for product_variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_active ON public.product_variants(product_id, is_active);
CREATE INDEX IF NOT EXISTS idx_product_variants_default ON public.product_variants(product_id) WHERE is_default = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: PRODUCT HUB ASSETS
-- Links products to DAM assets with relationship context
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_hub_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  asset_id UUID NOT NULL REFERENCES public.dam_assets(id) ON DELETE CASCADE,
  
  -- Relationship Type
  relationship_type TEXT NOT NULL CHECK (relationship_type IN (
    'hero_image',        -- Main product image
    'gallery',           -- Product gallery image
    'lifestyle',         -- Lifestyle/in-use image
    'detail',            -- Close-up/detail shot
    'packaging',         -- Packaging image
    'ingredient',        -- Ingredient highlight
    'before_after',      -- Before/after comparison
    'video',             -- Product video
    'document',          -- PDF, spec sheet, etc.
    'social',            -- Social media asset
    'email',             -- Email marketing asset
    'other'              -- Other relationship
  )),
  
  -- Context
  label TEXT, -- Optional label: "Front View", "Texture Shot"
  notes TEXT,
  
  -- Ordering
  position INTEGER DEFAULT 0,
  
  -- Usage tracking
  is_primary BOOLEAN DEFAULT false, -- Primary asset of this type
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Unique constraint
  CONSTRAINT unique_product_asset UNIQUE (product_id, asset_id, relationship_type)
);

-- Indexes for product_hub_assets
CREATE INDEX IF NOT EXISTS idx_product_hub_assets_product ON public.product_hub_assets(product_id);
CREATE INDEX IF NOT EXISTS idx_product_hub_assets_asset ON public.product_hub_assets(asset_id);
CREATE INDEX IF NOT EXISTS idx_product_hub_assets_type ON public.product_hub_assets(product_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_product_hub_assets_primary ON public.product_hub_assets(product_id, relationship_type) WHERE is_primary = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: PRODUCT HUB CONTENT
-- Links products to content pieces (blog posts, emails, social, etc.)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_hub_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- Content Reference (polymorphic - can reference different content tables)
  content_type TEXT NOT NULL CHECK (content_type IN (
    'master_content',     -- From master_content table
    'derivative_asset',   -- From derivative_assets table
    'prompt',             -- From prompts table (recipes)
    'email',              -- Email content
    'social_post',        -- Social media post
    'blog_post',          -- Blog article
    'product_description',-- Product description copy
    'external'            -- External content (URL reference)
  )),
  content_id UUID, -- ID in the referenced table
  external_url TEXT, -- For external content
  
  -- Relationship Context
  relationship TEXT DEFAULT 'featured' CHECK (relationship IN (
    'featured',       -- Product is featured/main subject
    'mentioned',      -- Product is mentioned
    'comparison',     -- Product is compared
    'collection',     -- Part of a collection/roundup
    'tutorial',       -- Tutorial/how-to content
    'review',         -- Review/testimonial
    'announcement'    -- Launch/announcement content
  )),
  
  -- Content Details (cached for performance)
  content_title TEXT,
  content_status TEXT, -- draft, published, scheduled
  content_published_at TIMESTAMPTZ,
  
  -- Performance (cached metrics)
  views INTEGER DEFAULT 0,
  engagement_score DECIMAL(5, 2),
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for product_hub_content
CREATE INDEX IF NOT EXISTS idx_product_hub_content_product ON public.product_hub_content(product_id);
CREATE INDEX IF NOT EXISTS idx_product_hub_content_content ON public.product_hub_content(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_product_hub_content_relationship ON public.product_hub_content(product_id, relationship);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 6: ENHANCE PRODUCT_HUBS TABLE
-- Add missing columns if they don't exist
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add development stage column
ALTER TABLE public.product_hubs 
ADD COLUMN IF NOT EXISTS development_stage TEXT DEFAULT 'concept' 
CHECK (development_stage IN ('concept', 'formulation', 'testing', 'production', 'launched'));

-- Add launch date
ALTER TABLE public.product_hubs 
ADD COLUMN IF NOT EXISTS launch_date DATE;

-- Add discontinued date
ALTER TABLE public.product_hubs 
ADD COLUMN IF NOT EXISTS discontinued_at TIMESTAMPTZ;

-- Add sort order for manual ordering
ALTER TABLE public.product_hubs 
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- Add parent product for bundles/kits
ALTER TABLE public.product_hubs 
ADD COLUMN IF NOT EXISTS parent_product_id UUID REFERENCES public.product_hubs(id);

-- Add product line/family grouping
ALTER TABLE public.product_hubs 
ADD COLUMN IF NOT EXISTS product_line TEXT;

-- Index for product line
CREATE INDEX IF NOT EXISTS idx_product_hubs_line ON public.product_hubs(organization_id, product_line);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 7: ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS
ALTER TABLE public.product_formulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_commerce ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_hub_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_hub_content ENABLE ROW LEVEL SECURITY;

-- Product Formulations Policies (via product_hubs join)
CREATE POLICY "product_formulations_select" ON public.product_formulations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_formulations_insert" ON public.product_formulations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_formulations_update" ON public.product_formulations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_formulations_delete" ON public.product_formulations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- Product Commerce Policies
CREATE POLICY "product_commerce_select" ON public.product_commerce
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_commerce_insert" ON public.product_commerce
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_commerce_update" ON public.product_commerce
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_commerce_delete" ON public.product_commerce
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- Product Variants Policies
CREATE POLICY "product_variants_select" ON public.product_variants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_variants_insert" ON public.product_variants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_variants_update" ON public.product_variants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_variants_delete" ON public.product_variants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- Product Hub Assets Policies
CREATE POLICY "product_hub_assets_select" ON public.product_hub_assets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_hub_assets_insert" ON public.product_hub_assets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_hub_assets_update" ON public.product_hub_assets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_hub_assets_delete" ON public.product_hub_assets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- Product Hub Content Policies
CREATE POLICY "product_hub_content_select" ON public.product_hub_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_hub_content_insert" ON public.product_hub_content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_hub_content_update" ON public.product_hub_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_hub_content_delete" ON public.product_hub_content
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 8: UPDATED_AT TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_product_formulations_updated_at
  BEFORE UPDATE ON public.product_formulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_commerce_updated_at
  BEFORE UPDATE ON public.product_commerce
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_hub_content_updated_at
  BEFORE UPDATE ON public.product_hub_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.product_formulations IS 'Formula/recipe details for cosmetic products';
COMMENT ON TABLE public.product_commerce IS 'E-commerce, pricing, and inventory data';
COMMENT ON TABLE public.product_variants IS 'Product variations (size, color, scent)';
COMMENT ON TABLE public.product_hub_assets IS 'Links products to DAM assets with relationship context';
COMMENT ON TABLE public.product_hub_content IS 'Links products to content pieces';
