# Fix Billing Page - Step by Step

## Issue Summary
- `subscription_plans` table doesn't exist (404 error)
- Edge Function CORS not working properly

---

## Step 1: Create the subscription_plans table

### Go to Supabase SQL Editor
https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/sql/new

### Run this SQL:

```sql
-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER,
  features JSONB DEFAULT '{}'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Create policy for public read
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Insert the 3 Madison Studio tiers
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, sort_order) VALUES
  (
    'Atelier',
    'atelier',
    'Your Personal Creative Director',
    4900,
    47000,
    '["50 master content pieces/month", "200 derivative assets/month", "25 AI-generated images/month", "1 brand, 25 products", "Brand knowledge training", "Madison AI assistant (500 queries/month)", "Content library & calendar", "Email support (48hr response)"]'::jsonb,
    1
  ),
  (
    'Studio',
    'studio',
    'Scale Your Brand Voice',
    19900,
    199000,
    '["Unlimited master content", "1,000 derivatives/month", "100 AI images/month", "3 brands, 100 products each", "5 team members with roles", "Shopify & Etsy integration", "Priority support (24hr) + monthly strategy call", "White-label add-on available"]'::jsonb,
    2
  ),
  (
    'Maison',
    'maison',
    'Your Brand Operating System',
    59900,
    599000,
    '["Unlimited everything (content, derivatives, brands)", "500 AI images/month", "Unlimited team members", "API access for custom integrations", "Full white-label included (zero attribution)", "Dedicated account manager", "Quarterly business reviews", "2-hour concierge onboarding", "Phone & Slack support (4hr response)"]'::jsonb,
    3
  )
ON CONFLICT (slug) DO NOTHING;

-- Update Stripe Price IDs
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQKzID9l7wPFqooVHalDG2R',
    stripe_price_id_yearly = 'price_1SQLepD9l7wPFqooLEeJ92JN'
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLg8D9l7wPFqoodEyzyrE8',
    stripe_price_id_yearly = 'price_1SQLgjD9l7wPFqooCaYOejpK'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLiKD9l7wPFqooNhmlAOB7',
    stripe_price_id_yearly = 'price_1SQLigD9l7wPFqooiVrldrhF'
WHERE slug = 'maison';
```

### Verify it worked:
```sql
SELECT name, slug, price_monthly, stripe_price_id_monthly 
FROM subscription_plans 
ORDER BY sort_order;
```

You should see 3 rows:
- Atelier ($49/mo)
- Studio ($199/mo)
- Maison ($599/mo)

---

## Step 2: Deploy the Edge Function

### Option A: Via Supabase Dashboard (Easiest)

1. Go to: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/functions
2. Find `get-subscription` in the list
3. Click the **︙** (3 dots) menu
4. Click **"Deploy new version"** or **"Redeploy"**

### Option B: Via GitHub

If your functions are deployed via GitHub:
1. The function code is already updated in your repo
2. Just need to trigger a deploy
3. Check the Functions page for deploy status

---

## Step 3: Test It

1. **Hard refresh** the billing page (Cmd+Shift+R or Ctrl+Shift+R)
2. **Check browser console** (F12 → Console tab)

### Expected result:
- ✅ No CORS errors
- ✅ No 404 errors
- ✅ 3 subscription plans displayed

### If still errors:
- Check what the console says
- Verify table exists: `SELECT * FROM subscription_plans;`
- Verify function deployed: Check Functions dashboard

---

## Troubleshooting

### Error: "relation subscription_plans does not exist"
→ Run Step 1 SQL again

### Error: "CORS blocked"
→ Redeploy function in Step 2

### Error: "Failed to fetch"
→ Check if function is deployed and active in dashboard

### Plans show but no prices
→ Check Stripe Price IDs are correct in the database




