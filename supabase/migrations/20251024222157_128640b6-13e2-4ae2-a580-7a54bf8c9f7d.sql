-- Add support for multiple reference images
ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS reference_images JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN generated_images.reference_images IS 'Array of reference image objects with url, description, and label (e.g., "Background", "Product", "Style Reference")';

-- Index for querying images with reference images
CREATE INDEX IF NOT EXISTS idx_generated_images_reference_images ON generated_images USING GIN (reference_images);