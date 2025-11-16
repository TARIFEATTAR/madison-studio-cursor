# Fix "Failed to send a request to the Edge Function" - Step by Step

## 🔍 The Problem

You're getting "Failed to send a request to the Edge Function" which means the `create-checkout-session` function either:
1. **Isn't deployed** (most likely)
2. **Has errors** when running
3. **Missing environment variables**

---

## ✅ Step 1: Update Price IDs in Database (Do This First!)

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/sql/new

**Copy and paste this SQL:**

```sql
-- Update Stripe Price IDs in subscription_plans table
-- Run this FIRST before testing checkout

-- Atelier Plan (Monthly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI2mRcevBEPUM5PgL24JMl'
WHERE slug = 'atelier';

-- Studio Plan (Monthly and Yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI4fRcevBEPUM5beEkPxri'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQI4yRcevBEPUM594dUdrVW'
WHERE slug = 'studio';

-- Maison Plan (Monthly and Yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI5DRcevBEPUM50jgK4rgv'
WHERE slug = 'maison';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQI5SRcevBEPUM5aH2Yprgw'
WHERE slug = 'maison';

-- Verify it worked
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
ORDER BY sort_order;
```

**After running, all Price IDs should show (not NULL).**

---

## ✅ Step 2: Deploy the Edge Function (CRITICAL!)

The function MUST be deployed for checkout to work.

### Option A: Deploy via Supabase Dashboard (Easiest)

1. **Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions

2. **Check if `create-checkout-session` exists:**
   - ✅ **If you see it** → Click on it → Click "Redeploy" or check for errors
   - ❌ **If you DON'T see it** → Click "Deploy Function" or "New Function"

3. **To deploy:**
   - Click "Deploy Function" or "New Function"
   - Upload the folder: `supabase/functions/create-checkout-session`
   - Or drag and drop the entire `create-checkout-session` folder
   - Wait for deployment to complete

4. **Also deploy these (if missing):**
   - `create-portal-session`
   - `get-subscription`
   - `stripe-webhook`

### Option B: Deploy via CLI (If you prefer)

```bash
cd "/Users/jordanrichter/Documents/Asala Projects/Asala Studio/asala-studio"

# Login first (opens browser)
supabase login

# Deploy the function
supabase functions deploy create-checkout-session --project-ref iflwjiwkbxuvmiviqdxv
```

---

## ✅ Step 3: Set Stripe Secret Key (REQUIRED!)

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/functions

**Scroll to "Secrets" section**

**Add/Verify:**
- **Name:** `STRIPE_SECRET_KEY`
- **Value:** Your Stripe Secret Key (starts with `sk_test_...`)
  - Get from: https://dashboard.stripe.com/test/apikeys → Secret key

**Click "Save"**

---

## ✅ Step 4: Test Again

1. **Refresh browser** (hard refresh: Cmd+Shift+R)
2. **Go to:** Settings → Billing tab
3. **Open browser console** (F12 → Console tab)
4. **Click "Subscribe"** on any plan
5. **Check console for errors:**
   - If you see "Function not found" → Function not deployed (go back to Step 2)
   - If you see "STRIPE_SECRET_KEY not found" → Secret not set (go back to Step 3)
   - If you see other errors → Share them and I'll help fix

---

## 🔍 Debugging: Check Function Logs

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions

1. **Click on `create-checkout-session`**
2. **Click "Logs" tab**
3. **Try subscribing again**
4. **Check logs for errors:**
   - Missing environment variables?
   - Database errors?
   - Stripe API errors?

---

## 📋 Complete Checklist

- [ ] **Step 1:** Run SQL to update Price IDs ✅ (Script ready below)
- [ ] **Step 2:** Deploy `create-checkout-session` function
- [ ] **Step 3:** Set `STRIPE_SECRET_KEY` in Supabase secrets
- [ ] **Step 4:** Test checkout flow
- [ ] **Step 5:** Check function logs if still failing

---

## 🚨 Most Common Issue

**"Function not found" or "Failed to send request"** = Function not deployed

**Solution:** Deploy the function via Dashboard (Step 2, Option A)

---

## 💡 Quick Test

After completing all steps, the checkout should:
1. ✅ Redirect to Stripe Checkout (not show error)
2. ✅ Accept test card `4242 4242 4242 4242`
3. ✅ Complete successfully
4. ✅ Redirect back to your app
5. ✅ Show subscription in Billing tab







