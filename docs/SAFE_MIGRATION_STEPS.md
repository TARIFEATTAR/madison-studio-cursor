# Safe Migration Steps - Based on Your Current Database

Based on your screenshot, you have these existing brand tables:
- `brand_collections`
- `brand_documents`
- `brand_health`
- `brand_health_history`
- `brand_knowledge`
- `brand_products`
- `brand_scans`

**But `brand_dna` doesn't exist yet** - which is good! This means we can create it fresh.

---

## 🔍 Step 1: Run Diagnostic Query

Run this in SQL Editor to check your current state:

```sql
-- Check if brand_dna exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'brand_dna'
    ) THEN 'EXISTS'
    ELSE 'DOES NOT EXIST - Safe to create'
  END as brand_dna_status;

-- Check for any broken functions/policies
SELECT 
  routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_definition LIKE '%brand_dna.org_id%';
```

---

## 🧹 Step 2: Clean Up (If Needed)

If the diagnostic shows any broken references, run this cleanup:

```sql
-- Drop any broken policies
DROP POLICY IF EXISTS "Members can view their org brand_dna" ON public.brand_dna;
DROP POLICY IF EXISTS "Members can insert their org brand_dna" ON public.brand_dna;
DROP POLICY IF EXISTS "Admins can update their org brand_dna" ON public.brand_dna;

-- Drop any broken functions
DROP FUNCTION IF EXISTS public.get_brand_dna(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.match_writing_examples CASCADE;
DROP FUNCTION IF EXISTS public.match_visual_examples CASCADE;

-- Drop table if it exists in broken state
DROP TABLE IF EXISTS public.brand_dna CASCADE;
```

---

## ✅ Step 3: Run Migration (Clean)

Now run the main migration file:
- `20251210000000_madison_architecture_schema.sql`

**Copy the ENTIRE file** and paste into SQL Editor, then click "Run".

---

## 🎯 Step 4: Verify Success

After migration, verify:

```sql
-- Check brand_dna was created
SELECT COUNT(*) as table_exists
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'brand_dna';

-- Check it has org_id column
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brand_dna' 
AND column_name = 'org_id';

-- Should return: 1 row with 'org_id'
```

---

## 🐛 If You Still Get Errors

### Error: "relation brand_dna already exists"
**Fix:** The table exists but might be broken. Run cleanup from Step 2, then retry.

### Error: "column org_id does not exist" 
**Fix:** This means the table was created but with wrong columns. Run:
```sql
DROP TABLE IF EXISTS public.brand_dna CASCADE;
```
Then rerun the migration.

### Error: "permission denied"
**Fix:** Make sure you're running as the `postgres` role (not anon/authenticated).

---

## 📋 Quick Checklist

- [ ] Ran diagnostic query (Step 1)
- [ ] Ran cleanup if needed (Step 2)
- [ ] Copied ENTIRE migration file
- [ ] Pasted into SQL Editor
- [ ] Clicked "Run"
- [ ] Verified success (Step 4)
- [ ] No errors in results

---

**The key:** Since `brand_dna` doesn't exist in your database yet, the migration should work cleanly. The error you got was likely from a partial/failed migration attempt. Clean up any broken pieces first, then run the full migration fresh.











