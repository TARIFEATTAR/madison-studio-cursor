-- Phase 0: Foundation Fixes
-- Step 0.1: Clean up brand_collections and establish 4 canonical collections
-- Step 0.2: Add prompt tracking fields

-- Step 0.1: Delete all existing collections and re-insert canonical ones
DO $$
DECLARE
  org_record RECORD;
BEGIN
  -- Delete all existing collections
  DELETE FROM brand_collections;
  
  -- Insert the 4 canonical collections for each organization
  FOR org_record IN SELECT id FROM organizations LOOP
    INSERT INTO brand_collections (name, sort_order, organization_id, description)
    VALUES 
      ('Cadence', 0, org_record.id, 'Rhythm and routine collection'),
      ('Purity', 1, org_record.id, 'Clean and minimal collection'),
      ('Reserve', 2, org_record.id, 'Premium reserve collection'),
      ('Sacred Space', 3, org_record.id, 'Sacred and contemplative collection');
  END LOOP;
END $$;

-- Step 0.2: Add prompt tracking fields to prompts table
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS times_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS avg_quality_rating NUMERIC(3,2),
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS effectiveness_score INTEGER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_prompts_tags ON prompts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_prompts_times_used ON prompts(times_used DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_effectiveness ON prompts(effectiveness_score DESC NULLS LAST);

-- Create function to auto-calculate avg_quality_rating from outputs
CREATE OR REPLACE FUNCTION update_prompt_quality_rating()
RETURNS TRIGGER AS $func$
BEGIN
  UPDATE prompts
  SET avg_quality_rating = (
    SELECT AVG(quality_rating)::NUMERIC(3,2)
    FROM outputs
    WHERE prompt_id = NEW.prompt_id
    AND quality_rating IS NOT NULL
  )
  WHERE id = NEW.prompt_id;
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to update quality rating when output is rated
DROP TRIGGER IF EXISTS update_prompt_rating_on_output ON outputs;
CREATE TRIGGER update_prompt_rating_on_output
AFTER INSERT OR UPDATE OF quality_rating ON outputs
FOR EACH ROW
WHEN (NEW.quality_rating IS NOT NULL AND NEW.prompt_id IS NOT NULL)
EXECUTE FUNCTION update_prompt_quality_rating();