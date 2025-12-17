# Quick Migration Guide - Apply to Remote Supabase

Since your local Supabase isn't running, let's apply migrations directly to your **remote/production** Supabase project.

---

## 🚀 Method 1: Via Supabase Dashboard (Easiest)

### Step 1: Access Your Project
1. Go to: https://supabase.com/dashboard
2. Find your project (check your `.env` file for project ID)
3. Click on your project

### Step 2: Navigate to Migrations
1. Click **"SQL Editor"** in the left sidebar
2. Or go directly to: **Database → Migrations**

### Step 3: Run Migration 1 (Schema)
1. Click **"New Query"**
2. Open file: `supabase/migrations/20251210000000_madison_architecture_schema.sql`
3. Copy **ALL** contents
4. Paste into SQL Editor
5. Click **"Run"** (or press Cmd+Enter)
6. Wait for completion (should take 10-30 seconds)

### Step 4: Run Migration 2 (Seed Data)
1. Click **"New Query"** again
2. Open file: `supabase/migrations/20251210000001_seed_madison_masters.sql`
3. Copy **ALL** contents
4. Paste into SQL Editor
5. Click **"Run"**
6. Wait for completion

### Step 5: Verify
Run this query in SQL Editor:

```sql
-- Check masters were seeded
SELECT COUNT(*) as copy_masters FROM madison_masters; -- Should be 7
SELECT COUNT(*) as visual_masters FROM visual_masters; -- Should be 4
SELECT COUNT(*) as schwartz_templates FROM schwartz_templates; -- Should be 5

-- Check pgvector extension
SELECT * FROM pg_extension WHERE extname = 'vector'; -- Should exist
```

---

## 🔧 Method 2: Via Supabase CLI (If Linked)

If you've linked your project to Supabase CLI:

```bash
# Make sure you're in the project root
cd /Users/jordanrichter/Projects/Madison\ Studio/madison-app

# Link to your remote project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations to remote
supabase db push
```

**To find your project ref:**
- Check your `.env` file for `VITE_SUPABASE_URL`
- Extract the project ID from the URL
- Example: `https://likkskifwsrvszxdvufw.supabase.co` → project ref is `likkskifwsrvszxdvufw`

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Meaning:** Some tables already exist  
**Fix:** This is okay - the migration will skip existing tables. Continue.

### Error: "permission denied"
**Meaning:** You don't have admin access  
**Fix:** Make sure you're logged in as project owner/admin

### Error: "extension vector does not exist"
**Meaning:** pgvector extension not enabled  
**Fix:** Run this first in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## ✅ After Migrations Complete

1. **Verify tables exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'madison_masters', 
  'visual_masters', 
  'schwartz_templates',
  'brand_dna',
  'brand_products',
  'design_systems',
  'brand_writing_examples',
  'brand_visual_examples',
  'generated_content'
);
```

2. **Check seed data:**
```sql
SELECT name, squad FROM madison_masters; -- Should show 7 masters
```

3. **Test RLS policies:**
```sql
-- Should return policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('madison_masters', 'brand_dna');
```

---

## 🎯 Next Steps

After migrations are complete:
1. ✅ Deploy edge functions (see `IMPLEMENTATION_CHECKLIST.md`)
2. ✅ Set environment variables
3. ✅ Test Brand Quick View Panel
4. ✅ Test Background Removal

---

**Need help?** Check the full `IMPLEMENTATION_CHECKLIST.md` for complete deployment steps.













