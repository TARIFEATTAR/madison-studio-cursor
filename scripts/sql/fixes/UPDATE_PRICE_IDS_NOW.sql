-- Update Stripe Price IDs in subscription_plans table
-- Generated from your Stripe prices.csv
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/sql/new

-- Atelier Plan (Monthly only - no yearly price found)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI2mRcevBEPUM5PgL24JMl'
WHERE slug = 'atelier';

-- Studio Plan (Monthly and Yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI4fRcevBEPUM5beEkPxri'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQI4yRcevBEPUM594dUdrVW'  -- $1990/year
WHERE slug = 'studio';

-- Maison Plan (Monthly and Yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQI5DRcevBEPUM50jgK4rgv'
WHERE slug = 'maison';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQI5SRcevBEPUM5aH2Yprgw'  -- $5990/year
WHERE slug = 'maison';

-- Verify the updates worked
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
-- Atelier: $49/month, monthly price ID set
-- Studio: $199/month, $1990/year, both price IDs set
-- Maison: $599/month, $5990/year, both price IDs set







