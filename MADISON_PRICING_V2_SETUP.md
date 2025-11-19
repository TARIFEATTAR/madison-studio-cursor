# Madison Studio Pricing v2.0 Setup Guide

**Version:** 2.0 (Updated Pricing)  
**Date:** November 5, 2025

---

## 🎯 Overview

This guide walks you through implementing the updated Madison Studio pricing tiers:
- **Atelier**: $49/month (unchanged)
- **Studio**: $199/month (increased from $149)
- **Maison**: $599/month (increased from $399)

Plus 6 add-on products for additional features.

---

## ✅ Implementation Checklist

### Phase 1: Database Migration ✅

**Step 1:** Run the pricing tier migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open the migration file: `supabase/migrations/20251105120000_update_madison_pricing_tiers.sql`
3. Copy and paste the SQL into the SQL Editor
4. Click **Run**
5. Verify success: You should see "Success. No rows returned"

**What this does:**
- Removes old tiers (Free, Premium, Enterprise)
- Adds new tiers (Atelier, Studio, Maison) with updated pricing
- Creates `subscription_addons` table for add-on products
- Seeds all add-on products

---

### Phase 2: Stripe Configuration 🔄

**Step 2:** Create Products & Prices in Stripe

Go to your [Stripe Dashboard](https://dashboard.stripe.com/test/products) and create:

#### **Base Tiers (6 products):**

1. **Atelier Monthly**
   - Name: `Madison Studio - Atelier`
   - Price: `$49.00 USD`
   - Billing: `Monthly recurring`
   - Trial: `14 days`
   - Copy Price ID: `price_atelier_monthly`

2. **Atelier Annual**
   - Name: `Madison Studio - Atelier (Annual)`
   - Price: `$470.00 USD`
   - Billing: `Yearly recurring`
   - Trial: `14 days`
   - Copy Price ID: `price_atelier_annual`

3. **Studio Monthly** ⚠️ NEW PRICING
   - Name: `Madison Studio - Studio`
   - Price: `$199.00 USD` (was $149)
   - Billing: `Monthly recurring`
   - Trial: `14 days`
   - Copy Price ID: `price_studio_monthly`

4. **Studio Annual** ⚠️ NEW PRICING
   - Name: `Madison Studio - Studio (Annual)`
   - Price: `$1,990.00 USD` (was $1,490)
   - Billing: `Yearly recurring`
   - Trial: `14 days`
   - Copy Price ID: `price_studio_annual`

5. **Maison Monthly** ⚠️ NEW PRICING
   - Name: `Madison Studio - Maison`
   - Price: `$599.00 USD` (was $399)
   - Billing: `Monthly recurring`
   - Trial: `14 days`
   - Copy Price ID: `price_maison_monthly`

6. **Maison Annual** ⚠️ NEW PRICING
   - Name: `Madison Studio - Maison (Annual)`
   - Price: `$5,990.00 USD` (was $3,990)
   - Billing: `Yearly recurring`
   - Trial: `14 days`
   - Copy Price ID: `price_maison_annual`

#### **Add-On Products (7 products):**

7. **White-Label Add-On** ⚠️ NEW PRICING
   - Name: `White-Label Branding Add-On`
   - Price: `$199.00 USD/month` (was $100)
   - Billing: `Monthly recurring`
   - Copy Price ID: `price_addon_whitelabel_monthly`

8. **Extra Images - 50 Pack**
   - Name: `Extra Image Credits - 50 Pack`
   - Price: `$25.00 USD/month`
   - Billing: `Monthly recurring`
   - Copy Price ID: `price_addon_images_50_monthly`

9. **Extra Images - 100 Pack**
   - Name: `Extra Image Credits - 100 Pack`
   - Price: `$45.00 USD/month`
   - Billing: `Monthly recurring`
   - Copy Price ID: `price_addon_images_100_monthly`

10. **Extra Images - 500 Pack**
    - Name: `Extra Image Credits - 500 Pack`
    - Price: `$175.00 USD/month`
    - Billing: `Monthly recurring`
    - Copy Price ID: `price_addon_images_500_monthly`

11. **Additional Brand Slot**
    - Name: `Additional Brand Slot`
    - Price: `$50.00 USD/month`
    - Billing: `Monthly recurring`
    - Copy Price ID: `price_addon_brand_slot_monthly`

12. **Additional Team Members (5-pack)**
    - Name: `Additional Team Members (5-pack)`
    - Price: `$50.00 USD/month`
    - Billing: `Monthly recurring`
    - Copy Price ID: `price_addon_team_5pack_monthly`

13. **Priority Onboarding** (One-time, not recurring)
    - Name: `Priority Onboarding & Training`
    - Price: `$500.00 USD`
    - Billing: `One-time`
    - Copy Price ID: `price_onetime_onboarding`

**Total: 13 Stripe Price IDs to create**

---

**Step 3:** Update Database with Price IDs

1. Open `update_stripe_price_ids.sql`
2. Replace all `price_xxxxx` placeholders with your actual Stripe Price IDs
3. Run the SQL in **Supabase Dashboard** → **SQL Editor**

Example:
```sql
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1ABC123...'  -- Your actual Price ID
WHERE slug = 'atelier';
```

---

### Phase 3: Stripe Webhook Setup

**Step 4:** Create Webhook Endpoint

1. Go to **Stripe Dashboard** → **Developers** → **Webhooks**
2. Click **Add Endpoint**
3. **Endpoint URL**: `https://likkskifwsrvszxdvufw.supabase.co/functions/v1/stripe-webhook`
4. **Description**: `Madison Studio Billing Webhook`
5. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `payment_method.attached`
6. **Save** and copy the **Signing Secret** (starts with `whsec_`)

**Step 5:** Add Webhook Secret to Supabase

1. Go to **Supabase Dashboard** → **Project Settings** → **Edge Functions** → **Secrets**
2. Add secret:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (your signing secret)

---

### Phase 4: Code Updates ✅

**Step 6:** Verify Configuration File

The tier configuration is already created at:
- `src/config/subscriptionTiers.ts`

This file contains:
- All tier limits and pricing
- Add-on configurations
- Helper functions

**No further code changes needed** — the `BillingTab` component fetches plans dynamically from the database.

---

### Phase 5: Testing

**Step 7:** Test the Checkout Flow

1. Go to **Settings** → **Billing** tab in your app
2. Click **Subscribe** on a plan (should show new prices)
3. Test with Stripe test card: `4242 4242 4242 4242`
4. Verify:
   - ✅ Prices display correctly ($49, $199, $599)
   - ✅ Checkout redirects to Stripe
   - ✅ Success webhook updates database
   - ✅ Subscription shows in Billing tab

**Step 8:** Test Webhook Events

1. In Stripe Dashboard → **Webhooks**
2. Click on your webhook endpoint
3. Send test events:
   - `customer.subscription.created`
   - `invoice.paid`
4. Verify events are received and processed

---

## 📊 Price Comparison

| Tier | Old Monthly | New Monthly | Change |
|------|-------------|-------------|--------|
| Atelier | $49 | $49 | No change |
| Studio | $149 | $199 | +$50 (+34%) |
| Maison | $399 | $599 | +$200 (+50%) |
| White-Label | $100 | $199 | +$99 (+99%) |

**Annual Pricing:**
- Studio: $1,990/year (was $1,490) — Save $398
- Maison: $5,990/year (was $3,990) — Save $1,198

---

## 🎯 Feature Limits Reference

### **Atelier** ($49/mo)
- 50 master content/month
- 200 derivatives/month
- 25 images/month
- 1 brand, 25 products
- 1 team member
- 500 Madison queries/month

### **Studio** ($199/mo)
- Unlimited master content
- 1,000 derivatives/month
- 100 images/month
- 3 brands, 100 products each
- 5 team members
- 2,000 Madison queries/month
- Marketplace integration

### **Maison** ($599/mo)
- Unlimited everything
- 500 images/month
- Unlimited brands & products
- Unlimited team members
- 10,000 Madison queries/month
- Full white-label included
- API access
- Dedicated support

---

## 📧 Grandfathering Existing Users

If you have existing subscribers on old pricing:

1. **Option 1** (Recommended): 12-month grace period, then 50% off forever
2. **Option 2**: Lock at old pricing forever
3. **Option 3**: 50% off new pricing forever

Send an email 2 weeks before changes go live with grandfathering offer.

---

## ✅ Final Verification

After completing all steps:

- [ ] Database migration executed successfully
- [ ] All 13 Stripe products created with correct pricing
- [ ] All Price IDs updated in database
- [ ] Webhook endpoint created and tested
- [ ] Webhook secret added to Supabase
- [ ] Stripe API keys set in Supabase secrets
- [ ] Test checkout flow works
- [ ] Prices display correctly in app
- [ ] Webhook events process successfully

---

## 🚨 Important Notes

1. **Test Mode First**: Complete all setup in Stripe test mode before switching to live
2. **Grandfathering**: Don't forget to handle existing subscribers
3. **Marketing Updates**: Update pricing page, landing page, emails with new prices
4. **Monitor Metrics**: Track conversion rates after launch

---

## 📞 Support

If you encounter issues:
1. Check Stripe Dashboard logs
2. Check Supabase Edge Function logs
3. Verify all secrets are set correctly
4. Test webhook endpoint manually

---

**Setup Complete!** 🎉

Your billing system is now configured for Madison Studio v2.0 pricing.
















