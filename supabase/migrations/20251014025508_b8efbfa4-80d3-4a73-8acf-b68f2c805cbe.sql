-- Add collection column to master_content table
ALTER TABLE master_content 
ADD COLUMN collection text;

-- Add index for better query performance when filtering by collection
CREATE INDEX idx_master_content_collection ON master_content(collection);