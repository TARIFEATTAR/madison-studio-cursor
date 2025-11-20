# ✅ Stripe Setup Verification Checklist

## What You've Completed ✅

1. ✅ **Database Price IDs** - Configured for all 3 plans
2. ✅ **Stripe Event Destination** - Created with correct URL
3. ✅ **Secrets Set** - STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET updated
4. ✅ **Functions Deployed:**
   - ✅ `create-checkout-session`
   - ✅ `create-portal-session`

---

## ⚠️ Still Need to Deploy

You still need to deploy these 2 functions:

### 1. stripe-webhook
**Why:** Handles Stripe webhook events (subscription updates, payments, etc.)

**Deploy:**
```bash
npx supabase functions deploy stripe-webhook --project-ref likkskifwsrvszxdvufw
```

### 2. get-subscription
**Why:** Fetches subscription data for the billing page

**Deploy:**
```bash
npx supabase functions deploy get-subscription --project-ref likkskifwsrvszxdvufw
```

---

## 🔍 Verify Secrets Are Correct

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Check that:**
- ✅ `STRIPE_SECRET_KEY` starts with `sk_test_...` (not `b0243d163...`)
- ✅ `STRIPE_WEBHOOK_SECRET` starts with `whsec_...` (not `c699f3214...`)

**If they still show wrong values:**
- The secrets weren't updated correctly
- Try updating them again via Dashboard or CLI

---

## 🎯 Complete Deployment

Run these commands in your terminal:

```bash
cd '/Users/jordanrichter/Documents/Asala Project/Asala Studio'

# Deploy remaining functions
npx supabase functions deploy stripe-webhook --project-ref likkskifwsrvszxdvufw
npx supabase functions deploy get-subscription --project-ref likkskifwsrvszxdvufw
```

---

## ✅ Final Verification

**Check all functions are deployed:**
https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

**Should see:**
- ✅ `create-checkout-session` - Deployed
- ✅ `create-portal-session` - Deployed
- ✅ `stripe-webhook` - Deployed (after you run the command)
- ✅ `get-subscription` - Deployed (after you run the command)

---

## 🧪 Test Billing

Once all 4 functions are deployed and secrets are correct:

1. Go to: http://localhost:8080/settings?tab=billing
2. Click "Subscribe" on any plan
3. Should redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242`

---

## 🐛 If Test Fails

**Check browser console (F12) for errors:**
- "Plan is not yet configured" → Database Price IDs issue (already fixed ✅)
- "Failed to create checkout" → Secrets might be wrong
- "Function not found" → Function not deployed
- CORS error → Function deployment issue









