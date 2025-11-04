-- Fix Organization Members Bug & Clean Up Duplicates

-- Step 1: Fix the INSERT RLS Policy on organization_members
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.organization_members;

CREATE POLICY "Allow organization creators and admins to add members"
ON public.organization_members
FOR INSERT
WITH CHECK (
  -- Allow if user is the creator of the organization
  EXISTS (
    SELECT 1 FROM public.organizations 
    WHERE id = organization_members.organization_id 
    AND created_by = auth.uid()
  )
  OR
  -- Allow if user is already an owner or admin
  (has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) 
   OR has_organization_role(auth.uid(), organization_id, 'admin'::organization_role))
);

-- Step 2: Clean up duplicate organizations (only if they exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.organizations WHERE created_by = 'cbeb5b7b-6a71-47ce-a529-bad4cbae9bc9'::uuid AND id != '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid) THEN
    DELETE FROM public.organizations 
    WHERE created_by = 'cbeb5b7b-6a71-47ce-a529-bad4cbae9bc9'::uuid
    AND id != '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid;
  END IF;
END $$;

-- Step 3: Add the missing organization_members entry (only if organization exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.organizations WHERE id = '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid) THEN
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (
      '79c923b3-91e5-4f0a-ad50-9806131107b3'::uuid,
      'cbeb5b7b-6a71-47ce-a529-bad4cbae9bc9'::uuid,
      'owner'
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;