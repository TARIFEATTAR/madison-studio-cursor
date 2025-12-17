-- ============================================
-- Fix: Allow organization members to upload brand documents
-- Date: 2025-12-17
-- Issue: RLS blocking document uploads for valid users
-- ============================================

-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Admins and owners can upload brand documents" ON public.brand_documents;

-- Create a more permissive policy that allows all org members to upload
CREATE POLICY "Members can upload brand documents"
ON public.brand_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = brand_documents.organization_id
    AND om.user_id = auth.uid()
    -- Any member of the organization can upload documents
  )
);

-- Also update the other policies to be more permissive
DROP POLICY IF EXISTS "Admins and owners can view brand documents" ON public.brand_documents;
DROP POLICY IF EXISTS "Admins and owners can update brand documents" ON public.brand_documents;
DROP POLICY IF EXISTS "Admins and owners can delete brand documents" ON public.brand_documents;

-- Members can view their org's documents
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

-- Members can update their org's documents
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

-- Only admins and owners can delete (keep this restrictive)
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
