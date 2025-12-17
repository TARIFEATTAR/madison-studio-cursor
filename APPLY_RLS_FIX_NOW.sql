-- ============================================
-- QUICK FIX: Apply RLS Changes Directly
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop the overly restrictive policies
DROP POLICY IF EXISTS "Admins and owners can upload brand documents" ON public.brand_documents;
DROP POLICY IF EXISTS "Admins and owners can view brand documents" ON public.brand_documents;
DROP POLICY IF EXISTS "Admins and owners can update brand documents" ON public.brand_documents;
DROP POLICY IF EXISTS "Admins and owners can delete brand documents" ON public.brand_documents;

-- Create more permissive policies (allow all org members)
CREATE POLICY "Members can upload brand documents"
ON public.brand_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = brand_documents.organization_id
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Members can view brand documents"
ON public.brand_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = brand_documents.organization_id
    AND om.user_id = auth.uid()
  )
);

CREATE POLICY "Members can update brand documents"
ON public.brand_documents
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = brand_documents.organization_id
    AND om.user_id = auth.uid()
  )
);

-- Keep delete restrictive (only owners/admins)
CREATE POLICY "Admins and owners can delete brand documents"
ON public.brand_documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = brand_documents.organization_id
    AND om.user_id = auth.uid()
    AND om.role IN ('owner', 'admin')
  )
);

-- Verify the policies were created
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'brand_documents'
ORDER BY policyname;
