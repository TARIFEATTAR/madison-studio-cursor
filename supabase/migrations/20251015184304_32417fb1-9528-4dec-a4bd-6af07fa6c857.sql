-- Phase 1: Clean up duplicate collections and rename
-- Step 1: Identify the primary organization (the one with products)
-- Step 2: Delete duplicate collection entries from other organizations
DELETE FROM brand_collections 
WHERE name IN ('Cadence', 'Sacred Space')
AND organization_id NOT IN (
  SELECT DISTINCT organization_id 
  FROM brand_products 
  WHERE collection IN ('Cadence', 'Sacred Space')
  LIMIT 1
);

-- Step 3: Rename Cadence to Humanities
UPDATE brand_collections 
SET name = 'Humanities',
    description = COALESCE(description, 'Composed fragrances - aromatic blends of natural and synthetic materials'),
    updated_at = now()
WHERE name = 'Cadence';

-- Step 4: Rename Sacred Space to Elemental
UPDATE brand_collections 
SET name = 'Elemental',
    description = COALESCE(description, 'Natural resins and incense - traditional burning materials'),
    updated_at = now()
WHERE name = 'Sacred Space';

-- Step 5: Update all product references
UPDATE brand_products 
SET collection = 'Humanities',
    updated_at = now()
WHERE collection = 'Cadence';

UPDATE brand_products 
SET collection = 'Elemental',
    updated_at = now()
WHERE collection = 'Sacred Space';

-- Step 6: Update all prompt references (normalize to lowercase)
UPDATE prompts 
SET collection = 'humanities',
    updated_at = now()
WHERE collection IN ('cadence', 'Cadence');

UPDATE prompts 
SET collection = 'elemental',
    updated_at = now()
WHERE collection IN ('sacred space', 'Sacred Space', 'sacred_space');

-- Add helpful comment
COMMENT ON COLUMN brand_collections.name IS 'Collection name: Humanities (Composed), Purity (100% pure), Elemental (Natural Resins & Incense)';
COMMENT ON COLUMN brand_products.collection IS 'Product collection: Humanities (Composed), Purity (100% pure), Elemental (Natural Resins & Incense)';