-- Add processing_stage column to track detailed progress
ALTER TABLE brand_documents 
ADD COLUMN processing_stage TEXT DEFAULT NULL;

-- Add helpful comment
COMMENT ON COLUMN brand_documents.processing_stage IS 'Tracks detailed processing stages: downloading, extracting_text, extracting_knowledge, saving';