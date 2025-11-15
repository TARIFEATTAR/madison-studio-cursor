# Stripe Webhook Setup Guide - Step by Step

## 🎯 Your Webhook URL

```
https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook
```

---

## Step 1: Create Webhook Endpoint in Stripe

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks
   - Make sure you're in **Test mode** (blue banner at top if you're testing)

2. **Click "+ Add endpoint"** button

3. **Endpoint URL**: Paste this exact URL:
   ```
   https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook
   ```

4. **Description**: `Madison Studio Billing Webhook`

5. **Select Events to Listen To**: Check these boxes:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.paid`
   - ✅ `invoice.payment_failed`
   - ✅ `payment_method.attached`

6. **Click "Add endpoint"** to save

---

## Step 2: Copy the Webhook Signing Secret

1. **After creating the webhook**, click on it to open details

2. **Find "Signing secret"** section (usually near the top)

3. **Click "Reveal"** or "Click to reveal" to show the secret

4. **Copy the secret** - it starts with `whsec_` and looks like:
   ```
   whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Save this somewhere temporarily** - you'll need it in the next step!

---

## Step 3: Add Secret to Supabase

1. **Go to Supabase Dashboard**: 
   - https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

2. **Scroll down to "Secrets"** section

3. **Click "Add new secret"** or **"+ New secret"**

4. **Enter:**
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: Paste your `whsec_...` secret from Step 2

5. **Click "Save secret"** or **"Create secret"**

---

## Step 4: Verify Edge Functions Are Deployed

Make sure your `stripe-webhook` function is deployed:

1. **Go to**: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

2. **Look for** `stripe-webhook` in the list

3. **If it's not there or shows as "Not deployed"**:
   - Deploy it using Supabase CLI:
     ```bash
     supabase functions deploy stripe-webhook
     ```
   - Or upload via Dashboard → Edge Functions → Deploy

---

## Step 5: Test the Webhook

### Option A: Test via Stripe Dashboard

1. **In Stripe Dashboard** → **Webhooks** → Click on your webhook

2. **Click "Send test webhook"** button

3. **Select an event**: `customer.subscription.created`

4. **Send** and check:
   - ✅ Should show "200" success response
   - ✅ Check Supabase Edge Function logs to see if it processed

### Option B: Test via Real Checkout

1. **Go to your app** → **Settings** → **Billing** tab

2. **Click "Subscribe"** on any plan

3. **Use test card**: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)

4. **Complete checkout**

5. **Check webhook received**:
   - Go to Stripe Dashboard → Webhooks → Your webhook → **Recent events**
   - You should see `customer.subscription.created` and `invoice.paid` events
   - Check Supabase logs to verify subscription was created in database

---

## ✅ Verification Checklist

- [ ] Webhook endpoint created in Stripe
- [ ] Webhook URL is correct: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
- [ ] All 6 events are selected
- [ ] Webhook signing secret copied (`whsec_...`)
- [ ] `STRIPE_WEBHOOK_SECRET` added to Supabase secrets
- [ ] `stripe-webhook` function is deployed
- [ ] Test webhook sent successfully (200 response)

---

## 🔍 Troubleshooting

### Webhook Not Receiving Events

1. **Check webhook URL is correct** - Copy/paste exact URL above
2. **Verify function is deployed** - Check Supabase Edge Functions page
3. **Check Stripe webhook logs** - Stripe Dashboard → Webhooks → Your webhook → Recent events
4. **Check Supabase logs** - Edge Functions → stripe-webhook → Logs

### "Webhook signature verification failed"

- Make sure `STRIPE_WEBHOOK_SECRET` in Supabase matches the signing secret from Stripe
- Secret must start with `whsec_`
- No extra spaces or quotes around the secret value

### Events Not Processing

- Check Supabase Edge Function logs for errors
- Verify the function has access to database
- Check that `STRIPE_SECRET_KEY` is also set in Supabase secrets

---

## 🚀 Once Webhook is Set Up

Your billing system will automatically:
- ✅ Create subscriptions when users checkout
- ✅ Update subscriptions when users change plans in Stripe Portal
- ✅ Sync payment method updates
- ✅ Update invoice status
- ✅ Handle subscription cancellations

The webhook is critical for keeping your database in sync with Stripe!












