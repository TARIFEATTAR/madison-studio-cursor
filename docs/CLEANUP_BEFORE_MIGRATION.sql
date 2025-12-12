-- ═══════════════════════════════════════════════════════════════════════════════
-- SAFE CLEANUP - Only drops things that exist
-- Run this BEFORE the main migration
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop functions first (they don't depend on tables existing)
DROP FUNCTION IF EXISTS public.get_brand_dna(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.match_writing_examples(extensions.vector, FLOAT, INT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.match_visual_examples(extensions.vector, FLOAT, INT, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.get_masters_by_squad(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_master_by_name(TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_schwartz_template(TEXT) CASCADE;

-- Drop tables (CASCADE will drop dependent policies automatically)
DROP TABLE IF EXISTS public.brand_dna CASCADE;
DROP TABLE IF EXISTS public.brand_products CASCADE;
DROP TABLE IF EXISTS public.design_systems CASCADE;
DROP TABLE IF EXISTS public.brand_writing_examples CASCADE;
DROP TABLE IF EXISTS public.brand_visual_examples CASCADE;
DROP TABLE IF EXISTS public.generated_content CASCADE;
DROP TABLE IF EXISTS public.madison_masters CASCADE;
DROP TABLE IF EXISTS public.visual_masters CASCADE;
DROP TABLE IF EXISTS public.schwartz_templates CASCADE;

-- Verify cleanup
DO $$
BEGIN
  RAISE NOTICE 'Cleanup complete. Safe to run main migration now.';
END $$;
