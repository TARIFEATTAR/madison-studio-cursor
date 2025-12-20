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

-- Step 2: Drop ALL existing unique constraints/indexes on this table
ALTER TABLE public.product_ingredients
DROP CONSTRAINT IF EXISTS unique_product_ingredient;

DROP INDEX IF EXISTS idx_product_ingredients_unique_library;

-- Step 3: Create a new partial unique index that only applies when ingredient_id is NOT NULL
-- This allows:
-- - Multiple manual entries (ingredient_id IS NULL) per product
-- - Only ONE entry per (product_id, ingredient_id) when linking to library
CREATE UNIQUE INDEX idx_product_ingredients_unique_library
ON public.product_ingredients(product_id, ingredient_id)
WHERE ingredient_id IS NOT NULL;

-- Step 4: Verify the column is nullable
SELECT 
  column_name, 
  is_nullable,
  data_type
FROM information_schema.columns 
WHERE table_name = 'product_ingredients' 
  AND column_name = 'ingredient_id';

-- Step 5: Check indexes on the table
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'product_ingredients';

-- Step 6: Check constraints on the table
SELECT
    conname AS constraint_name,
    contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'public.product_ingredients'::regclass;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- ═══════════════════════════════════════════════════════════════════════════════
-- EXPECTED RESULT: 
-- ingredient_id should now show is_nullable = 'YES'
-- No unique_product_ingredient constraint should exist
-- idx_product_ingredients_unique_library should be a partial unique index
-- ═══════════════════════════════════════════════════════════════════════════════
