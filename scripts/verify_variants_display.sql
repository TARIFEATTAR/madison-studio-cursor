-- Quick verification script to check if variants are being stored correctly
-- Run this to see if your products have variants with SKUs

-- Check if variants column exists
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'product_hubs'
  AND column_name IN ('variants', 'options');

-- Check products with variants (showing first 5)
SELECT
  id,
  name,
  sku as primary_sku,
  jsonb_array_length(variants) as variant_count,
  variants,
  options
FROM product_hubs
WHERE jsonb_array_length(variants) > 0
ORDER BY updated_at DESC
LIMIT 5;

-- Check a specific product by name (replace 'ADEN' with your product name)
SELECT
  name,
  sku as primary_sku,
  jsonb_array_length(variants) as variant_count,
  jsonb_pretty(variants) as variants_json,
  jsonb_pretty(options) as options_json
FROM product_hubs
WHERE name ILIKE '%ADEN%'
LIMIT 1;
