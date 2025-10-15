-- Add soft delete columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false;

-- Create trigger to automatically set deleted_at when is_deleted is set to true
CREATE OR REPLACE FUNCTION public.set_organization_deleted_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.is_deleted = true AND OLD.is_deleted = false THEN
    NEW.deleted_at = now();
  ELSIF NEW.is_deleted = false THEN
    NEW.deleted_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_organization_deleted_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW
EXECUTE FUNCTION public.set_organization_deleted_at();

-- Update existing SELECT policy to exclude soft-deleted organizations
DROP POLICY IF EXISTS "Users can view their organizations" ON public.organizations;

CREATE POLICY "Users can view their non-deleted organizations" 
ON public.organizations
FOR SELECT 
USING (
  (is_organization_member(auth.uid(), id) OR (created_by = auth.uid()))
  AND is_deleted = false
);

-- Add soft delete policy (owners can soft delete by updating is_deleted)
CREATE POLICY "Organization owners can soft delete their organization" 
ON public.organizations
FOR UPDATE 
USING (has_organization_role(auth.uid(), id, 'owner'::organization_role))
WITH CHECK (has_organization_role(auth.uid(), id, 'owner'::organization_role));

-- Add index for performance on soft delete queries
CREATE INDEX IF NOT EXISTS idx_organizations_is_deleted ON public.organizations(is_deleted) WHERE is_deleted = false;