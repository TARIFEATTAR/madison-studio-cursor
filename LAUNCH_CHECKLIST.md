# 🚀 Launch Checklist - Complete Guide

**Last Updated:** Today  
**Status:** ~80% Ready | Needs Configuration & Verification

---

## 📊 CURRENT BUILD STATUS

### ✅ What's Working
- **Frontend Code:** ✅ Complete and compiling
- **Backend Code:** ✅ All edge functions coded
- **Database Structure:** ✅ Migrations exist
- **UI Components:** ✅ All features built
- **TypeScript:** ✅ Configured (Deno files excluded)
- **GitHub Actions:** ✅ Deployment workflows ready

### ⚠️ What Needs Verification/Setup
- **Edge Functions Deployment:** ⚠️ Need to verify all are deployed
- **API Keys:** ⚠️ Need to verify in Supabase secrets
- **Stripe Configuration:** ⚠️ Need products & webhook setup
- **Madison Training Data:** ❓ Unknown if populated
- **Frontend Environment:** ⚠️ Need to verify `.env` file

---

## 🎯 LAUNCH CHECKLIST (Priority Order)

### 🔴 CRITICAL - Do These First (Blocks Launch)

#### 1. Verify AI API Key is Set ⭐ (5 minutes)

**Status:** You mentioned generation is working, so likely ✅ Set

**Verify:**
1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions
2. Scroll to "Secrets" section
3. Check: `GEMINI_API_KEY` exists and starts with `AIza...`

**If Missing:**
- Get key from: https://aistudio.google.com
- Add to Supabase secrets as `GEMINI_API_KEY`
- Value: Your API key (starts with `AIza...`)

**Test:** Generate content in app - should work ✅

---

#### 2. Verify Frontend Environment Variables (5 minutes)

**Check if `.env` file exists:**
```bash
ls -la .env
```

**If missing or incomplete, create/update:**
```bash
# Get your anon key from: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/api
# Then create .env file:
cat > .env << EOF
VITE_SUPABASE_URL=https://likkskifwsrvszxdvufw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key_here
EOF
```

**Verify in browser console:**
```javascript
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Has Key:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
```

**Status:** [ ] ✅ Verified / [ ] ⚠️ Needs Setup

---

#### 3. Verify Edge Functions Are Deployed (10 minutes)

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**Check these critical functions show "Active":**
- [ ] `generate-with-claude` - Content generation
- [ ] `repurpose-content` - Content transformation (v10 deployed)
- [ ] `create-checkout-session` - Stripe billing
- [ ] `stripe-webhook` - Payment processing
- [ ] `get-subscription` - Subscription management
- [ ] `process-madison-training-document` - Training docs

**If any are missing, deploy:**
```bash
npx supabase functions deploy generate-with-claude --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy repurpose-content --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy create-checkout-session --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy stripe-webhook --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy get-subscription --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy process-madison-training-document --project-ref likkskifwsrvszxdvufw
```

**Status:** [ ] ✅ All Deployed / [ ] ⚠️ Some Missing

---

### 🟡 HIGH PRIORITY - Required for Full Functionality

#### 4. Set Up Stripe Billing (30-45 minutes)

**A. Verify Stripe Secrets:**
- Go to: Supabase Dashboard → Settings → Edge Functions → Secrets
- Check: `STRIPE_SECRET_KEY` exists (starts with `sk_test_...` or `sk_live_...`)
- Status: [ ] ✅ Set / [ ] ❌ Missing

**B. Create Stripe Products (13 total):**

Go to: https://dashboard.stripe.com/test/products

**Base Tiers (6 products):**
1. Atelier Monthly - $49/month
2. Atelier Annual - $470/year
3. Studio Monthly - $199/month
4. Studio Annual - $1,990/year
5. Maison Monthly - $599/month
6. Maison Annual - $5,990/year

**Add-Ons (7 products):**
7. White-Label - $199/month
8. Extra Images 50 - $25/month
9. Extra Images 100 - $45/month
10. Extra Images 500 - $175/month
11. Brand Slot - $50/month
12. Team 5-pack - $50/month
13. Priority Onboarding - $500 (one-time)

**For each product:**
- Copy the Price ID (starts with `price_...`)
- Update `update_stripe_price_ids.sql` with your Price IDs
- Run the SQL in Supabase SQL Editor

**C. Set Up Stripe Webhook:**
1. Go to: Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. URL: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_method.attached`
5. Copy signing secret (`whsec_...`)
6. Add to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

**Status:** [ ] ✅ Complete / [ ] ⚠️ In Progress / [ ] ❌ Not Started

---

#### 5. Verify Database Tables (5 minutes)

**Run in Supabase SQL Editor:**
```sql
-- Check subscription plans
SELECT name, slug, price_monthly FROM subscription_plans ORDER BY sort_order;
-- Should return 3 rows: Atelier, Studio, Maison

-- Check Madison training config
SELECT id, persona IS NOT NULL as has_persona, 
       writing_influences IS NOT NULL as has_influences 
FROM madison_system_config LIMIT 1;
-- Check if data exists
```

**Status:** [ ] ✅ Verified / [ ] ⚠️ Needs Data

---

#### 6. Populate Madison Training Data (15-30 minutes)

**Check if data exists:**
1. Go to Settings → Madison Training tab (Super Admin only)
2. Check if fields are populated:
   - Writing Influences (8 legendary copywriters)
   - Editorial Philosophy
   - Forbidden Phrases
   - Quality Standards
   - Voice Spectrum

**If empty, add:**
1. Fill in all text fields with your training documentation
2. Upload training documents (text files recommended - `.txt` or `.md`)
3. Click "Save Madison's System Training"

**Status:** [ ] ✅ Populated / [ ] ⚠️ Needs Data

---

### 🟢 MEDIUM PRIORITY - Nice to Have

#### 7. Set Up Google OAuth (If using Calendar features)

**Required Secrets:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_TOKEN_ENCRYPTION_KEY` (generate with command in docs)

**Status:** [ ] ✅ Set / [ ] ⚠️ Optional / [ ] ❌ Not Using

---

#### 8. Set Up GitHub Actions Auto-Deployment (Optional)

**Already Created:**
- `.github/workflows/deploy-optimized.yml` ✅
- `.github/workflows/deploy.yml` ✅

**To Enable:**
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add secrets:
   - `SUPABASE_ACCESS_TOKEN` (get from Supabase Dashboard → Account → Tokens)
   - `VITE_SUPABASE_URL` = `https://likkskifwsrvszxdvufw.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = Your anon key

**Status:** [ ] ✅ Set Up / [ ] ⚠️ Optional

---

## 🧪 TESTING CHECKLIST

### Core Features
- [ ] User authentication (Google OAuth)
- [ ] Content creation (Forge)
- [ ] Content generation (AI working)
- [ ] Content repurposing (Multiply)
- [ ] Image generation (Image Studio)
- [ ] Billing/subscriptions (Stripe checkout)
- [ ] Brand knowledge upload
- [ ] Madison training upload

### Edge Functions
- [ ] `generate-with-claude` - Test content generation
- [ ] `repurpose-content` - Test content transformation
- [ ] `create-checkout-session` - Test Stripe checkout
- [ ] `stripe-webhook` - Test webhook (use Stripe test webhook)
- [ ] `get-subscription` - Test subscription data retrieval

---

## 📋 QUICK VERIFICATION COMMANDS

### Check Frontend Config
```bash
# Check if .env exists
ls -la .env

# Check environment variables (in browser console)
console.log(import.meta.env.VITE_SUPABASE_URL);
```

### Check Edge Functions
```bash
# List all deployed functions
npx supabase functions list --project-ref likkskifwsrvszxdvufw
```

### Check Database
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM subscription_plans; -- Should be 3
SELECT COUNT(*) FROM madison_system_config; -- Should be 0 or 1
```

---

## 🚨 COMMON ISSUES & FIXES

### Issue: "No AI API configured"
**Fix:** Add `GEMINI_API_KEY` to Supabase secrets

### Issue: "Failed to create checkout"
**Fix:** Verify `STRIPE_SECRET_KEY` is set in Supabase secrets

### Issue: "Webhook signature verification failed"
**Fix:** Verify `STRIPE_WEBHOOK_SECRET` matches Stripe webhook signing secret

### Issue: "Missing Supabase environment variables"
**Fix:** Create `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`

### Issue: Function not found
**Fix:** Deploy the function using `npx supabase functions deploy <function-name>`

---

## ⏱️ ESTIMATED TIME TO LAUNCH

| Task | Time | Priority |
|------|------|----------|
| Verify AI API Key | 5 min | 🔴 Critical |
| Verify Frontend .env | 5 min | 🔴 Critical |
| Verify Edge Functions | 10 min | 🔴 Critical |
| Set Up Stripe | 30-45 min | 🟡 High |
| Verify Database | 5 min | 🟡 High |
| Populate Madison Training | 15-30 min | 🟡 High |
| **TOTAL** | **1-2 hours** | |

---

## ✅ LAUNCH READINESS SCORE

**Current Status:** ~80% Ready

| Component | Status | Blocking? |
|-----------|--------|-----------|
| Frontend Code | ✅ Ready | No |
| Backend Code | ✅ Ready | No |
| Edge Functions | ⚠️ Need Verification | Yes |
| AI API Keys | ✅ Working | No |
| Frontend Config | ⚠️ Need Verification | Yes |
| Stripe Setup | ⚠️ Needs Setup | Yes (for billing) |
| Database | ✅ Likely Ready | No |
| Madison Training | ❓ Unknown | No (but recommended) |

---

## 🎯 MINIMUM VIABLE LAUNCH (MVP)

**To launch with basic functionality:**

1. ✅ Verify AI API key is set (you said generation works)
2. ✅ Verify frontend `.env` file exists
3. ✅ Verify critical edge functions are deployed
4. ⚠️ Set up Stripe (if billing is needed)
5. ⚠️ Test core features

**Everything else can be added post-launch.**

---

## 📞 QUICK REFERENCE LINKS

- **Supabase Dashboard:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw
- **Edge Functions:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
- **Secrets:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions
- **SQL Editor:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new
- **Stripe Dashboard:** https://dashboard.stripe.com/test/products
- **Google AI Studio:** https://aistudio.google.com

---

## 🚀 NEXT STEPS

1. **Start with Critical items** (Items 1-3) - 20 minutes
2. **Set up Stripe** (Item 4) - 30-45 minutes
3. **Verify Database** (Item 5) - 5 minutes
4. **Populate Madison Training** (Item 6) - 15-30 minutes
5. **Test everything** - 15 minutes

**Total Time:** ~1.5-2 hours to full launch readiness

---

**Ready to start? Begin with Item 1 and work your way down!** 🎉


