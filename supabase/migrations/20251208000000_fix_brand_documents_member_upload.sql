-- Fix brand_documents RLS to allow ALL organization members to upload documents
-- Previously only owner/admin roles could INSERT, causing upload failures for regular members
-- Issue: medicineevolution@gmail.com and other member-role users couldn't upload documents

-- ============================================================================
-- PROBLEM:
-- Storage bucket allows any authenticated user to upload files
-- BUT brand_documents table only allowed owner/admin to INSERT records
-- Result: File uploads succeeded, but database insert failed for 'member' role
-- ============================================================================

-- Drop the restrictive INSERT policy (owner/admin only)
DROP POLICY IF EXISTS "Admins and owners can upload brand documents" ON public.brand_documents;

-- Drop the restrictive SELECT policy (owner/admin only)
DROP POLICY IF EXISTS "Admins and owners can view brand documents" ON public.brand_documents;

-- Create new INSERT policy: Allow ALL organization members to upload documents
CREATE POLICY "Organization members can upload brand documents"
ON public.brand_documents FOR INSERT TO authenticated
WITH CHECK (is_organization_member(auth.uid(), organization_id));

-- Create new SELECT policy: Allow ALL organization members to view documents
-- (Members need to see brand guidelines and uploaded documents)
CREATE POLICY "Organization members can view brand documents"
ON public.brand_documents FOR SELECT TO authenticated
USING (is_organization_member(auth.uid(), organization_id));

-- NOTE: UPDATE and DELETE policies remain restricted to owners/admins
-- This prevents accidental modifications while allowing uploads
-- Existing policies for UPDATE/DELETE:
--   "Admins and owners can update brand documents"
--   "Admins and owners can delete brand documents"
