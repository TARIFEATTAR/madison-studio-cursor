# Migration Steps - Apply to Remote Supabase

**Issue:** Local Supabase requires Docker (which isn't running)  
**Solution:** Apply migrations directly to your remote/production Supabase project

---

## 🚀 Step-by-Step Instructions

### Step 1: Open Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Log in if needed
3. **Find your project** (check your `.env` file for the project URL)
   - Look for project ID in URL like: `https://YOUR_PROJECT_ID.supabase.co`

### Step 2: Open SQL Editor

1. In your project dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New Query"** button (top right)

### Step 3: Run First Migration (Schema)

1. **Open this file** on your computer:
   ```
   supabase/migrations/20251210000000_madison_architecture_schema.sql
   ```

2. **Select ALL** contents (Cmd+A / Ctrl+A)

3. **Copy** (Cmd+C / Ctrl+C)

4. **Paste** into the SQL Editor in Supabase Dashboard

5. **Click "Run"** button (or press Cmd+Enter / Ctrl+Enter)

6. **Wait** for completion (10-30 seconds)
   - You should see: "Success. No rows returned"

### Step 4: Run Second Migration (Seed Data)

1. **Click "New Query"** again (to start fresh)

2. **Open this file**:
   ```
   supabase/migrations/20251210000001_seed_madison_masters.sql
   ```

3. **Select ALL** and **Copy**

4. **Paste** into SQL Editor

5. **Click "Run"**

6. **Wait** for completion

### Step 5: Verify Migrations Worked

Run this verification query in SQL Editor:

```sql
-- Check tables exist
SELECT 
  'madison_masters' as table_name, 
  COUNT(*) as row_count 
FROM madison_masters
UNION ALL
SELECT 'visual_masters', COUNT(*) FROM visual_masters
UNION ALL
SELECT 'schwartz_templates', COUNT(*) FROM schwartz_templates
UNION ALL
SELECT 'brand_dna', COUNT(*) FROM brand_dna;
```

**Expected Results:**
- `madison_masters`: 7 rows
- `visual_masters`: 4 rows  
- `schwartz_templates`: 5 rows
- `brand_dna`: 0 rows (empty until you scan a brand)

### Step 6: Verify pgvector Extension

```sql
-- Check pgvector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';
```

Should return 1 row showing the vector extension.

---

## ✅ Success Checklist

After running migrations, verify:

- [ ] No errors in SQL Editor
- [ ] `madison_masters` table has 7 rows
- [ ] `visual_masters` table has 4 rows
- [ ] `schwartz_templates` table has 5 rows
- [ ] `pgvector` extension is enabled
- [ ] All tables are visible in Database → Tables

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Meaning:** Some tables might already exist  
**Fix:** This is okay - the migration uses `CREATE TABLE IF NOT EXISTS`. Continue.

### Error: "permission denied"
**Meaning:** You don't have admin access  
**Fix:** Make sure you're logged in as project owner/admin

### Error: "extension vector does not exist"
**Fix:** Run this first in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
Then re-run the first migration.

### Error: "syntax error"
**Fix:** Make sure you copied the ENTIRE file, including the `$$` delimiters at the start/end

---

## 🎯 Next Steps After Migrations

Once migrations are complete:

1. ✅ **Deploy Edge Functions** (see `IMPLEMENTATION_CHECKLIST.md`)
2. ✅ **Set Environment Variables** (API keys)
3. ✅ **Test Brand Quick View Panel** (should appear on dashboard)
4. ✅ **Test Background Removal** (in Image Editor)

---

## 📝 Alternative: Start Docker (If You Want Local Testing)

If you want to test locally first:

```bash
# 1. Start Docker Desktop application
# (Open Docker Desktop app on your Mac)

# 2. Wait for Docker to start (check system tray icon)

# 3. Then start Supabase
cd "/Users/jordanrichter/Projects/Madison Studio/madison-app"
supabase start

# 4. Wait for it to initialize (1-2 minutes)

# 5. Then run migrations
supabase migration up
```

**But for production deployment, use the Dashboard method above!**

---

**Questions?** Check `IMPLEMENTATION_CHECKLIST.md` for complete deployment guide.
















