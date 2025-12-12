# Madison Training Documents Audit

## Overview
This audit queries the `madison_training_documents` table to identify all training documents, particularly those related to "writing style" or "visual identity", and highlights any references to Gary Halbert or other unexpected writers.

## How to Run

### Option 1: Supabase SQL Editor (Recommended)
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/audit-madison-training.sql`
4. Run the query
5. Review the results

### Option 2: Node.js Script
1. Ensure you have `.env.local` with:
   - `VITE_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
2. Run: `node scripts/audit-madison-training.js`

## Expected Output

The query will return:

1. **Full Row List** with:
   - `id` - Document UUID
   - `slug` - URL-friendly identifier (if column exists)
   - `name` - Human-readable name (if column exists)
   - `file_name` - Original filename
   - `version` - Version number (if column exists)
   - `created_at` - Creation timestamp
   - `Active?` - Yes/No based on:
     - `version = latest` (if version column exists)
     - `created_at` within past 12 months
     - `processing_status = 'completed'`

2. **Gary Halbert Detection**:
   - Documents with "gary-halbert" or "halbert" in filename or slug
   - Marked with `has_gary_halbert_reference = true`

3. **Category Classification**:
   - `writing_style` - Documents about writing, style, voice, copy
   - `visual_identity` - Documents about visual identity, brand, design
   - `other` - All other documents

## Cleanup Recommendations

The query also provides:

1. **Archive Candidates**: Documents older than 12 months or with incomplete processing
2. **Rename Suggestions**: Documents with inconsistent naming (e.g., "halbert" without "gary-")
3. **Schema Enhancement**: Recommendations if expected columns (category, slug, name, version) are missing

## Next Steps

After reviewing the audit results:

1. **Archive old documents**: Update `processing_status = 'archived'` for documents older than 12 months
2. **Review Gary Halbert docs**: Determine if they align with current Madison Studio training (Ogilvy, Hopkins, Reeves, Schwartz)
3. **Rename inconsistent files**: Standardize naming conventions
4. **Add missing columns**: If category, slug, name, version columns don't exist, consider adding them for better organization

## SQL for Cleanup Actions

### Archive Old Documents
```sql
UPDATE madison_training_documents 
SET processing_status = 'archived' 
WHERE created_at < NOW() - INTERVAL '12 months'
   OR processing_status != 'completed';
```

### Add Schema Columns (if missing)
```sql
-- Add category column
ALTER TABLE madison_training_documents 
ADD COLUMN IF NOT EXISTS category TEXT;

-- Add slug column
ALTER TABLE madison_training_documents 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add name column
ALTER TABLE madison_training_documents 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add version column
ALTER TABLE madison_training_documents 
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;
```



































