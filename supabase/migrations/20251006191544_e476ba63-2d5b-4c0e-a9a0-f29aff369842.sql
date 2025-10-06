-- Fix RLS policy to allow users to see their newly created organization
-- Drop the existing policy first
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

-- Create updated policy that allows users to view organizations they created OR are members of
CREATE POLICY "Users can view their organizations" 
ON public.organizations 
FOR SELECT 
USING (is_organization_member(auth.uid(), id) OR created_by = auth.uid());