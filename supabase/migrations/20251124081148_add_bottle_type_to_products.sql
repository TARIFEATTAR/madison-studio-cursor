-- Add bottle_type column to brand_products for explicit control over oil vs spray detection
-- This allows users to explicitly set bottle type, overriding automatic detection

ALTER TABLE public.brand_products
ADD COLUMN IF NOT EXISTS bottle_type TEXT CHECK (bottle_type IN ('oil', 'spray', 'auto'));

-- Add comment explaining the column
COMMENT ON COLUMN public.brand_products.bottle_type IS 
'Explicit bottle type: "oil" = dropper/roller (no spray), "spray" = atomizer (no dropper), "auto" = auto-detect from other fields (default). If NULL, defaults to "auto".';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_brand_products_bottle_type 
ON public.brand_products(bottle_type) 
WHERE bottle_type IS NOT NULL;

-- Set default to 'auto' for existing products (backward compatible)
UPDATE public.brand_products
SET bottle_type = 'auto'
WHERE bottle_type IS NULL;

-- For products that are clearly oils, set bottle_type to 'oil' based on existing data
UPDATE public.brand_products
SET bottle_type = 'oil'
WHERE bottle_type = 'auto'
AND (
  LOWER(name) LIKE '%oil%' OR
  LOWER(name) LIKE '%attar%' OR
  LOWER(name) LIKE '%roller%' OR
  LOWER(name) LIKE '%dropper%' OR
  LOWER(format) LIKE '%oil%' OR
  LOWER(format) LIKE '%roller%' OR
  LOWER(format) LIKE '%dropper%' OR
  LOWER(product_type) LIKE '%oil%' OR
  category = 'skincare'
);

-- For products that are clearly sprays, set bottle_type to 'spray'
UPDATE public.brand_products
SET bottle_type = 'spray'
WHERE bottle_type = 'auto'
AND (
  (LOWER(name) LIKE '%spray%' OR LOWER(format) LIKE '%spray%' OR LOWER(product_type) LIKE '%spray%')
  AND NOT (LOWER(name) LIKE '%oil%' OR LOWER(format) LIKE '%oil%' OR LOWER(product_type) LIKE '%oil%')
  AND NOT (LOWER(name) LIKE '%perfume oil%' OR LOWER(name) LIKE '%fragrance oil%')
);


