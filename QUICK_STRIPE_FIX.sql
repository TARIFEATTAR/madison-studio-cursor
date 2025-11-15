-- Quick Stripe Billing Fix
-- Run this in Supabase SQL Editor to ensure plans have Stripe Price IDs configured
-- This will fix the "Plan is not yet configured with Stripe" error

-- Step 1: Ensure plans exist with correct pricing (Madison Studio v2.0)
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, sort_order, is_active) VALUES
  (
    'Atelier',
    'atelier',
    'Your Personal Creative Director',
    4900, -- $49.00/month
    47000, -- $470.00/year
    '["50 master content pieces/month", "200 derivative assets/month", "25 AI-generated images/month", "1 brand, 25 products each", "Madison AI assistant (500 queries/month)", "1 team member", "Email support (48h)"]'::jsonb,
    1,
    true
  ),
  (
    'Studio',
    'studio',
    'Scale Your Brand Voice',
    19900, -- $199.00/month
    199000, -- $1,990.00/year
    '["Unlimited master content", "1,000 derivative assets/month", "100 AI-generated images/month", "3 brands, 100 products each", "Madison AI assistant (2,000 queries/month)", "5 team members", "Shopify & Etsy integration", "Priority email support (24h)"]'::jsonb,
    2,
    true
  ),
  (
    'Maison',
    'maison',
    'Your Brand Operating System',
    59900, -- $599.00/month
    599000, -- $5,990.00/year
    '["Unlimited master content", "Unlimited derivatives", "500 AI-generated images/month", "Unlimited brands & products", "Madison AI assistant (10,000 queries/month)", "Unlimited team members", "Shopify & Etsy integration", "API access", "Full white-label included", "Phone & Slack support (4h)"]'::jsonb,
    3,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  is_active = true,
  updated_at = now();

-- Step 2: Update Stripe Price IDs (Test Mode)
-- These are the Price IDs from your Stripe Dashboard
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQKzID9l7wPFqooVHalDG2R',
    stripe_price_id_yearly = 'price_1SQLepD9l7wPFqooLEeJ92JN',
    updated_at = now()
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLg8D9l7wPFqoodEyzyrE8',
    stripe_price_id_yearly = 'price_1SQLgjD9l7wPFqooCaYOejpK',
    updated_at = now()
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLiKD9l7wPFqooNhmlAOB7',
    stripe_price_id_yearly = 'price_1SQLigD9l7wPFqooiVrldrhF',
    updated_at = now()
WHERE slug = 'maison';

-- Step 3: Verify the configuration
SELECT 
  name, 
  slug, 
  price_monthly, 
  price_yearly,
  stripe_price_id_monthly,
  stripe_price_id_yearly,
  is_active
FROM subscription_plans 
WHERE is_active = true
ORDER BY sort_order;

-- Expected output:
-- ✅ Atelier: monthly & yearly Price IDs set
-- ✅ Studio: monthly & yearly Price IDs set  
-- ✅ Maison: monthly & yearly Price IDs set





