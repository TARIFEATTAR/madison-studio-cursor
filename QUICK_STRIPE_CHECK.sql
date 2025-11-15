-- Quick Stripe Payment System Status Check
-- Copy and paste this entire block into Supabase SQL Editor

-- 1. Check subscription plans exist and have Price IDs
SELECT 
  name,
  slug,
  price_monthly,
  price_yearly,
  CASE 
    WHEN stripe_price_id_monthly IS NOT NULL THEN '✅' 
    ELSE '❌ MISSING' 
  END as monthly_price_id,
  CASE 
    WHEN stripe_price_id_yearly IS NOT NULL THEN '✅' 
    ELSE '❌ MISSING' 
  END as yearly_price_id,
  is_active,
  sort_order
FROM subscription_plans 
ORDER BY sort_order;






