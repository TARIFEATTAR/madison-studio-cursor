-- Add status column to master_content table
ALTER TABLE master_content 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' 
CHECK (status IN ('draft', 'published', 'archived'));