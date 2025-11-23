-- ============================================================================
-- Madison Training Documents Audit - Simple Query
-- ============================================================================
-- Run this in Supabase SQL Editor
-- ============================================================================

-- 1. CHECK TABLE STRUCTURE
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'madison_training_documents'
ORDER BY ordinal_position;

-- 2. ALL DOCUMENTS WITH ANALYSIS
SELECT 
    id,
    file_name,
    file_type,
    processing_status,
    created_at,
    EXTRACT(DAY FROM (NOW() - created_at))::INTEGER as days_ago,
    -- Active status: completed AND within 12 months
    CASE 
        WHEN processing_status = 'completed' 
             AND created_at >= NOW() - INTERVAL '12 months'
        THEN 'Yes'
        ELSE 'No'
    END as "Active?",
    -- Gary Halbert detection
    CASE 
        WHEN LOWER(file_name) LIKE '%halbert%' THEN '⚠️ YES'
        ELSE 'No'
    END as "Gary Halbert?",
    -- Category inference
    CASE 
        WHEN LOWER(file_name) LIKE '%writing%' 
             OR LOWER(file_name) LIKE '%style%'
             OR LOWER(file_name) LIKE '%voice%'
             OR LOWER(file_name) LIKE '%copy%'
             OR LOWER(file_name) LIKE '%ogilvy%'
             OR LOWER(file_name) LIKE '%hopkins%'
             OR LOWER(file_name) LIKE '%halbert%'
        THEN 'writing_style'
        WHEN LOWER(file_name) LIKE '%visual%'
             OR LOWER(file_name) LIKE '%identity%'
             OR LOWER(file_name) LIKE '%brand%'
             OR LOWER(file_name) LIKE '%design%'
        THEN 'visual_identity'
        ELSE 'other'
    END as inferred_category
FROM madison_training_documents
ORDER BY 
    -- Gary Halbert first
    CASE WHEN LOWER(file_name) LIKE '%halbert%' THEN 0 ELSE 1 END,
    created_at DESC;

-- 3. GARY HALBERT DOCUMENTS ONLY
SELECT 
    id,
    file_name,
    processing_status,
    created_at,
    CASE 
        WHEN processing_status = 'completed' 
             AND created_at >= NOW() - INTERVAL '12 months'
        THEN 'Yes'
        ELSE 'No'
    END as "Active?"
FROM madison_training_documents
WHERE LOWER(file_name) LIKE '%halbert%'
ORDER BY created_at DESC;

-- 4. SUMMARY STATS
SELECT 
    COUNT(*) as total_docs,
    COUNT(*) FILTER (WHERE processing_status = 'completed' AND created_at >= NOW() - INTERVAL '12 months') as active_docs,
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%halbert%') as halbert_docs,
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%writing%' OR LOWER(file_name) LIKE '%style%' OR LOWER(file_name) LIKE '%voice%' OR LOWER(file_name) LIKE '%copy%') as writing_style_docs,
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%visual%' OR LOWER(file_name) LIKE '%identity%' OR LOWER(file_name) LIKE '%brand%') as visual_identity_docs
FROM madison_training_documents;

-- 5. ARCHIVE CANDIDATES (older than 12 months or incomplete)
SELECT 
    id,
    file_name,
    processing_status,
    created_at,
    CASE 
        WHEN processing_status != 'completed' THEN 'Processing incomplete'
        WHEN created_at < NOW() - INTERVAL '12 months' THEN 'Older than 12 months'
    END as archive_reason
FROM madison_training_documents
WHERE processing_status != 'completed'
   OR created_at < NOW() - INTERVAL '12 months'
ORDER BY created_at DESC;

