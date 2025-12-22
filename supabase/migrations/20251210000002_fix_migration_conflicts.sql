-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX MIGRATION CONFLICTS
-- Run this BEFORE the main migration if you get "column org_id does not exist"
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop existing tables if they have wrong schema
-- This is safe because the main migration will recreate them

DO $$
BEGIN
  -- Check and drop brand_dna if it exists with wrong column name
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'brand_dna'
  ) THEN
    -- Check if it has organization_id instead of org_id
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'brand_dna' 
      AND column_name = 'organization_id'
    ) THEN
      RAISE NOTICE 'Dropping existing brand_dna table (has organization_id, needs org_id)';
      DROP TABLE IF EXISTS public.brand_dna CASCADE;
    END IF;
  END IF;

  -- Drop other tables that might conflict
  DROP TABLE IF EXISTS public.brand_products CASCADE;
  DROP TABLE IF EXISTS public.design_systems CASCADE;
  DROP TABLE IF EXISTS public.brand_writing_examples CASCADE;
  DROP TABLE IF EXISTS public.brand_visual_examples CASCADE;
  DROP TABLE IF EXISTS public.generated_content CASCADE;
  
  -- Drop functions that might reference wrong columns
  DROP FUNCTION IF EXISTS public.match_writing_examples(extensions.vector, FLOAT, INT, UUID) CASCADE;
  DROP FUNCTION IF EXISTS public.match_visual_examples(extensions.vector, FLOAT, INT, UUID) CASCADE;
  DROP FUNCTION IF EXISTS public.get_brand_dna(UUID) CASCADE;
  
  RAISE NOTICE 'Cleanup complete - safe to run main migration now';
END $$;




















