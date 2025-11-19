# Quick Webhook Verification Test

## ✅ 30-Second Health Check

### 1. Quick Stripe Check
**Go to:** https://dashboard.stripe.com/test/webhooks

**Verify:**
- [ ] You see your webhook endpoint listed
- [ ] URL matches: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
- [ ] Status shows "Enabled" or similar (not red/error)

### 2. Quick Supabase Check
**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Scroll to "Secrets"**

**Verify:**
- [ ] `STRIPE_WEBHOOK_SECRET` exists
- [ ] Value is visible (shows first few characters)

### 3. Test Webhook (2 minutes)
**In Stripe Dashboard:**
1. Click on your webhook
2. Click **"Send test webhook"**
3. Select: `customer.subscription.created`
4. Click **"Send test webhook"**
5. Check response: Should show **"200"** status ✅

**If you see 200:** 🎉 Webhook is working!

**If you see errors:** Check the error message and we'll fix it.

---

## 🧪 Full End-to-End Test

### Test the Complete Flow:

1. **Go to your app** → **Settings** → **Billing**
2. **Click "Subscribe"** on Atelier plan ($49/month)
3. **Enter test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: `12/25` (any future date)
   - CVC: `123`
4. **Complete checkout**
5. **After redirect, refresh the Billing tab**

**Expected Results:**
- ✅ Shows "Atelier" as current plan
- ✅ Shows $49/month pricing
- ✅ Shows renewal date
- ✅ "Manage Plan" button works

---

## 🔍 What to Check If Something's Wrong

### Check Stripe Webhook Logs:
1. Stripe Dashboard → Webhooks → Your webhook → **Recent events**
2. Look for `customer.subscription.created` event
3. Click it → Should show "200" response

### Check Supabase Function Logs:
1. Supabase Dashboard → Edge Functions → `stripe-webhook` → **Logs**
2. Should see processing logs
3. No red error messages

### Check Database:
Run in Supabase SQL Editor:
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
```
Should show your test subscription if checkout worked.

---

## ✅ Success Checklist

- [ ] Stripe webhook endpoint exists and is enabled
- [ ] `STRIPE_WEBHOOK_SECRET` is set in Supabase
- [ ] Test webhook returns 200 status
- [ ] Checkout flow completes successfully
- [ ] Subscription appears in database after checkout
- [ ] Billing tab shows subscription correctly

---

## 🎉 If All Checks Pass

Your billing system is fully configured! 🚀

- ✅ Users can subscribe via checkout
- ✅ Subscriptions sync automatically
- ✅ Plan changes update in real-time
- ✅ Payment methods sync
- ✅ Everything is ready for production!
















