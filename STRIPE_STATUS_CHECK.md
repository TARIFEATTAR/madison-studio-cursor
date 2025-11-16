# Stripe Integration Status Check

## ✅ What's Configured

### Frontend
- ✅ **Stripe Publishable Key**: Configured in `.env.local`
  - Key: `pk_test_51SM1YvRcevBEPUM5Yaa9n7kszUk2BMjdtYRB14EYPo7dux984ndeVUw4QXpRys7vmxZGD5aGbJwqoQMGrmDT6VSj00vvGTkw71`

### Products Created
- ✅ **Atelier** - Monthly: `price_1SQKzID9l7wPFqooVHalDG2R`, Yearly: `price_1SQLepD9l7wPFqooLEeJ92JN`
- ✅ **Studio** - Monthly: `price_1SQLg8D9l7wPFqoodEyzyrE8`, Yearly: `price_1SQLgjD9l7wPFqooCaYOejpK`
- ✅ **Maison** - Monthly: `price_1SQLiKD9l7wPFqooNhmlAOB7`, Yearly: `price_1SQLigD9l7wPFqooiVrldrhF`

### Code Implementation
- ✅ Frontend billing component (`BillingTab.tsx`)
- ✅ Edge functions created:
  - `create-checkout-session`
  - `create-portal-session`
  - `get-subscription`
  - `stripe-webhook`
- ✅ Database migrations applied
- ✅ SQL script ready: `update_stripe_price_ids.sql`

---

## ⚠️ What Needs Verification

### 1. Database Price IDs (CRITICAL)
**Status**: Need to verify if Price IDs are in database

**Check:**
```sql
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
ORDER BY sort_order;
```

**If Price IDs are NULL or missing:**
Run `update_stripe_price_ids.sql` in Supabase SQL Editor

---

### 2. Backend Stripe Secret Key
**Status**: Need to verify

**Check in Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/functions
2. Scroll to "Secrets" section
3. Look for: `STRIPE_SECRET_KEY`
4. Should start with: `sk_test_...` (for test mode)

**If missing:**
```bash
# Get your secret key from Stripe Dashboard → Developers → API keys
# Then set in Supabase:
supabase secrets set STRIPE_SECRET_KEY="sk_test_..." --project-ref iflwjiwkbxuvmiviqdxv
```

---

### 3. Webhook Secret
**Status**: Need to verify

**Check in Supabase Dashboard:**
- Look for: `STRIPE_WEBHOOK_SECRET` in secrets
- Should start with: `whsec_...`

**If missing:**
1. Go to Stripe Dashboard → Webhooks
2. Find your webhook endpoint
3. Copy the signing secret
4. Add to Supabase secrets

---

### 4. Edge Functions Deployment
**Status**: Need to verify

**Check:**
1. Go to: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions
2. Verify these functions are deployed:
   - ✅ `create-checkout-session`
   - ✅ `create-portal-session`
   - ✅ `get-subscription`
   - ✅ `stripe-webhook`

**If not deployed:**
```bash
supabase functions deploy create-checkout-session --project-ref iflwjiwkbxuvmiviqdxv
supabase functions deploy create-portal-session --project-ref iflwjiwkbxuvmiviqdxv
supabase functions deploy get-subscription --project-ref iflwjiwkbxuvmiviqdxv
supabase functions deploy stripe-webhook --project-ref iflwjiwkbxuvmiviqdxv
```

---

### 5. Webhook Endpoint in Stripe
**Status**: Need to verify

**Check:**
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Verify webhook exists with URL:
   ```
   https://iflwjiwkbxuvmiviqdxv.supabase.co/functions/v1/stripe-webhook
   ```
3. Verify events selected:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_method.attached`

---

## 🧪 Quick Test

### Test Checkout Flow:
1. Go to: http://localhost:8080/settings?tab=billing
2. Click "Subscribe" on any plan
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete checkout
6. Should redirect back and show subscription

**If checkout doesn't work:**
- Check browser console for errors
- Verify `STRIPE_SECRET_KEY` is set in Supabase
- Verify Price IDs are in database
- Verify edge function is deployed

---

## 📋 Action Items

1. **Run SQL to verify/update Price IDs:**
   ```sql
   -- Check current state
   SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
   FROM subscription_plans;
   
   -- If missing, run update_stripe_price_ids.sql
   ```

2. **Verify Supabase Secrets:**
   - Check `STRIPE_SECRET_KEY` exists
   - Check `STRIPE_WEBHOOK_SECRET` exists

3. **Verify Functions Deployed:**
   - Check all 4 functions are in Supabase Dashboard

4. **Test End-to-End:**
   - Try subscribing to a plan
   - Verify subscription appears in database

---

## 🎯 Next Steps Based on Status

**If everything is verified:**
- ✅ You're ready to test!
- Try a test subscription with card `4242 4242 4242 4242`

**If Price IDs missing:**
- Run `update_stripe_price_ids.sql` in Supabase SQL Editor

**If secrets missing:**
- Add `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` to Supabase

**If functions not deployed:**
- Deploy all 4 edge functions







