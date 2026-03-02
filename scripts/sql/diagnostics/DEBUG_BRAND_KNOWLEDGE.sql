-- DEBUG: Check what brand knowledge exists for Asala organization
-- Run this in Supabase SQL Editor

-- 1. Find the organization
SELECT id, name, created_at, brand_config 
FROM organizations 
WHERE id = '6efb188c-a5c9-4047-b77a-4267b04';

-- 2. Check brand_knowledge entries
SELECT 
  id,
  knowledge_type,
  is_active,
  created_at,
  content::text as content_preview
FROM brand_knowledge 
WHERE organization_id = '6efb188c-a5c9-4047-b77a-4267b04'
ORDER BY created_at DESC;

-- 3. Check brand_documents
SELECT 
  id,
  file_name,
  processing_status,
  created_at,
  LENGTH(extracted_content) as content_length,
  LEFT(extracted_content, 500) as content_preview
FROM brand_documents 
WHERE organization_id = '6efb188c-a5c9-4047-b77a-4267b04'
AND file_name LIKE '%ASALA%'
ORDER BY created_at DESC;

-- 4. Check if documents were processed
SELECT 
  bd.file_name,
  bd.processing_status,
  bd.created_at as uploaded_at,
  COUNT(bk.id) as knowledge_entries_created
FROM brand_documents bd
LEFT JOIN brand_knowledge bk ON bk.document_id = bd.id
WHERE bd.organization_id = '6efb188c-a5c9-4047-b77a-4267b04'
AND bd.file_name LIKE '%ASALA%'
GROUP BY bd.id, bd.file_name, bd.processing_status, bd.created_at
ORDER BY bd.created_at DESC;

-- 5. Check brand_dna
SELECT *
FROM brand_dna
WHERE org_id = '6efb188c-a5c9-4047-b77a-4267b04';
