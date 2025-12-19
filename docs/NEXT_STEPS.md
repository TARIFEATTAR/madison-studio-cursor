# Next Steps - Complete Implementation Guide

**Current Status:** Migrations ready, need to apply to database  
**Goal:** Get everything working end-to-end

---

## 🎯 Step-by-Step Action Plan

### ✅ STEP 1: Clean Up Database (2 minutes)

**In Supabase SQL Editor, run:**

```sql
-- Safe cleanup - won't error if tables don't exist
DROP FUNCTION IF EXISTS public.get_brand_dna(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.match_writing_examples CASCADE;
DROP FUNCTION IF EXISTS public.match_visual_examples CASCADE;

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

**Expected Result:** ✅ "Success. No rows returned"

---

### ✅ STEP 2: Run Schema Migration (5 minutes)

1. **Open:** `supabase/migrations/20251210000000_madison_architecture_schema.sql`
2. **Select All:** Cmd+A (or Ctrl+A)
3. **Copy:** Cmd+C (or Ctrl+C)
4. **In Supabase SQL Editor:**
   - Click "New Query"
   - Paste (Cmd+V)
   - Click "Run" (or Cmd+Enter)
5. **Wait** for completion (10-30 seconds)

**Expected Result:** ✅ "Success. No rows returned"

**If you get errors:** Check `FIX_MIGRATION_ERROR.md` for troubleshooting

---

### ✅ STEP 3: Run Seed Migration (2 minutes)

1. **Open:** `supabase/migrations/20251210000001_seed_madison_masters.sql`
2. **Select All:** Cmd+A
3. **Copy:** Cmd+C
4. **In Supabase SQL Editor:**
   - Click "New Query"
   - Paste
   - Click "Run"
5. **Wait** for completion (5-10 seconds)

**Expected Result:** ✅ "Success. No rows returned"

---

### ✅ STEP 4: Verify Migrations (1 minute)

Run this verification query:

```sql
-- Check tables exist
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
)
ORDER BY table_name;

-- Check seed data
SELECT 
  'madison_masters' as table_name, COUNT(*) as count FROM madison_masters
UNION ALL
SELECT 'visual_masters', COUNT(*) FROM visual_masters
UNION ALL
SELECT 'schwartz_templates', COUNT(*) FROM schwartz_templates;
```

**Expected Results:**
- 9 tables listed
- `madison_masters`: 7 rows
- `visual_masters`: 4 rows
- `schwartz_templates`: 5 rows

---

### ✅ STEP 5: Deploy Edge Functions (10 minutes)

**Option A: Via Supabase Dashboard (Easiest)**

1. Go to **Edge Functions** in left sidebar
2. For each function, click **"Deploy"**:
   - `scan-website-enhanced`
   - `scan-brand-document`
   - `remove-background`
3. Upload the function folder or use CLI (see Option B)

**Option B: Via CLI**

```bash
cd "/Users/jordanrichter/Projects/Madison Studio/madison-app"

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy scan-website-enhanced
supabase functions deploy scan-brand-document
supabase functions deploy remove-background
```

**Verify:**
- [ ] All 3 functions show "Healthy" status
- [ ] No deployment errors

---

### ✅ STEP 6: Set Environment Variables (5 minutes)

**In Supabase Dashboard → Settings → Edge Functions → Secrets:**

Add these secrets:

```bash
# Required for Brand Scanner
SCREENSHOT_API_KEY=your_key_here
GEMINI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here

# Required for Background Removal (at least one)
FAL_API_KEY=your_key_here
# OR
REPLICATE_API_TOKEN=your_token_here
# OR  
PHOTOROOM_API_KEY=your_key_here
```

**Where to get keys:**
- **ScreenshotAPI.net:** https://screenshotapi.net (free tier)
- **Gemini:** https://makersuite.google.com/app/apikey
- **Anthropic:** https://console.anthropic.com/
- **fal.ai:** https://fal.ai (free tier)
- **Replicate:** https://replicate.com (free tier)

**Verify:**
- [ ] All secrets are saved
- [ ] No typos in key names

---

### ✅ STEP 7: Test Everything (5 minutes)

**Test Brand Quick View Panel:**

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to Dashboard:**
   - Should see "Brand" button in top bar
   - Click it → Panel should slide out
   - If no brand DNA exists, shows "No Brand DNA Yet"

**Test Background Removal:**

1. **Go to Image Library or Dark Room**
2. **Click any image**
3. **Image Editor Modal opens**
4. **Click "BG Remove" tab**
5. **Click "Remove Background"**
6. **Should process** (if API keys are set)

**Test Brand Scanner:**

1. **Go to Settings → Brand Guidelines**
2. **Upload a brand document PDF**
3. **Should process and extract data**

---

### ✅ STEP 8: Deploy Frontend (If Ready)

```bash
# Build
npm run build

# Deploy to Vercel/Netlify/etc.
# (Follow your normal deployment process)
```

---

## 📋 Complete Checklist

### Database
- [ ] Cleanup query ran successfully
- [ ] Schema migration ran successfully
- [ ] Seed migration ran successfully
- [ ] Verification queries show correct counts
- [ ] All 9 tables exist

### Edge Functions
- [ ] `scan-website-enhanced` deployed
- [ ] `scan-brand-document` deployed
- [ ] `remove-background` deployed
- [ ] All functions show "Healthy"

### Environment Variables
- [ ] `SCREENSHOT_API_KEY` set
- [ ] `GEMINI_API_KEY` set
- [ ] `ANTHROPIC_API_KEY` set
- [ ] At least one background removal key set

### Frontend
- [ ] Brand Quick View button visible on dashboard
- [ ] Panel opens/closes correctly
- [ ] Background Removal tab in Image Editor
- [ ] No console errors

### Testing
- [ ] Brand Quick View works
- [ ] Background Removal works (with API keys)
- [ ] Brand Scanner works (with API keys)

---

## 🎯 Priority Order

**Do these first (critical):**
1. ✅ Database migrations (Steps 1-4)
2. ✅ Deploy edge functions (Step 5)
3. ✅ Set environment variables (Step 6)

**Then test:**
4. ✅ Test Brand Quick View (Step 7)
5. ✅ Test Background Removal (Step 7)

**Finally:**
6. ✅ Deploy frontend (Step 8)

---

## 🐛 If Something Fails

**Migration errors:** See `FIX_MIGRATION_ERROR.md`  
**Function deployment errors:** Check Supabase logs  
**Frontend errors:** Check browser console (F12)  
**API errors:** Verify environment variables are set

---

## 📚 Reference Docs

- `IMPLEMENTATION_CHECKLIST.md` - Full deployment guide
- `WHERE_TO_FIND_FEATURES.md` - UI locations
- `QUICK_MIGRATION_GUIDE.md` - Migration steps
- `FIX_MIGRATION_ERROR.md` - Troubleshooting

---

**Start with Step 1** and work through each step. Take your time - each step builds on the previous one!


















