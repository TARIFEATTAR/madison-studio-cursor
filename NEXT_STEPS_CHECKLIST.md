# Next Steps Checklist - Madison Pricing v2.0

## ✅ Completed
- [x] Database migration executed successfully

---

## 🔄 Remaining Tasks

### Step 1: Verify New Tiers (Quick Check)

Run this in Supabase SQL Editor to confirm:

```sql
SELECT name, slug, price_monthly, price_yearly 
FROM subscription_plans 
ORDER BY sort_order;
```

**Expected:**
- Atelier: $49/month, $470/year ✅
- Studio: $199/month, $1,990/year ✅
- Maison: $599/month, $5,990/year ✅

---

### Step 2: Create Stripe Products (13 Products)

Go to: https://dashboard.stripe.com/test/products

**Base Tiers (6 products):**
1. ✅ Atelier Monthly - $49/month
2. ✅ Atelier Annual - $470/year
3. ✅ Studio Monthly - $199/month ⚠️ NEW PRICING
4. ✅ Studio Annual - $1,990/year ⚠️ NEW PRICING
5. ✅ Maison Monthly - $599/month ⚠️ NEW PRICING
6. ✅ Maison Annual - $5,990/year ⚠️ NEW PRICING

**Add-Ons (7 products):**
7. ✅ White-Label - $199/month ⚠️ NEW PRICING
8. ✅ Extra Images 50 - $25/month
9. ✅ Extra Images 100 - $45/month
10. ✅ Extra Images 500 - $175/month
11. ✅ Brand Slot - $50/month
12. ✅ Team 5-pack - $50/month
13. ✅ Priority Onboarding - $500 (one-time)

**For each product:**
- Set up pricing correctly
- Enable 14-day trial (for recurring subscriptions)
- Copy the Price ID (starts with `price_...`)

---

### Step 3: Update Price IDs in Database

1. Open `update_stripe_price_ids.sql`
2. Replace all `price_xxxxx` with your actual Stripe Price IDs
3. Run the SQL in Supabase SQL Editor

---

### Step 4: Set Up Stripe Webhook

1. **Stripe Dashboard** → **Developers** → **Webhooks**
2. **Add Endpoint:**
   - URL: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
   - Events: `customer.subscription.*`, `invoice.*`, `payment_method.attached`
3. **Copy Signing Secret** (`whsec_...`)
4. **Add to Supabase Secrets:**
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...`

---

### Step 5: Verify Stripe Secrets Are Set

In Supabase Dashboard → **Settings** → **Edge Functions** → **Secrets**:

- ✅ `STRIPE_SECRET_KEY` = `sk_test_...`
- ✅ `STRIPE_PUBLISHABLE_KEY` = `pk_test_...`
- ⚠️ `STRIPE_WEBHOOK_SECRET` = `whsec_...` (add after webhook setup)

---

### Step 6: Test the Checkout Flow

1. Go to your app → **Settings** → **Billing**
2. Click **Subscribe** on a plan
3. Verify:
   - ✅ New prices display ($49, $199, $599)
   - ✅ Redirects to Stripe Checkout
   - ✅ Test card: `4242 4242 4242 4242` works
   - ✅ Success creates subscription in database

---

## 📋 Quick Reference

**Migration File:** `supabase/migrations/20251105120000_update_madison_pricing_tiers.sql` ✅  
**Tier Config:** `src/config/subscriptionTiers.ts` ✅  
**Price ID Update:** `update_stripe_price_ids.sql` (needs your Price IDs)  
**Setup Guide:** `MADISON_PRICING_V2_SETUP.md`

---

## 🎯 Current Status

**Database:** ✅ Ready  
**Stripe Products:** ⚠️ Need to create  
**Price IDs:** ⚠️ Need to link  
**Webhook:** ⚠️ Need to set up  
**Testing:** ⏳ Pending

---

Once you complete Steps 2-4, your billing system will be fully configured! 🚀
















