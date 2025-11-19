-- Quick Stripe Payment System Status Check
-- Run this in Supabase SQL Editor to verify everything is configured

-- 1. Check subscription plans exist and have Price IDs
SELECT 
  name,
  slug,
  price_monthly,
  price_yearly,
  CASE 
    WHEN stripe_price_id_monthly IS NOT NULL THEN '✅' 
    ELSE '❌ MISSING' 
  END as monthly_price_id,
  CASE 
    WHEN stripe_price_id_yearly IS NOT NULL THEN '✅' 
    ELSE '❌ MISSING' 
  END as yearly_price_id,
  is_active,
  sort_order
FROM subscription_plans 
ORDER BY sort_order;

-- 2. Check if any subscriptions exist
SELECT 
  COUNT(*) as total_subscriptions,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
  COUNT(CASE WHEN status = 'trialing' THEN 1 END) as trialing_subscriptions,
  COUNT(CASE WHEN status = 'canceled' THEN 1 END) as canceled_subscriptions
FROM subscriptions;

-- 3. Check recent subscriptions (if any)
SELECT 
  s.id,
  s.status,
  s.stripe_subscription_id,
  s.current_period_start,
  s.current_period_end,
  sp.name as plan_name,
  sp.slug as plan_slug,
  o.name as organization_name
FROM subscriptions s
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
LEFT JOIN organizations o ON s.organization_id = o.id
ORDER BY s.created_at DESC
LIMIT 5;

-- 4. Check payment methods (if any)
SELECT 
  COUNT(*) as total_payment_methods,
  COUNT(CASE WHEN is_default = true THEN 1 END) as default_payment_methods
FROM payment_methods;

-- 5. Check invoices (if any)
SELECT 
  COUNT(*) as total_invoices,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_invoices,
  SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) / 100.0 as total_revenue_usd
FROM invoices;

-- 6. Verify database tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('subscription_plans', 'subscriptions', 'payment_methods', 'invoices') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscription_plans', 'subscriptions', 'payment_methods', 'invoices')
ORDER BY table_name;










