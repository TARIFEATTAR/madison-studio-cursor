-- ============================================
-- FIX: Brand Document Upload RLS Issue
-- ============================================
-- Problem: User getting RLS error when uploading documents
-- Cause: User might not have 'owner' or 'admin' role

-- STEP 1: Check your current role
-- Run this first to see what role you have
SELECT 
  om.user_id,
  om.organization_id,
  om.role,
  o.name as org_name,
  u.email
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
JOIN auth.users u ON u.id = om.user_id
WHERE u.email = 'jordan@asala.ai';  -- Replace with your email

-- STEP 2: If role is NOT 'owner' or 'admin', fix it
-- Update your role to 'owner'
UPDATE organization_members
SET role = 'owner'
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'jordan@asala.ai')
AND organization_id = '6efb188c-a5c9-4047-b77a-4267b04';  -- Your org ID

-- STEP 3: Verify the fix
SELECT 
  om.role,
  o.name as org_name
FROM organization_members om
JOIN organizations o ON o.id = om.organization_id
WHERE om.user_id = (SELECT id FROM auth.users WHERE email = 'jordan@asala.ai');

-- ============================================
-- ALTERNATIVE: Temporarily Allow All Members
-- (Use this if you want all team members to upload docs)
-- ============================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Admins and owners can upload brand documents" ON public.brand_documents;

-- Create a more permissive policy
CREATE POLICY "Members can upload brand documents"
ON public.brand_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = brand_documents.organization_id
    AND om.user_id = auth.uid()
    -- No role restriction - any member can upload
  )
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'brand_documents'
ORDER BY policyname;

-- Test if you can insert (dry run)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = '6efb188c-a5c9-4047-b77a-4267b04'
      AND om.user_id = (SELECT id FROM auth.users WHERE email = 'jordan@asala.ai')
      AND om.role IN ('owner', 'admin')
    ) THEN 'You CAN upload documents ✅'
    ELSE 'You CANNOT upload documents ❌ - Need owner/admin role'
  END as upload_permission;
