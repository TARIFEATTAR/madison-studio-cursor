-- Drop the existing problematic policy that causes circular dependency
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON public.profiles;

-- Create a simpler, more efficient policy without circular dependency
CREATE POLICY "Users can view profiles in their organization"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT om.user_id
    FROM organization_members om
    WHERE om.organization_id IN (
      SELECT organization_id
      FROM organization_members
      WHERE user_id = auth.uid()
    )
  )
);