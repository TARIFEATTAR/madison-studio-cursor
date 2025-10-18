-- Add publishing tracking fields to master_content
ALTER TABLE master_content 
ADD COLUMN published_to JSONB DEFAULT '[]'::jsonb,
ADD COLUMN external_urls JSONB DEFAULT '{}'::jsonb,
ADD COLUMN publish_notes TEXT;

-- Add publishing tracking fields to derivative_assets
ALTER TABLE derivative_assets 
ADD COLUMN published_to JSONB DEFAULT '[]'::jsonb,
ADD COLUMN external_urls JSONB DEFAULT '{}'::jsonb,
ADD COLUMN publish_notes TEXT;

-- Add comments for documentation
COMMENT ON COLUMN master_content.published_to IS 'Array of platform names where content is published (e.g., ["facebook", "instagram"])';
COMMENT ON COLUMN master_content.external_urls IS 'Object mapping platforms to URLs (e.g., {"facebook": "https://..."})';
COMMENT ON COLUMN master_content.publish_notes IS 'Notes about publishing context and performance';

COMMENT ON COLUMN derivative_assets.published_to IS 'Array of platform names where content is published';
COMMENT ON COLUMN derivative_assets.external_urls IS 'Object mapping platforms to URLs';
COMMENT ON COLUMN derivative_assets.publish_notes IS 'Notes about publishing context and performance';