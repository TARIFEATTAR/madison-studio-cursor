-- Fix: Create subscription_plans table if it doesn't exist
-- Run this in Supabase SQL Editor

-- Check if table exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscription_plans') THEN
    -- Create subscription_plans table
    CREATE TABLE subscription_plans (
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

    COMMENT ON TABLE subscription_plans IS 'Available subscription plans with pricing and features';
    
    -- Enable RLS
    ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policy for public read
    CREATE POLICY "Anyone can view active subscription plans"
      ON subscription_plans FOR SELECT
      USING (is_active = true);
    
    -- Insert Madison Studio tiers
    INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, sort_order) VALUES
      (
        'Atelier',
        'atelier',
        'Your Personal Creative Director',
        4900,
        47000,
        '["50 master content pieces/month", "200 derivative assets/month", "25 AI-generated images/month", "1 brand, 25 products", "Brand knowledge training", "Madison AI assistant (500 queries/month)", "Content library & calendar", "Email support (48hr response)"]'::jsonb,
        1
      ),
      (
        'Studio',
        'studio',
        'Scale Your Brand Voice',
        19900,
        199000,
        '["Unlimited master content", "1,000 derivatives/month", "100 AI images/month", "3 brands, 100 products each", "5 team members with roles", "Shopify & Etsy integration", "Priority support (24hr) + monthly strategy call", "White-label add-on available"]'::jsonb,
        2
      ),
      (
        'Maison',
        'maison',
        'Your Brand Operating System',
        59900,
        599000,
        '["Unlimited everything (content, derivatives, brands)", "500 AI images/month", "Unlimited team members", "API access for custom integrations", "Full white-label included (zero attribution)", "Dedicated account manager", "Quarterly business reviews", "2-hour concierge onboarding", "Phone & Slack support (4hr response)"]'::jsonb,
        3
      );
    
    RAISE NOTICE 'subscription_plans table created and populated';
  ELSE
    RAISE NOTICE 'subscription_plans table already exists';
  END IF;
END $$;

-- Update Price IDs (use your actual Stripe Price IDs)
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

-- Verify
SELECT name, slug, stripe_price_id_monthly, stripe_price_id_yearly 
FROM subscription_plans 
ORDER BY sort_order;










