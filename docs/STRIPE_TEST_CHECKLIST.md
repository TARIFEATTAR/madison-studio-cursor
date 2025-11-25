# Stripe Payment System - Test Checklist

## 🎯 Quick Status Check

### Step 1: Verify Database Configuration

Run this in **Supabase SQL Editor**:

```sql
-- Check subscription plans and price IDs
SELECT 
  name, 
  slug, 
  price_monthly, 
  price_yearly,
  stripe_price_id_monthly,
  stripe_price_id_yearly,
  is_active
FROM subscription_plans 
ORDER BY sort_order;
```

**Expected Result:**
- ✅ 3 rows: Atelier, Studio, Maison
- ✅ All have `stripe_price_id_monthly` and `stripe_price_id_yearly` set
- ✅ All have `is_active = true`

---

### Step 2: Verify Edge Functions Are Deployed

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**Check for these 4 functions:**
- ✅ `create-checkout-session`
- ✅ `create-portal-session`
- ✅ `stripe-webhook`
- ✅ `get-subscription`

**If missing:** Deploy them using:
```bash
npx supabase functions deploy create-checkout-session
npx supabase functions deploy create-portal-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy get-subscription
```

---

### Step 3: Verify Supabase Secrets

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Scroll to "Secrets" section**

**Required Secrets:**
- ✅ `STRIPE_SECRET_KEY` (should start with `sk_test_` or `sk_live_`)
- ✅ `STRIPE_WEBHOOK_SECRET` (should start with `whsec_`)
- ✅ `APP_URL` (optional, defaults to localhost)

**If missing:** Add them via Dashboard or CLI:
```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
npx supabase secrets set APP_URL=http://localhost:5173
```

---

### Step 4: Verify Stripe Webhook

**Go to:** https://dashboard.stripe.com/test/webhooks

**Check for endpoint:**
- ✅ URL: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
- ✅ Status: Active
- ✅ Events configured:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `payment_method.attached`

**If missing:** Create webhook endpoint (see `WEBHOOK_SETUP_GUIDE.md`)

---

### Step 5: Test Billing Page

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Navigate to:** http://localhost:5173/settings?tab=billing

3. **Check for:**
   - ✅ Page loads without errors
   - ✅ 3 subscription plans visible (Atelier, Studio, Maison)
   - ✅ Prices display correctly
   - ✅ No console errors

4. **Open Browser Console (F12):**
   - ✅ No CORS errors
   - ✅ No 404 errors
   - ✅ No "Failed to fetch" errors

---

### Step 6: Test Checkout Flow

1. **Click "Subscribe" on any plan**

2. **Expected:**
   - ✅ Redirects to Stripe Checkout page
   - ✅ Shows correct plan name and price
   - ✅ Checkout page loads (not blank/error)

3. **If error occurs:**
   - Check browser console for error message
   - Verify `STRIPE_SECRET_KEY` is set correctly
   - Verify Price IDs in database match Stripe

---

### Step 7: Test Payment (Test Mode)

1. **On Stripe Checkout page:**
   - Use test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

2. **Complete checkout**

3. **Expected:**
   - ✅ Redirects back to billing page
   - ✅ Success toast appears
   - ✅ Subscription shows as "Current Plan"
   - ✅ Webhook receives event (check Stripe Dashboard → Webhooks)

---

### Step 8: Verify Database After Payment

Run this in **Supabase SQL Editor**:

```sql
-- Check if subscription was created
SELECT 
  s.id,
  s.status,
  s.stripe_subscription_id,
  s.current_period_start,
  s.current_period_end,
  sp.name as plan_name,
  o.name as organization_name
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
JOIN organizations o ON s.organization_id = o.id
ORDER BY s.created_at DESC
LIMIT 5;
```

**Expected:**
- ✅ New subscription record created
- ✅ Status is `active` or `trialing`
- ✅ `stripe_subscription_id` is set
- ✅ Plan matches what you subscribed to

---

### Step 9: Test Customer Portal

1. **Click "Manage Plan" button**

2. **Expected:**
   - ✅ Redirects to Stripe Customer Portal
   - ✅ Portal loads (not blank/error)
   - ✅ Shows current subscription details

3. **In Portal, you can:**
   - Update payment method
   - View billing history
   - Cancel subscription
   - Update billing address

---

## 🐛 Common Issues & Fixes

### Issue: "Price ID not configured"
**Fix:** Run `update_stripe_price_ids.sql` in Supabase SQL Editor

### Issue: CORS errors
**Fix:** Verify edge functions are deployed and CORS headers are set

### Issue: "Unauthorized" error
**Fix:** Check that user is logged in and has organization

### Issue: Webhook not receiving events
**Fix:** 
- Verify webhook URL is correct
- Verify `STRIPE_WEBHOOK_SECRET` matches Stripe webhook signing secret
- Check Stripe Dashboard → Webhooks → Recent events

### Issue: Checkout redirects to wrong URL
**Fix:** Set `APP_URL` secret in Supabase to your app URL

---

## ✅ Ready to Test Checklist

Before testing, ensure:
- [ ] Database has subscription_plans with Price IDs
- [ ] All 4 edge functions are deployed
- [ ] `STRIPE_SECRET_KEY` is set in Supabase secrets
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Supabase secrets
- [ ] Stripe webhook endpoint is configured
- [ ] Dev server is running
- [ ] You're logged in with a user that has an organization

---

## 🚀 Quick Test Command

Test the get-subscription function directly:

```bash
# Get your auth token from browser (Application → Local Storage → supabase.auth.token)
curl -X GET \
  'https://likkskifwsrvszxdvufw.supabase.co/functions/v1/get-subscription' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'apikey: YOUR_SUPABASE_ANON_KEY'
```

Expected: JSON response with subscription data (or null if no subscription)












