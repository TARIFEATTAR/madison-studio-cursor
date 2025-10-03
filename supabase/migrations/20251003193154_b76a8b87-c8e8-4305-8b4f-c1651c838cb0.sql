-- Add image_urls field to outputs table for storing multiple image links
ALTER TABLE outputs
ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN outputs.image_urls IS 'Array of image URLs generated externally (e.g., Google AI Studio with Nano Banana)';