# Brand Knowledge Architecture & Duplication Analysis

## Current System Overview

### Three Separate Data Sources

1. **Uploaded Brand Documents** (`brand_documents` table)
   - Files: `product_terminology.txt`, `Tarife Attar_BrandGuide.txt`
   - Processed by edge function `process-brand-document`
   - Extracts structured knowledge → creates entries in `brand_knowledge` table

2. **Brand Knowledge Management** (`brand_knowledge` table)
   - Structured knowledge entries with `knowledge_type` field
   - Version controlled (v1, v2, etc.)
   - Created from:
     - Document processing (automatic)
     - "Ask Madison" feature (user-initiated)
   - Current knowledge types in your system:
     - `brand_voice`
     - `vocabulary`
     - `writing_examples`
     - `structural_guidelines`
     - `category_personal_fragrance`
     - `category_home_fragrance`
     - `core_identity` (Mission, etc.)

3. **Brand Identity Section** (`organizations.brand_config` JSONB)
   - Manual input fields in Settings UI
   - Fields:
     - Brand Name
     - Brand Voice & Tone (textarea)
     - Forbidden Phrases (textarea)
     - Brand Story (textarea)
     - Target Audience (textarea)
   - Stored as unstructured JSONB blob
   - **NOT** in `brand_knowledge` table

---

## The Duplication Problem

### What's Happening

The Brand Health system detected **6 duplicate knowledge types** in the `brand_knowledge` table:

```
brand_voice
vocabulary
writing_examples
structural_guidelines
category_personal_fragrance
category_home_fragrance
```

This means there are **multiple rows** in `brand_knowledge` with the same `knowledge_type` but different content or versions.

### Why It Happened

**Scenario 1: Multiple Document Uploads**
- You uploaded `Tarife Attar_BrandGuide.txt` → created knowledge entries
- Later re-uploaded or uploaded another document with overlapping content
- Each processing created new entries instead of updating existing ones

**Scenario 2: "Ask Madison" Feature**
- When you click "Ask Madison" to suggest brand knowledge, it creates new entries
- If knowledge already exists from documents, this creates duplicates

**Scenario 3: Manual Creation**
- Brand Knowledge entries were manually created or edited
- System didn't detect existing entries with same `knowledge_type`

---

## Recommended Fixes

### Option 1: Consolidate to Single Source (Recommended)

**Merge Brand Identity → Brand Knowledge Management**

1. Deprecate the "Brand Identity" manual input section
2. Use only "Brand Knowledge Management" for all knowledge
3. Provide a "Quick Add" button in Brand Knowledge Management for manual entries
4. Benefits:
   - Single source of truth
   - Version control for all knowledge
   - No confusion about which data source is authoritative

### Option 2: Keep Both, Define Clear Roles

**Brand Identity = High-Level Overrides**
- Use for brand name, primary voice statement, story
- Quick, non-versioned inputs for onboarding

**Brand Knowledge Management = Detailed, Structured Knowledge**
- All document-extracted knowledge
- Category-specific guidelines
- Vocabulary, examples, structural rules

---

## How to Fix Current Duplicates

### Step 1: Query to Find Duplicates

```sql
SELECT 
  knowledge_type, 
  COUNT(*) as count,
  ARRAY_AGG(id) as duplicate_ids
FROM brand_knowledge
WHERE organization_id = '<your-org-id>'
  AND is_active = true
GROUP BY knowledge_type
HAVING COUNT(*) > 1;
```

### Step 2: Manual Resolution

For each duplicate `knowledge_type`:

1. Review all versions of that knowledge type
2. Identify the most complete/accurate version
3. Deactivate older/incomplete versions:
   ```sql
   UPDATE brand_knowledge
   SET is_active = false
   WHERE id = '<old-version-id>';
   ```

### Step 3: Automated Fix (Use with Caution)

Keep only the latest version of each knowledge type:

```sql
UPDATE brand_knowledge
SET is_active = false
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY knowledge_type, organization_id 
        ORDER BY updated_at DESC
      ) as rn
    FROM brand_knowledge
    WHERE organization_id = '<your-org-id>'
      AND is_active = true
  ) sub
  WHERE rn > 1
);
```

---

## Data Flow Diagram

```
┌─────────────────────────┐
│  Uploaded Documents     │
│  - product_terminology  │
│  - BrandGuide          │
└───────────┬─────────────┘
            │
            ▼
   [process-brand-document]
   Edge Function
            │
            ▼
┌─────────────────────────┐
│  brand_knowledge table  │◄──── "Ask Madison" feature
│  (Structured entries)   │
│  - brand_voice          │
│  - vocabulary           │
│  - category_*           │
└─────────────────────────┘
            │
            ▼
   Used by generate-with-claude
   for AI content generation


┌─────────────────────────┐
│  Brand Identity Section │
│  (UI in Settings)       │
│  - Manual inputs        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  organizations table    │
│  brand_config JSONB     │
└─────────────────────────┘
            │
            ▼
   Currently underutilized
   in content generation
```

---

## Immediate Action Items

1. **Check database** to see which exact entries are duplicated
2. **Review each duplicate** to determine which version is authoritative
3. **Deactivate** older/incomplete versions
4. **Decide architecture**: Single source or dual-purpose?
5. **Update edge functions** to prevent future duplicates (add upsert logic)

---

## Technical Notes

- `brand_knowledge.is_active` = flag for soft deletion
- `brand_knowledge.version` = increments for same knowledge type
- Document processing should **UPSERT** not INSERT to avoid duplicates
- Consider adding a unique constraint: `UNIQUE(organization_id, knowledge_type, is_active)` where `is_active = true`
