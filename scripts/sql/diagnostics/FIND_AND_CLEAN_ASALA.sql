-- ============================================
-- STEP 1: Find Your Organization ID
-- ============================================

-- Find organization by your email
SELECT 
  o.id as org_id,
  o.name as org_name,
  om.role,
  u.email
FROM organizations o
JOIN organization_members om ON om.organization_id = o.id
JOIN auth.users u ON u.id = om.user_id
WHERE u.email = 'jordan@asala.ai';

-- OR find by organization name
SELECT id, name, created_at
FROM organizations
WHERE name ILIKE '%asala%';

-- OR find by documents
SELECT DISTINCT organization_id
FROM brand_documents
WHERE file_name LIKE '%ASALA%';

-- ============================================
-- STEP 2: Once you have the FULL org ID, use it below
-- Replace 'YOUR_FULL_ORG_ID_HERE' with the actual UUID
-- ============================================

-- 1. Delete old fragrance categories
DELETE FROM brand_knowledge 
WHERE organization_id = 'YOUR_FULL_ORG_ID_HERE'
AND knowledge_type IN (
  'category_personal_fragrance',
  'category_home_fragrance',
  'category_skincare'
);

-- 2. Check how many Asala documents exist
SELECT 
  id,
  file_name,
  created_at,
  processing_status
FROM brand_documents 
WHERE organization_id = 'YOUR_FULL_ORG_ID_HERE'
AND file_name LIKE '%ASALA%'
ORDER BY created_at DESC;

-- 3. Delete duplicate documents (keep only the newest)
-- First, see which ones will be deleted (DRY RUN):
SELECT 
  id,
  file_name,
  created_at,
  'WILL BE DELETED' as action
FROM brand_documents 
WHERE id IN (
  SELECT id 
  FROM brand_documents 
  WHERE organization_id = 'YOUR_FULL_ORG_ID_HERE'
  AND file_name LIKE '%ASALA%'
  ORDER BY created_at DESC
  OFFSET 1
);

-- If that looks right, run the actual delete:
DELETE FROM brand_documents 
WHERE id IN (
  SELECT id 
  FROM brand_documents 
  WHERE organization_id = 'YOUR_FULL_ORG_ID_HERE'
  AND file_name LIKE '%ASALA%'
  ORDER BY created_at DESC
  OFFSET 1
);

-- 4. Delete all old brand_knowledge entries for fresh start
DELETE FROM brand_knowledge
WHERE organization_id = 'YOUR_FULL_ORG_ID_HERE';

-- ============================================
-- STEP 3: Verify cleanup
-- ============================================

-- Should return 0 rows
SELECT COUNT(*) as fragrance_categories_remaining
FROM brand_knowledge 
WHERE organization_id = 'YOUR_FULL_ORG_ID_HERE'
AND knowledge_type LIKE 'category_%';

-- Should return 1 document
SELECT COUNT(*) as asala_documents_remaining
FROM brand_documents 
WHERE organization_id = 'YOUR_FULL_ORG_ID_HERE'
AND file_name LIKE '%ASALA%';

-- Should return 0 (fresh start)
SELECT COUNT(*) as brand_knowledge_entries
FROM brand_knowledge
WHERE organization_id = 'YOUR_FULL_ORG_ID_HERE';
