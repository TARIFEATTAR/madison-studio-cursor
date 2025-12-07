-- Add video support columns to generated_images table
-- This enables storing video generations alongside images

-- Media type to distinguish between images and videos
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- Video-specific fields
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS video_duration INTEGER;

-- Reference to source image (for image-to-video conversions)
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS source_image_id UUID REFERENCES generated_images(id);

-- Track which AI provider was used
ALTER TABLE generated_images 
ADD COLUMN IF NOT EXISTS generation_provider TEXT DEFAULT 'gemini';

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_generated_images_media_type 
ON generated_images(media_type);

CREATE INDEX IF NOT EXISTS idx_generated_images_provider 
ON generated_images(generation_provider);

-- Add comment for documentation
COMMENT ON COLUMN generated_images.media_type IS 'Type of media: image or video';
COMMENT ON COLUMN generated_images.video_url IS 'URL to video file (for video media type)';
COMMENT ON COLUMN generated_images.video_duration IS 'Duration of video in seconds';
COMMENT ON COLUMN generated_images.source_image_id IS 'Reference to source image for image-to-video conversions';
COMMENT ON COLUMN generated_images.generation_provider IS 'AI provider used: gemini, freepik, etc.';
