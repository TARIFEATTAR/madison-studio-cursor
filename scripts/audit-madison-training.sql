-- ============================================================================
-- Madison Training Documents Audit Query
-- ============================================================================
-- Run this query in Supabase SQL Editor to audit training documents
-- ============================================================================

-- Step 1: Check table structure
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'madison_training_documents'
ORDER BY ordinal_position;

-- ============================================================================
-- Step 2: MAIN AUDIT QUERY
-- ============================================================================
-- Returns all documents with inferred category and active status
-- Filters for writing_style, visual_identity, or Gary Halbert references

SELECT 
    id,
    -- Try to select category, slug, name, version if columns exist
    -- (These will return NULL if columns don't exist - that's OK)
    (SELECT category FROM madison_training_documents mtd2 WHERE mtd2.id = mtd.id) as category,
    (SELECT slug FROM madison_training_documents mtd3 WHERE mtd3.id = mtd.id) as slug,
    (SELECT name FROM madison_training_documents mtd4 WHERE mtd4.id = mtd.id) as name,
    (SELECT version FROM madison_training_documents mtd5 WHERE mtd5.id = mtd.id) as version,
    file_name,
    file_type,
    processing_status,
    created_at,
    -- Calculate active status
    CASE 
        WHEN processing_status = 'completed' 
             AND created_at >= NOW() - INTERVAL '12 months'
        THEN 'Yes'
        ELSE 'No'
    END as "Active?",
    -- Check for Gary Halbert references
    CASE 
        WHEN LOWER(file_name) LIKE '%gary%halbert%' 
             OR LOWER(file_name) LIKE '%halbert%'
             OR (SELECT slug FROM madison_training_documents mtd6 WHERE mtd6.id = mtd.id) LIKE '%halbert%'
        THEN true
        ELSE false
    END as has_gary_halbert_reference,
    -- Infer category from file_name
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
    END as inferred_category,
    -- Days since creation
    EXTRACT(DAY FROM (NOW() - created_at))::INTEGER as days_ago
FROM madison_training_documents mtd
WHERE 
    -- Filter for writing style or visual identity (inferred from filename)
    (
        LOWER(file_name) LIKE '%writing%' 
        OR LOWER(file_name) LIKE '%style%'
        OR LOWER(file_name) LIKE '%voice%'
        OR LOWER(file_name) LIKE '%copy%'
        OR LOWER(file_name) LIKE '%ogilvy%'
        OR LOWER(file_name) LIKE '%hopkins%'
        OR LOWER(file_name) LIKE '%halbert%'
        OR LOWER(file_name) LIKE '%visual%'
        OR LOWER(file_name) LIKE '%identity%'
        OR LOWER(file_name) LIKE '%brand%'
        OR LOWER(file_name) LIKE '%design%'
    )
    -- OR if category column exists, filter by it
    OR (
        EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'madison_training_documents' 
            AND column_name = 'category'
        )
        AND (SELECT category FROM madison_training_documents mtd7 WHERE mtd7.id = mtd.id) IN ('writing style', 'visual identity')
    )
ORDER BY 
    -- Gary Halbert docs first
    CASE 
        WHEN LOWER(file_name) LIKE '%halbert%' THEN 0
        ELSE 1
    END,
    created_at DESC;

-- ============================================================================
-- SUMMARY STATISTICS
-- ============================================================================
SELECT 
    COUNT(*) as total_documents,
    COUNT(*) FILTER (WHERE processing_status = 'completed' AND created_at >= NOW() - INTERVAL '12 months') as active_documents,
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%halbert%') as gary_halbert_documents,
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%writing%' OR LOWER(file_name) LIKE '%style%' OR LOWER(file_name) LIKE '%voice%' OR LOWER(file_name) LIKE '%copy%') as writing_style_documents,
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%visual%' OR LOWER(file_name) LIKE '%identity%' OR LOWER(file_name) LIKE '%brand%' OR LOWER(file_name) LIKE '%design%') as visual_identity_documents
FROM madison_training_documents;

-- ============================================================================
-- GARY HALBERT DOCUMENTS DETAIL
-- ============================================================================
SELECT 
    id,
    file_name,
    file_type,
    processing_status,
    created_at,
    CASE 
        WHEN processing_status = 'completed' AND created_at >= NOW() - INTERVAL '12 months'
        THEN 'Yes'
        ELSE 'No'
    END as "Active?",
    EXTRACT(DAY FROM (NOW() - created_at))::INTEGER as days_ago
FROM madison_training_documents
WHERE LOWER(file_name) LIKE '%halbert%'
   OR LOWER(file_name) LIKE '%gary%halbert%'
ORDER BY created_at DESC;

-- ============================================================================
-- CLEANUP RECOMMENDATIONS
-- ============================================================================
-- Documents to archive (older than 12 months or incomplete)
SELECT 
    id,
    file_name,
    processing_status,
    created_at,
    CASE 
        WHEN processing_status != 'completed' THEN 'Processing incomplete'
        WHEN created_at < NOW() - INTERVAL '12 months' THEN 'Older than 12 months'
        ELSE 'Other'
    END as archive_reason
FROM madison_training_documents
WHERE processing_status != 'completed'
   OR created_at < NOW() - INTERVAL '12 months'
ORDER BY created_at DESC;

