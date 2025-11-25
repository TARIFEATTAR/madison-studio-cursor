# Complete Stripe Test Setup - Step by Step

## 🎯 Goal
Set up test subscriptions in Stripe Test Mode so you can complete a test checkout and see how it works.

---

## Step 1: Create Products in Stripe Dashboard (Test Mode)

**Go to:** https://dashboard.stripe.com/test/products

**Make sure you're in TEST MODE** (toggle in top right should say "Test mode")

### Create Product 1: Atelier Monthly

1. Click **"+ Create product"**
2. **Product information:**
   - Name: `Madison Studio - Atelier`
   - Description: `Your Personal Creative Director`
3. **Pricing:**
   - Click **"Add price"**
   - Amount: `49.00`
   - Currency: `USD`
   - Billing period: **"Monthly recurring"**
   - Trial period: `14 days` (optional)
4. Click **"Save product"**
5. **Copy the Price ID** (starts with `price_...`) - Save this!
   - Example: `price_1SQKzID9l7wPFqooVHalDG2R`

### Create Product 2: Atelier Annual

1. Go back to the **Atelier** product you just created
2. Click **"Add price"**
3. Amount: `470.00`
4. Billing period: **"Yearly recurring"**
5. Click **"Save"**
6. **Copy the Yearly Price ID** - Save this!

### Create Product 3: Studio Monthly

1. Click **"+ Create product"**
2. Name: `Madison Studio - Studio`
3. Description: `Scale Your Brand Voice`
4. **Add price:** `199.00` / Monthly recurring
5. **Copy Monthly Price ID**

### Create Product 4: Studio Annual

1. Add yearly price to Studio product: `1990.00` / Yearly recurring
2. **Copy Yearly Price ID**

### Create Product 5: Maison Monthly

1. Click **"+ Create product"**
2. Name: `Madison Studio - Maison`
3. Description: `Your Brand Operating System`
4. **Add price:** `599.00` / Monthly recurring
5. **Copy Monthly Price ID**

### Create Product 6: Maison Annual

1. Add yearly price to Maison product: `5990.00` / Yearly recurring
2. **Copy Yearly Price ID**

---

## Step 2: Update Database with Price IDs

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/sql/new

**Run this SQL** (replace the Price IDs with your actual ones from Step 1):

```sql
-- Update Atelier Plan
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_YOUR_ATELIER_MONTHLY_ID_HERE',
  stripe_price_id_yearly = 'price_YOUR_ATELIER_YEARLY_ID_HERE'
WHERE slug = 'atelier';

-- Update Studio Plan
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_YOUR_STUDIO_MONTHLY_ID_HERE',
  stripe_price_id_yearly = 'price_YOUR_STUDIO_YEARLY_ID_HERE'
WHERE slug = 'studio';

-- Update Maison Plan
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_YOUR_MAISON_MONTHLY_ID_HERE',
  stripe_price_id_yearly = 'price_YOUR_MAISON_YEARLY_ID_HERE'
WHERE slug = 'maison';

-- Verify the updates
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
ORDER BY sort_order;
```

**After running, you should see all 3 plans with Price IDs filled in.**

---

## Step 3: Verify Edge Functions Are Deployed

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions

**Verify these functions exist:**
- ✅ `create-checkout-session`
- ✅ `create-portal-session`
- ✅ `get-subscription`
- ✅ `stripe-webhook`

**If any are missing, deploy them via Dashboard or CLI.**

---

## Step 4: Set Stripe Secret Key

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/functions

**Scroll to "Secrets" section**

**Add/Verify:**
- **Name:** `STRIPE_SECRET_KEY`
- **Value:** Your Stripe Secret Key (starts with `sk_test_...`)
  - Get from: Stripe Dashboard → Developers → API keys → Secret key

**Also add (optional but recommended):**
- **Name:** `APP_URL`
- **Value:** `http://localhost:8080`

---

## Step 5: Test the Subscription Flow! 🎉

1. **Refresh your browser** (hard refresh: Cmd+Shift+R)
2. **Go to:** http://localhost:8080/settings?tab=billing
3. **Click "Subscribe"** on any plan (e.g., Atelier $49/month)
4. **You should be redirected to Stripe Checkout**

### Use Stripe Test Card:
- **Card number:** `4242 4242 4242 4242`
- **Expiry:** Any future date (e.g., `12/25`)
- **CVC:** Any 3 digits (e.g., `123`)
- **ZIP:** Any 5 digits (e.g., `12345`)

5. **Complete checkout**
6. **You'll be redirected back** to your app
7. **Refresh the Billing tab** - you should see:
   - ✅ Current plan displayed
   - ✅ Renewal date
   - ✅ "Manage Plan" button

---

## Step 6: Verify Subscription in Database

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/sql/new

**Run:**
```sql
SELECT * FROM subscriptions ORDER BY created_at DESC LIMIT 1;
```

**You should see your test subscription!**

---

## 🐛 Troubleshooting

### "Plan is not yet configured with Stripe"
- **Fix:** Price IDs are NULL in database
- **Solution:** Run Step 2 SQL with your actual Price IDs

### "Failed to send a request to the Edge Function"
- **Fix:** Function not deployed
- **Solution:** Deploy `create-checkout-session` function (Step 3)

### "STRIPE_SECRET_KEY not found"
- **Fix:** Secret not set in Supabase
- **Solution:** Add `STRIPE_SECRET_KEY` to Supabase secrets (Step 4)

### Checkout redirects but shows error
- **Fix:** Check browser console (F12) for errors
- **Check:** Supabase function logs for detailed error messages

---

## ✅ Quick Checklist

- [ ] Created 3 products in Stripe (Atelier, Studio, Maison)
- [ ] Created 6 prices (monthly + yearly for each)
- [ ] Copied all 6 Price IDs
- [ ] Updated database with Price IDs (Step 2 SQL)
- [ ] Verified functions are deployed
- [ ] Set `STRIPE_SECRET_KEY` in Supabase secrets
- [ ] Tested checkout with card `4242 4242 4242 4242`
- [ ] Verified subscription appears in database

---

## 🎯 You're Ready!

Once you complete these steps, you'll be able to:
- ✅ Subscribe to any plan
- ✅ See subscription in your app
- ✅ Manage subscription via Stripe Portal
- ✅ See invoices in billing history

All in **test mode** - no real charges! 💳







