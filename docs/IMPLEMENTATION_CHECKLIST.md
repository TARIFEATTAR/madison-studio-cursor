# Implementation Checklist - Madison Architecture & Features

**Date:** December 10, 2025  
**Status:** Ready for Deployment  
**Total Components:** 6 major features

---

## ✅ WHAT WAS BUILT

### 1. Database Schema (Three Silos Architecture)
- ✅ `20251210000000_madison_architecture_schema.sql` - Main schema
- ✅ `20251210000001_seed_madison_masters.sql` - Master data seeding
- ✅ Tables: `madison_masters`, `visual_masters`, `schwartz_templates`, `brand_dna`, `brand_products`, `design_systems`, `brand_writing_examples`, `brand_visual_examples`, `generated_content`

### 2. TypeScript Types
- ✅ `src/types/madison.ts` - All type definitions

### 3. 4-Agent Pipeline
- ✅ `src/lib/agents/router.ts` - Router Agent
- ✅ `src/lib/agents/assembler.ts` - Assembler Agent
- ✅ `src/lib/agents/generator.ts` - Generator Agent
- ✅ `src/lib/agents/editor.ts` - Editor Agent
- ✅ `src/lib/agents/pipeline.ts` - Main orchestrator
- ✅ `src/lib/agents/index.ts` - Exports

### 4. Brand Scanner (Pomelli-style)
- ✅ `supabase/functions/_shared/visualAnalyzer.ts` - Visual analysis
- ✅ `supabase/functions/_shared/squadAssignment.ts` - Squad auto-assignment
- ✅ `supabase/functions/_shared/designTokenGenerator.ts` - Design tokens
- ✅ `supabase/functions/scan-website-enhanced/index.ts` - Enhanced URL scanner
- ✅ `supabase/functions/scan-brand-document/index.ts` - PDF document scanner

### 5. Brand Quick View Panel UI
- ✅ `src/components/brand/BrandQuickViewPanel.tsx` - Main panel component
- ✅ `src/components/brand/BrandQuickViewTrigger.tsx` - Trigger button
- ✅ `src/components/brand/index.ts` - Exports
- ✅ `src/hooks/useBrandDNA.tsx` - Brand DNA hook
- ✅ **ADDED TO:** `src/pages/DashboardNew.tsx` (top bar)
- ✅ **ADDED TO:** `src/components/dashboard/BrandHealthCard.tsx` (quick view button)

### 6. Background Removal
- ✅ `supabase/functions/remove-background/index.ts` - Edge function
- ✅ `src/hooks/useBackgroundRemoval.tsx` - React hook
- ✅ `src/components/image-editor/BackgroundRemovalTab.tsx` - UI component
- ✅ **ADDED TO:** `src/components/image-editor/ImageEditorModal.tsx` (new tab)

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Database Migrations

**Run these migrations in order:**

```bash
# Navigate to Supabase project
cd supabase

# Apply migrations
supabase migration up

# Or if using Supabase CLI locally:
supabase db push

# Or via Supabase Dashboard:
# 1. Go to Database → Migrations
# 2. Upload and run: 20251210000000_madison_architecture_schema.sql
# 3. Upload and run: 20251210000001_seed_madison_masters.sql
```

**Verify:**
- [ ] Check `madison_masters` table has 7 rows
- [ ] Check `visual_masters` table has 4 rows
- [ ] Check `schwartz_templates` table has 5 rows
- [ ] Verify `pgvector` extension is enabled
- [ ] Test RLS policies are active

```sql
-- Quick verification queries
SELECT COUNT(*) FROM madison_masters; -- Should be 7
SELECT COUNT(*) FROM visual_masters; -- Should be 4
SELECT COUNT(*) FROM schwartz_templates; -- Should be 5
SELECT * FROM pg_extension WHERE extname = 'vector'; -- Should exist
```

---

### Step 2: Deploy Edge Functions

**Deploy all new edge functions:**

```bash
# Deploy enhanced website scanner
supabase functions deploy scan-website-enhanced

# Deploy brand document scanner
supabase functions deploy scan-brand-document

# Deploy background removal
supabase functions deploy remove-background
```

**Or via Supabase Dashboard:**
1. Go to Edge Functions
2. Deploy each function folder individually
3. Set timeout to 60 seconds for all functions

**Verify:**
- [ ] `scan-website-enhanced` is deployed and active
- [ ] `scan-brand-document` is deployed and active
- [ ] `remove-background` is deployed and active
- [ ] All functions show "Healthy" status

---

### Step 3: Environment Variables

**Add these secrets to Supabase (Settings → Edge Functions → Secrets):**

```bash
# Required for Brand Scanner
SCREENSHOT_API_KEY=your_screenshot_api_key          # ScreenshotAPI.net or Screenshot Machine
GEMINI_API_KEY=your_gemini_api_key                  # For visual analysis
ANTHROPIC_API_KEY=your_anthropic_api_key             # For squad assignment

# Required for Background Removal (at least one)
FAL_API_KEY=your_fal_api_key                        # Primary (best quality)
REPLICATE_API_TOKEN=your_replicate_token            # Fallback 1
PHOTOROOM_API_KEY=your_photoroom_key                # Fallback 2

# Already configured (verify these exist)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Where to get API keys:**
- **ScreenshotAPI.net:** https://screenshotapi.net (free tier available)
- **Screenshot Machine:** https://www.screenshotmachine.com (free tier available)
- **Gemini:** https://makersuite.google.com/app/apikey
- **Anthropic (Claude):** https://console.anthropic.com/
- **fal.ai:** https://fal.ai (free tier available)
- **Replicate:** https://replicate.com (free tier available)
- **PhotoRoom:** https://www.photoroom.com/api/

**Verify:**
- [ ] All secrets are set in Supabase
- [ ] Test edge function logs show no "missing API key" errors

---

### Step 4: Frontend Build & Deploy

**Build the frontend:**

```bash
# Install dependencies (if needed)
npm install

# Build for production
npm run build

# Test locally first
npm run dev
```

**Verify UI Components:**
- [ ] Dashboard shows Brand Quick View trigger in top bar
- [ ] Brand Health Card shows "Brand" quick view button
- [ ] Image Editor Modal has "BG Remove" tab
- [ ] No console errors related to new components

**Deploy:**
- [ ] Deploy to production (Vercel/Netlify/etc.)
- [ ] Verify all routes load correctly
- [ ] Test Brand Quick View Panel opens/closes
- [ ] Test Background Removal tab in Image Editor

---

### Step 5: Test Everything

**Test Brand Scanner:**

```bash
# Test enhanced website scanner
curl -X POST https://your-project.supabase.co/functions/v1/scan-website-enhanced \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "organizationId": "your-org-id"
  }'
```

**Test Background Removal:**

```bash
# Test background removal
curl -X POST https://your-project.supabase.co/functions/v1/remove-background \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/image.jpg",
    "organizationId": "your-org-id",
    "userId": "your-user-id"
  }'
```

**Test 4-Agent Pipeline:**

```typescript
// In your app, test the pipeline
import { madisonPipeline } from '@/lib/agents';

const result = await madisonPipeline({
  brief: "Write a blog post about sustainable living",
  organizationId: "your-org-id",
  userId: "your-user-id"
});
```

**Manual UI Tests:**
- [ ] Click Brand Quick View trigger → Panel opens
- [ ] Panel shows logo, colors, typography, squads
- [ ] Click "Rescan Brand" → Function executes
- [ ] Open Image Editor → See "BG Remove" tab
- [ ] Upload image → Click "Remove Background" → Works
- [ ] Background removed image downloads correctly

---

### Step 6: Data Migration (If Needed)

**If you have existing brand data:**

```sql
-- Migrate existing brand_scans to new brand_dna table
INSERT INTO brand_dna (org_id, visual, essence, scan_metadata, scan_method)
SELECT 
  organization_id,
  jsonb_build_object(
    'colors', jsonb_build_object(
      'primary', primary_color,
      'secondary', secondary_color,
      'palette', ARRAY[primary_color, secondary_color]
    ),
    'typography', jsonb_build_object(
      'headline', headline_font,
      'body', body_font
    )
  ),
  jsonb_build_object(
    'tone', brand_tone,
    'mission', mission_statement
  ),
  jsonb_build_object(
    'scanned_at', created_at,
    'confidence', 0.75
  ),
  'LEGACY_MIGRATION'
FROM brand_scans
WHERE organization_id IS NOT NULL;
```

---

## 🐛 TROUBLESHOOTING

### Issue: Brand Quick View Panel doesn't open

**Check:**
- [ ] `useBrandDNA` hook is importing correctly
- [ ] Organization ID exists in `brand_dna` table
- [ ] Check browser console for errors
- [ ] Verify `BrandQuickViewPanel` component is imported

**Fix:**
```typescript
// Verify hook is working
const { quickView, isLoading } = useBrandDNA();
console.log('Quick View:', quickView);
```

### Issue: Background removal fails

**Check:**
- [ ] At least one API key is set (FAL_API_KEY, REPLICATE_API_TOKEN, or PHOTOROOM_API_KEY)
- [ ] Image URL is accessible (not behind auth)
- [ ] Edge function logs show error details

**Fix:**
```bash
# Check edge function logs
supabase functions logs remove-background

# Test with a public image URL
curl -X POST https://your-project.supabase.co/functions/v1/remove-background \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"imageUrl": "https://picsum.photos/400/400"}'
```

### Issue: Brand Scanner doesn't extract colors

**Check:**
- [ ] Screenshot API key is set
- [ ] Website URL is accessible
- [ ] Gemini API key is set
- [ ] Check edge function logs

**Fix:**
```bash
# Check logs
supabase functions logs scan-website-enhanced

# Verify screenshot capture works
# Test with ScreenshotAPI.net directly first
```

### Issue: 4-Agent Pipeline returns errors

**Check:**
- [ ] Brand DNA exists for organization
- [ ] Masters are seeded (check `madison_masters` table)
- [ ] Anthropic API key is set
- [ ] Check browser console for detailed errors

**Fix:**
```typescript
// Add error handling
try {
  const result = await madisonPipeline({...});
  console.log('Pipeline result:', result);
} catch (error) {
  console.error('Pipeline error:', error);
}
```

---

## 📊 VERIFICATION CHECKLIST

### Database
- [ ] All migrations applied successfully
- [ ] Master documents seeded (7 copy, 4 visual, 5 Schwartz)
- [ ] pgvector extension enabled
- [ ] RLS policies active
- [ ] Indexes created

### Edge Functions
- [ ] `scan-website-enhanced` deployed and healthy
- [ ] `scan-brand-document` deployed and healthy
- [ ] `remove-background` deployed and healthy
- [ ] All functions respond to test requests
- [ ] Logs show no critical errors

### Environment Variables
- [ ] Screenshot API key set
- [ ] Gemini API key set
- [ ] Anthropic API key set
- [ ] At least one background removal API key set
- [ ] Supabase URL and service role key set

### Frontend
- [ ] Brand Quick View trigger visible on dashboard
- [ ] Panel opens and closes correctly
- [ ] Background Removal tab in Image Editor
- [ ] No console errors
- [ ] All imports resolve correctly

### Integration
- [ ] Brand scanner creates `brand_dna` records
- [ ] Design tokens generated and stored
- [ ] Squad assignment works
- [ ] Background removal saves to library
- [ ] 4-Agent pipeline generates content

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **Monitor Edge Function Logs** (first 24 hours)
   - Check for errors
   - Monitor API usage/costs
   - Verify response times

2. **Test with Real Data**
   - Scan a real brand website
   - Upload a real brand document
   - Remove background from product images
   - Generate content using the pipeline

3. **User Testing**
   - Have team members test Brand Quick View
   - Test Background Removal on various images
   - Verify Brand Scanner accuracy

4. **Documentation**
   - Update user docs with new features
   - Create help articles
   - Record tutorial videos (see `VIDEO_1_FILMING_GUIDE.md`)

---

## 📝 NOTES

- **Brand Quick View Panel** is now visible in:
  - Dashboard top bar (desktop: minimal variant, mobile: icon-only)
  - Brand Health Card (minimal variant button)

- **Background Removal** is accessible via:
  - Image Editor Modal → "BG Remove" tab

- **Brand Scanner** can be triggered via:
  - Settings → Brand Guidelines → Upload document
  - Or call edge function directly

- **4-Agent Pipeline** is ready to use:
  - Import from `@/lib/agents`
  - Use `madisonPipeline()` function

---

**Status:** ✅ Ready for Production  
**Last Updated:** December 10, 2025  
**Questions?** Check edge function logs or browser console for detailed errors.




