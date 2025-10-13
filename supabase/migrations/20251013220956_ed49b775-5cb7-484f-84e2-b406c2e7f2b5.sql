-- Fix stuck brand documents and retry processing
UPDATE brand_documents 
SET processing_status = 'pending', 
    updated_at = now()
WHERE processing_status IN ('processing', 'pending') 
  AND extracted_content IS NULL
  AND created_at < now() - INTERVAL '1 hour';

-- Add index to improve brand knowledge queries
CREATE INDEX IF NOT EXISTS idx_brand_knowledge_org_active 
ON brand_knowledge(organization_id, is_active) 
WHERE is_active = true;

-- Add index to improve brand document queries
CREATE INDEX IF NOT EXISTS idx_brand_documents_org_status 
ON brand_documents(organization_id, processing_status);

COMMENT ON INDEX idx_brand_knowledge_org_active IS 'Improves Madison brand data access queries';
COMMENT ON INDEX idx_brand_documents_org_status IS 'Improves brand document retrieval performance';