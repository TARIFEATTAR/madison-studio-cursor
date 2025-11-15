-- ✅ READY TO RUN - Your Stripe Price IDs are already filled in!
-- Copy and paste this entire file into Supabase SQL Editor → Run

-- Atelier Plan (monthly and yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQKzID9l7wPFqooVHalDG2R'
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQLepD9l7wPFqooLEeJ92JN'
WHERE slug = 'atelier';

-- Studio Plan (monthly and yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLg8D9l7wPFqoodEyzyrE8'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQLgjD9l7wPFqooCaYOejpK'
WHERE slug = 'studio';

-- Maison Plan (monthly and yearly)
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLiKD9l7wPFqooNhmlAOB7'
WHERE slug = 'maison';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQLigD9l7wPFqooiVrldrhF'
WHERE slug = 'maison';

-- ✅ Verify the updates worked
SELECT 
  name,
  slug,
  price_monthly / 100.0 as monthly_price_usd,
  price_yearly / 100.0 as yearly_price_usd,
  stripe_price_id_monthly,
  stripe_price_id_yearly
FROM subscription_plans 
ORDER BY sort_order;










