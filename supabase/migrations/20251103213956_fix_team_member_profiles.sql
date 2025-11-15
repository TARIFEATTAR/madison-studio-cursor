-- Fix team member profile fetching with SECURITY DEFINER function
-- This allows fetching profiles of team members in the same organization
-- while maintaining security by verifying organization membership

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
    p.id,
    p.email,
    p.full_name
  FROM public.profiles p
  INNER JOIN public.organization_members om ON om.user_id = p.id
  WHERE om.organization_id = _org_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_team_member_profiles(UUID) TO authenticated;
















