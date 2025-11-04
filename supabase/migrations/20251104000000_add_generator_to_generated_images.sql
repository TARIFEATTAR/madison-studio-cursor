-- Add image_generator field to track which AI service generated the image
ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS image_generator text DEFAULT 'nano-banana';

COMMENT ON COLUMN generated_images.image_generator IS 'The AI image generation service used (e.g., nano-banana, dall-e, midjourney, etc.)';

-- Create index for querying by generator
CREATE INDEX IF NOT EXISTS idx_generated_images_generator ON generated_images(image_generator);

