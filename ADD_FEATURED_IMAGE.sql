-- Run this in Supabase SQL Editor to add featured image support
-- Dashboard > SQL Editor > New Query > Paste & Run

ALTER TABLE master_content 
ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Verify it worked
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'master_content' 
AND column_name = 'featured_image_url';
