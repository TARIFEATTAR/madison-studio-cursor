-- Fix Orphaned Subscription
-- Your subscription is pointing to the old "Premium" plan that was deleted
-- This will map it to "Studio" (the closest new tier)

-- Step 1: Check what subscriptions are orphaned
SELECT 
  s.id,
  s.organization_id,
  s.plan_id as old_plan_id,
  s.status,
  sp.name as old_plan_name
FROM subscriptions s
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE sp.id IS NULL;

-- Step 2: Update the orphaned subscription to point to Studio (closest to Premium $99)
UPDATE subscriptions
SET plan_id = (
  SELECT id FROM subscription_plans WHERE slug = 'studio' LIMIT 1
)
WHERE plan_id NOT IN (SELECT id FROM subscription_plans)
AND EXISTS (SELECT 1 FROM subscription_plans WHERE slug = 'studio');

-- Step 3: Verify the fix
SELECT 
  s.id,
  s.organization_id,
  sp.name as plan_name,
  sp.slug,
  sp.price_monthly,
  s.status
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id;










