-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX: Team Invitations - Add DELETE policy and improve acceptance flow
-- ═══════════════════════════════════════════════════════════════════════════════

-- DROP existing policies to recreate them properly
DROP POLICY IF EXISTS "Owners and admins can view their org invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners and admins can create invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Org members can view invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "Owners and admins can delete invitations" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_select" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_insert" ON public.team_invitations;
DROP POLICY IF EXISTS "team_invitations_delete" ON public.team_invitations;

-- ═══════════════════════════════════════════════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════════════════════════════════════════════

-- SELECT: Organization members can view invitations for their org
CREATE POLICY "team_invitations_select" ON public.team_invitations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = team_invitations.organization_id
      AND om.user_id = auth.uid()
    )
  );

-- INSERT: Only owners and admins can create invitations
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

-- DELETE: Only owners and admins can delete/cancel invitations
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

-- UPDATE: Allow the system (via trigger) and admins to update invitations
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
-- FIX: Function to check invitations on login (not just signup)
-- This function should be called when a user logs in to accept pending invitations
-- ═══════════════════════════════════════════════════════════════════════════════

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
  -- Find all pending invitations for this user's email
  FOR invitation_record IN
    SELECT ti.id, ti.organization_id, ti.role::TEXT
    FROM public.team_invitations ti
    WHERE LOWER(ti.email) = LOWER(_user_email)
      AND ti.accepted_at IS NULL
      AND ti.expires_at > NOW()
  LOOP
    -- Add user to organization (ignore if already a member)
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (invitation_record.organization_id, _user_id, invitation_record.role::organization_role)
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    -- Mark invitation as accepted
    UPDATE public.team_invitations
    SET accepted_at = NOW()
    WHERE id = invitation_record.id;
    
    -- Return the processed invitation
    invitation_id := invitation_record.id;
    organization_id := invitation_record.organization_id;
    role := invitation_record.role;
    RETURN NEXT;
  END LOOP;
  
  RETURN;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.accept_pending_invitations_for_user(UUID, TEXT) TO authenticated;

-- Success message
SELECT 'Team invitations RLS policies and functions updated successfully!' as result;
