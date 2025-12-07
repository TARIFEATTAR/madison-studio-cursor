-- ═══════════════════════════════════════════════════════════════════════════
-- FIX ORGANIZATION MEMBERSHIP
-- Run this in Supabase SQL Editor to diagnose and fix organization issues
-- https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/sql/new
-- ═══════════════════════════════════════════════════════════════════════════

-- STEP 1: Find your user (replace email with yours)
-- ─────────────────────────────────────────────────────────────────────────────
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
WHERE email ILIKE '%jordan%' -- Update with your email
ORDER BY created_at DESC
LIMIT 5;

-- STEP 2: Check for organizations created by this user
-- ─────────────────────────────────────────────────────────────────────────────
-- Replace 'YOUR_USER_ID' with the ID from Step 1
SELECT 
  id as org_id,
  name,
  created_at,
  created_by,
  subscription_tier
FROM organizations
WHERE created_by = 'YOUR_USER_ID';

-- STEP 3: Check for organization memberships
-- ─────────────────────────────────────────────────────────────────────────────
-- Replace 'YOUR_USER_ID' with the ID from Step 1
SELECT 
  om.organization_id,
  om.user_id,
  o.name as org_name,
  om.created_at as membership_created
FROM organization_members om
LEFT JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = 'YOUR_USER_ID';

-- ═══════════════════════════════════════════════════════════════════════════
-- FIX: If you have an organization but NO membership, run this:
-- ═══════════════════════════════════════════════════════════════════════════

-- Replace 'YOUR_USER_ID' and 'YOUR_ORG_ID' with actual values from above
/*
INSERT INTO organization_members (organization_id, user_id)
VALUES ('YOUR_ORG_ID', 'YOUR_USER_ID')
ON CONFLICT (organization_id, user_id) DO NOTHING;
*/

-- ═══════════════════════════════════════════════════════════════════════════
-- QUICK FIX: Auto-create membership from organizations table
-- This finds orgs you created but aren't a member of, and fixes it
-- ═══════════════════════════════════════════════════════════════════════════

-- Replace 'YOUR_USER_ID' with your actual user ID
/*
INSERT INTO organization_members (organization_id, user_id)
SELECT o.id, o.created_by
FROM organizations o
WHERE o.created_by = 'YOUR_USER_ID'
  AND NOT EXISTS (
    SELECT 1 FROM organization_members om 
    WHERE om.organization_id = o.id AND om.user_id = o.created_by
  )
ON CONFLICT (organization_id, user_id) DO NOTHING;
*/

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFY: After running the fix, check again
-- ═══════════════════════════════════════════════════════════════════════════

-- Replace 'YOUR_USER_ID' with your actual user ID
/*
SELECT 
  om.organization_id,
  o.name as org_name,
  o.subscription_tier,
  'MEMBERSHIP EXISTS ✅' as status
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = 'YOUR_USER_ID';
*/
