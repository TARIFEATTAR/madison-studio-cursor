-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - DAM (Digital Asset Management) FOUNDATION
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Phase 1: Foundation Schema
-- Creates the storage layer for the DAM system including:
--   - dam_folders: Folder hierarchy for organizing assets
--   - dam_assets: Core asset storage with metadata and AI fields
--   - dam_activity_log: Activity tracking for analytics and agents
--   - product_hubs: Central product management
--   - product_specifications: Detailed product specs
--   - ingredient_library: Shared ingredient database
--   - product_ingredients: Product-ingredient relationships
--
-- Created: December 19, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: DAM FOLDERS
-- Hierarchical folder structure for organizing assets
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dam_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.dam_folders(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT, -- URL-safe version of name
  description TEXT,
  icon TEXT DEFAULT 'folder', -- Lucide icon name
  color TEXT, -- Hex color for folder badge
  
  -- Folder Type
  folder_type TEXT NOT NULL DEFAULT 'user' CHECK (folder_type IN ('user', 'smart', 'system', 'inbox')),
  -- user: Created by user
  -- smart: Auto-populated by filters
  -- system: Pre-created system folders (Blog Posts, Social, etc.)
  -- inbox: Default drop zone for new uploads
  
  -- Smart Folder Configuration (for folder_type = 'smart')
  smart_filter JSONB DEFAULT NULL,
  /*
  {
    "conditions": [
      { "field": "file_type", "operator": "in", "value": ["image/jpeg", "image/png"] },
      { "field": "tags", "operator": "contains", "value": "product" },
      { "field": "created_at", "operator": "gte", "value": "2025-01-01" }
    ],
    "match": "all" | "any"
  }
  */
  
  -- Agent Access Control
  agent_accessible BOOLEAN DEFAULT true,
  agent_permissions JSONB DEFAULT '{"read": true, "write": false, "delete": false}'::jsonb,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT unique_folder_name_per_parent UNIQUE (organization_id, parent_id, name)
);

-- Indexes for dam_folders
CREATE INDEX IF NOT EXISTS idx_dam_folders_org ON public.dam_folders(organization_id);
CREATE INDEX IF NOT EXISTS idx_dam_folders_parent ON public.dam_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_dam_folders_type ON public.dam_folders(folder_type);
CREATE INDEX IF NOT EXISTS idx_dam_folders_slug ON public.dam_folders(organization_id, slug);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: DAM ASSETS
-- Core asset storage with full metadata and AI integration fields
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dam_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  folder_id UUID REFERENCES public.dam_folders(id) ON DELETE SET NULL,
  
  -- File Information
  name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type: image/jpeg, application/pdf, etc.
  file_extension TEXT, -- jpg, png, pdf, etc.
  file_size BIGINT, -- Size in bytes
  file_url TEXT NOT NULL, -- Supabase Storage URL
  
  -- Thumbnails & Previews
  thumbnail_url TEXT, -- Auto-generated thumbnail
  preview_url TEXT, -- Larger preview for quick view
  
  -- Source Tracking
  source_type TEXT NOT NULL DEFAULT 'upload' CHECK (source_type IN (
    'upload',           -- User uploaded
    'generated',        -- AI generated (Madison Image Studio)
    'external_sync',    -- Synced from external platform
    'derivative',       -- Created from another asset
    'system'            -- System generated
  )),
  source_ref JSONB DEFAULT NULL,
  /*
  For 'generated': { "session_id": "...", "prompt": "...", "model": "flux" }
  For 'external_sync': { "platform": "shopify", "product_id": "...", "synced_at": "..." }
  For 'derivative': { "parent_asset_id": "...", "operation": "crop", "params": {...} }
  */
  
  -- Content Linking (links to Madison content)
  linked_content_ids UUID[] DEFAULT '{}',
  linked_content_types TEXT[] DEFAULT '{}', -- 'master_content', 'derivative_asset', 'email', etc.
  
  -- Organization & Discovery
  tags TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}', -- product, lifestyle, editorial, social, etc.
  campaigns TEXT[] DEFAULT '{}', -- Campaign names/IDs this asset is used in
  
  -- AI Analysis Fields (populated by process-dam-asset)
  ai_analysis JSONB DEFAULT NULL,
  /*
  {
    "description": "Auto-generated description",
    "detected_objects": ["bottle", "hand", "background"],
    "dominant_colors": ["#F5F1E8", "#B8956A"],
    "sentiment": "luxury",
    "brand_consistency_score": 85,
    "suggested_tags": ["product", "skincare", "minimalist"],
    "text_content": "Extracted text from image/PDF",
    "faces_detected": 0
  }
  */
  
  -- Vector Embedding for Semantic Search
  embedding vector(1536), -- OpenAI ada-002 compatible
  
  -- Usage Analytics
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  last_used_in JSONB DEFAULT NULL, -- { "type": "blog", "id": "...", "title": "..." }
  
  -- Status & Lifecycle
  status TEXT DEFAULT 'active' CHECK (status IN ('processing', 'active', 'archived', 'deleted')),
  is_favorite BOOLEAN DEFAULT false,
  is_hero BOOLEAN DEFAULT false, -- Marked as hero/featured image
  
  -- Version Control
  version INTEGER DEFAULT 1,
  parent_version_id UUID REFERENCES public.dam_assets(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "dimensions": { "width": 1920, "height": 1080 },
    "duration": 30, // for video
    "pages": 5, // for PDF
    "exif": { ... },
    "custom": { ... }
  }
  */
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,
  uploaded_by UUID REFERENCES auth.users(id),
  
  -- Search optimization
  search_text TEXT GENERATED ALWAYS AS (
    COALESCE(name, '') || ' ' || 
    COALESCE(array_to_string(tags, ' '), '') || ' ' ||
    COALESCE(array_to_string(categories, ' '), '')
  ) STORED
);

-- Indexes for dam_assets
CREATE INDEX IF NOT EXISTS idx_dam_assets_org ON public.dam_assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_dam_assets_folder ON public.dam_assets(folder_id);
CREATE INDEX IF NOT EXISTS idx_dam_assets_source ON public.dam_assets(source_type);
CREATE INDEX IF NOT EXISTS idx_dam_assets_status ON public.dam_assets(status);
CREATE INDEX IF NOT EXISTS idx_dam_assets_type ON public.dam_assets(file_type);
CREATE INDEX IF NOT EXISTS idx_dam_assets_tags ON public.dam_assets USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_dam_assets_categories ON public.dam_assets USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_dam_assets_campaigns ON public.dam_assets USING GIN(campaigns);
CREATE INDEX IF NOT EXISTS idx_dam_assets_created ON public.dam_assets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_dam_assets_search ON public.dam_assets USING GIN(to_tsvector('english', search_text));

-- Vector index for semantic search (using ivfflat for better performance)
CREATE INDEX IF NOT EXISTS idx_dam_assets_embedding ON public.dam_assets 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: DAM ACTIVITY LOG
-- Tracks all actions for analytics, agents, and audit trail
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.dam_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- What was affected
  asset_id UUID REFERENCES public.dam_assets(id) ON DELETE SET NULL,
  folder_id UUID REFERENCES public.dam_folders(id) ON DELETE SET NULL,
  
  -- Action details
  action TEXT NOT NULL CHECK (action IN (
    'upload', 'download', 'view', 'edit', 'delete', 'restore',
    'move', 'copy', 'rename', 'tag', 'untag',
    'use', 'share', 'archive', 'unarchive',
    'folder_create', 'folder_delete', 'folder_rename',
    'ai_analyze', 'ai_suggest', 'agent_action'
  )),
  
  -- Who performed it
  actor_type TEXT NOT NULL DEFAULT 'user' CHECK (actor_type IN ('user', 'agent', 'system', 'webhook')),
  actor_id UUID, -- user_id or agent_id
  actor_name TEXT, -- Display name for audit trail
  
  -- Context
  context JSONB DEFAULT '{}'::jsonb,
  /*
  For 'use': { "used_in": "blog", "content_id": "...", "content_title": "..." }
  For 'move': { "from_folder": "...", "to_folder": "..." }
  For 'agent_action': { "agent_name": "Content Agent", "task": "suggest_images" }
  */
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity log
CREATE INDEX IF NOT EXISTS idx_dam_activity_org ON public.dam_activity_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_dam_activity_asset ON public.dam_activity_log(asset_id);
CREATE INDEX IF NOT EXISTS idx_dam_activity_folder ON public.dam_activity_log(folder_id);
CREATE INDEX IF NOT EXISTS idx_dam_activity_action ON public.dam_activity_log(action);
CREATE INDEX IF NOT EXISTS idx_dam_activity_actor ON public.dam_activity_log(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_dam_activity_created ON public.dam_activity_log(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: PRODUCT HUBS
-- Central product management - the single source of truth for products
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Basic Information
  name TEXT NOT NULL,
  slug TEXT,
  sku TEXT,
  barcode TEXT,
  
  -- Description & Copy
  short_description TEXT,
  long_description TEXT,
  tagline TEXT,
  
  -- Pricing
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  cost_per_unit DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'discontinued')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'internal', 'public')),
  
  -- Categorization
  category TEXT,
  subcategory TEXT,
  product_type TEXT, -- e.g., 'serum', 'moisturizer', 'cleanser'
  collections TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  
  -- Media (links to DAM)
  hero_image_id UUID REFERENCES public.dam_assets(id),
  gallery_image_ids UUID[] DEFAULT '{}',
  video_ids UUID[] DEFAULT '{}',
  
  -- External Syncs
  external_ids JSONB DEFAULT '{}'::jsonb,
  /*
  {
    "shopify": { "product_id": "...", "variant_id": "...", "synced_at": "..." },
    "etsy": { "listing_id": "...", "synced_at": "..." },
    "amazon": { "asin": "...", "synced_at": "..." }
  }
  */
  
  -- AI & Brand
  brand_voice_notes TEXT, -- Notes for AI when writing about this product
  target_audience TEXT,
  key_benefits TEXT[] DEFAULT '{}',
  key_differentiators TEXT[] DEFAULT '{}',
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[] DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Indexes for product_hubs
CREATE INDEX IF NOT EXISTS idx_product_hubs_org ON public.product_hubs(organization_id);
CREATE INDEX IF NOT EXISTS idx_product_hubs_status ON public.product_hubs(status);
CREATE INDEX IF NOT EXISTS idx_product_hubs_slug ON public.product_hubs(organization_id, slug);
CREATE INDEX IF NOT EXISTS idx_product_hubs_sku ON public.product_hubs(organization_id, sku);
CREATE INDEX IF NOT EXISTS idx_product_hubs_category ON public.product_hubs(category);
CREATE INDEX IF NOT EXISTS idx_product_hubs_tags ON public.product_hubs USING GIN(tags);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: PRODUCT SPECIFICATIONS
-- Detailed technical specifications for products
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_specifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- Physical Specifications
  weight DECIMAL(10, 4),
  weight_unit TEXT DEFAULT 'oz' CHECK (weight_unit IN ('oz', 'g', 'kg', 'lb', 'ml', 'fl_oz', 'l')),
  
  dimensions JSONB DEFAULT NULL,
  /*
  {
    "length": 5.5,
    "width": 2.0,
    "height": 7.0,
    "unit": "in"
  }
  */
  
  -- Packaging
  container_type TEXT, -- bottle, jar, tube, pump, dropper, etc.
  container_material TEXT, -- glass, plastic, aluminum, etc.
  closure_type TEXT, -- pump, dropper, cap, spray, etc.
  
  -- Product-Specific (Beauty/Skincare focused)
  volume TEXT, -- "1.7 fl oz", "50ml"
  concentration TEXT, -- For serums: percentage of active
  ph_level DECIMAL(3, 1),
  texture TEXT, -- cream, gel, oil, serum, lotion, etc.
  finish TEXT, -- matte, dewy, natural, etc.
  scent TEXT,
  color TEXT,
  
  -- Usage Information
  how_to_use TEXT,
  when_to_use TEXT, -- AM, PM, both
  frequency TEXT, -- daily, twice daily, weekly
  application_area TEXT, -- face, body, eyes, lips, etc.
  
  -- Claims & Certifications
  claims TEXT[] DEFAULT '{}', -- vegan, cruelty-free, organic, etc.
  certifications TEXT[] DEFAULT '{}',
  awards TEXT[] DEFAULT '{}',
  
  -- Regulatory
  country_of_origin TEXT,
  shelf_life TEXT,
  expiry_info TEXT,
  warnings TEXT[] DEFAULT '{}',
  
  -- Extended Specs (flexible)
  custom_specs JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for product_specifications
CREATE INDEX IF NOT EXISTS idx_product_specs_product ON public.product_specifications(product_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 6: INGREDIENT LIBRARY
-- Shared ingredient database with detailed information
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ingredient_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  name TEXT NOT NULL,
  inci_name TEXT, -- International Nomenclature of Cosmetic Ingredients
  common_names TEXT[] DEFAULT '{}', -- Alternative names
  
  -- Classification
  category TEXT, -- active, emollient, humectant, preservative, etc.
  function TEXT[] DEFAULT '{}', -- moisturizing, anti-aging, brightening, etc.
  
  -- Description
  description TEXT,
  benefits TEXT[] DEFAULT '{}',
  concerns TEXT[] DEFAULT '{}', -- Potential concerns or sensitivities
  
  -- Source & Nature
  source TEXT, -- plant, synthetic, mineral, animal, etc.
  is_natural BOOLEAN,
  is_organic_available BOOLEAN,
  
  -- Safety & Regulatory
  ewg_score INTEGER, -- Environmental Working Group score (1-10)
  comedogenic_rating INTEGER, -- 0-5
  irritation_potential TEXT, -- low, medium, high
  
  -- Marketing Copy Helpers
  hero_claim TEXT, -- Main marketing claim
  story TEXT, -- Origin story or interesting facts
  
  -- AI Training
  ai_description TEXT, -- Optimized description for AI context
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique per org
  CONSTRAINT unique_ingredient_per_org UNIQUE (organization_id, name)
);

-- Indexes for ingredient_library
CREATE INDEX IF NOT EXISTS idx_ingredient_lib_org ON public.ingredient_library(organization_id);
CREATE INDEX IF NOT EXISTS idx_ingredient_lib_category ON public.ingredient_library(category);
CREATE INDEX IF NOT EXISTS idx_ingredient_lib_name ON public.ingredient_library(name);
CREATE INDEX IF NOT EXISTS idx_ingredient_lib_inci ON public.ingredient_library(inci_name);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 7: PRODUCT INGREDIENTS (Junction Table)
-- Links products to ingredients with order and concentration
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES public.ingredient_library(id) ON DELETE CASCADE,
  
  -- Order (ingredients listed in descending order of concentration)
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Concentration (if disclosed)
  concentration_percent DECIMAL(5, 2),
  concentration_display TEXT, -- "1%", "<1%", "hero ingredient"
  
  -- Role in this product
  is_hero_ingredient BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT false,
  role_in_product TEXT, -- What this ingredient does in this specific product
  
  -- Marketing
  highlight_in_copy BOOLEAN DEFAULT false,
  marketing_claim TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint
  CONSTRAINT unique_product_ingredient UNIQUE (product_id, ingredient_id)
);

-- Indexes for product_ingredients
CREATE INDEX IF NOT EXISTS idx_product_ingredients_product ON public.product_ingredients(product_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_ingredient ON public.product_ingredients(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_product_ingredients_hero ON public.product_ingredients(product_id) WHERE is_hero_ingredient = true;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 8: ROW LEVEL SECURITY (RLS)
-- Secure all tables with organization-based access
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.dam_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dam_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dam_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_ingredients ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's organization IDs
CREATE OR REPLACE FUNCTION public.get_user_organization_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(
    array_agg(DISTINCT organization_id),
    '{}'::UUID[]
  )
  FROM public.organization_members
  WHERE user_id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- DAM Folders Policies
CREATE POLICY "dam_folders_select" ON public.dam_folders
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "dam_folders_insert" ON public.dam_folders
  FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "dam_folders_update" ON public.dam_folders
  FOR UPDATE USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "dam_folders_delete" ON public.dam_folders
  FOR DELETE USING (organization_id = ANY(public.get_user_organization_ids()));

-- DAM Assets Policies
CREATE POLICY "dam_assets_select" ON public.dam_assets
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "dam_assets_insert" ON public.dam_assets
  FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "dam_assets_update" ON public.dam_assets
  FOR UPDATE USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "dam_assets_delete" ON public.dam_assets
  FOR DELETE USING (organization_id = ANY(public.get_user_organization_ids()));

-- DAM Activity Log Policies
CREATE POLICY "dam_activity_select" ON public.dam_activity_log
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "dam_activity_insert" ON public.dam_activity_log
  FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

-- Product Hubs Policies
CREATE POLICY "product_hubs_select" ON public.product_hubs
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_hubs_insert" ON public.product_hubs
  FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_hubs_update" ON public.product_hubs
  FOR UPDATE USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "product_hubs_delete" ON public.product_hubs
  FOR DELETE USING (organization_id = ANY(public.get_user_organization_ids()));

-- Product Specifications Policies (via product_hubs join)
CREATE POLICY "product_specs_select" ON public.product_specifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_specs_insert" ON public.product_specifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_specs_update" ON public.product_specifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_specs_delete" ON public.product_specifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- Ingredient Library Policies
CREATE POLICY "ingredient_lib_select" ON public.ingredient_library
  FOR SELECT USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "ingredient_lib_insert" ON public.ingredient_library
  FOR INSERT WITH CHECK (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "ingredient_lib_update" ON public.ingredient_library
  FOR UPDATE USING (organization_id = ANY(public.get_user_organization_ids()));

CREATE POLICY "ingredient_lib_delete" ON public.ingredient_library
  FOR DELETE USING (organization_id = ANY(public.get_user_organization_ids()));

-- Product Ingredients Policies (via product_hubs join)
CREATE POLICY "product_ingredients_select" ON public.product_ingredients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_ingredients_insert" ON public.product_ingredients
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_ingredients_update" ON public.product_ingredients
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_ingredients_delete" ON public.product_ingredients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 9: UPDATED_AT TRIGGERS
-- Automatically update timestamps
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER update_dam_folders_updated_at
  BEFORE UPDATE ON public.dam_folders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dam_assets_updated_at
  BEFORE UPDATE ON public.dam_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_hubs_updated_at
  BEFORE UPDATE ON public.product_hubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_specs_updated_at
  BEFORE UPDATE ON public.product_specifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ingredient_lib_updated_at
  BEFORE UPDATE ON public.ingredient_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 10: DEFAULT SYSTEM FOLDERS
-- Function to create default folders for new organizations
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.create_default_dam_folders(org_id UUID, user_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Inbox (default upload destination)
  INSERT INTO public.dam_folders (organization_id, name, slug, icon, folder_type, sort_order, created_by)
  VALUES (org_id, 'Inbox', 'inbox', 'inbox', 'inbox', 0, user_id)
  ON CONFLICT (organization_id, parent_id, name) DO NOTHING;
  
  -- System folders
  INSERT INTO public.dam_folders (organization_id, name, slug, icon, folder_type, sort_order, created_by)
  VALUES 
    (org_id, 'Blog Images', 'blog-images', 'file-text', 'system', 1, user_id),
    (org_id, 'Social Media', 'social-media', 'share-2', 'system', 2, user_id),
    (org_id, 'Product Photos', 'product-photos', 'package', 'system', 3, user_id),
    (org_id, 'Email Assets', 'email-assets', 'mail', 'system', 4, user_id),
    (org_id, 'Brand Assets', 'brand-assets', 'palette', 'system', 5, user_id),
    (org_id, 'Documents', 'documents', 'file', 'system', 6, user_id)
  ON CONFLICT (organization_id, parent_id, name) DO NOTHING;
  
  -- Smart folders
  INSERT INTO public.dam_folders (
    organization_id, name, slug, icon, folder_type, sort_order, created_by,
    smart_filter
  )
  VALUES 
    (
      org_id, 'Recent', 'recent', 'clock', 'smart', 100, user_id,
      '{"conditions": [{"field": "created_at", "operator": "gte", "value": "7_days_ago"}], "match": "all"}'::jsonb
    ),
    (
      org_id, 'Favorites', 'favorites', 'star', 'smart', 101, user_id,
      '{"conditions": [{"field": "is_favorite", "operator": "eq", "value": true}], "match": "all"}'::jsonb
    ),
    (
      org_id, 'AI Generated', 'ai-generated', 'sparkles', 'smart', 102, user_id,
      '{"conditions": [{"field": "source_type", "operator": "eq", "value": "generated"}], "match": "all"}'::jsonb
    )
  ON CONFLICT (organization_id, parent_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 11: STORAGE BUCKETS
-- Create storage buckets for DAM assets
-- ═══════════════════════════════════════════════════════════════════════════════

-- Note: Storage bucket creation should be done via Supabase Dashboard or CLI
-- These are the bucket configurations to create:

/*
Bucket: dam-assets
- Public: true
- File size limit: 50MB
- Allowed MIME types: image/*, video/*, application/pdf, application/msword, 
                      application/vnd.openxmlformats-officedocument.*

Bucket: dam-thumbnails
- Public: true
- File size limit: 5MB
- Allowed MIME types: image/*

Storage policies should allow:
- SELECT for authenticated users where path starts with their org_id
- INSERT for authenticated users into their org_id folder
- DELETE for authenticated users in their org_id folder
*/

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.dam_folders IS 'DAM folder hierarchy for organizing assets';
COMMENT ON TABLE public.dam_assets IS 'Core DAM asset storage with metadata and AI fields';
COMMENT ON TABLE public.dam_activity_log IS 'Activity tracking for DAM analytics and audit';
COMMENT ON TABLE public.product_hubs IS 'Central product management hub';
COMMENT ON TABLE public.product_specifications IS 'Detailed product specifications';
COMMENT ON TABLE public.ingredient_library IS 'Shared ingredient database';
COMMENT ON TABLE public.product_ingredients IS 'Product-ingredient relationships';
