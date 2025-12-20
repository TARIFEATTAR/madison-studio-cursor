-- Add featured_image_url field to master_content for blog posts
-- This allows setting a hero/featured image for published content

ALTER TABLE master_content 
ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN master_content.featured_image_url IS 'URL of the featured/hero image for blog posts and published content';
