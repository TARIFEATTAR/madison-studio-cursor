-- Fix scheduled_content DELETE RLS policy to allow users to delete their own content
-- even when organization_id is NULL
DROP POLICY IF EXISTS "Users can delete their own or organization scheduled content" ON scheduled_content;

CREATE POLICY "Users can delete their own or organization scheduled content"
ON scheduled_content
FOR DELETE
USING (
  (auth.uid() = user_id) OR 
  (organization_id IS NOT NULL AND is_organization_member(auth.uid(), organization_id))
);

-- Add CASCADE constraints to handle dependent deletions automatically
-- This prevents foreign key constraint errors when deleting parent records

-- First, we need to drop existing foreign key constraints if they exist
ALTER TABLE derivative_assets 
DROP CONSTRAINT IF EXISTS derivative_assets_master_content_id_fkey;

-- Re-add with CASCADE
ALTER TABLE derivative_assets
ADD CONSTRAINT derivative_assets_master_content_id_fkey 
FOREIGN KEY (master_content_id) 
REFERENCES master_content(id) 
ON DELETE CASCADE;

-- Handle scheduled_content references to master_content
ALTER TABLE scheduled_content
DROP CONSTRAINT IF EXISTS scheduled_content_content_id_fkey;

ALTER TABLE scheduled_content
ADD CONSTRAINT scheduled_content_content_id_fkey 
FOREIGN KEY (content_id) 
REFERENCES master_content(id) 
ON DELETE SET NULL;

-- Handle scheduled_content references to derivative_assets
ALTER TABLE scheduled_content
DROP CONSTRAINT IF EXISTS scheduled_content_derivative_id_fkey;

ALTER TABLE scheduled_content
ADD CONSTRAINT scheduled_content_derivative_id_fkey 
FOREIGN KEY (derivative_id) 
REFERENCES derivative_assets(id) 
ON DELETE SET NULL;