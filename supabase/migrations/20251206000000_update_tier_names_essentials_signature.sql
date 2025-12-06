-- Update subscription plan tiers from Atelier/Maison to Essentials/Signature
-- Maintains Studio tier name

-- Update the subscription_plans table with new tier names and Stripe Price IDs
UPDATE subscription_plans 
SET 
  name = 'Essentials',
  slug = 'essentials',
  description = 'Essential tools for individual creators and boutique brands to craft their voice',
  stripe_price_id_monthly = 'price_1SbA3SRcevBEPUM5Dtsbo4l5',
  stripe_price_id_yearly = 'price_1SbA5hRcevBEPUM5vrXYq02Q',
  price_monthly = 4900,
  price_yearly = 49000,
  updated_at = now()
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_1SbA7JRcevBEPUM5YjQM4JGR',
  stripe_price_id_yearly = 'price_1SbA7sRcevBEPUM5Gk3cRoS8',
  price_monthly = 14900,
  price_yearly = 149000,
  updated_at = now()
WHERE slug = 'studio';

UPDATE subscription_plans 
SET 
  name = 'Signature',
  slug = 'signature',
  description = 'Your signature presence - full capabilities for established brands',
  stripe_price_id_monthly = 'price_1SbA8oRcevBEPUM5fwfcuTk0',
  stripe_price_id_yearly = 'price_1SbA9ERcevBEPUM5PEPa3icy',
  price_monthly = 34900,
  price_yearly = 349000,
  updated_at = now()
WHERE slug = 'maison';

-- Verify the update
SELECT slug, name, price_monthly, price_yearly, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
WHERE slug IN ('essentials', 'studio', 'signature')
ORDER BY price_monthly ASC;

