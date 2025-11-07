-- COMPREHENSIVE BILLING FIX
-- Run this entire script in Supabase SQL Editor
-- This will ensure subscription_plans table exists, has correct data, and RLS is properly configured

-- Step 1: Ensure table exists with all columns
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER,
  features JSONB DEFAULT '[]'::jsonb,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Ensure RLS is enabled
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policy if it exists and recreate it (ensures it's correct)
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Step 4: Delete only old plans that don't have foreign key references
-- Don't delete atelier/studio/maison as they may be referenced by subscription_addons
DELETE FROM subscription_plans WHERE slug IN ('free', 'premium', 'enterprise');

-- Step 5: Insert Madison Studio tiers with correct pricing
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, sort_order, is_active) VALUES
  (
    'Atelier',
    'atelier',
    'Your Personal Creative Director',
    4900, -- $49.00/month
    47000, -- $470.00/year
    '["50 master content pieces/month", "200 derivative assets/month", "25 AI-generated images/month", "1 brand, 25 products", "Brand knowledge training", "Madison AI assistant (500 queries/month)", "Content library & calendar", "Email support (48hr response)"]'::jsonb,
    1,
    true
  ),
  (
    'Studio',
    'studio',
    'Scale Your Brand Voice',
    19900, -- $199.00/month
    199000, -- $1,990.00/year
    '["Unlimited master content", "1,000 derivatives/month", "100 AI images/month", "3 brands, 100 products each", "5 team members with roles", "Shopify & Etsy integration", "Priority support (24hr) + monthly strategy call", "White-label add-on available"]'::jsonb,
    2,
    true
  ),
  (
    'Maison',
    'maison',
    'Your Brand Operating System',
    59900, -- $599.00/month
    599000, -- $5,990.00/year
    '["Unlimited everything (content, derivatives, brands)", "500 AI images/month", "Unlimited team members", "API access for custom integrations", "Full white-label included (zero attribution)", "Dedicated account manager", "Quarterly business reviews", "2-hour concierge onboarding", "Phone & Slack support (4hr response)"]'::jsonb,
    3,
    true
  )
ON CONFLICT (slug) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Step 6: Update Stripe Price IDs
-- These are your actual Stripe Price IDs from RUN_THIS_NOW.sql
UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQKzID9l7wPFqooVHalDG2R'
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQLepD9l7wPFqooLEeJ92JN'
WHERE slug = 'atelier';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLg8D9l7wPFqoodEyzyrE8'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQLgjD9l7wPFqooCaYOejpK'
WHERE slug = 'studio';

UPDATE subscription_plans 
SET stripe_price_id_monthly = 'price_1SQLiKD9l7wPFqooNhmlAOB7'
WHERE slug = 'maison';

UPDATE subscription_plans 
SET stripe_price_id_yearly = 'price_1SQLigD9l7wPFqooiVrldrhF'
WHERE slug = 'maison';

-- Step 7: Verify the setup
SELECT 
  '✅ Verification Results' as status,
  COUNT(*) as total_plans,
  COUNT(*) FILTER (WHERE is_active = true) as active_plans,
  COUNT(*) FILTER (WHERE stripe_price_id_monthly IS NOT NULL) as plans_with_stripe_monthly,
  COUNT(*) FILTER (WHERE stripe_price_id_yearly IS NOT NULL) as plans_with_stripe_yearly
FROM subscription_plans;

-- Step 8: Show all plans
SELECT 
  name,
  slug,
  price_monthly / 100.0 as monthly_price_usd,
  price_yearly / 100.0 as yearly_price_usd,
  is_active,
  sort_order,
  stripe_price_id_monthly IS NOT NULL as has_monthly_price_id,
  stripe_price_id_yearly IS NOT NULL as has_yearly_price_id
FROM subscription_plans 
ORDER BY sort_order;

