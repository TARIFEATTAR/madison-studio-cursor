-- Fix Orphaned Subscriptions After Pricing Migration
-- This migration handles subscriptions that reference old plan IDs that no longer exist

-- Check for subscriptions with missing plan references
-- If a subscription references a plan that doesn't exist, we have a few options:

-- Option 1: Set orphaned subscriptions to inactive/expired
-- This is safest if you don't have a mapping strategy

-- Option 2: Map old plans to new plans (if you want to migrate users)
-- Premium ($99) -> Studio ($199) - closest tier
-- Enterprise ($299) -> Maison ($599) - closest tier
-- Free ($0) -> Atelier ($49) - closest tier

-- For now, we'll mark subscriptions with missing plans as needing attention
-- You can manually assign them to a new tier

-- First, let's see what subscriptions are orphaned:
SELECT 
  s.id,
  s.organization_id,
  s.plan_id,
  s.status,
  s.stripe_subscription_id,
  sp.name as plan_name,
  sp.slug as plan_slug
FROM subscriptions s
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE sp.id IS NULL;

-- If you want to auto-map old Premium subscriptions to Studio:
-- Update subscriptions that reference non-existent plans
-- Uncomment the lines below and run if you want to auto-migrate:

/*
-- Map old "Premium" plan subscriptions to "Studio" (closest tier)
UPDATE subscriptions
SET plan_id = (
  SELECT id FROM subscription_plans WHERE slug = 'studio' LIMIT 1
)
WHERE plan_id NOT IN (SELECT id FROM subscription_plans)
AND EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'studio');
*/

-- For safety, we'll leave the manual assignment for now
-- You can manually fix subscriptions via Supabase Dashboard or assign them programmatically




