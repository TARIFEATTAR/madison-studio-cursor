# Billing System Setup - Complete! ✅

## What's Been Created

### ✅ Database Tables (Migration Applied)
- `subscription_plans` - Available plans (Free, Premium, Enterprise)
- `subscriptions` - Organization subscriptions
- `payment_methods` - Payment methods per organization
- `invoices` - Billing history
- Updated `organizations` table with subscription fields

### ✅ Edge Functions Created
1. **`create-checkout-session`** - Creates Stripe Checkout for new subscriptions
2. **`create-portal-session`** - Opens Stripe Customer Portal for managing subscriptions
3. **`stripe-webhook`** - Handles Stripe webhook events (subscription updates, invoices, etc.)
4. **`get-subscription`** - Fetches current subscription, payment methods, and invoices

### ✅ Frontend Updated
- **`BillingTab.tsx`** - Now fetches and displays real subscription data
- Shows current plan, payment methods, and billing history
- Handles subscription upgrades and management

### ✅ Configuration
- Added Stripe to `deno.json` dependencies
- Updated `supabase/config.toml` with function configurations

---

## Next Steps to Complete Setup

### 1. Set Up Stripe Account & Products

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com
2. **Create Products & Prices**:
   - Go to **Products** → **Add Product**
   - Create products for each plan:
     - **Free Plan**: $0/month
     - **Premium Plan**: $99/month (and $990/year if you want yearly)
     - **Enterprise Plan**: $299/month (and $2,990/year if you want yearly)
   
3. **Copy Price IDs**:
   - After creating each price, copy the Price ID (starts with `price_`)
   - Update the `subscription_plans` table with these Price IDs:
   
   ```sql
   UPDATE subscription_plans 
   SET stripe_price_id_monthly = 'price_xxxxx' 
   WHERE slug = 'premium';
   
   UPDATE subscription_plans 
   SET stripe_price_id_yearly = 'price_xxxxx' 
   WHERE slug = 'premium';
   ```

### 2. Set Up Stripe Secrets in Supabase

Go to your Supabase Dashboard → **Project Settings** → **Edge Functions** → **Secrets**:

```bash
# Add these secrets:
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
APP_URL=https://your-app-domain.com
```

**For local development**, add to `supabase/.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
APP_URL=http://localhost:5173
```

### 3. Set Up Stripe Webhook

1. **In Stripe Dashboard**: Go to **Developers** → **Webhooks**
2. **Add Endpoint**:
   - URL: `https://iflwjiwkbxuvmiviqdxv.supabase.co/functions/v1/stripe-webhook`
   - Description: "Madison Billing Webhook"
3. **Select Events to Listen To**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_method.attached`
4. **Copy Webhook Signing Secret**:
   - After creating the webhook, click on it
   - Copy the "Signing secret" (starts with `whsec_`)
   - Add to Supabase secrets: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 4. Deploy Edge Functions

If using Supabase CLI:
```bash
supabase functions deploy create-checkout-session
supabase functions deploy create-portal-session
supabase functions deploy stripe-webhook
supabase functions deploy get-subscription
```

Or deploy via Supabase Dashboard:
- Go to **Edge Functions** → **Deploy Function**
- Upload each function folder

### 5. Test the Integration

1. **Test Checkout Flow**:
   - Go to Settings → Billing tab
   - Click "Subscribe" on a plan
   - Should redirect to Stripe Checkout
   - Use test card: `4242 4242 4242 4242`

2. **Test Webhook**:
   - After successful checkout, check Stripe Dashboard → Webhooks
   - Verify events are being received
   - Check database to see if subscription was created

3. **Test Portal**:
   - Click "Manage Plan" button
   - Should open Stripe Customer Portal
   - Can update payment method, cancel subscription, etc.

---

## Testing with Stripe Test Mode

### Test Cards:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

### Test Dates:
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)

---

## Troubleshooting

### Webhook Not Receiving Events
- Check webhook URL is correct
- Verify `STRIPE_WEBHOOK_SECRET` is set correctly
- Check Stripe Dashboard → Webhooks → Logs for errors

### Checkout Not Working
- Verify `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` are set
- Check Price IDs are correctly set in `subscription_plans` table
- Check browser console for errors

### Subscription Not Appearing
- Check webhook logs in Stripe Dashboard
- Verify webhook endpoint is accessible
- Check Edge Function logs in Supabase Dashboard

---

## Production Checklist

Before going live:

- [ ] Switch to Stripe Live keys (`sk_live_` / `pk_live_`)
- [ ] Update `APP_URL` to production domain
- [ ] Create live webhook endpoint (same URL structure)
- [ ] Test with real payment method (then refund)
- [ ] Set up monitoring/alerts for failed payments
- [ ] Configure email notifications in Stripe Dashboard

---

## Support

If you encounter issues:
1. Check Supabase Edge Function logs
2. Check Stripe Dashboard → Webhooks → Logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

