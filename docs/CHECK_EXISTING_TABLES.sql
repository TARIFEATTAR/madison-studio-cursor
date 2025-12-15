-- ═══════════════════════════════════════════════════════════════════════════════
-- CHECK EXISTING BRAND TABLES - Run this to see what you have
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. List all brand-related tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE '%brand%'
ORDER BY table_name;

-- 2. Check if brand_dna exists (it shouldn't be in your list)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'brand_dna'
    ) THEN 'EXISTS - Check columns below'
    ELSE 'DOES NOT EXIST - Safe to create'
  END as brand_dna_status;

-- 3. If brand_dna exists, check its columns
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brand_dna'
ORDER BY ordinal_position;

-- 4. Check existing brand_products table columns (to see if it uses organization_id)
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brand_products'
ORDER BY ordinal_position;

-- 5. Check for any functions that reference org_id
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND (
  routine_definition LIKE '%org_id%' 
  OR routine_definition LIKE '%brand_dna%'
)
ORDER BY routine_name;

-- 6. Check for RLS policies on brand_dna (if table exists)
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'brand_dna';










