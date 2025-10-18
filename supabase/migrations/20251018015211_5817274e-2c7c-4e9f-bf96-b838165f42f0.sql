-- Add performance indexes to speed up team member queries
CREATE INDEX IF NOT EXISTS idx_organization_members_user_org 
ON public.organization_members(user_id, organization_id);

CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON public.profiles(id);