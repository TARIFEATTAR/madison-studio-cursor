-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - INGREDIENTS & COMPLIANCE
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Week 7: Product Hub - Ingredients & Compliance
-- Complete ingredient management, allergen detection, and regulatory compliance
--
-- Tables created/enhanced:
--   - ingredient_library (enhanced with compliance fields)
--   - product_ingredients (enhanced with allergen/compliance)
--   - product_packaging (new)
--   - product_sds (Safety Data Sheets)
--   - product_certifications (new)
--   - allergen_registry (reference table)
--
-- Created: December 20, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: ALLERGEN REGISTRY
-- Reference table of known allergens (EU/US regulations)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.allergen_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Allergen Identity
  name TEXT NOT NULL UNIQUE,
  inci_name TEXT, -- INCI nomenclature
  cas_number TEXT, -- CAS Registry Number
  
  -- Classification
  allergen_type TEXT NOT NULL CHECK (allergen_type IN (
    'fragrance',      -- EU 26 fragrance allergens
    'preservative',   -- Preservative allergens
    'colorant',       -- Dye/colorant allergens
    'plant',          -- Plant-derived allergens
    'other'           -- Other allergens
  )),
  
  -- Regulatory Status
  eu_regulated BOOLEAN DEFAULT false,  -- EU Cosmetics Regulation
  us_regulated BOOLEAN DEFAULT false,  -- FDA regulations
  disclosure_threshold DECIMAL(6, 4),  -- % threshold requiring disclosure
  
  -- Common Sources
  common_sources TEXT[] DEFAULT '{}',  -- Ingredients that contain this allergen
  
  -- Display
  display_warning TEXT,  -- Warning text for labels
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for allergen lookup
CREATE INDEX IF NOT EXISTS idx_allergen_registry_name ON public.allergen_registry(name);
CREATE INDEX IF NOT EXISTS idx_allergen_registry_inci ON public.allergen_registry(inci_name);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: SEED EU 26 FRAGRANCE ALLERGENS
-- Required disclosure at 0.001% (rinse-off) / 0.01% (leave-on)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO public.allergen_registry (name, inci_name, allergen_type, eu_regulated, disclosure_threshold, common_sources, display_warning) VALUES
('Amyl Cinnamal', 'AMYL CINNAMAL', 'fragrance', true, 0.001, ARRAY['Jasmine', 'Gardenia'], 'Contains Amyl Cinnamal'),
('Amylcinnamyl Alcohol', 'AMYLCINNAMYL ALCOHOL', 'fragrance', true, 0.001, ARRAY['Jasmine'], 'Contains Amylcinnamyl Alcohol'),
('Anise Alcohol', 'ANISE ALCOHOL', 'fragrance', true, 0.001, ARRAY['Anise', 'Star Anise'], 'Contains Anise Alcohol'),
('Benzyl Alcohol', 'BENZYL ALCOHOL', 'fragrance', true, 0.001, ARRAY['Jasmine', 'Ylang Ylang', 'Peru Balsam'], 'Contains Benzyl Alcohol'),
('Benzyl Benzoate', 'BENZYL BENZOATE', 'fragrance', true, 0.001, ARRAY['Ylang Ylang', 'Peru Balsam', 'Jasmine'], 'Contains Benzyl Benzoate'),
('Benzyl Cinnamate', 'BENZYL CINNAMATE', 'fragrance', true, 0.001, ARRAY['Peru Balsam', 'Tolu Balsam'], 'Contains Benzyl Cinnamate'),
('Benzyl Salicylate', 'BENZYL SALICYLATE', 'fragrance', true, 0.001, ARRAY['Carnation', 'Ylang Ylang'], 'Contains Benzyl Salicylate'),
('Cinnamal', 'CINNAMAL', 'fragrance', true, 0.001, ARRAY['Cinnamon', 'Cassia'], 'Contains Cinnamal'),
('Cinnamyl Alcohol', 'CINNAMYL ALCOHOL', 'fragrance', true, 0.001, ARRAY['Cinnamon', 'Peru Balsam'], 'Contains Cinnamyl Alcohol'),
('Citral', 'CITRAL', 'fragrance', true, 0.001, ARRAY['Lemon', 'Lemongrass', 'Verbena', 'Citrus oils'], 'Contains Citral'),
('Citronellol', 'CITRONELLOL', 'fragrance', true, 0.001, ARRAY['Rose', 'Geranium', 'Citronella'], 'Contains Citronellol'),
('Coumarin', 'COUMARIN', 'fragrance', true, 0.001, ARRAY['Tonka Bean', 'Lavender', 'Cassia'], 'Contains Coumarin'),
('Eugenol', 'EUGENOL', 'fragrance', true, 0.001, ARRAY['Clove', 'Cinnamon', 'Rose', 'Carnation'], 'Contains Eugenol'),
('Farnesol', 'FARNESOL', 'fragrance', true, 0.001, ARRAY['Rose', 'Neroli', 'Ylang Ylang', 'Linden'], 'Contains Farnesol'),
('Geraniol', 'GERANIOL', 'fragrance', true, 0.001, ARRAY['Rose', 'Geranium', 'Palmarosa', 'Citronella'], 'Contains Geraniol'),
('Hexyl Cinnamal', 'HEXYL CINNAMAL', 'fragrance', true, 0.001, ARRAY['Chamomile'], 'Contains Hexyl Cinnamal'),
('Hydroxycitronellal', 'HYDROXYCITRONELLAL', 'fragrance', true, 0.001, ARRAY['Synthetic'], 'Contains Hydroxycitronellal'),
('Hydroxyisohexyl 3-Cyclohexene Carboxaldehyde', 'HYDROXYISOHEXYL 3-CYCLOHEXENE CARBOXALDEHYDE', 'fragrance', true, 0.001, ARRAY['Lyral', 'Synthetic'], 'Contains HICC (Lyral)'),
('Isoeugenol', 'ISOEUGENOL', 'fragrance', true, 0.001, ARRAY['Ylang Ylang', 'Clove', 'Nutmeg'], 'Contains Isoeugenol'),
('Limonene', 'LIMONENE', 'fragrance', true, 0.001, ARRAY['Citrus oils', 'Orange', 'Lemon', 'Bergamot'], 'Contains Limonene'),
('Linalool', 'LINALOOL', 'fragrance', true, 0.001, ARRAY['Lavender', 'Bergamot', 'Rosewood', 'Ho Wood'], 'Contains Linalool'),
('Methyl 2-Octynoate', 'METHYL 2-OCTYNOATE', 'fragrance', true, 0.001, ARRAY['Violet leaf'], 'Contains Methyl 2-Octynoate'),
('Alpha-Isomethyl Ionone', 'ALPHA-ISOMETHYL IONONE', 'fragrance', true, 0.001, ARRAY['Violet', 'Orris'], 'Contains Alpha-Isomethyl Ionone'),
('Oak Moss Extract', 'EVERNIA PRUNASTRI EXTRACT', 'fragrance', true, 0.001, ARRAY['Oak Moss'], 'Contains Oak Moss'),
('Tree Moss Extract', 'EVERNIA FURFURACEA EXTRACT', 'fragrance', true, 0.001, ARRAY['Tree Moss'], 'Contains Tree Moss')
ON CONFLICT (name) DO NOTHING;

-- Additional common allergens
INSERT INTO public.allergen_registry (name, inci_name, allergen_type, eu_regulated, disclosure_threshold, common_sources, display_warning) VALUES
('Butylphenyl Methylpropional', 'BUTYLPHENYL METHYLPROPIONAL', 'fragrance', true, 0.001, ARRAY['Lilial', 'Synthetic'], 'Contains Lilial'),
('Tree Nut Derivatives', 'Various', 'plant', false, 0.0, ARRAY['Almond', 'Walnut', 'Hazelnut'], 'May contain tree nut derivatives'),
('Soy', 'GLYCINE SOJA', 'plant', false, 0.0, ARRAY['Soy lecithin', 'Soybean oil'], 'Contains soy derivatives'),
('Gluten', 'Various', 'plant', false, 0.0, ARRAY['Wheat', 'Oat', 'Barley'], 'May contain gluten')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: ENHANCE INGREDIENT LIBRARY
-- Add compliance and regulatory fields
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add INCI name if not exists
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS inci_name TEXT;

-- Add CAS number
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS cas_number TEXT;

-- Add EINECS/ELINCS number (EU)
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS einecs_number TEXT;

-- Allergen flags
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS is_allergen BOOLEAN DEFAULT false;

ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS allergen_ids UUID[] DEFAULT '{}';

ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS contains_allergens TEXT[] DEFAULT '{}';

-- Origin/sourcing
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS origin TEXT CHECK (origin IN (
  'natural',
  'natural_derived',
  'synthetic',
  'biotechnology',
  'mineral',
  'unknown'
));

ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS source_material TEXT;

-- Certifications
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS is_vegan BOOLEAN DEFAULT NULL;
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS is_cruelty_free BOOLEAN DEFAULT NULL;
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS is_organic BOOLEAN DEFAULT NULL;
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS is_halal BOOLEAN DEFAULT NULL;
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS is_kosher BOOLEAN DEFAULT NULL;

-- Regulatory notes
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS regulatory_notes TEXT;

ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS max_usage_percent DECIMAL(5, 2);

-- Function (what it does in formulation)
ALTER TABLE public.ingredient_library 
ADD COLUMN IF NOT EXISTS cosmetic_function TEXT[] DEFAULT '{}';
-- e.g., 'emollient', 'preservative', 'fragrance', 'colorant', 'surfactant'

-- Index for INCI search
CREATE INDEX IF NOT EXISTS idx_ingredient_library_inci ON public.ingredient_library(inci_name);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: ENHANCE PRODUCT INGREDIENTS
-- Add compliance tracking per ingredient in product
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add allergen flag per ingredient
ALTER TABLE public.product_ingredients 
ADD COLUMN IF NOT EXISTS contains_allergens TEXT[] DEFAULT '{}';

-- Add disclosure requirement
ALTER TABLE public.product_ingredients 
ADD COLUMN IF NOT EXISTS requires_disclosure BOOLEAN DEFAULT false;

-- Add INCI name (denormalized for convenience)
ALTER TABLE public.product_ingredients 
ADD COLUMN IF NOT EXISTS inci_name TEXT;

-- Add origin for this specific use
ALTER TABLE public.product_ingredients 
ADD COLUMN IF NOT EXISTS origin TEXT;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: PRODUCT PACKAGING TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_packaging (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- Primary Container
  container_type TEXT, -- bottle, jar, tube, pump, dropper, roller, spray
  container_material TEXT, -- glass, plastic, aluminum, bamboo
  container_color TEXT,
  container_capacity TEXT, -- "30ml", "1 fl oz"
  
  -- Closure
  closure_type TEXT, -- pump, spray, dropper, screw cap, flip top
  closure_material TEXT,
  
  -- Secondary Packaging
  box_required BOOLEAN DEFAULT false,
  box_material TEXT,
  box_dimensions JSONB, -- { length, width, height, unit }
  
  -- Labels
  label_type TEXT, -- pressure sensitive, shrink sleeve, screen print
  label_material TEXT,
  
  -- Weights
  net_weight DECIMAL(10, 2),
  net_weight_unit TEXT DEFAULT 'g',
  gross_weight DECIMAL(10, 2),
  gross_weight_unit TEXT DEFAULT 'g',
  
  -- Sustainability
  is_recyclable BOOLEAN,
  recycling_code TEXT, -- #1 PET, #2 HDPE, etc.
  is_refillable BOOLEAN DEFAULT false,
  post_consumer_recycled_percent INTEGER,
  
  -- Supplier Info
  supplier_name TEXT,
  supplier_sku TEXT,
  unit_cost DECIMAL(10, 4),
  moq INTEGER, -- Minimum order quantity
  lead_time_days INTEGER,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_product_packaging_product ON public.product_packaging(product_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 6: SAFETY DATA SHEETS (SDS)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_sds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- SDS Version
  version TEXT NOT NULL DEFAULT '1.0',
  revision_date DATE,
  
  -- Document
  file_url TEXT,
  file_name TEXT,
  
  -- Key Safety Info (extracted/entered)
  ghs_classification TEXT[] DEFAULT '{}', -- GHS hazard classes
  signal_word TEXT, -- Danger, Warning, or none
  hazard_statements TEXT[] DEFAULT '{}', -- H-statements
  precautionary_statements TEXT[] DEFAULT '{}', -- P-statements
  
  -- Pictograms
  ghs_pictograms TEXT[] DEFAULT '{}', -- GHS01-GHS09
  
  -- Physical Properties
  physical_state TEXT, -- solid, liquid, gas
  color TEXT,
  odor TEXT,
  ph DECIMAL(4, 2),
  flash_point TEXT,
  
  -- First Aid
  first_aid_inhalation TEXT,
  first_aid_skin TEXT,
  first_aid_eye TEXT,
  first_aid_ingestion TEXT,
  
  -- Storage
  storage_conditions TEXT,
  shelf_life_months INTEGER,
  
  -- Regulatory
  reaches_compliant BOOLEAN,
  tsca_compliant BOOLEAN,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'expired')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_product_sds_product ON public.product_sds(product_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 7: PRODUCT CERTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.product_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.product_hubs(id) ON DELETE CASCADE,
  
  -- Certification Type
  certification_type TEXT NOT NULL CHECK (certification_type IN (
    'cruelty_free',
    'vegan',
    'organic',
    'natural',
    'halal',
    'kosher',
    'fair_trade',
    'ecocert',
    'cosmos',
    'natrue',
    'usda_organic',
    'leaping_bunny',
    'peta',
    'ewe',
    'b_corp',
    'climate_neutral',
    'plastic_free',
    'other'
  )),
  
  -- Certification Details
  certifying_body TEXT, -- Leaping Bunny, PETA, USDA, etc.
  certificate_number TEXT,
  
  -- Validity
  issued_date DATE,
  expiry_date DATE,
  
  -- Documentation
  certificate_url TEXT,
  
  -- Status
  status TEXT DEFAULT 'claimed' CHECK (status IN (
    'claimed',      -- Self-declared
    'pending',      -- Application in progress
    'certified',    -- Officially certified
    'expired',      -- Certification expired
    'revoked'       -- Certification revoked
  )),
  
  -- Display
  show_on_label BOOLEAN DEFAULT true,
  show_on_website BOOLEAN DEFAULT true,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint - one cert type per product
  CONSTRAINT unique_product_certification UNIQUE (product_id, certification_type)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_product_certifications_product ON public.product_certifications(product_id);
CREATE INDEX IF NOT EXISTS idx_product_certifications_type ON public.product_certifications(certification_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 8: ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════════════════════════════════

-- Allergen registry is public read
ALTER TABLE public.allergen_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allergen_registry_select" ON public.allergen_registry
  FOR SELECT TO authenticated USING (true);

-- Product Packaging
ALTER TABLE public.product_packaging ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_packaging_select" ON public.product_packaging
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_packaging_insert" ON public.product_packaging
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_packaging_update" ON public.product_packaging
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_packaging_delete" ON public.product_packaging
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- Product SDS
ALTER TABLE public.product_sds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_sds_select" ON public.product_sds
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_sds_insert" ON public.product_sds
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_sds_update" ON public.product_sds
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_sds_delete" ON public.product_sds
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- Product Certifications
ALTER TABLE public.product_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_certifications_select" ON public.product_certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_certifications_insert" ON public.product_certifications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_certifications_update" ON public.product_certifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

CREATE POLICY "product_certifications_delete" ON public.product_certifications
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.product_hubs ph
      WHERE ph.id = product_id
      AND ph.organization_id = ANY(public.get_user_organization_ids())
    )
  );

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 9: UPDATED_AT TRIGGERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_product_packaging_updated_at
  BEFORE UPDATE ON public.product_packaging
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_sds_updated_at
  BEFORE UPDATE ON public.product_sds
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_certifications_updated_at
  BEFORE UPDATE ON public.product_certifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.allergen_registry IS 'Reference table of known allergens (EU 26 + others)';
COMMENT ON TABLE public.product_packaging IS 'Packaging details for products';
COMMENT ON TABLE public.product_sds IS 'Safety Data Sheets for products';
COMMENT ON TABLE public.product_certifications IS 'Certifications (vegan, cruelty-free, etc.) per product';
