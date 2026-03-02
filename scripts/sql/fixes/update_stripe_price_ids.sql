-- Update Stripe Price IDs in subscription_plans table
-- Madison Studio v2.0 Pricing Tiers
-- ✅ Price IDs updated on: November 2025

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

-- Update Add-On Price IDs (if using subscription_addons table)
UPDATE subscription_addons 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with: price_addon_whitelabel_monthly
WHERE slug = 'whitelabel';

UPDATE subscription_addons 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with: price_addon_images_50_monthly
WHERE slug = 'images_50';

UPDATE subscription_addons 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with: price_addon_images_100_monthly
WHERE slug = 'images_100';

UPDATE subscription_addons 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with: price_addon_images_500_monthly
WHERE slug = 'images_500';

UPDATE subscription_addons 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with: price_addon_brand_slot_monthly
WHERE slug = 'brand_slot';

UPDATE subscription_addons 
SET stripe_price_id_monthly = 'price_xxxxx'  -- Replace with: price_addon_team_5pack_monthly
WHERE slug = 'team_5pack';

-- Verify the updates
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly, price_monthly, price_yearly
FROM subscription_plans 
ORDER BY sort_order;

-- Verify add-ons
SELECT name, slug, stripe_price_id_monthly, price_monthly, required_tier_slug
FROM subscription_addons 
ORDER BY sort_order;

