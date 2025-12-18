-- ═══════════════════════════════════════════════════════════════════════════════
-- DIAGNOSTIC QUERIES - Run these in SQL Editor to diagnose the issue
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Check if brand_dna table exists
SELECT 
  'brand_dna table exists' as check_name,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'brand_dna'
  ) as result;

-- 2. If it exists, check what columns it has
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brand_dna'
ORDER BY ordinal_position;

-- 3. Check all brand-related tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%brand%'
ORDER BY table_name;

-- 4. Check if there are any RLS policies on brand_dna
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'brand_dna';

-- 5. Check for functions that reference brand_dna
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition LIKE '%brand_dna%';














