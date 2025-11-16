-- Quick Setup: Update Price IDs for Test Subscriptions
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/iflwjiwkbxuvmiviqdxv/sql/new

-- First, check current state
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
ORDER BY sort_order;

-- If Price IDs are NULL, you need to:
-- 1. Create products in Stripe Dashboard (test mode)
-- 2. Copy the Price IDs
-- 3. Update them below

-- Update Atelier Plan (replace with your actual Price IDs from Stripe)
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_1SQKzID9l7wPFqooVHalDG2R',  -- Replace with your Atelier monthly Price ID
  stripe_price_id_yearly = 'price_1SQLepD9l7wPFqooLEeJ92JN'    -- Replace with your Atelier yearly Price ID
WHERE slug = 'atelier';

-- Update Studio Plan
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_1SQLg8D9l7wPFqoodEyzyrE8',  -- Replace with your Studio monthly Price ID
  stripe_price_id_yearly = 'price_1SQLgjD9l7wPFqooCaYOejpK'    -- Replace with your Studio yearly Price ID
WHERE slug = 'studio';

-- Update Maison Plan
UPDATE subscription_plans 
SET 
  stripe_price_id_monthly = 'price_1SQLiKD9l7wPFqooNhmlAOB7',  -- Replace with your Maison monthly Price ID
  stripe_price_id_yearly = 'price_1SQLigD9l7wPFqooiVrldrhF'    -- Replace with your Maison yearly Price ID
WHERE slug = 'maison';

-- Verify the updates worked
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly, price_monthly, price_yearly
FROM subscription_plans 
ORDER BY sort_order;

-- All Price IDs should be filled in (not NULL) for checkout to work!







