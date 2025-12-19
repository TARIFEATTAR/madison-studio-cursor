# Fix Migration Error: column "org_id" does not exist

## The Problem

The error occurs because the migration is trying to create RLS policies or functions that reference `org_id`, but there might be an existing table or the migration is running in the wrong order.

## Quick Fix

Run this **BEFORE** running the main migration:

```sql
-- Check if brand_dna table already exists with wrong column name
DO $$
BEGIN
  -- If brand_dna exists but has organization_id instead of org_id, drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'brand_dna'
    AND EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'brand_dna' 
      AND column_name = 'organization_id'
    )
  ) THEN
    -- Drop existing table if it has wrong schema
    DROP TABLE IF EXISTS public.brand_dna CASCADE;
    RAISE NOTICE 'Dropped existing brand_dna table with wrong schema';
  END IF;
END $$;
```

## Alternative: Run Migration in Parts

If the above doesn't work, run the migration in smaller chunks:

### Step 1: Create Tables Only (Skip RLS for now)

Run just the `CREATE TABLE` statements first, then add RLS policies separately.

### Step 2: Check What Tables Exist

```sql
-- See what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%brand%'
ORDER BY table_name;
```

### Step 3: Check Column Names

```sql
-- Check column names in brand_dna (if it exists)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'brand_dna';
```

## Most Likely Solution

The error is probably from an RLS policy trying to reference `org_id` before the table is created. Try this:

1. **Run the migration WITHOUT the RLS policies first**
2. **Then add RLS policies separately**

Or, **drop all existing brand-related tables** first:

```sql
-- Drop existing tables (CAREFUL - this deletes data!)
DROP TABLE IF EXISTS public.brand_dna CASCADE;
DROP TABLE IF EXISTS public.brand_products CASCADE;
DROP TABLE IF EXISTS public.design_systems CASCADE;
DROP TABLE IF EXISTS public.brand_writing_examples CASCADE;
DROP TABLE IF EXISTS public.brand_visual_examples CASCADE;
DROP TABLE IF EXISTS public.generated_content CASCADE;
```

Then run the full migration.


















