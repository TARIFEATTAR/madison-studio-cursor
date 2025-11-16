# Complete Test Subscription - Quick Guide

## 🎯 What You Need to Do

The error "Plan is not yet configured with Stripe" means the Price IDs aren't in your database yet. Here's how to fix it:

---

## Step 1: Create Products in Stripe (5 minutes)

**Go to:** https://dashboard.stripe.com/test/products

**Make sure you're in TEST MODE** (toggle in top right)

### Create 3 Products:

1. **Atelier** - $49/month, $470/year
2. **Studio** - $199/month, $1,990/year  
3. **Maison** - $599/month, $5,990/year

**For each product:**
- Click "+ Create product"
- Enter name and description
- Add monthly price (e.g., $49.00, recurring monthly)
- Add yearly price (e.g., $470.00, recurring yearly)
- **Copy the Price IDs** (they start with `price_...`)

**You'll get 6 Price IDs total:**
- Atelier monthly
- Atelier yearly
- Studio monthly
- Studio yearly
- Maison monthly
- Maison yearly

---

## Step 2: Update Database with Price IDs (2 minutes)

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/sql/new

**Run this SQL** (replace the Price IDs with your actual ones):

```sql
-- Update Atelier
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_YOUR_ATELIER_MONTHLY_ID',
  stripe_price_id_yearly = 'price_YOUR_ATELIER_YEARLY_ID'
WHERE slug = 'atelier';

-- Update Studio
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_YOUR_STUDIO_MONTHLY_ID',
  stripe_price_id_yearly = 'price_YOUR_STUDIO_YEARLY_ID'
WHERE slug = 'studio';

-- Update Maison
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_YOUR_MAISON_MONTHLY_ID',
  stripe_price_id_yearly = 'price_YOUR_MAISON_YEARLY_ID'
WHERE slug = 'maison';

-- Verify
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans;
```

**All Price IDs should show (not NULL) after running this.**

---

## Step 3: Verify Edge Function is Deployed

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions

**Check if `create-checkout-session` exists:**
- ✅ If it's there → You're good!
- ❌ If it's missing → Deploy it (upload the folder or use CLI)

---

## Step 4: Set Stripe Secret Key

**Go to:** https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/settings/functions

**Scroll to "Secrets"**

**Add/Verify:**
- `STRIPE_SECRET_KEY` = Your Stripe secret key (`sk_test_...`)
  - Get from: Stripe Dashboard → Developers → API keys

---

## Step 5: Test Subscription! 🎉

1. **Refresh browser** (Cmd+Shift+R)
2. **Go to:** Settings → Billing tab
3. **Click "Subscribe"** on any plan
4. **Should redirect to Stripe Checkout**

### Use Test Card:
- **Card:** `4242 4242 4242 4242`
- **Expiry:** `12/25` (any future date)
- **CVC:** `123` (any 3 digits)
- **ZIP:** `12345` (any 5 digits)

5. **Complete checkout**
6. **You'll be redirected back**
7. **Refresh Billing tab** → Should show your subscription!

---

## ✅ Quick Checklist

- [ ] Created 3 products in Stripe Test Mode
- [ ] Copied 6 Price IDs (monthly + yearly for each)
- [ ] Updated database with Price IDs (Step 2 SQL)
- [ ] Verified `create-checkout-session` function is deployed
- [ ] Set `STRIPE_SECRET_KEY` in Supabase secrets
- [ ] Tested checkout with card `4242 4242 4242 4242`

---

## 🐛 If Still Not Working

**Check browser console (F12):**
- Look for specific error messages
- Share the error and I'll help fix it

**Check Supabase function logs:**
- Dashboard → Edge Functions → `create-checkout-session` → Logs
- Look for errors when you click Subscribe

---

## 💡 Pro Tip

If you already have Price IDs from a previous setup, you can use those! Just make sure they're in **Test Mode** and update the database with them.

The Price IDs in `update_stripe_price_ids.sql` might already work if they're from your Stripe account - try running that SQL first!







