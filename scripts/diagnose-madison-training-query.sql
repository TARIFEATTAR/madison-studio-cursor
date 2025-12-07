-- ============================================================================
-- DIAGNOSTIC: Check if Madison can query training documents correctly
-- ============================================================================
-- This checks:
-- 1. If documents exist and are accessible
-- 2. If RLS policies might be blocking access
-- 3. If documents are properly processed
-- 4. If the query logic matches what edge functions use
-- ============================================================================

-- 1. CHECK IF DOCUMENTS EXIST
SELECT 
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE processing_status = 'completed') as completed_documents,
    COUNT(*) FILTER (WHERE processing_status = 'pending') as pending_documents,
    COUNT(*) FILTER (WHERE processing_status = 'processing') as processing_documents,
    COUNT(*) FILTER (WHERE extracted_content IS NOT NULL) as documents_with_content,
    COUNT(*) FILTER (WHERE processing_status = 'completed' AND extracted_content IS NOT NULL) as ready_documents
FROM madison_training_documents;

-- 2. SIMULATE THE EXACT QUERY MADISON USES (from generate-with-claude/index.ts)
-- This is what the edge function actually runs:
SELECT 
    file_name,
    extracted_content,
    processing_status,
    created_at,
    LENGTH(extracted_content) as content_length,
    CASE 
        WHEN LENGTH(extracted_content) > 3000 THEN 'Will be truncated to 3000 chars'
        ELSE 'Full content will be used'
    END as truncation_status
FROM madison_training_documents
WHERE processing_status = 'completed'
  AND extracted_content IS NOT NULL
ORDER BY created_at ASC  -- Note: This gets OLDEST first (might want newest?)
LIMIT 3;

-- 3. CHECK RLS POLICIES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'madison_training_documents';

-- 4. VERIFY SERVICE ROLE CAN ACCESS (should bypass RLS)
-- Note: This query runs as the current user. In edge functions, SERVICE_ROLE_KEY bypasses RLS
SELECT 
    'Service role should bypass RLS policies' as note,
    COUNT(*) as accessible_documents
FROM madison_training_documents
WHERE processing_status = 'completed'
  AND extracted_content IS NOT NULL;

-- 5. CHECK IF DOCUMENTS ARE GLOBAL (no organization_id column)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'madison_training_documents' 
            AND column_name = 'organization_id'
        ) THEN '❌ HAS organization_id - NOT GLOBAL'
        ELSE '✅ NO organization_id - IS GLOBAL'
    END as global_status;

-- 6. LIST ALL READY DOCUMENTS (what Madison should see)
SELECT 
    id,
    file_name,
    processing_status,
    created_at,
    LENGTH(extracted_content) as content_length,
    LEFT(extracted_content, 100) as content_preview
FROM madison_training_documents
WHERE processing_status = 'completed'
  AND extracted_content IS NOT NULL
ORDER BY created_at DESC;  -- Show newest first for reference

-- 7. CHECK FOR POTENTIAL ISSUES
SELECT 
    'Potential Issues' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ NO DOCUMENTS - Madison has no training data'
        WHEN COUNT(*) FILTER (WHERE processing_status = 'completed' AND extracted_content IS NOT NULL) = 0 
        THEN '❌ NO COMPLETED DOCUMENTS - All are pending/processing or have no content'
        WHEN COUNT(*) FILTER (WHERE processing_status = 'completed' AND extracted_content IS NOT NULL) < 3
        THEN '⚠️ FEWER THAN 3 DOCUMENTS - Only ' || COUNT(*) FILTER (WHERE processing_status = 'completed' AND extracted_content IS NOT NULL) || ' available'
        ELSE '✅ Documents available for training'
    END as status
FROM madison_training_documents;



















