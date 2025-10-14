-- Reset stuck brand documents to pending so they can be reprocessed
UPDATE brand_documents 
SET processing_status = 'pending',
    content_preview = NULL
WHERE processing_status = 'processing' 
  AND created_at < NOW() - INTERVAL '1 hour';