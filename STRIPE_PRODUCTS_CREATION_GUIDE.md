# Stripe Products Creation Guide - Step by Step

## 🎯 Quick Reference: Products to Create

### Base Subscription Tiers (Priority - Do These First)

| # | Product Name | Monthly Price | Yearly Price | Notes |
|---|-------------|---------------|--------------|-------|
| 1 | Madison Studio - Atelier | $49.00/month | $470.00/year | Your Personal Creative Director |
| 2 | Madison Studio - Studio | $199.00/month | $1,990.00/year | Scale Your Brand Voice |
| 3 | Madison Studio - Maison | $599.00/month | $5,990.00/year | Your Brand Operating System |

---

## 📝 Detailed Creation Steps

### Product 1: Atelier Monthly

1. Click **"+ Create product"** button
2. **Product information:**
   - Name: `Madison Studio - Atelier`
   - Description (optional): `Your Personal Creative Director`
3. **Pricing:**
   - Click **"Add price"**
   - Amount: `49.00`
   - Currency: `USD`
   - Billing period: **"Monthly recurring"**
   - Trial period: `14 days` (optional but recommended)
4. **Save** the product
5. **Copy the Price ID:**
   - After saving, click on the price you just created
   - Copy the Price ID (looks like `price_1ABC123DEF456...`)
   - Save this somewhere - you'll need it!
6. **Label it:** `price_atelier_monthly` (for your reference)

---

### Product 2: Atelier Annual

**Option A: Add to same product (recommended)**
- Go back to the Atelier product
- Click **"Add price"**
- Amount: `470.00`
- Billing: **"Yearly recurring"**
- Copy Price ID → Label: `price_atelier_annual`

**Option B: Create separate product**
- Follow same steps as Product 1, but use:
  - Name: `Madison Studio - Atelier (Annual)`
  - Price: `470.00`
  - Billing: `Yearly recurring`

---

### Product 3: Studio Monthly

1. **"+ Create product"**
2. **Product information:**
   - Name: `Madison Studio - Studio`
   - Description: `Scale Your Brand Voice`
3. **Pricing:**
   - Click **"Add price"**
   - Amount: `199.00`
   - Currency: `USD`
   - Billing period: **"Monthly recurring"**
   - Trial: `14 days`
4. **Save** and copy Price ID → Label: `price_studio_monthly`

---

### Product 4: Studio Annual

- Add yearly price to Studio product (or create separate)
- Amount: `1990.00` (or `1,990.00` - Stripe handles commas)
- Billing: **"Yearly recurring"**
- Copy Price ID → Label: `price_studio_annual`

---

### Product 5: Maison Monthly

1. **"+ Create product"**
2. **Product information:**
   - Name: `Madison Studio - Maison`
   - Description: `Your Brand Operating System`
3. **Pricing:**
   - Amount: `599.00`
   - Billing: **"Monthly recurring"**
   - Trial: `14 days`
4. **Save** and copy Price ID → Label: `price_maison_monthly`

---

### Product 6: Maison Annual

- Add yearly price to Maison product
- Amount: `5990.00` (or `5,990.00`)
- Billing: **"Yearly recurring"**
- Copy Price ID → Label: `price_maison_annual`

---

## ✅ After Creating Products

### Step 1: Save All Price IDs

You should have 6 Price IDs like this:
```
price_atelier_monthly = price_xxxxx...
price_atelier_annual = price_xxxxx...
price_studio_monthly = price_xxxxx...
price_studio_annual = price_xxxxx...
price_maison_monthly = price_xxxxx...
price_maison_annual = price_xxxxx...
```

### Step 2: Update Database

Run this SQL in **Supabase Dashboard** → **SQL Editor**, replacing the `price_xxxxx` values with your actual Price IDs:

```sql
-- Atelier Plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with your Atelier monthly Price ID
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_xxxxx'  -- Replace with your Atelier annual Price ID
WHERE slug = 'atelier';

-- Studio Plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with your Studio monthly Price ID
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_xxxxx'  -- Replace with your Studio annual Price ID
WHERE slug = 'studio';

-- Maison Plan
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with your Maison monthly Price ID
WHERE slug = 'maison';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_xxxxx'  -- Replace with your Maison annual Price ID
WHERE slug = 'maison';
```

### Step 3: Verify

Check that prices are set correctly:
```sql
SELECT name, slug, price_monthly, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
ORDER BY sort_order;
```

---

## 🚀 Testing

Once products are created and Price IDs are updated:

1. Go to your app → **Settings** → **Billing** tab
2. You should see the three tiers: Atelier, Studio, Maison
3. Click **"Subscribe"** on any plan
4. Should redirect to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete checkout - webhook should create subscription in database

---

## 💡 Pro Tips

- **Stripe Test Mode**: Make sure you're creating products in **Test mode** (blue banner at top)
- **Price ID Format**: Always starts with `price_` followed by your account identifier
- **Same Product vs Separate**: You can add multiple prices to one product (monthly + yearly), or create separate products. Both work!
- **Trial Period**: 14-day trials are optional but recommended for user acquisition
- **Copy Immediately**: Copy Price IDs right after creation - they're hard to find later!

---

## ❓ Troubleshooting

**"Price ID not found" error:**
- Double-check you copied the entire Price ID (they're long!)
- Make sure you're using Price IDs, not Product IDs
- Verify you're using test mode Price IDs if testing locally

**Products not showing in app:**
- Run the SQL UPDATE queries above
- Refresh the Billing tab
- Check browser console for errors

**Checkout not working:**
- Verify `STRIPE_SECRET_KEY` is set in Supabase secrets
- Check that Price IDs match exactly (case-sensitive)
- Ensure webhook is configured (see `BILLING_SETUP_COMPLETE.md`)












