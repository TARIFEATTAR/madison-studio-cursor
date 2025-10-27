-- Phase 1: Activate Document 02 (Comprehensive Artifact & Platform System)
UPDATE brand_knowledge
SET is_active = true,
    updated_at = now()
WHERE organization_id IN (
  SELECT id FROM organizations 
  WHERE name ILIKE '%Tarife%' OR name ILIKE '%Attär%'
)
AND knowledge_type = 'visual_standards'
AND is_active = false;

-- Verification: Check active brand knowledge
-- This should now show 2 active documents totaling ~117KB
SELECT 
  knowledge_type,
  is_active,
  LENGTH(content::text) as content_bytes,
  created_at
FROM brand_knowledge
WHERE organization_id IN (
  SELECT id FROM organizations 
  WHERE name ILIKE '%Tarife%' OR name ILIKE '%Attär%'
)
ORDER BY created_at;