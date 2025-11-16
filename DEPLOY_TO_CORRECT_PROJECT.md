# Deploy to Correct Project - likkskifwsrvszxdvufw

## ✅ Found Your Project!

Your actual project ID is: **`likkskifwsrvszxdvufw`**

---

## 🚀 Step 1: Deploy Edge Functions

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

### Deploy `create-checkout-session`:

1. **Click "Deploy Function"** or **"Deploy a new function"**
2. **Function name:** `create-checkout-session`
3. **Upload the folder:** `supabase/functions/create-checkout-session`
   - Or drag and drop the entire `create-checkout-session` folder
4. **Wait for deployment** (30-60 seconds)

### Also Deploy These:

- `create-portal-session`
- `get-subscription`
- `stripe-webhook`

---

## ✅ Step 2: Set Stripe Secret Key

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions

**Scroll to "Secrets" section**

**Add:**
- **Name:** `STRIPE_SECRET_KEY`
- **Value:** Your Stripe secret key (`sk_test_...`)
  - Get from: https://dashboard.stripe.com/test/apikeys
- Click **"Save"**

---

## ✅ Step 3: Update Price IDs (If Not Done Yet)

**Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new

**Run this SQL:**

```sql
-- Update Stripe Price IDs
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI2mRcevBEPUM5PgL24JMl'
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI4fRcevBEPUM5beEkPxri'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQI4yRcevBEPUM594dUdrVW'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI5DRcevBEPUM50jgK4rgv'
WHERE slug = 'maison';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQI5SRcevBEPUM5aH2Yprgw'
WHERE slug = 'maison';

-- Verify
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans;
```

---

## ✅ Step 4: Test Checkout!

1. **Refresh browser** (Cmd+Shift+R)
2. **Go to:** Settings → Billing tab
3. **Click "Subscribe"** on any plan
4. **Should redirect to Stripe Checkout!**

---

## 📋 Quick Links for Your Project

- **Functions:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
- **Secrets:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/functions
- **SQL Editor:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new
- **Project Settings:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/settings/general

---

## 🎯 Next Steps

1. ✅ Deploy `create-checkout-session` function
2. ✅ Set `STRIPE_SECRET_KEY` secret
3. ✅ Test checkout flow

Let me know once you've deployed the function and we can test it!







