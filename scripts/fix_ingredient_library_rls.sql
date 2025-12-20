-- ═══════════════════════════════════════════════════════════════════════════════
-- FIX INGREDIENT LIBRARY RLS POLICY
-- Allows access to GLOBAL ingredients (organization_id IS NULL)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Drop existing select policy
DROP POLICY IF EXISTS "ingredient_lib_select" ON public.ingredient_library;

-- Create new policy that allows:
-- 1. Global ingredients (organization_id IS NULL) - accessible to everyone
-- 2. Organization-specific ingredients - accessible to org members
CREATE POLICY "ingredient_lib_select" ON public.ingredient_library
  FOR SELECT USING (
    organization_id IS NULL  -- Global ingredients accessible to all authenticated users
    OR 
    organization_id = ANY(public.get_user_organization_ids())  -- Org-specific
  );

-- Verify the policy was created
SELECT 
  policyname, 
  tablename, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'ingredient_library';
