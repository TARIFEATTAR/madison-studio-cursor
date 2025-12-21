-- ═══════════════════════════════════════════════════════════════════════════════
-- SIMPLE FIX: Allow viewing profiles of team members
-- RUN THIS IN SUPABASE SQL EDITOR
-- ═══════════════════════════════════════════════════════════════════════════════

-- Step 1: Fix any profiles missing email/name
UPDATE public.profiles p
SET 
  email = COALESCE(p.email, u.email),
  full_name = COALESCE(p.full_name, SPLIT_PART(u.email, '@', 1))
FROM auth.users u
WHERE p.id = u.id AND p.email IS NULL;

-- Step 2: Insert any completely missing profiles
INSERT INTO public.profiles (id, email, full_name)
SELECT u.id, u.email, COALESCE(u.raw_user_meta_data->>'full_name', SPLIT_PART(u.email, '@', 1))
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- Step 3: Drop old profile policies
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_org" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Step 4: Create simple policies that work
-- Everyone can view their own profile
CREATE POLICY "profiles_view_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- Users can view profiles of people in the same organization
CREATE POLICY "profiles_view_org_members" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT om2.user_id 
      FROM public.organization_members om1
      JOIN public.organization_members om2 ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Step 5: Fix invitation delete policy
DROP POLICY IF EXISTS "team_invitations_delete" ON public.team_invitations;
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

-- Show what we have now
SELECT 'Profiles fixed:' as status, COUNT(*) as total FROM public.profiles WHERE email IS NOT NULL;
