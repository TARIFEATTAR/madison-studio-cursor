-- Add visual specification and AI instruction fields to brand_products table

-- Core Product Identity (handle already exists as unique constraint)
ALTER TABLE brand_products
  ADD COLUMN IF NOT EXISTS handle TEXT,
  ADD COLUMN IF NOT EXISTS collection_tier TEXT,
  ADD COLUMN IF NOT EXISTS scent_family_detailed TEXT;

-- Visual DNA Fields
ALTER TABLE brand_products
  ADD COLUMN IF NOT EXISTS platform_type TEXT,
  ADD COLUMN IF NOT EXISTS platform_material TEXT,
  ADD COLUMN IF NOT EXISTS visual_world TEXT,
  ADD COLUMN IF NOT EXISTS visual_world_week INTEGER,
  ADD COLUMN IF NOT EXISTS color_palette_hex_codes TEXT,
  ADD COLUMN IF NOT EXISTS lighting_spec TEXT,
  ADD COLUMN IF NOT EXISTS lighting_direction TEXT,
  ADD COLUMN IF NOT EXISTS depth_of_field TEXT,
  ADD COLUMN IF NOT EXISTS composition_style TEXT,
  ADD COLUMN IF NOT EXISTS aspect_ratio_primary TEXT,
  ADD COLUMN IF NOT EXISTS shadow_treatment TEXT,
  ADD COLUMN IF NOT EXISTS image_type_primary TEXT,
  ADD COLUMN IF NOT EXISTS textile_backdrop TEXT;

-- Archetype & Context Fields
ALTER TABLE brand_products
  ADD COLUMN IF NOT EXISTS archetype_hero_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archetype_flatlay_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archetype_lived_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archetype_travel_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archetype_environmental_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS archetype_ritual_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hero_primary_artifacts TEXT,
  ADD COLUMN IF NOT EXISTS hero_artifact_placement TEXT,
  ADD COLUMN IF NOT EXISTS flatlay_ingredients TEXT,
  ADD COLUMN IF NOT EXISTS lived_life_context TEXT,
  ADD COLUMN IF NOT EXISTS travel_context TEXT,
  ADD COLUMN IF NOT EXISTS environmental_location TEXT,
  ADD COLUMN IF NOT EXISTS ritual_skin_tone TEXT;

-- Scent Profile Extended
ALTER TABLE brand_products
  ADD COLUMN IF NOT EXISTS longevity_hours TEXT,
  ADD COLUMN IF NOT EXISTS sillage_description TEXT;

-- Brand Philosophy & Messaging
ALTER TABLE brand_products
  ADD COLUMN IF NOT EXISTS dip_layer_moral TEXT,
  ADD COLUMN IF NOT EXISTS moral_philosophy TEXT,
  ADD COLUMN IF NOT EXISTS philosophy_keywords TEXT,
  ADD COLUMN IF NOT EXISTS semantic_categories TEXT,
  ADD COLUMN IF NOT EXISTS approved_descriptors TEXT,
  ADD COLUMN IF NOT EXISTS primary_avatar TEXT,
  ADD COLUMN IF NOT EXISTS avatar_motivation TEXT,
  ADD COLUMN IF NOT EXISTS use_case_primary TEXT,
  ADD COLUMN IF NOT EXISTS occasion_tags TEXT,
  ADD COLUMN IF NOT EXISTS transparency_statement TEXT,
  ADD COLUMN IF NOT EXISTS craftsmanship_term TEXT,
  ADD COLUMN IF NOT EXISTS ingredient_disclosure TEXT;

-- AI Instructions
ALTER TABLE brand_products
  ADD COLUMN IF NOT EXISTS prompt_template_id TEXT,
  ADD COLUMN IF NOT EXISTS use_case_templates TEXT;

-- Create index on handle for faster lookups
CREATE INDEX IF NOT EXISTS idx_brand_products_handle ON brand_products(handle);
CREATE INDEX IF NOT EXISTS idx_brand_products_collection_tier ON brand_products(collection_tier);
CREATE INDEX IF NOT EXISTS idx_brand_products_visual_world ON brand_products(visual_world);

-- Add unique constraint on handle per organization
ALTER TABLE brand_products
  DROP CONSTRAINT IF EXISTS brand_products_handle_organization_id_key;
  
ALTER TABLE brand_products
  ADD CONSTRAINT brand_products_handle_organization_id_key 
  UNIQUE (handle, organization_id);