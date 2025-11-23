-- ============================================================================
-- Verify J. Peterman Documents Integration
-- ============================================================================
-- Run this in Supabase SQL Editor to check if Peterman documents are properly
-- ingested and available to Madison
-- ============================================================================

-- 1. CHECK ALL PETERMAN TRAINING DOCUMENTS
SELECT 
    id,
    file_name,
    file_type,
    processing_status,
    LENGTH(extracted_content) as content_length,
    created_at,
    EXTRACT(DAY FROM (NOW() - created_at))::INTEGER as days_ago,
    -- Status check
    CASE 
        WHEN processing_status = 'completed' 
             AND LENGTH(extracted_content) > 100
        THEN '✅ READY - Will be included in prompts'
        WHEN processing_status = 'completed' 
             AND LENGTH(extracted_content) <= 100
        THEN '⚠️ COMPLETED BUT EMPTY - Check content extraction'
        WHEN processing_status = 'processing'
        THEN '⏳ PROCESSING - Wait a moment'
        WHEN processing_status = 'pending'
        THEN '⏳ PENDING - Trigger processing'
        WHEN processing_status = 'failed'
        THEN '❌ FAILED - Check logs'
        ELSE '❓ UNKNOWN STATUS'
    END as integration_status
FROM madison_training_documents
WHERE LOWER(file_name) LIKE '%peterman%'
   OR LOWER(file_name) LIKE '%j.%peterman%'
ORDER BY created_at DESC;

-- 2. CHECK IF PETERMAN DOCUMENTS ARE IN TOP 3 (WILL BE LOADED)
WITH recent_docs AS (
    SELECT 
        id,
        file_name,
        processing_status,
        created_at,
        ROW_NUMBER() OVER (ORDER BY created_at DESC) as recency_rank
    FROM madison_training_documents
    WHERE processing_status = 'completed'
      AND extracted_content IS NOT NULL
      AND LENGTH(extracted_content) > 100
)
SELECT 
    file_name,
    recency_rank,
    CASE 
        WHEN recency_rank <= 3 THEN '✅ WILL BE LOADED (Top 3)'
        ELSE '⚠️ NOT IN TOP 3 (Won\'t be loaded automatically)'
    END as load_status
FROM recent_docs
WHERE LOWER(file_name) LIKE '%peterman%'
ORDER BY recency_rank;

-- 3. SUMMARY STATS
SELECT 
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%peterman%') as total_peterman_docs,
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%peterman%' 
                     AND processing_status = 'completed'
                     AND LENGTH(extracted_content) > 100) as ready_peterman_docs,
    COUNT(*) FILTER (WHERE LOWER(file_name) LIKE '%peterman%' 
                     AND processing_status = 'completed'
                     AND LENGTH(extracted_content) > 100
                     AND created_at >= NOW() - INTERVAL '30 days') as recent_peterman_docs,
    SUM(LENGTH(extracted_content)) FILTER (WHERE LOWER(file_name) LIKE '%peterman%' 
                                            AND processing_status = 'completed') as total_peterman_content_chars
FROM madison_training_documents;

-- 4. SAMPLE CONTENT (First 500 chars of each Peterman doc)
SELECT 
    file_name,
    LEFT(extracted_content, 500) as content_preview,
    LENGTH(extracted_content) as full_length
FROM madison_training_documents
WHERE LOWER(file_name) LIKE '%peterman%'
  AND processing_status = 'completed'
  AND extracted_content IS NOT NULL
ORDER BY created_at DESC;

-- 5. CHECK AUTHOR PROFILES IN CODEBASE (via system config)
-- Note: This checks if Peterman is mentioned in system config
-- The actual profiles are in authorProfiles.ts (codebase)
SELECT 
    'Author Profiles' as source,
    CASE 
        WHEN writing_influences LIKE '%Peterman%' 
          OR writing_influences LIKE '%peterman%'
        THEN '✅ Peterman mentioned in system config'
        ELSE '⚠️ Peterman not in system config (but may be in codebase)'
    END as status
FROM madison_system_config
LIMIT 1;

