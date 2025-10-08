-- Add columns to brand_documents for extracted content
ALTER TABLE brand_documents
ADD COLUMN IF NOT EXISTS extracted_content TEXT,
ADD COLUMN IF NOT EXISTS content_preview TEXT;