# Madison Training Documents - Diagnostic Report

## 🔍 Analysis Summary

Based on code review, here's what I found about Madison's ability to query training documents:

### ✅ **Training Documents ARE GLOBAL** (Correct)

The `madison_training_documents` table:
- **Does NOT have `organization_id` column** ✅
- Is designed to be **system-wide/global** training
- All organizations share the same training documents
- This is the correct design for foundational editorial training

### ⚠️ **Potential Issues Found**

#### 1. **Query Logic Issue: Oldest First**
```typescript
// Current query in generate-with-claude/index.ts (line 104)
.order('created_at', { ascending: true })  // Gets OLDEST documents first
.limit(3);
```

**Problem**: This gets the 3 oldest completed documents, not the most recent/relevant ones.

**Recommendation**: Change to `ascending: false` to get newest documents, or add a priority/version system.

#### 2. **Content Truncation**
```typescript
// Line 113-118
const MAX_TRAINING_DOC_LENGTH = 3000; // Each doc truncated to 3000 chars
```

**Impact**: Large training documents are cut off, potentially losing important guidance.

**Recommendation**: Consider increasing limit or using smarter summarization.

#### 3. **RLS Policy Access**
The edge functions use `SUPABASE_SERVICE_ROLE_KEY` which **bypasses RLS**, so access should work. However, verify:
- RLS policies only allow super_admin access
- Service role key is properly configured in edge function environment

#### 4. **Limited Document Count**
```typescript
.limit(3); // Only 3 documents loaded
```

**Impact**: If you have more than 3 training documents, only the first 3 (oldest) are used.

**Recommendation**: 
- Increase limit if needed
- Add category filtering (writing_style vs visual_identity)
- Add priority/version system

## 📋 How to Verify

### Step 1: Run Diagnostic SQL
Execute `scripts/diagnose-madison-training-query.sql` in Supabase SQL Editor to check:
- Document count and status
- Whether documents are accessible
- Content length and truncation impact

### Step 2: Check Edge Function Logs
Look for these log messages in edge function execution:
```
Madison system config loaded: [number] chars
```

If you see `none` or `0 chars`, the query is failing.

### Step 3: Verify Documents Are Processed
```sql
SELECT file_name, processing_status, 
       LENGTH(extracted_content) as content_length
FROM madison_training_documents
WHERE processing_status = 'completed';
```

## 🔧 Recommended Fixes

### Fix 1: Get Newest Documents First
```typescript
// In generate-with-claude/index.ts, line 104
.order('created_at', { ascending: false })  // Change to false
.limit(3);
```

### Fix 2: Add Category Filtering (if category column exists)
```typescript
// If you add category column, filter by it:
.eq('category', 'writing_style')  // or 'visual_identity'
.order('created_at', { ascending: false })
.limit(3);
```

### Fix 3: Increase Content Limit or Use Summarization
```typescript
const MAX_TRAINING_DOC_LENGTH = 5000; // Increase from 3000
// OR use AI to summarize long documents
```

### Fix 4: Add Priority/Version System
Consider adding:
- `priority` column (integer, higher = more important)
- `version` column (for document versioning)
- `is_active` boolean (to archive old documents)

## 🎯 Current Query Flow

1. **Edge Function** (`generate-with-claude/index.ts`):
   - Uses `SUPABASE_SERVICE_ROLE_KEY` (bypasses RLS) ✅
   - Queries `madison_training_documents` table
   - Filters: `processing_status = 'completed'` AND `extracted_content IS NOT NULL`
   - Orders by `created_at ASC` (oldest first) ⚠️
   - Limits to 3 documents ⚠️
   - Truncates each to 3000 chars ⚠️

2. **Injection into AI Prompt**:
   - Documents are added to system prompt
   - Labeled as "MADISON'S CORE TRAINING DOCUMENTS"
   - Marked as "Foundational Editorial Guidelines"

## ✅ What's Working

- ✅ Table structure is correct (global, no organization_id)
- ✅ RLS policies exist (though service role bypasses them)
- ✅ Query uses service role key (should work)
- ✅ Documents are properly injected into AI prompts
- ✅ Content truncation prevents token overflow

## ❓ What Needs Verification

1. **Are documents actually in the database?**
   - Run diagnostic SQL to check

2. **Are documents processed correctly?**
   - Check `processing_status = 'completed'`
   - Check `extracted_content IS NOT NULL`

3. **Is service role key configured?**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` in edge function env vars

4. **Are documents being loaded?**
   - Check edge function logs for "Madison system config loaded" message

## 🚀 Next Steps

1. Run `scripts/diagnose-madison-training-query.sql` in Supabase
2. Review the results
3. Apply recommended fixes if needed
4. Test edge function to verify documents are loaded
5. Consider adding category/priority system for better document management























