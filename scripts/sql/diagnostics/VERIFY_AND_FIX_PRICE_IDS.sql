-- Verify and Fix Stripe Price IDs
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new

-- Step 1: Check current state
SELECT 
  name, 
  slug, 
  price_monthly,
  price_yearly,
  stripe_price_id_monthly, 
  stripe_price_id_yearly,
  is_active
FROM subscription_plans 
ORDER BY sort_order;

-- Step 2: Update Price IDs (run this if they're NULL)
-- Atelier Plan (Monthly only)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI2mRcevBEPUM5PgL24JMl'
WHERE slug = 'atelier';

-- Studio Plan (Monthly and Yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI4fRcevBEPUM5beEkPxri'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQI4yRcevBEPUM594dUdrVW'
WHERE slug = 'studio';

-- Maison Plan (Monthly and Yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI5DRcevBEPUM50jgK4rgv'
WHERE slug = 'maison';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQI5SRcevBEPUM5aH2Yprgw'
WHERE slug = 'maison';

-- Step 3: Verify the updates worked
SELECT 
  name, 
  slug, 
  price_monthly,
  price_yearly,
  stripe_price_id_monthly, 
  stripe_price_id_yearly
FROM subscription_plans 
ORDER BY sort_order;

-- Expected results:
-- Atelier: $49/month, monthly price ID = 'price_1SQI2mRcevBEPUM5PgL24JMl'
-- Studio: $199/month, $1990/year, both price IDs set
-- Maison: $599/month, $5990/year, both price IDs set







