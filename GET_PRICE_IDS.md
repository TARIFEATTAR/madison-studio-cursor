# Get Price IDs from Your Stripe Products

## 📋 What You Have vs What You Need

**You have:** Product IDs (start with `prod_`)
**You need:** Price IDs (start with `price_`)

Each product can have multiple prices (monthly, yearly, etc.). We need the Price IDs.

---

## 🎯 Quick Steps to Get Price IDs

### Option 1: Via Stripe Dashboard (Easiest)

1. **Go to:** https://dashboard.stripe.com/test/products
2. **Click on each product** to see its prices
3. **For each price, copy the Price ID** (starts with `price_...`)

### Option 2: Via Stripe API (Faster)

Run this in your terminal (if you have Stripe CLI):

```bash
stripe prices list --limit 20
```

This will show all your prices with their IDs.

---

## 📝 Products You Have

From your CSV, you have:

1. **Atelier** (`prod_TN269RGzYtpt0x`)
   - Need: Monthly Price ID
   - Need: Yearly Price ID (if exists)

2. **Studio** (`prod_TN28FuD4CVOQSM`) - Monthly
   - Need: Monthly Price ID

3. **Studio (Annual)** (`prod_TN2F0VwhfTSeAI`)
   - Need: Yearly Price ID

4. **Maison** (`prod_TN29HeH6yvQM9d`) - Monthly
   - Need: Monthly Price ID

5. **Maison (Annual)** (`prod_TN29cVKvktJqw5`)
   - Need: Yearly Price ID

6. **Avenue (Annual)** (`prod_TN2GUA8cvyFN8w`)
   - This might be a different tier - check if you need this

---

## 🔍 How to Find Price IDs in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/products
2. Click on **"Atelier"** product
3. You'll see a section showing **"Pricing"** with prices listed
4. Each price has a **Price ID** next to it (starts with `price_...`)
5. **Copy that Price ID**

Repeat for each product!

---

## 📊 What We Need

Once you have the Price IDs, we'll map them like this:

```sql
-- Atelier
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_ATELIER_MONTHLY_ID'
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_ATELIER_YEARLY_ID'  -- if you have yearly
WHERE slug = 'atelier';

-- Studio
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_STUDIO_MONTHLY_ID'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_STUDIO_YEARLY_ID'
WHERE slug = 'studio';

-- Maison
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_MAISON_MONTHLY_ID'
WHERE slug = 'maison';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_MAISON_YEARLY_ID'
WHERE slug = 'maison';
```

---

## ⚡ Fastest Way

**If you can access Stripe Dashboard:**

1. Go to each product
2. Copy the Price IDs
3. Share them with me and I'll generate the exact SQL

**Or use Stripe CLI:**

```bash
# List all prices
stripe prices list --limit 50 --output json > prices.json

# This will show all Price IDs with their product associations
```

---

## 💡 Quick Check

If you want to verify what prices exist, you can also check in Stripe Dashboard:

**Go to:** https://dashboard.stripe.com/test/prices

This shows ALL prices across all products, making it easier to find what you need!







