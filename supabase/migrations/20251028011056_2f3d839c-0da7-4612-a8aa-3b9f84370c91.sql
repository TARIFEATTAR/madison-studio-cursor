-- Delete all visual_standards entries for clean slate
-- This clears the way for a new comprehensive visual directive document
DELETE FROM brand_knowledge
WHERE id IN (
  '6842735c-88e1-40ac-956c-0b40a3400cd8',  -- 12KB active: Product Shot templates from Brand Guidelines V4
  '8cacb523-4709-4413-bd68-283e9d8e561d',  -- 60KB inactive: Comprehensive Artifact & Platform System
  '1bd01bf4-d021-4fdd-a902-2ede36259758'   -- 57KB inactive: General VLM Prompt Structure
)
AND knowledge_type = 'visual_standards';

-- Verify deletion
SELECT COUNT(*) as remaining_visual_standards
FROM brand_knowledge
WHERE organization_id IN (SELECT id FROM organizations WHERE name = 'Tarife Attar' LIMIT 1)
AND knowledge_type = 'visual_standards';