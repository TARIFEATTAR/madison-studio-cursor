# Webhook Setup Verification Checklist ✅

## Step 1: Verify Stripe Webhook is Created

**Go to:** https://dashboard.stripe.com/test/webhooks

**Check:**
- [ ] You see a webhook endpoint listed
- [ ] Endpoint URL matches: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
- [ ] Status shows as "Enabled" or "Receiving events"
- [ ] All 6 events are selected:
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.paid`
  - [ ] `invoice.payment_failed`
  - [ ] `payment_method.attached`

---

## Step 2: Verify Supabase Secret is Set

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Scroll to "Secrets" section**

**Check:**
- [ ] `STRIPE_WEBHOOK_SECRET` exists in the secrets list
- [ ] Value starts with `whsec_`
- [ ] Value matches the signing secret from Stripe Dashboard

**To verify:**
1. In Stripe Dashboard → Webhooks → Click your webhook
2. Copy the "Signing secret" (should match what's in Supabase)

---

## Step 3: Verify Edge Function is Deployed

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**Check:**
- [ ] `stripe-webhook` function appears in the list
- [ ] Status shows as "Active" or "Deployed"
- [ ] No error indicators

**If not deployed:**
```bash
supabase functions deploy stripe-webhook
```

---

## Step 4: Test the Webhook Connection

### Option A: Send Test Webhook from Stripe

1. **In Stripe Dashboard** → **Webhooks** → Click your webhook
2. **Click "Send test webhook"** button
3. **Select event:** `customer.subscription.created`
4. **Click "Send test webhook"**
5. **Check response:**
   - Should show "200" status code
   - Response body should say `{"received": true}`

### Option B: Check Function Logs

**Go to:** Supabase Dashboard → Edge Functions → `stripe-webhook` → Logs

**After sending test webhook, check:**
- [ ] New log entry appears
- [ ] No error messages
- [ ] Should see processing logs for the event

---

## Step 5: Do a Real Test Checkout

1. **Go to your app** → **Settings** → **Billing** tab
2. **Click "Subscribe"** on any plan (e.g., Atelier)
3. **Use test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: `123`
4. **Complete checkout**
5. **After redirect back:**

**Check Stripe Dashboard:**
- [ ] Go to **Webhooks** → Your webhook → **Recent events**
- [ ] Should see `customer.subscription.created` event
- [ ] Should see `invoice.paid` event
- [ ] Both should show "200" success status

**Check Supabase:**
- [ ] Go to **Database** → **subscriptions** table
- [ ] Should see a new subscription record
- [ ] `plan_id` should match the plan you subscribed to
- [ ] `status` should be "active"

**Check Your App:**
- [ ] Refresh the Billing tab
- [ ] Should see your subscription listed
- [ ] Should show the plan name and price correctly

---

## ✅ Success Criteria

If all checks pass, your webhook is properly configured! The billing system will now:
- ✅ Automatically create subscriptions when users checkout
- ✅ Sync subscription changes from Stripe Portal
- ✅ Update payment methods automatically
- ✅ Handle cancellations and renewals

---

## 🐛 Troubleshooting

### Webhook shows errors in Stripe:

1. **Check Supabase Function Logs** for error messages
2. **Verify `STRIPE_WEBHOOK_SECRET`** matches Stripe signing secret exactly
3. **Verify function is deployed** and active
4. **Check webhook URL** is correct (no typos)

### Test webhook fails:

1. **Verify function is deployed:**
   ```bash
   supabase functions deploy stripe-webhook
   ```

2. **Check function has access to database:**
   - Function should use service role key (which it does)
   - Check RLS policies allow function to create/update subscriptions

3. **Check all secrets are set:**
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL` (auto-set)
   - `SUPABASE_SERVICE_ROLE_KEY` (auto-set)

### Subscription created but not showing in app:

1. **Check `get-subscription` function** is working
2. **Verify database query** in BillingTab component
3. **Check browser console** for frontend errors
4. **Try clicking Refresh button** on Billing tab

---

## 📝 Quick Health Check Query

Run this in Supabase SQL Editor to verify database setup:

```sql
-- Check all plans have Price IDs
SELECT 
  name,
  slug,
  stripe_price_id_monthly IS NOT NULL as has_monthly_price,
  stripe_price_id_yearly IS NOT NULL as has_yearly_price
FROM subscription_plans 
ORDER BY sort_order;

-- Check if any subscriptions exist
SELECT COUNT(*) as subscription_count FROM subscriptions;

-- Check subscription statuses
SELECT status, COUNT(*) 
FROM subscriptions 
GROUP BY status;
```
















