-- Phase 1: Add category and category-specific fields to brand_products
ALTER TABLE brand_products 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'personal_fragrance',
ADD COLUMN IF NOT EXISTS scent_profile text,
ADD COLUMN IF NOT EXISTS format text,
ADD COLUMN IF NOT EXISTS burn_time text,
ADD COLUMN IF NOT EXISTS key_ingredients text,
ADD COLUMN IF NOT EXISTS benefits text,
ADD COLUMN IF NOT EXISTS usage text,
ADD COLUMN IF NOT EXISTS formulation_type text,
ADD COLUMN IF NOT EXISTS usp text,
ADD COLUMN IF NOT EXISTS tone text;

-- Migrate existing products based on their data
UPDATE brand_products
SET category = CASE
  WHEN product_type ILIKE '%candle%' OR product_type ILIKE '%diffuser%' OR product_type ILIKE '%incense%' OR product_type ILIKE '%room spray%' THEN 'home_fragrance'
  WHEN product_type ILIKE '%serum%' OR product_type ILIKE '%cream%' OR product_type ILIKE '%oil%' OR product_type ILIKE '%balm%' THEN 'skincare'
  WHEN top_notes IS NOT NULL OR middle_notes IS NOT NULL OR base_notes IS NOT NULL THEN 'personal_fragrance'
  ELSE 'personal_fragrance'
END
WHERE category = 'personal_fragrance';

-- Add check constraint for category
ALTER TABLE brand_products
ADD CONSTRAINT brand_products_category_check 
CHECK (category IN ('personal_fragrance', 'home_fragrance', 'skincare'));