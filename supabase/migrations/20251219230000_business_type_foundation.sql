-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - BUSINESS TYPE FOUNDATION
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Week 4: Business Type Foundation & Organization Setup
-- Enables different business types to have tailored experiences
--
-- Business Types:
--   - finished_goods: Complete products (cosmetics, skincare, etc.)
--   - bottles_vessels: Container manufacturers
--   - packaging_boxes: Box/packaging manufacturers  
--   - raw_materials: Ingredient/material suppliers
--
-- Created: December 19, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 1: ADD BUSINESS TYPE TO ORGANIZATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create business type enum
DO $$ BEGIN
  CREATE TYPE public.business_type AS ENUM (
    'finished_goods',
    'bottles_vessels', 
    'packaging_boxes',
    'raw_materials'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Add business_type column to organizations (nullable for existing orgs)
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS business_type public.business_type DEFAULT NULL;

-- Add index for querying by business type
CREATE INDEX IF NOT EXISTS idx_organizations_business_type 
ON public.organizations(business_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 2: BUSINESS TYPE CONFIGURATION TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.business_type_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Business type this config applies to
  business_type public.business_type NOT NULL UNIQUE,
  
  -- Display information
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'package', -- Lucide icon name
  
  -- What sections/features are enabled for this business type
  enabled_sections JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {
  --   "products": true,
  --   "ingredients": true,
  --   "specifications": true,
  --   "packaging": false,
  --   "formulations": true
  -- }
  
  -- Vocabulary/terminology overrides for this business type
  vocabulary JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {
  --   "product": "Formulation",
  --   "ingredient": "Raw Material",
  --   "customer": "Brand Partner"
  -- }
  
  -- Default categories for this business type
  default_categories JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: ["Serums", "Moisturizers", "Cleansers"]
  
  -- Product field configuration (which fields to show/require)
  product_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {
  --   "required": ["name", "sku"],
  --   "optional": ["description", "price"],
  --   "hidden": ["formulation_id"]
  -- }
  
  -- AI context hints for Madison
  ai_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {
  --   "industry_terms": ["MOQ", "lead time", "formulation"],
  --   "content_focus": "B2B marketing, technical specifications",
  --   "tone_hints": "Professional, technical accuracy important"
  -- }
  
  -- Onboarding customization
  onboarding_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Example: {
  --   "welcome_message": "Welcome to Madison Studio for Cosmetic Brands!",
  --   "suggested_first_steps": ["Upload product images", "Add your hero product"],
  --   "skip_sections": ["packaging_setup"]
  -- }
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for active configs
CREATE INDEX IF NOT EXISTS idx_business_type_config_active 
ON public.business_type_config(is_active, sort_order);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 3: SEED BUSINESS TYPE CONFIGURATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Finished Goods (Cosmetic Brands, Skincare Companies, etc.)
INSERT INTO public.business_type_config (
  business_type,
  display_name,
  description,
  icon,
  enabled_sections,
  vocabulary,
  default_categories,
  product_fields,
  ai_context,
  onboarding_config,
  sort_order
) VALUES (
  'finished_goods',
  'Finished Goods Brand',
  'You sell complete products directly to consumers or retailers (cosmetics, skincare, haircare, etc.)',
  'sparkles',
  '{
    "products": true,
    "ingredients": true,
    "specifications": true,
    "packaging": true,
    "formulations": false,
    "customers": true,
    "retail_channels": true,
    "marketing_campaigns": true,
    "social_media": true,
    "email_marketing": true,
    "blog_content": true,
    "product_photography": true
  }'::jsonb,
  '{
    "product": "Product",
    "products": "Products",
    "ingredient": "Ingredient",
    "customer": "Customer",
    "order": "Order",
    "catalog": "Product Catalog"
  }'::jsonb,
  '["Skincare", "Haircare", "Body Care", "Cosmetics", "Fragrance", "Wellness", "Sun Care", "Men''s Grooming"]'::jsonb,
  '{
    "required": ["name", "short_description"],
    "recommended": ["price", "hero_image_id", "key_benefits", "ingredients"],
    "optional": ["sku", "barcode", "long_description", "seo_title", "seo_description"],
    "hidden": []
  }'::jsonb,
  '{
    "industry_terms": ["hero ingredient", "clean beauty", "sustainable", "cruelty-free", "vegan", "formulation", "texture", "finish"],
    "content_focus": "Consumer marketing, lifestyle storytelling, ingredient education, brand building",
    "tone_hints": "Aspirational yet authentic, educational, emotionally resonant",
    "target_audience": "End consumers, beauty enthusiasts, conscious shoppers"
  }'::jsonb,
  '{
    "welcome_message": "Welcome to Madison Studio! Let''s build your brand''s marketing engine.",
    "suggested_first_steps": [
      "Add your hero product",
      "Upload brand guidelines",
      "Generate your first blog post"
    ],
    "skip_sections": []
  }'::jsonb,
  1
) ON CONFLICT (business_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  enabled_sections = EXCLUDED.enabled_sections,
  vocabulary = EXCLUDED.vocabulary,
  default_categories = EXCLUDED.default_categories,
  product_fields = EXCLUDED.product_fields,
  ai_context = EXCLUDED.ai_context,
  onboarding_config = EXCLUDED.onboarding_config,
  updated_at = NOW();

-- Bottles & Vessels (Container Manufacturers)
INSERT INTO public.business_type_config (
  business_type,
  display_name,
  description,
  icon,
  enabled_sections,
  vocabulary,
  default_categories,
  product_fields,
  ai_context,
  onboarding_config,
  sort_order
) VALUES (
  'bottles_vessels',
  'Bottles & Vessels Manufacturer',
  'You manufacture containers, bottles, jars, tubes, and vessels for beauty/personal care brands',
  'flask-conical',
  '{
    "products": true,
    "ingredients": false,
    "specifications": true,
    "packaging": false,
    "formulations": false,
    "customers": true,
    "retail_channels": false,
    "marketing_campaigns": true,
    "social_media": true,
    "email_marketing": true,
    "blog_content": true,
    "product_photography": true,
    "technical_specs": true,
    "moq_pricing": true,
    "materials": true
  }'::jsonb,
  '{
    "product": "Container",
    "products": "Containers",
    "ingredient": "Material",
    "customer": "Brand Partner",
    "order": "Purchase Order",
    "catalog": "Container Catalog",
    "price": "Unit Price",
    "inventory": "Stock"
  }'::jsonb,
  '["Glass Bottles", "Plastic Bottles", "Jars", "Tubes", "Pumps & Dispensers", "Droppers", "Airless", "Roll-Ons", "Compacts", "Closures"]'::jsonb,
  '{
    "required": ["name", "sku", "container_type", "material"],
    "recommended": ["volume", "dimensions", "moq", "lead_time"],
    "optional": ["description", "weight", "color_options", "decoration_options"],
    "hidden": ["ingredients", "formulation_id"]
  }'::jsonb,
  '{
    "industry_terms": ["MOQ", "lead time", "tooling", "decoration", "silk screen", "hot stamp", "frosted", "PCR", "recyclable", "refillable"],
    "content_focus": "B2B marketing, technical specifications, sustainability credentials, customization capabilities",
    "tone_hints": "Professional, technically accurate, reliability-focused, partnership-oriented",
    "target_audience": "Brand founders, packaging managers, procurement teams, product developers"
  }'::jsonb,
  '{
    "welcome_message": "Welcome to Madison Studio for Container Manufacturers!",
    "suggested_first_steps": [
      "Add your bestselling containers",
      "Upload technical spec sheets",
      "Set up your B2B content strategy"
    ],
    "skip_sections": ["ingredients_setup", "formulation_setup"]
  }'::jsonb,
  2
) ON CONFLICT (business_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  enabled_sections = EXCLUDED.enabled_sections,
  vocabulary = EXCLUDED.vocabulary,
  default_categories = EXCLUDED.default_categories,
  product_fields = EXCLUDED.product_fields,
  ai_context = EXCLUDED.ai_context,
  onboarding_config = EXCLUDED.onboarding_config,
  updated_at = NOW();

-- Packaging & Boxes (Secondary Packaging Manufacturers)
INSERT INTO public.business_type_config (
  business_type,
  display_name,
  description,
  icon,
  enabled_sections,
  vocabulary,
  default_categories,
  product_fields,
  ai_context,
  onboarding_config,
  sort_order
) VALUES (
  'packaging_boxes',
  'Packaging & Boxes Manufacturer',
  'You manufacture secondary packaging like boxes, cartons, labels, and display units',
  'box',
  '{
    "products": true,
    "ingredients": false,
    "specifications": true,
    "packaging": false,
    "formulations": false,
    "customers": true,
    "retail_channels": false,
    "marketing_campaigns": true,
    "social_media": true,
    "email_marketing": true,
    "blog_content": true,
    "product_photography": true,
    "technical_specs": true,
    "moq_pricing": true,
    "materials": true,
    "print_specs": true
  }'::jsonb,
  '{
    "product": "Packaging",
    "products": "Packaging Solutions",
    "ingredient": "Material",
    "customer": "Brand Client",
    "order": "Production Order",
    "catalog": "Packaging Catalog",
    "price": "Unit Price"
  }'::jsonb,
  '["Folding Cartons", "Rigid Boxes", "Labels", "Sleeves", "Inserts", "Display Units", "Gift Sets", "Shipping Boxes", "Pouches", "Bags"]'::jsonb,
  '{
    "required": ["name", "sku", "packaging_type", "material"],
    "recommended": ["dimensions", "moq", "lead_time", "print_method"],
    "optional": ["description", "gsm", "finish_options", "certification"],
    "hidden": ["ingredients", "formulation_id"]
  }'::jsonb,
  '{
    "industry_terms": ["GSM", "die-cut", "embossing", "debossing", "foil stamp", "spot UV", "FSC certified", "sustainable", "biodegradable", "structural design"],
    "content_focus": "B2B marketing, print capabilities, sustainability, design services, quick turnaround",
    "tone_hints": "Professional, creative, quality-focused, solution-oriented",
    "target_audience": "Brand managers, creative directors, procurement teams, marketing managers"
  }'::jsonb,
  '{
    "welcome_message": "Welcome to Madison Studio for Packaging Manufacturers!",
    "suggested_first_steps": [
      "Showcase your packaging capabilities",
      "Add portfolio examples",
      "Create content highlighting your printing expertise"
    ],
    "skip_sections": ["ingredients_setup", "formulation_setup"]
  }'::jsonb,
  3
) ON CONFLICT (business_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  enabled_sections = EXCLUDED.enabled_sections,
  vocabulary = EXCLUDED.vocabulary,
  default_categories = EXCLUDED.default_categories,
  product_fields = EXCLUDED.product_fields,
  ai_context = EXCLUDED.ai_context,
  onboarding_config = EXCLUDED.onboarding_config,
  updated_at = NOW();

-- Raw Materials (Ingredient Suppliers)
INSERT INTO public.business_type_config (
  business_type,
  display_name,
  description,
  icon,
  enabled_sections,
  vocabulary,
  default_categories,
  product_fields,
  ai_context,
  onboarding_config,
  sort_order
) VALUES (
  'raw_materials',
  'Raw Materials Supplier',
  'You supply ingredients, actives, fragrances, or raw materials to cosmetic manufacturers',
  'flask-round',
  '{
    "products": true,
    "ingredients": true,
    "specifications": true,
    "packaging": false,
    "formulations": true,
    "customers": true,
    "retail_channels": false,
    "marketing_campaigns": true,
    "social_media": true,
    "email_marketing": true,
    "blog_content": true,
    "product_photography": true,
    "technical_specs": true,
    "moq_pricing": true,
    "certifications": true,
    "regulatory": true
  }'::jsonb,
  '{
    "product": "Ingredient",
    "products": "Ingredients",
    "ingredient": "Component",
    "customer": "Formulator",
    "order": "Purchase Order",
    "catalog": "Ingredient Portfolio",
    "price": "Price/kg"
  }'::jsonb,
  '["Active Ingredients", "Emollients", "Emulsifiers", "Preservatives", "Fragrances", "Colorants", "Surfactants", "Thickeners", "Botanicals", "Peptides"]'::jsonb,
  '{
    "required": ["name", "inci_name", "cas_number"],
    "recommended": ["function", "usage_level", "moq", "certifications"],
    "optional": ["description", "origin", "sustainability_info", "documentation"],
    "hidden": []
  }'::jsonb,
  '{
    "industry_terms": ["INCI", "CAS number", "usage level", "solubility", "pH range", "stability", "REACH", "COSMOS", "Ecocert", "natural origin"],
    "content_focus": "Technical marketing, formulation support, regulatory compliance, innovation stories, sustainability",
    "tone_hints": "Scientific, authoritative, supportive, innovation-focused",
    "target_audience": "Cosmetic chemists, formulators, R&D teams, procurement managers"
  }'::jsonb,
  '{
    "welcome_message": "Welcome to Madison Studio for Ingredient Suppliers!",
    "suggested_first_steps": [
      "Add your star ingredients",
      "Upload technical data sheets",
      "Create formulation inspiration content"
    ],
    "skip_sections": ["retail_channels_setup"]
  }'::jsonb,
  4
) ON CONFLICT (business_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  enabled_sections = EXCLUDED.enabled_sections,
  vocabulary = EXCLUDED.vocabulary,
  default_categories = EXCLUDED.default_categories,
  product_fields = EXCLUDED.product_fields,
  ai_context = EXCLUDED.ai_context,
  onboarding_config = EXCLUDED.onboarding_config,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 4: RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on business_type_config (public read, admin write)
ALTER TABLE public.business_type_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read active business type configs
CREATE POLICY "business_type_config_public_read"
ON public.business_type_config FOR SELECT
USING (is_active = true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 5: HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Function to get business type config for an organization
CREATE OR REPLACE FUNCTION public.get_org_business_type_config(org_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  org_business_type public.business_type;
BEGIN
  -- Get the organization's business type
  SELECT business_type INTO org_business_type
  FROM public.organizations
  WHERE id = org_id;
  
  -- If no business type set, return default (finished_goods) config
  IF org_business_type IS NULL THEN
    org_business_type := 'finished_goods';
  END IF;
  
  -- Get the config
  SELECT jsonb_build_object(
    'business_type', btc.business_type,
    'display_name', btc.display_name,
    'description', btc.description,
    'icon', btc.icon,
    'enabled_sections', btc.enabled_sections,
    'vocabulary', btc.vocabulary,
    'default_categories', btc.default_categories,
    'product_fields', btc.product_fields,
    'ai_context', btc.ai_context,
    'onboarding_config', btc.onboarding_config
  ) INTO result
  FROM public.business_type_config btc
  WHERE btc.business_type = org_business_type
    AND btc.is_active = true;
  
  RETURN COALESCE(result, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.get_org_business_type_config(UUID) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- PART 6: UPDATED_AT TRIGGER
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TRIGGER update_business_type_config_updated_at
  BEFORE UPDATE ON public.business_type_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE public.business_type_config IS 'Configuration for different business types - defines sections, vocabulary, and AI context';
COMMENT ON COLUMN public.organizations.business_type IS 'The type of business this organization represents';
