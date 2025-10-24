-- Add indexes for faster team member queries
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id 
  ON organization_members(organization_id);

CREATE INDEX IF NOT EXISTS idx_team_invitations_org_id 
  ON team_invitations(organization_id);

CREATE INDEX IF NOT EXISTS idx_team_invitations_email
  ON team_invitations(email, accepted_at);