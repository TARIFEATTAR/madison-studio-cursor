-- ═══════════════════════════════════════════════════════════════════════════════
-- MASTER FIX: Team Invitations & Security Policies
-- Run this ENTIRE script in the Supabase SQL Editor to fix:
-- 1. Deleting invitations
-- 2. Accepting invitations
-- 3. Viewing team profiles
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. DROP EVERYTHING related to invitations to start clean
DROP POLICY IF EXISTS "Owners and admins can view their org invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners and admins can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Org members can view invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners and admins can delete invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_select" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_insert" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_delete" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_update" ON public.team_invitations;

-- Ensure RLS is enabled
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- 2. RECREATE POLICIES (Correctly)

-- VIEW: Managers can see all invites for their org
CREATE POLICY "team_invitations_select" ON public.team_invitations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = team_invitations.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- CREATE: Managers can create invites
CREATE POLICY "team_invitations_insert" ON public.team_invitations
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = team_invitations.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- DELETE: Managers can DELETE invites (This fixes the "Delete not working" issue)
CREATE POLICY "team_invitations_delete" ON public.team_invitations
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = team_invitations.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- UPDATE: Managers can update (e.g. for retries, though mostly system handles this)
CREATE POLICY "team_invitations_update" ON public.team_invitations
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = team_invitations.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );


-- 3. FIX TEAM PROFILES FUNCTION (Fixes the 400 Error)
DROP FUNCTION IF EXISTS public.get_team_member_profiles(UUID);

CREATE OR REPLACE FUNCTION public.get_team_member_profiles(_org_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security check
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User is not a member of this organization';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name
  FROM public.profiles p
  INNER JOIN public.organization_members om ON om.user_id = p.id
  WHERE om.organization_id = _org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_team_member_profiles(UUID) TO authenticated;


-- 4. FIX INVITATION ACCEPTANCE FUNCTION (Fixes "Status still pending")
DROP FUNCTION IF EXISTS public.accept_pending_invitations_for_user(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.accept_pending_invitations_for_user(_user_id UUID, _user_email TEXT)
RETURNS TABLE (
  invitation_id UUID,
  organization_id UUID,
  role TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Loop through all matching pending invitations
  FOR invitation_record IN
    SELECT ti.id, ti.organization_id, ti.role::TEXT
    FROM public.team_invitations ti
    WHERE LOWER(ti.email) = LOWER(_user_email)
      AND ti.accepted_at IS NULL
  LOOP
    -- 1. Add user to organization
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (invitation_record.organization_id, _user_id, invitation_record.role::organization_role)
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    -- 2. Mark invitation as accepted
    UPDATE public.team_invitations
    SET accepted_at = NOW()
    WHERE id = invitation_record.id;
    
    -- 3. Return result
    invitation_id := invitation_record.id;
    organization_id := invitation_record.organization_id;
    role := invitation_record.role;
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_pending_invitations_for_user(UUID, TEXT) TO authenticated;

SELECT 'SUCCESS: All team invitation policies and functions have been applied.' as status;
