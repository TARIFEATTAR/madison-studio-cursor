-- Update Madison Studio Pricing Tiers
-- Replaces Free/Premium/Enterprise with Atelier/Studio/Maison
-- Updates pricing according to v2.0 specification

-- First, remove old plans
DELETE FROM subscription_plans WHERE slug IN ('free', 'premium', 'enterprise');

-- Insert new Madison Studio tiers
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, sort_order) VALUES
  (
    'Atelier',
    'atelier',
    'Your Personal Creative Director',
    4900, -- $49.00/month
    47000, -- $470.00/year (save $118)
    '["50 master content pieces/month", "200 derivative assets/month", "25 AI-generated images/month", "1 brand, 25 products", "Brand knowledge training", "Madison AI assistant (500 queries/month)", "Content library & calendar", "Email support (48hr response)"]'::jsonb,
    1
  ),
  (
    'Studio',
    'studio',
    'Scale Your Brand Voice',
    19900, -- $199.00/month (increased from $149)
    199000, -- $1,990.00/year (increased from $1,490, save $398)
    '["Unlimited master content", "1,000 derivatives/month", "100 AI images/month", "3 brands, 100 products each", "5 team members with roles", "Shopify & Etsy integration", "Priority support (24hr) + monthly strategy call", "White-label add-on available"]'::jsonb,
    2
  ),
  (
    'Maison',
    'maison',
    'Your Brand Operating System',
    59900, -- $599.00/month (increased from $399)
    599000, -- $5,990.00/year (increased from $3,990, save $1,198)
    '["Unlimited everything (content, derivatives, brands)", "500 AI images/month", "Unlimited team members", "API access for custom integrations", "Full white-label included (zero attribution)", "Dedicated account manager", "Quarterly business reviews", "2-hour concierge onboarding", "Phone & Slack support (4hr response)"]'::jsonb,
    3
  )
ON CONFLICT (slug) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Add a table for subscription add-ons (optional enhancement)
-- This allows tracking add-on subscriptions separately
CREATE TABLE IF NOT EXISTS subscription_addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL, -- in cents
  stripe_price_id_monthly TEXT,
  required_tier_slug TEXT REFERENCES subscription_plans(slug),
  features JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE subscription_addons IS 'Additional subscription products (white-label, extra credits, etc.)';

-- Insert add-on products (these will need Stripe Price IDs)
INSERT INTO subscription_addons (name, slug, description, price_monthly, required_tier_slug, features, sort_order) VALUES
  (
    'White-Label Branding',
    'whitelabel',
    'Full platform rebranding with custom logo, colors, domain, and email white-labeling',
    19900, -- $199.00/month (increased from $100)
    'studio',
    '["Custom logo replacement", "Brand color customization", "Custom domain (CNAME)", "Platform name change", "Email white-labeling", "Custom onboarding messages", "Small attribution badge"]'::jsonb,
    1
  ),
  (
    'Extra Image Credits - 50 Pack',
    'images_50',
    'Additional 50 AI-generated images per month',
    2500, -- $25.00/month
    NULL, -- Available for all tiers
    '["50 additional image credits"]'::jsonb,
    2
  ),
  (
    'Extra Image Credits - 100 Pack',
    'images_100',
    'Additional 100 AI-generated images per month',
    4500, -- $45.00/month
    NULL,
    '["100 additional image credits"]'::jsonb,
    3
  ),
  (
    'Extra Image Credits - 500 Pack',
    'images_500',
    'Additional 500 AI-generated images per month',
    17500, -- $175.00/month
    NULL,
    '["500 additional image credits"]'::jsonb,
    4
  ),
  (
    'Additional Brand Slot',
    'brand_slot',
    'Add 1 additional brand/organization (for Studio tier)',
    5000, -- $50.00/month
    'studio',
    '["1 additional brand/organization"]'::jsonb,
    5
  ),
  (
    'Additional Team Members (5-pack)',
    'team_5pack',
    'Add 5 additional team member seats (for Studio tier)',
    5000, -- $50.00/month
    'studio',
    '["5 additional team member seats"]'::jsonb,
    6
  )
ON CONFLICT (slug) 
DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_monthly = EXCLUDED.price_monthly,
  required_tier_slug = EXCLUDED.required_tier_slug,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Enable RLS on addons table
ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription addons"
  ON subscription_addons FOR SELECT
  USING (is_active = true);

-- Add trigger for updated_at on addons
CREATE TRIGGER update_subscription_addons_updated_at
  BEFORE UPDATE ON subscription_addons
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_plans_updated_at();

