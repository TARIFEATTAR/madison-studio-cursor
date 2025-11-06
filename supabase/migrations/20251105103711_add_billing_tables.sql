-- Billing and Subscription System Migration
-- Creates tables for managing subscriptions, plans, payment methods, and invoices

-- 1. Subscription Plans Table
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE, -- e.g., "Free", "Premium", "Enterprise"
  slug TEXT NOT NULL UNIQUE, -- e.g., "free", "premium", "enterprise"
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
  price_yearly INTEGER, -- in cents (optional, NULL if not available)
  features JSONB DEFAULT '{}'::jsonb, -- Array of feature strings
  stripe_price_id_monthly TEXT, -- Stripe Price ID for monthly billing
  stripe_price_id_yearly TEXT, -- Stripe Price ID for yearly billing
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE subscription_plans IS 'Available subscription plans with pricing and features';
COMMENT ON COLUMN subscription_plans.price_monthly IS 'Monthly price in cents (e.g., 9900 = $99.00)';
COMMENT ON COLUMN subscription_plans.price_yearly IS 'Yearly price in cents (NULL if yearly not available)';
COMMENT ON COLUMN subscription_plans.features IS 'JSON array of feature strings';

-- 2. Subscriptions Table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, canceled, past_due, trialing, incomplete, incomplete_expired, unpaid
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id) -- One subscription per organization
);

COMMENT ON TABLE subscriptions IS 'Active and past subscriptions for organizations';
COMMENT ON COLUMN subscriptions.status IS 'Stripe subscription status: active, canceled, past_due, trialing, etc.';

-- 3. Payment Methods Table
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT NOT NULL UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  type TEXT NOT NULL, -- card, bank_account, etc.
  card_brand TEXT, -- visa, mastercard, amex, etc.
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE payment_methods IS 'Payment methods (cards, bank accounts) for organizations';

-- 4. Invoices Table (Billing History)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- paid, open, void, uncollectible, draft
  invoice_pdf_url TEXT,
  hosted_invoice_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE invoices IS 'Billing history - invoices for subscriptions';

-- 5. Add subscription columns to organizations table
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

COMMENT ON COLUMN organizations.subscription_id IS 'Current active subscription';
COMMENT ON COLUMN organizations.trial_ends_at IS 'When the trial period ends (if applicable)';

-- Indexes for performance
CREATE INDEX idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_payment_methods_org ON payment_methods(organization_id);
CREATE INDEX idx_payment_methods_customer ON payment_methods(stripe_customer_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_created ON invoices(created_at DESC);

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their organization's subscription"
  ON subscriptions FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Owners can manage their organization's subscription"
  ON subscriptions FOR ALL
  USING (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role));

-- RLS Policies for payment_methods
CREATE POLICY "Users can view their organization's payment methods"
  ON payment_methods FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

CREATE POLICY "Owners can manage their organization's payment methods"
  ON payment_methods FOR ALL
  USING (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role));

-- RLS Policies for invoices
CREATE POLICY "Users can view their organization's invoices"
  ON invoices FOR SELECT
  USING (is_organization_member(auth.uid(), organization_id));

-- Trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_subscription_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_plans_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_updated_at();

-- Seed default subscription plans
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, features, sort_order) VALUES
  (
    'Free',
    'free',
    'Perfect for getting started',
    0,
    NULL,
    '["10 content generations per month", "Basic templates", "Community support"]'::jsonb,
    1
  ),
  (
    'Premium',
    'premium',
    'For serious content creators',
    9900, -- $99/month
    99000, -- $990/year (save $198)
    '["Unlimited content generations", "All templates", "Priority support", "Brand customization", "Advanced analytics"]'::jsonb,
    2
  ),
  (
    'Enterprise',
    'enterprise',
    'For teams and agencies',
    29900, -- $299/month
    299000, -- $2,990/year (save $598)
    '["Everything in Premium", "Team collaboration", "Custom integrations", "Dedicated support", "White-label options", "API access"]'::jsonb,
    3
  )
ON CONFLICT (slug) DO NOTHING;

