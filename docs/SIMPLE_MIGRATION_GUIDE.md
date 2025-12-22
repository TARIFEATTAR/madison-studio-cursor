# Simple Migration Guide - Fix "relation does not exist" Error

## The Problem

You're getting `relation "public.brand_dna" does not exist` because the cleanup query tries to drop policies on a table that doesn't exist yet.

## ✅ Simple Solution

### Step 1: Run Safe Cleanup

Copy and run this **SAFE** cleanup query (it only drops things that exist):

```sql
-- Drop functions (safe - doesn't require tables)
DROP FUNCTION IF EXISTS public.get_brand_dna(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.match_writing_examples CASCADE;
DROP FUNCTION IF EXISTS public.match_visual_examples CASCADE;

-- Drop tables (CASCADE automatically drops policies)
DROP TABLE IF EXISTS public.brand_dna CASCADE;
DROP TABLE IF EXISTS public.brand_products CASCADE;
DROP TABLE IF EXISTS public.design_systems CASCADE;
DROP TABLE IF EXISTS public.brand_writing_examples CASCADE;
DROP TABLE IF EXISTS public.brand_visual_examples CASCADE;
DROP TABLE IF EXISTS public.generated_content CASCADE;
DROP TABLE IF EXISTS public.madison_masters CASCADE;
DROP TABLE IF EXISTS public.visual_masters CASCADE;
DROP TABLE IF EXISTS public.schwartz_templates CASCADE;
```

**This won't error** because `IF EXISTS` handles missing tables gracefully.

### Step 2: Run Main Migration

Now run the full migration file:
- `20251210000000_madison_architecture_schema.sql`

**Copy ALL contents** and paste into SQL Editor, then click "Run".

### Step 3: Run Seed Migration

After the schema migration succeeds, run:
- `20251210000001_seed_madison_masters.sql`

**Copy ALL contents** and paste into SQL Editor, then click "Run".

### Step 4: Verify

Run this verification:

```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'madison_masters',
  'visual_masters', 
  'schwartz_templates',
  'brand_dna',
  'brand_products',
  'design_systems'
)
ORDER BY table_name;

-- Check seed data
SELECT COUNT(*) as copy_masters FROM madison_masters; -- Should be 7
SELECT COUNT(*) as visual_masters FROM visual_masters; -- Should be 4
SELECT COUNT(*) as schwartz_templates FROM schwartz_templates; -- Should be 5
```

---

## 🎯 Why This Works

- `DROP TABLE IF EXISTS` won't error if the table doesn't exist
- `CASCADE` automatically drops dependent policies/functions
- Starting fresh ensures no conflicts

---

## ✅ Success Checklist

- [ ] Cleanup query ran without errors
- [ ] Schema migration ran successfully
- [ ] Seed migration ran successfully  
- [ ] Verification queries show correct counts
- [ ] No errors in SQL Editor

---

**That's it!** The key is using `IF EXISTS` so it doesn't error when tables don't exist yet.




















