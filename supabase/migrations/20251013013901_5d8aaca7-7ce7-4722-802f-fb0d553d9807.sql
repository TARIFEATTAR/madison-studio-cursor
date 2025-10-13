-- First, delete duplicate master_content entries keeping only the most recent one per (organization_id, title)
DELETE FROM master_content
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY organization_id, title ORDER BY created_at DESC) as rn
    FROM master_content
    WHERE is_archived = false
  ) t
  WHERE t.rn > 1
);

-- Then add unique constraint on master_content title per organization
CREATE UNIQUE INDEX idx_master_content_unique_title_per_org 
ON master_content(organization_id, title) 
WHERE is_archived = false;