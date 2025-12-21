-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE FIX: Team Member System
-- RUN THIS ENTIRE SCRIPT IN SUPABASE SQL EDITOR
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 1: Fix profiles table - ensure all users have email populated
-- ═══════════════════════════════════════════════════════════════════════════════

-- Update any profiles that are missing email from auth.users
UPDATE public.profiles p
SET 
  email = COALESCE(p.email, u.email),
  full_name = COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1))
FROM auth.users u
WHERE p.id = u.id
AND (p.email IS NULL OR p.full_name IS NULL);

-- Insert any missing profiles
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: Fix RLS on profiles - allow viewing profiles in same org
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create proper policies
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_org" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid()
      AND om2.user_id = profiles.id
    )
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Create/Fix the get_team_member_profiles function
-- ═══════════════════════════════════════════════════════════════════════════════

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
  -- Verify the requesting user is a member of the organization
  IF NOT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = _org_id
    AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User is not a member of this organization';
  END IF;

  -- Return profiles of all members in the organization
  RETURN QUERY
  SELECT 
    p.id AS user_id,
    COALESCE(p.email, u.email) AS email,
    COALESCE(p.full_name, u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1)) AS full_name
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  INNER JOIN public.organization_members om ON om.user_id = p.id
  WHERE om.organization_id = _org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_team_member_profiles(UUID) TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 4: Fix team_invitations RLS policies
-- ═══════════════════════════════════════════════════════════════════════════════

DROP POLICY IF EXISTS "Owners and admins can view their org invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners and admins can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_select" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_insert" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_delete" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_update" ON public.team_invitations;

ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Admins/Owners can view all invitations for their org
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

-- Admins/Owners can create invitations
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

-- Admins/Owners can delete invitations
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

-- Admins/Owners can update invitations
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 5: Create accept_pending_invitations function
-- ═══════════════════════════════════════════════════════════════════════════════

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

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 6: Verify everything works
-- ═══════════════════════════════════════════════════════════════════════════════

-- Show count of profiles with data
SELECT 
  COUNT(*) as total_profiles,
  COUNT(email) as with_email,
  COUNT(full_name) as with_name
FROM public.profiles;

SELECT 'SUCCESS: All fixes applied!' as status;
