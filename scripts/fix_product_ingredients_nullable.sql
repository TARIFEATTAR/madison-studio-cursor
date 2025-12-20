-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: Make ingredient_id nullable in product_ingredients
-- ═══════════════════════════════════════════════════════════════════════════════
-- Problem: ingredient_id is NOT NULL, but we need to allow manual ingredient entries
-- without linking to the ingredient_library
--
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Drop the NOT NULL constraint on ingredient_id
ALTER TABLE public.product_ingredients 
ALTER COLUMN ingredient_id DROP NOT NULL;

-- Step 2: Drop the unique constraint that might conflict
-- (We'll recreate it to handle NULL ingredient_ids)
ALTER TABLE public.product_ingredients
DROP CONSTRAINT IF EXISTS unique_product_ingredient;

-- Step 3: Create a new unique constraint that handles both cases
-- - If ingredient_id is NOT NULL: ensure unique combo of product_id + ingredient_id
-- - If ingredient_id IS NULL: allow multiple manual entries per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_ingredients_unique_library
ON public.product_ingredients(product_id, ingredient_id)
WHERE ingredient_id IS NOT NULL;

-- Step 4: Verify the change
SELECT 
  column_name, 
  is_nullable,
  data_type
FROM information_schema.columns 
WHERE table_name = 'product_ingredients' 
  AND column_name = 'ingredient_id';

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════════════════
-- EXPECTED RESULT: 
-- ingredient_id should now show is_nullable = 'YES'
-- ═══════════════════════════════════════════════════════════════════════════════
