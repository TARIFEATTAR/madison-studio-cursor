# 🧪 Quick Stripe Testing Guide

## Step 1: Fix Database (Run This First!)

**Go to Supabase Dashboard → SQL Editor** and run:

```sql
-- Quick fix: Ensure plans have Stripe Price IDs
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQKzID9l7wPFqooVHalDG2R',
    stripe_price_id_yearly = 'price_1SQLepD9l7wPFqooLEeJ92JN'
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLg8D9l7wPFqoodEyzyrE8',
    stripe_price_id_yearly = 'price_1SQLgjD9l7wPFqooCaYOejpK'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLiKD9l7wPFqooNhmlAOB7',
    stripe_price_id_yearly = 'price_1SQLigD9l7wPFqooiVrldrhF'
WHERE slug = 'maison';

-- Verify
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
WHERE is_active = true;
```

**Expected:** All 3 plans should show Price IDs (not NULL)

---

## Step 2: Verify Supabase Secrets

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Check for:**
- ✅ `STRIPE_SECRET_KEY` (should start with `sk_test_...`)
- ✅ `STRIPE_WEBHOOK_SECRET` (should start with `whsec_...`)

**If missing, get from Stripe Dashboard:**
1. **Secret Key:** https://dashboard.stripe.com/test/apikeys
   - Copy the "Secret key" (starts with `sk_test_`)
   - Set in Supabase: `npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx`

2. **Webhook Secret:** https://dashboard.stripe.com/test/webhooks
   - Create webhook endpoint: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
   - Copy the "Signing secret" (starts with `whsec_`)
   - Set in Supabase: `npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

---

## Step 3: Deploy Edge Functions (If Not Already Deployed)

**Check if deployed:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**If missing, deploy:**
```bash
cd '/Users/jordanrichter/Documents/Asala Project/Asala Studio'
npx supabase functions deploy create-checkout-session
npx supabase functions deploy create-portal-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy get-subscription
```

---

## Step 4: Test Billing Page

1. **Make sure dev server is running:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** http://localhost:8080/settings?tab=billing
   (or whatever port your dev server uses)

3. **You should see:**
   - ✅ 3 plans: Atelier ($49/mo), Studio ($199/mo), Maison ($599/mo)
   - ✅ "Subscribe" buttons on each plan
   - ✅ No error messages

---

## Step 5: Test Checkout

1. **Click "Subscribe" on any plan** (e.g., Atelier)

2. **Expected:**
   - ✅ Redirects to Stripe Checkout page
   - ✅ Shows plan name and price correctly
   - ✅ Checkout form loads

3. **If you get error:**
   - Check browser console (F12) for error message
   - Most common: "Plan is not yet configured" → Run Step 1 SQL
   - Or: "Unauthorized" → Check Supabase secrets

---

## Step 6: Complete Test Payment

**On Stripe Checkout page:**

1. **Use test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/34` (any future date)
   - CVC: `123` (any 3 digits)
   - ZIP: `12345` (any 5 digits)

2. **Click "Subscribe"**

3. **Expected:**
   - ✅ Redirects back to billing page
   - ✅ Success message appears
   - ✅ Shows "Current Plan: [Plan Name]"
   - ✅ Subscription appears in Stripe Dashboard

---

## 🐛 Troubleshooting

### Error: "Plan is not yet configured with Stripe"
**Fix:** Run Step 1 SQL script above

### Error: "Failed to create checkout session"
**Fix:** 
- Check `STRIPE_SECRET_KEY` is set in Supabase secrets
- Verify Price IDs exist in Stripe Dashboard → Products

### Error: CORS or 404
**Fix:** 
- Verify edge functions are deployed (Step 3)
- Check function logs in Supabase Dashboard

### Checkout page is blank
**Fix:**
- Check Stripe Dashboard → Products → Prices
- Verify Price IDs match what's in database
- Check browser console for errors

---

## ✅ Success Checklist

- [ ] Database has Price IDs (Step 1)
- [ ] Supabase secrets are set (Step 2)
- [ ] Edge functions are deployed (Step 3)
- [ ] Billing page loads (Step 4)
- [ ] Checkout redirects to Stripe (Step 5)
- [ ] Test payment completes (Step 6)

---

## 🎯 Quick Test Command

Test if get-subscription function works:

```bash
# Replace YOUR_AUTH_TOKEN with token from browser localStorage
curl -X GET \
  'https://likkskifwsrvszxdvufw.supabase.co/functions/v1/get-subscription' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY'
```

Expected: JSON response (or `{"subscription": null}` if no subscription)





