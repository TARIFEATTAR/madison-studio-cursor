-- Add chain tracking fields to generated_images table
ALTER TABLE generated_images
ADD COLUMN IF NOT EXISTS parent_image_id uuid REFERENCES generated_images(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS chain_depth integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_chain_origin boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS refinement_instruction text;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_images_parent ON generated_images(parent_image_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_chain_origin ON generated_images(is_chain_origin) WHERE is_chain_origin = true;
CREATE INDEX IF NOT EXISTS idx_generated_images_session_chain ON generated_images(session_id, parent_image_id);

-- Add comment for documentation
COMMENT ON COLUMN generated_images.parent_image_id IS 'Reference to the parent image in a chain refinement sequence';
COMMENT ON COLUMN generated_images.chain_depth IS 'How many iterations deep in the refinement chain (0 = original)';
COMMENT ON COLUMN generated_images.is_chain_origin IS 'True if this image started a new chain';
COMMENT ON COLUMN generated_images.refinement_instruction IS 'The specific instruction used to refine from parent image';