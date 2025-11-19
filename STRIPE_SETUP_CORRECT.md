# ✅ Stripe Setup - CORRECT Project Configuration

## Your Actual Project Details

**Project ID:** `likkskifwsrvszxdvufw`  
**Project URL:** `https://likkskifwsrvszxdvufw.supabase.co`  
**Webhook URL:** `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`

---

## ✅ Current Status

### 1. Database ✅
- Price IDs configured for all 3 plans
- SQL script ran successfully

### 2. Stripe Webhook ✅
- URL is correct: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
- Already configured in Stripe Dashboard

### 3. Next Steps Needed

#### A. Verify Supabase Secrets
**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Check these secrets:**
- ✅ `STRIPE_SECRET_KEY` - Should start with `sk_test_...`
- ✅ `STRIPE_WEBHOOK_SECRET` - Should start with `whsec_...`

**If they're wrong (don't start with `sk_test_` and `whsec_`):**

1. **Get Stripe Secret Key:**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy the "Secret key" (starts with `sk_test_...`)

2. **Get Webhook Secret:**
   - Go to: https://dashboard.stripe.com/test/webhooks
   - Click on your webhook endpoint
   - Copy the "Signing secret" (starts with `whsec_...`)

3. **Update in Supabase:**
   ```bash
   npx supabase secrets set STRIPE_SECRET_KEY=sk_test_YOUR_KEY --project-ref likkskifwsrvszxdvufw
   npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET --project-ref likkskifwsrvszxdvufw
   ```

#### B. Deploy Edge Functions
**Check if deployed:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**If not deployed, run:**
```bash
npx supabase functions deploy create-checkout-session --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy create-portal-session --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy stripe-webhook --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy get-subscription --project-ref likkskifwsrvszxdvufw
```

#### C. Test Billing
1. Go to: http://localhost:8080/settings?tab=billing
2. Click "Subscribe" on any plan
3. Use test card: `4242 4242 4242 4242`

---

## 🎯 Quick Checklist

- [x] Database Price IDs configured
- [x] Stripe webhook URL correct
- [ ] Supabase secrets have correct values (`sk_test_...` and `whsec_...`)
- [ ] Edge functions deployed
- [ ] Test checkout flow

---

## 🔗 Important Links (Correct Project)

- **Supabase Dashboard:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw
- **Edge Functions:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
- **Secrets:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions
- **Stripe Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Stripe API Keys:** https://dashboard.stripe.com/test/apikeys







