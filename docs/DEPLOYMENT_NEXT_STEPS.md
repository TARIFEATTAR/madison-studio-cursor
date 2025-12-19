# Deployment Next Steps - After Successful Migrations

**✅ Status:** Database migrations complete!  
**Next:** Deploy edge functions and configure API keys

---

## 🎉 What You've Completed

- ✅ Database schema created (9 tables)
- ✅ Master documents seeded (7 copy, 4 visual, 5 Schwartz)
- ✅ pgvector extension enabled
- ✅ All indexes and RLS policies created

---

## 🚀 Next Steps

### STEP 1: Verify All Tables (Optional - Quick Check)

Run this in SQL Editor to confirm everything:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'madison_masters', 'visual_masters', 'schwartz_templates',
  'brand_dna', 'brand_products', 'design_systems',
  'brand_writing_examples', 'brand_visual_examples', 'generated_content'
)
ORDER BY table_name;
```

**Expected:** 9 tables listed

---

### STEP 2: Deploy Edge Functions (10 minutes)

**Option A: Via Supabase Dashboard (Easiest)**

1. Go to **Edge Functions** in left sidebar
2. For each function folder, click **"Deploy"**:
   - `scan-website-enhanced`
   - `scan-brand-document`  
   - `remove-background`

**Option B: Via CLI**

```bash
cd "/Users/jordanrichter/Projects/Madison Studio/madison-app"

# Link to your project (if not already linked)
# Get your project ref from Supabase Dashboard → Settings → General
supabase link --project-ref YOUR_PROJECT_REF

# Deploy functions
supabase functions deploy scan-website-enhanced
supabase functions deploy scan-brand-document
supabase functions deploy remove-background
```

**Verify:**
- [ ] All 3 functions show "Healthy" status
- [ ] No deployment errors in logs

---

### STEP 3: Set Environment Variables (5 minutes)

**In Supabase Dashboard → Settings → Edge Functions → Secrets:**

Add these secrets (click "Add new secret" for each):

```bash
# Required for Brand Scanner
SCREENSHOT_API_KEY=your_screenshot_api_key
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key

# Required for Background Removal (at least ONE)
FAL_API_KEY=your_fal_api_key
# OR
REPLICATE_API_TOKEN=your_replicate_token
# OR
PHOTOROOM_API_KEY=your_photoroom_key
```

**Where to Get Keys:**

| Service | URL | Free Tier? |
|---------|-----|------------|
| **ScreenshotAPI.net** | https://screenshotapi.net | ✅ Yes |
| **Screenshot Machine** | https://www.screenshotmachine.com | ✅ Yes |
| **Gemini** | https://makersuite.google.com/app/apikey | ✅ Yes |
| **Anthropic (Claude)** | https://console.anthropic.com/ | ❌ No (but free trial) |
| **fal.ai** | https://fal.ai | ✅ Yes |
| **Replicate** | https://replicate.com | ✅ Yes |

**Note:** You can start with just one background removal service. Add more later if needed.

---

### STEP 4: Test Brand Quick View Panel (2 minutes)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Go to Dashboard:**
   - Look for **"Brand"** button in top bar (right side)
   - Click it → Panel should slide out from right
   - If no brand DNA exists, shows "No Brand DNA Yet" message

3. **If button doesn't appear:**
   - Check browser console (F12) for errors
   - Verify `useBrandDNA` hook is working
   - Check that organization exists

---

### STEP 5: Test Background Removal (2 minutes)

1. **Go to Image Library or Dark Room**
2. **Click any image**
3. **Image Editor Modal opens**
4. **Look for "BG Remove" tab** (with scissors icon)
5. **Click tab** → Should show background removal interface
6. **Click "Remove Background"** → Should process (if API keys are set)

**If API keys aren't set:** You'll see an error, but the UI should still work.

---

### STEP 6: Test Brand Scanner (Optional - Requires API Keys)

1. **Go to Settings → Brand Guidelines**
2. **Upload a brand document PDF**
3. **Should process and extract:**
   - Brand voice
   - Colors
   - Typography
   - Mission/values
   - Squad assignments

---

## 📋 Deployment Checklist

### Database ✅
- [x] Schema migration complete
- [x] Seed migration complete
- [x] All tables verified
- [x] Seed data verified

### Edge Functions
- [ ] `scan-website-enhanced` deployed
- [ ] `scan-brand-document` deployed
- [ ] `remove-background` deployed
- [ ] All functions healthy

### Environment Variables
- [ ] `SCREENSHOT_API_KEY` set
- [ ] `GEMINI_API_KEY` set
- [ ] `ANTHROPIC_API_KEY` set
- [ ] At least one background removal key set

### Frontend Testing
- [ ] Brand Quick View button visible
- [ ] Panel opens/closes correctly
- [ ] Background Removal tab visible
- [ ] No console errors

---

## 🎯 Priority Order

**Do these now:**
1. ✅ Deploy edge functions (Step 2)
2. ✅ Set environment variables (Step 3)
3. ✅ Test Brand Quick View (Step 4)

**Then:**
4. ✅ Test Background Removal (Step 5)
5. ✅ Test Brand Scanner (Step 6)

---

## 🐛 Troubleshooting

**Brand Quick View not showing:**
- Check browser console for errors
- Verify component is imported in `DashboardNew.tsx`
- Check that `useBrandDNA` hook works

**Background Removal not working:**
- Verify API keys are set in Supabase secrets
- Check edge function logs for errors
- Test with a simple public image URL

**Edge Functions won't deploy:**
- Check Supabase CLI is linked: `supabase link`
- Verify function folders exist
- Check function syntax/imports

---

## 📚 Reference

- `IMPLEMENTATION_CHECKLIST.md` - Full deployment guide
- `WHERE_TO_FIND_FEATURES.md` - UI locations
- `NEXT_STEPS.md` - Complete action plan

---

**Start with Step 2 (Deploy Edge Functions)** - that's the next critical step!


















