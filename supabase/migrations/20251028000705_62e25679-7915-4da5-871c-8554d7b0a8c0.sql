
-- Deactivate the visual_standards entry that contains the image generation system
-- This is NOT the brand guidelines, it's the comprehensive artifact system
UPDATE brand_knowledge
SET is_active = false,
    updated_at = now()
WHERE id = '8cacb523-4709-4413-bd68-283e9d8e561d'
  AND knowledge_type = 'visual_standards';

-- Add a comment for tracking
COMMENT ON TABLE brand_knowledge IS 'Deactivated visual_standards entry (60KB image generation system) on 2025-10-27. Awaiting clean brand guidelines upload.';
