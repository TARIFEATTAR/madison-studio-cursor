# Next Steps - Database Verified ✅

## ✅ Completed
- [x] Database subscription plans verified
- [x] All Price IDs configured correctly
- [x] All plans active

---

## 🔄 Remaining Steps

### Step 1: Verify Edge Functions Are Deployed

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**Check for these 4 functions:**
- [ ] `create-checkout-session`
- [ ] `create-portal-session`
- [ ] `stripe-webhook`
- [ ] `get-subscription`

**If any are missing, deploy them:**

```bash
npx supabase functions deploy create-checkout-session
npx supabase functions deploy create-portal-session
npx supabase functions deploy stripe-webhook
npx supabase functions deploy get-subscription
```

---

### Step 2: Verify Supabase Secrets

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Scroll to "Secrets" section**

**Required Secrets:**
- [ ] `STRIPE_SECRET_KEY` - Should start with `sk_test_` or `sk_live_`
- [ ] `STRIPE_WEBHOOK_SECRET` - Should start with `whsec_`

**If missing, add them:**
- Click "+ New secret" or "Add new secret"
- Name: `STRIPE_SECRET_KEY`
- Value: Your Stripe secret key from https://dashboard.stripe.com/apikeys
- Repeat for `STRIPE_WEBHOOK_SECRET` (get from Stripe webhook)

---

### Step 3: Verify Stripe Webhook

**Go to:** https://dashboard.stripe.com/test/webhooks

**Check for webhook endpoint:**
- [ ] URL: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
- [ ] Status: Active/Enabled
- [ ] Events configured (all 6):
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.paid`
  - [ ] `invoice.payment_failed`
  - [ ] `payment_method.attached`

**If webhook doesn't exist:**
1. Click "+ Add endpoint"
2. URL: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
3. Select all 6 events above
4. Copy signing secret (`whsec_...`)
5. Add to Supabase secrets as `STRIPE_WEBHOOK_SECRET`

---

### Step 4: Test the Billing Page

1. **Make sure dev server is running:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:5173/settings?tab=billing

3. **Check:**
   - [ ] Page loads without errors
   - [ ] 3 subscription plans visible
   - [ ] Prices display correctly
   - [ ] No console errors (F12 → Console)

---

### Step 5: Test Checkout Flow

1. **Click "Subscribe" on any plan**

2. **Expected:**
   - [ ] Redirects to Stripe Checkout
   - [ ] Checkout page loads (not blank/error)
   - [ ] Shows correct plan name and price

3. **If error occurs:**
   - Check browser console for error message
   - Verify `STRIPE_SECRET_KEY` is set in Supabase
   - Verify Price IDs match between database and Stripe

---

## 🎯 Current Status

| Component | Status |
|-----------|--------|
| **Database** | ✅ Verified |
| **Edge Functions** | ⚠️ Need to verify |
| **Supabase Secrets** | ⚠️ Need to verify |
| **Stripe Webhook** | ⚠️ Need to verify |
| **Testing** | ⏳ Ready once above are done |

---

## 🚀 Quick Test Command

Once everything is configured, test with:

1. Go to: http://localhost:5173/settings?tab=billing
2. Click "Subscribe" on Atelier plan
3. Use test card: `4242 4242 4242 4242`
4. Complete checkout
5. Should redirect back and show subscription

---

## ✅ Success Criteria

Your Stripe setup is complete when:
- ✅ Database has plans with Price IDs (DONE!)
- ✅ All 4 edge functions are deployed
- ✅ Supabase secrets are set
- ✅ Stripe webhook is configured
- ✅ Checkout flow works end-to-end




