-- Phase 2: Secure repurposing_rules table with organization scoping
-- Option 1: Keep existing rules as system defaults (organization_id = NULL)

-- Step 1: Add organization_id column
ALTER TABLE repurposing_rules 
ADD COLUMN organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE;

-- Step 2: Add indexes for performance
CREATE INDEX idx_repurposing_rules_org ON repurposing_rules(organization_id);
CREATE INDEX idx_repurposing_rules_source_target ON repurposing_rules(source_type, target_type);
CREATE INDEX idx_repurposing_rules_active ON repurposing_rules(is_active) WHERE is_active = true;

-- Step 3: Drop overly permissive policy
DROP POLICY IF EXISTS "Repurposing rules are viewable by authenticated users" ON repurposing_rules;

-- Step 4: Create organization-scoped RLS policies

-- SELECT: Users can view their organization's rules + system defaults (NULL org_id)
CREATE POLICY "Members can view organization and system repurposing rules"
ON repurposing_rules
FOR SELECT
USING (
  organization_id IS NULL OR 
  is_organization_member(auth.uid(), organization_id)
);

-- INSERT: Only admins/owners can create organization-specific rules
CREATE POLICY "Admins and owners can create repurposing rules"
ON repurposing_rules
FOR INSERT
WITH CHECK (
  has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR
  has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
);

-- UPDATE: Only admins/owners can update their organization's rules
CREATE POLICY "Admins and owners can update repurposing rules"
ON repurposing_rules
FOR UPDATE
USING (
  has_organization_role(auth.uid(), organization_id, 'owner'::organization_role) OR
  has_organization_role(auth.uid(), organization_id, 'admin'::organization_role)
);

-- DELETE: Only owners can delete repurposing rules
CREATE POLICY "Owners can delete repurposing rules"
ON repurposing_rules
FOR DELETE
USING (
  has_organization_role(auth.uid(), organization_id, 'owner'::organization_role)
);

-- Step 5: Add documentation
COMMENT ON COLUMN repurposing_rules.organization_id IS 'Organization that owns this rule. NULL = system default rule visible to all.';
COMMENT ON TABLE repurposing_rules IS 'Content transformation rules. System rules (org_id=NULL) are read-only defaults. Organizations can create custom rules.';