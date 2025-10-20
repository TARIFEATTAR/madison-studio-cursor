-- Phase 1A: Database Schema Updates for Madison Image Studio

-- Add session tracking columns to generated_images
ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS session_id UUID,
ADD COLUMN IF NOT EXISTS session_name TEXT,
ADD COLUMN IF NOT EXISTS saved_to_library BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS library_category TEXT CHECK (library_category IN ('content', 'marketplace', 'both')),
ADD COLUMN IF NOT EXISTS image_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_hero_image BOOLEAN DEFAULT false;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_generated_images_session 
ON generated_images(session_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_generated_images_cleanup 
ON generated_images(saved_to_library, created_at);

CREATE INDEX IF NOT EXISTS idx_generated_images_library 
ON generated_images(organization_id, saved_to_library, created_at DESC);

-- Migrate existing orphaned images with default session grouping
UPDATE generated_images
SET 
  session_id = gen_random_uuid(),
  session_name = 'Legacy Session - ' || TO_CHAR(created_at, 'Mon DD, YYYY'),
  saved_to_library = COALESCE(saved_to_library, true),
  image_order = 0,
  is_hero_image = false
WHERE session_id IS NULL;

-- Create cleanup function for unsaved sessions (7-day retention)
CREATE OR REPLACE FUNCTION cleanup_unsaved_image_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete unsaved images older than 7 days
  DELETE FROM generated_images
  WHERE saved_to_library = false
  AND created_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

COMMENT ON FUNCTION cleanup_unsaved_image_sessions() IS 
'Removes unsaved image session data older than 7 days to prevent database bloat. Returns count of deleted records.';