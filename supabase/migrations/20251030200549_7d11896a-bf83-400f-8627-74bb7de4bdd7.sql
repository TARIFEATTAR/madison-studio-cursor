-- ============================================
-- PHASE 1: CRITICAL SECURITY FIXES
-- Fix RLS policies to prevent data exposure
-- ============================================

-- FIX 1: Restrict profiles table to prevent email harvesting
-- Current: Any org member can see all emails in org
-- New: Users can only see their own profile data
-- Impact: Prevents competitors/bad actors from harvesting email lists

-- Drop all existing view policies on profiles
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
  DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- FIX 2: Add RLS to brand_documents table if exists
-- Restrict document access to admins/owners only
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'brand_documents') THEN
    ALTER TABLE public.brand_documents ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Members can view their org's brand documents" ON public.brand_documents;
    DROP POLICY IF EXISTS "Members can upload brand documents" ON public.brand_documents;
    DROP POLICY IF EXISTS "Members can update their org's brand documents" ON public.brand_documents;
    DROP POLICY IF EXISTS "Members can delete brand documents" ON public.brand_documents;
    DROP POLICY IF EXISTS "Admins and owners can view brand documents" ON public.brand_documents;
    DROP POLICY IF EXISTS "Admins and owners can upload brand documents" ON public.brand_documents;
    DROP POLICY IF EXISTS "Admins and owners can update brand documents" ON public.brand_documents;
    DROP POLICY IF EXISTS "Admins and owners can delete brand documents" ON public.brand_documents;
    
    CREATE POLICY "Admins and owners can view brand documents"
    ON public.brand_documents FOR SELECT TO authenticated
    USING (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR has_organization_role(auth.uid(), organization_id, 'admin'::organization_role));
    
    CREATE POLICY "Admins and owners can upload brand documents"
    ON public.brand_documents FOR INSERT TO authenticated
    WITH CHECK (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR has_organization_role(auth.uid(), organization_id, 'admin'::organization_role));
    
    CREATE POLICY "Admins and owners can update brand documents"
    ON public.brand_documents FOR UPDATE TO authenticated
    USING (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR has_organization_role(auth.uid(), organization_id, 'admin'::organization_role));
    
    CREATE POLICY "Admins and owners can delete brand documents"
    ON public.brand_documents FOR DELETE TO authenticated
    USING (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR has_organization_role(auth.uid(), organization_id, 'admin'::organization_role));
  END IF;
END $$;

-- FIX 3: Restrict worksheet_uploads to admins/owners
DROP POLICY IF EXISTS "Users can view their org's worksheets" ON public.worksheet_uploads;
DROP POLICY IF EXISTS "Users can insert worksheets for their org" ON public.worksheet_uploads;
DROP POLICY IF EXISTS "Users can update their org's worksheets" ON public.worksheet_uploads;
DROP POLICY IF EXISTS "Admins and owners can view worksheets" ON public.worksheet_uploads;
DROP POLICY IF EXISTS "Admins and owners can upload worksheets" ON public.worksheet_uploads;
DROP POLICY IF EXISTS "Admins and owners can update worksheets" ON public.worksheet_uploads;

CREATE POLICY "Admins and owners can view worksheets"
ON public.worksheet_uploads FOR SELECT TO authenticated
USING (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR has_organization_role(auth.uid(), organization_id, 'admin'::organization_role));

CREATE POLICY "Admins and owners can upload worksheets"
ON public.worksheet_uploads FOR INSERT TO authenticated
WITH CHECK (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR has_organization_role(auth.uid(), organization_id, 'admin'::organization_role));

CREATE POLICY "Admins and owners can update worksheets"
ON public.worksheet_uploads FOR UPDATE TO authenticated
USING (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR has_organization_role(auth.uid(), organization_id, 'admin'::organization_role));

-- FIX 4: Restrict team_invitations to prevent email harvesting
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_invitations') THEN
    DROP POLICY IF EXISTS "Admins and owners can view invitations" ON public.team_invitations;
    DROP POLICY IF EXISTS "Users can view invitations for their org" ON public.team_invitations;
    DROP POLICY IF EXISTS "Users can view invitations they sent" ON public.team_invitations;
    
    CREATE POLICY "Users can view invitations they sent"
    ON public.team_invitations FOR SELECT TO authenticated
    USING (invited_by = auth.uid() OR has_organization_role(auth.uid(), organization_id, 'owner'::organization_role));
  END IF;
END $$;