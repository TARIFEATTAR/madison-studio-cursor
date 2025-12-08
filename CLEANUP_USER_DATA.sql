-- Cleanup script for jordan@tarifatar.com
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new

-- Step 1: Find the user ID for jordan@tarifatar.com
-- Run this first to see what exists:
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'jordan@tarifeattar.com';

-- Step 2: Find organizations associated with this user
-- Replace USER_ID_HERE with the ID from Step 1
SELECT 
  o.id as org_id,
  o.name,
  o.brand_config,
  o.created_at,
  o.created_by
FROM organizations o
WHERE o.created_by = 'USER_ID_HERE';

-- Step 3: Check organization memberships
SELECT 
  om.organization_id,
  om.user_id,
  om.created_at
FROM organization_members om
WHERE om.user_id = 'USER_ID_HERE';

-- Step 4: CLEAN UP (only run after reviewing Steps 1-3)
-- This will delete ALL data for jordan@tarifatar.com

-- Delete brand documents
DELETE FROM brand_documents
WHERE organization_id IN (
  SELECT id FROM organizations WHERE created_by = 'USER_ID_HERE'
);

-- Delete brand knowledge
DELETE FROM brand_knowledge
WHERE organization_id IN (
  SELECT id FROM organizations WHERE created_by = 'USER_ID_HERE'
);

-- Delete brand collections
DELETE FROM brand_collections
WHERE organization_id IN (
  SELECT id FROM organizations WHERE created_by = 'USER_ID_HERE'
);

-- Delete subscriptions
DELETE FROM subscriptions
WHERE organization_id IN (
  SELECT id FROM organizations WHERE created_by = 'USER_ID_HERE'
);

-- Delete organization memberships
DELETE FROM organization_members
WHERE user_id = 'USER_ID_HERE';

-- Delete organizations
DELETE FROM organizations
WHERE created_by = 'USER_ID_HERE';

-- Update profile to clear any cached data
UPDATE profiles
SET 
  full_name = NULL,
  updated_at = now()
WHERE id = 'USER_ID_HERE';

-- Optional: Delete the user entirely (be careful!)
-- DELETE FROM auth.users WHERE id = 'USER_ID_HERE';






