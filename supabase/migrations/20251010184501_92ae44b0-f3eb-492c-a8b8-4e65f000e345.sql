-- Add quality_rating column to master_content table
ALTER TABLE master_content 
ADD COLUMN IF NOT EXISTS quality_rating INTEGER 
CHECK (quality_rating >= 1 AND quality_rating <= 5);

-- Add index for filtering/sorting by rating
CREATE INDEX IF NOT EXISTS idx_master_content_quality_rating 
ON master_content(quality_rating) 
WHERE quality_rating IS NOT NULL;

-- Add comment
COMMENT ON COLUMN master_content.quality_rating IS 'User-assigned quality rating from 1-5 stars';