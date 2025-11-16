# Billing Tiers Setup Guide

This guide walks you through setting up your billing tiers in Stripe and connecting them to your application.

## Step 1: Create Products in Stripe Dashboard

1. Go to your Stripe Dashboard: https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (for local development)
3. Navigate to **Products** → Click **+ Add product**

### Create Each Tier

For each tier defined in `src/config/billingTiers.ts`, create a corresponding product in Stripe:

#### Starter Tier ($29/month)
1. **Name**: "Starter"
2. **Description**: "Perfect for individuals and small teams getting started"
3. **Pricing**:
   - **Price**: $29.00
   - **Billing period**: Monthly (recurring)
4. Click **Save product**
5. **Copy the Price ID** (starts with `price_...`) - you'll need this!

#### Professional Tier ($99/month)
1. **Name**: "Professional"
2. **Description**: "For growing teams that need more power and flexibility"
3. **Pricing**:
   - **Price**: $99.00
   - **Billing period**: Monthly (recurring)
4. Click **Save product**
5. **Copy the Price ID**

#### Enterprise Tier ($299/month)
1. **Name**: "Enterprise"
2. **Description**: "For large organizations with advanced needs"
3. **Pricing**:
   - **Price**: $299.00
   - **Billing period**: Monthly (recurring)
4. Click **Save product**
5. **Copy the Price ID**

---

## Step 2: Update Billing Tiers Configuration

Open `src/config/billingTiers.ts` and update the `priceId` field for each tier with your Stripe Price IDs:

```typescript
export const BILLING_TIERS: BillingTier[] = [
  {
    id: "starter",
    name: "Starter",
    // ... other fields ...
    priceId: "price_1234567890abcdef", // ← Replace with your actual Stripe Price ID
  },
  {
    id: "professional",
    name: "Professional",
    // ... other fields ...
    priceId: "price_abcdef1234567890", // ← Replace with your actual Stripe Price ID
  },
  {
    id: "enterprise",
    name: "Enterprise",
    // ... other fields ...
    priceId: "price_9876543210fedcba", // ← Replace with your actual Stripe Price ID
  },
];
```

### Option: Use Environment Variables (Recommended for Production)

Instead of hardcoding Price IDs, you can use environment variables:

1. Add to `.env.local`:
```bash
VITE_STRIPE_PRICE_STARTER=price_1234567890abcdef
VITE_STRIPE_PRICE_PROFESSIONAL=price_abcdef1234567890
VITE_STRIPE_PRICE_ENTERPRISE=price_9876543210fedcba
```

2. The config file already supports this - just make sure your `.env.local` has the values!

---

## Step 3: Customize Your Tiers (Optional)

You can customize the tiers in `src/config/billingTiers.ts`:

- **Change pricing**: Update the `price` field
- **Modify features**: Edit the `features` array
- **Add/remove tiers**: Add or remove objects from the `BILLING_TIERS` array
- **Mark as popular**: Set `popular: true` on a tier to highlight it
- **Add badge**: Set `badge: "Most Popular"` or any text

---

## Step 4: Test the Integration

1. **Start your dev server**: `npm run dev`
2. **Navigate to**: Settings → Billing tab
3. **You should see**:
   - All three tiers displayed as cards
   - "Professional" tier marked as "Most Popular"
   - Click "Subscribe" on any tier
   - You'll be redirected to Stripe Checkout
4. **Use test card**: `4242 4242 4242 4242` (any future expiry, any CVC)
5. **Complete checkout** and verify:
   - Subscription appears in your database
   - Current plan shows in Billing tab
   - Invoice appears in billing history

---

## Step 5: Production Setup

When ready for production:

1. **Switch to Live Mode** in Stripe Dashboard
2. **Create the same products** in Live Mode
3. **Copy the Live Mode Price IDs**
4. **Update environment variables** in your production environment:
   ```
   VITE_STRIPE_PRICE_STARTER=price_live_...
   VITE_STRIPE_PRICE_PROFESSIONAL=price_live_...
   VITE_STRIPE_PRICE_ENTERPRISE=price_live_...
   ```
5. **Update Stripe keys** to live keys (see `STRIPE_LOCAL_SETUP.md`)

---

## Troubleshooting

### "Price ID not found" error
- Make sure you've created the product in Stripe Dashboard
- Verify the Price ID is correct (starts with `price_...`)
- Check you're using Test Mode Price IDs for local development

### Tiers not showing
- Check that `billingTiers.ts` is properly imported
- Verify the `BILLING_TIERS` array is not empty
- Check browser console for errors

### Checkout not working
- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set in `.env.local`
- Check that `create-checkout-session` edge function is deployed
- Verify Stripe secret key is set in Supabase secrets

---

## Current Tier Configuration

Your current tiers are:

1. **Starter** - $29/month
   - Basic features for individuals

2. **Professional** - $99/month ⭐ (Most Popular)
   - Full feature set for growing teams

3. **Enterprise** - $299/month
   - Advanced features for large organizations

You can modify these in `src/config/billingTiers.ts` at any time!








