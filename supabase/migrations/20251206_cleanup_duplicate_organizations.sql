-- =====================================================
-- CLEANUP DUPLICATE ORGANIZATIONS
-- This migration ensures each user has only ONE organization
-- =====================================================

-- Step 1: Create a temp table with the FIRST (oldest) org for each user
CREATE TEMP TABLE first_user_orgs AS
SELECT DISTINCT ON (created_by) 
  id as keep_org_id, 
  created_by as user_id,
  name as org_name,
  brand_config
FROM organizations
WHERE created_by IS NOT NULL
ORDER BY created_by, created_at ASC;

-- Step 2: Log what we're about to do
DO $$
DECLARE
  total_orgs INTEGER;
  orgs_to_keep INTEGER;
  orgs_to_delete INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_orgs FROM organizations;
  SELECT COUNT(*) INTO orgs_to_keep FROM first_user_orgs;
  orgs_to_delete := total_orgs - orgs_to_keep;
  
  RAISE NOTICE 'Total organizations: %', total_orgs;
  RAISE NOTICE 'Organizations to keep (one per user): %', orgs_to_keep;
  RAISE NOTICE 'Duplicate organizations to delete: %', orgs_to_delete;
END $$;

-- Step 3: Update organization_members to point to the FIRST org for each user
UPDATE organization_members om
SET organization_id = fo.keep_org_id
FROM first_user_orgs fo
WHERE om.user_id = fo.user_id
AND om.organization_id != fo.keep_org_id;

-- Step 4: Update any empty brand_config in the orgs we're keeping
-- Copy brand_config from the most complete duplicate if the first one is empty
UPDATE organizations o
SET brand_config = (
  SELECT o2.brand_config 
  FROM organizations o2 
  WHERE o2.created_by = o.created_by 
  AND o2.brand_config IS NOT NULL 
  AND o2.brand_config != '{}'::jsonb
  AND jsonb_typeof(o2.brand_config) = 'object'
  AND (o2.brand_config ? 'brandName' OR o2.brand_config ? 'industry')
  ORDER BY o2.created_at DESC
  LIMIT 1
)
WHERE o.id IN (SELECT keep_org_id FROM first_user_orgs)
AND (o.brand_config IS NULL OR o.brand_config = '{}'::jsonb);

-- Step 5: Update the name if it's a generic workspace name and we have a better one
UPDATE organizations o
SET name = (
  SELECT o2.name 
  FROM organizations o2 
  WHERE o2.created_by = o.created_by 
  AND o2.name NOT LIKE '%Workspace'
  AND o2.name IS NOT NULL
  AND LENGTH(o2.name) > 0
  ORDER BY o2.created_at DESC
  LIMIT 1
)
WHERE o.id IN (SELECT keep_org_id FROM first_user_orgs)
AND o.name LIKE '%Workspace';

-- Step 6: Delete related records from duplicate organizations first
-- Delete brand_knowledge from duplicates
DELETE FROM brand_knowledge 
WHERE organization_id NOT IN (SELECT keep_org_id FROM first_user_orgs)
AND organization_id IN (SELECT id FROM organizations WHERE created_by IN (SELECT user_id FROM first_user_orgs));

-- Delete brand_documents from duplicates
DELETE FROM brand_documents 
WHERE organization_id NOT IN (SELECT keep_org_id FROM first_user_orgs)
AND organization_id IN (SELECT id FROM organizations WHERE created_by IN (SELECT user_id FROM first_user_orgs));

-- Delete brand_collections from duplicates
DELETE FROM brand_collections 
WHERE organization_id NOT IN (SELECT keep_org_id FROM first_user_orgs)
AND organization_id IN (SELECT id FROM organizations WHERE created_by IN (SELECT user_id FROM first_user_orgs));

-- Delete subscriptions from duplicates
DELETE FROM subscriptions 
WHERE organization_id NOT IN (SELECT keep_org_id FROM first_user_orgs)
AND organization_id IN (SELECT id FROM organizations WHERE created_by IN (SELECT user_id FROM first_user_orgs));

-- Delete organization_members from duplicates
DELETE FROM organization_members 
WHERE organization_id NOT IN (SELECT keep_org_id FROM first_user_orgs)
AND organization_id IN (SELECT id FROM organizations WHERE created_by IN (SELECT user_id FROM first_user_orgs));

-- Step 7: Finally, delete the duplicate organizations
DELETE FROM organizations 
WHERE id NOT IN (SELECT keep_org_id FROM first_user_orgs)
AND created_by IN (SELECT user_id FROM first_user_orgs);

-- Step 8: Verify the cleanup
DO $$
DECLARE
  remaining_orgs INTEGER;
  users_with_multiple INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_orgs FROM organizations;
  
  SELECT COUNT(*) INTO users_with_multiple
  FROM (
    SELECT created_by, COUNT(*) as cnt 
    FROM organizations 
    WHERE created_by IS NOT NULL
    GROUP BY created_by 
    HAVING COUNT(*) > 1
  ) dupes;
  
  RAISE NOTICE 'Cleanup complete!';
  RAISE NOTICE 'Remaining organizations: %', remaining_orgs;
  RAISE NOTICE 'Users with multiple orgs (should be 0): %', users_with_multiple;
END $$;

-- Drop temp table
DROP TABLE first_user_orgs;






























