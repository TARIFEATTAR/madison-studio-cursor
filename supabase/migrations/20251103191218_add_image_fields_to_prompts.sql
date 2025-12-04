-- Add image fields to prompts table for Image Recipe Library
-- This allows prompts to be linked to generated images or uploaded images

-- Create enum for image source
DO $$ BEGIN
    CREATE TYPE image_source_type AS ENUM ('generated', 'uploaded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add image fields to prompts table
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS image_source image_source_type,
ADD COLUMN IF NOT EXISTS generated_image_id UUID REFERENCES generated_images(id) ON DELETE SET NULL;

-- Add index on image_url for performance
CREATE INDEX IF NOT EXISTS idx_prompts_image_url ON prompts(image_url) WHERE image_url IS NOT NULL;

-- Add index on generated_image_id for performance
CREATE INDEX IF NOT EXISTS idx_prompts_generated_image_id ON prompts(generated_image_id) WHERE generated_image_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN prompts.image_url IS 'URL for uploaded images (stored in Supabase storage)';
COMMENT ON COLUMN prompts.image_source IS 'Source of the image: generated from Image Studio or uploaded by user';
COMMENT ON COLUMN prompts.generated_image_id IS 'Reference to generated_images table when image is from Image Studio';

