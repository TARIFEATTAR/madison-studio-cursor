-- Quick verification and fix for billing setup
-- Run this in Supabase SQL Editor

-- 1. Check if subscription_plans table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'subscription_plans'
) as table_exists;

-- 2. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'subscription_plans';

-- 3. Check RLS policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'subscription_plans';

-- 4. Check if plans exist and are active
SELECT id, name, slug, is_active, sort_order, 
       stripe_price_id_monthly, stripe_price_id_yearly
FROM subscription_plans 
ORDER BY sort_order;

-- 5. If table doesn't exist or is missing data, run this:
-- (Uncomment if needed)

/*
-- Ensure table exists
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

-- Ensure policy exists
DROP POLICY IF EXISTS "Anyone can view active subscription plans" ON subscription_plans;
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Insert plans if they don't exist
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, sort_order) VALUES
  ('Atelier', 'atelier', 'Perfect for getting started', 0, NULL, '["10 content generations per month", "Basic templates", "Community support"]'::jsonb, 1),
  ('Studio', 'studio', 'For serious content creators', 9900, 99000, '["Unlimited content generations", "All templates", "Priority support", "Brand customization", "Advanced analytics"]'::jsonb, 2),
  ('Maison', 'maison', 'For teams and agencies', 29900, 299000, '["Everything in Studio", "Team collaboration", "Custom integrations", "Dedicated support", "White-label options", "API access"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;
*/

