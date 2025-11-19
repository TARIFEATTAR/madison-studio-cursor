# Quick Guide: Update Database with Stripe Price IDs

## Step 1: Find Your Price IDs in Stripe

1. **Go to Stripe Dashboard** → **Products** tab
2. **For each product**, click on it to view details
3. **Find the Price ID**:
   - Look for a field labeled "Price ID" or "API ID" 
   - It starts with `price_` followed by a long string
   - Example: `price_1ABC123XYZ789...`
4. **Copy each Price ID** and match it to the plan below

---

## Step 2: Collect Your Price IDs

Fill in your Price IDs here as you find them:

```
Atelier Monthly:  price________________________
Atelier Annual:   price________________________
Studio Monthly:   price________________________
Studio Annual:    price________________________
Maison Monthly:   price________________________
Maison Annual:    price________________________
```

**💡 Tip**: If you added both monthly and yearly prices to the same product, you'll see multiple prices listed under that product. Make sure to get the correct one for each billing cycle!

---

## Step 3: Update Database

### Option A: Update Using SQL File (Recommended)

1. **Open** `update_stripe_price_ids.sql` in your code editor
2. **Replace** each `'price_xxxxx'` with your actual Price ID (keep the quotes!)
3. **Go to Supabase Dashboard** → **SQL Editor**
4. **Paste and Run** the updated SQL

### Option B: Update One-by-One (Easier to Check)

Copy and run each SQL statement one at a time in Supabase SQL Editor:

```sql
-- 1. Atelier Monthly
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'YOUR_ATELIER_MONTHLY_PRICE_ID_HERE'
WHERE slug = 'atelier';

-- 2. Atelier Annual  
UPDATE subscription_plans 
SET stripe_price_id_yearly = 'YOUR_ATELIER_ANNUAL_PRICE_ID_HERE'
WHERE slug = 'atelier';

-- 3. Studio Monthly
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'YOUR_STUDIO_MONTHLY_PRICE_ID_HERE'
WHERE slug = 'studio';

-- 4. Studio Annual
UPDATE subscription_plans 
SET stripe_price_id_yearly = 'YOUR_STUDIO_ANNUAL_PRICE_ID_HERE'
WHERE slug = 'studio';

-- 5. Maison Monthly
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'YOUR_MAISON_MONTHLY_PRICE_ID_HERE'
WHERE slug = 'maison';

-- 6. Maison Annual
UPDATE subscription_plans 
SET stripe_price_id_yearly = 'YOUR_MAISON_ANNUAL_PRICE_ID_HERE'
WHERE slug = 'maison';
```

---

## Step 4: Verify It Worked

Run this query to check all Price IDs are set:

```sql
SELECT 
  name,
  slug,
  price_monthly / 100.0 as monthly_price,
  price_yearly / 100.0 as yearly_price,
  stripe_price_id_monthly,
  stripe_price_id_yearly
FROM subscription_plans 
ORDER BY sort_order;
```

**Expected Result:**
- All `stripe_price_id_monthly` and `stripe_price_id_yearly` should show your Price IDs (not NULL)
- Prices should match: $49/$470, $199/$1,990, $599/$5,990

---

## Step 5: Test It!

1. **Go to your app** → **Settings** → **Billing** tab
2. **Click "Subscribe"** on any plan
3. **Should redirect to Stripe Checkout** with the correct price
4. **Use test card**: `4242 4242 4242 4242`
5. **Complete checkout** - subscription should appear in database

---

## ❌ Troubleshooting

**Price IDs showing as NULL:**
- Double-check you copied the entire Price ID (they're long!)
- Make sure you included the quotes around the Price ID
- Verify you ran the UPDATE queries successfully

**Checkout not working:**
- Refresh the Billing tab
- Check browser console for errors
- Verify `STRIPE_SECRET_KEY` is set in Supabase secrets
- Make sure Price IDs match exactly (case-sensitive)

**Can't find Price IDs in Stripe:**
- Click on each product in Stripe Dashboard
- Look under the "Pricing" section
- The Price ID is usually displayed next to each price point
- If using API mode, check the API response or webhook events
















