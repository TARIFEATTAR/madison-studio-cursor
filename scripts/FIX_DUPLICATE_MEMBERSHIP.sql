-- FIX DUPLICATE ORGANIZATION MEMBERSHIP
-- The error shows your user has 2 organization_members records, which breaks the query

-- Step 1: Find your duplicate records
SELECT
  om.id,
  om.user_id,
  om.organization_id,
  om.role,
  om.team_role,
  om.created_at,
  u.email,
  o.name as org_name
FROM organization_members om
LEFT JOIN auth.users u ON u.id = om.user_id
LEFT JOIN organizations o ON o.id = om.organization_id
WHERE u.email LIKE '%jordan%' OR u.email LIKE '%tarife%' OR u.email LIKE '%tarif%'
ORDER BY om.created_at;

-- Step 2: After identifying duplicates, keep the one with 'owner' role and delete the other
-- UNCOMMENT AND RUN THIS AFTER STEP 1 (replace the ID with the duplicate record's ID):

-- DELETE FROM organization_members
-- WHERE id = 'PUT_DUPLICATE_RECORD_ID_HERE';

-- Step 3: Ensure the remaining record has 'owner' role
-- UPDATE organization_members
-- SET role = 'owner'
-- WHERE user_id = (SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE' LIMIT 1);

-- Step 4: Verify the fix
SELECT
  om.id,
  om.user_id,
  om.organization_id,
  om.role,
  om.team_role,
  u.email
FROM organization_members om
LEFT JOIN auth.users u ON u.id = om.user_id
WHERE u.email LIKE '%jordan%' OR u.email LIKE '%tarife%';
