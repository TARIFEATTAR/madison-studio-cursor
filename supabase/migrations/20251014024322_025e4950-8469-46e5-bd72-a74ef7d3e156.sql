-- Phase 2: Fix Collection Type Mismatch (Simplified)
-- Change prompts.collection from enum to text without foreign key
-- Collections are organization-specific, so FK wouldn't work across orgs

-- Change column type to text
ALTER TABLE prompts 
ALTER COLUMN collection TYPE text;

-- Drop the old enum type
DROP TYPE IF EXISTS collection_type CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_collection ON prompts(collection);

-- Add a check to ensure collection is not empty
ALTER TABLE prompts
ADD CONSTRAINT prompts_collection_not_empty CHECK (collection IS NOT NULL AND length(trim(collection)) > 0);