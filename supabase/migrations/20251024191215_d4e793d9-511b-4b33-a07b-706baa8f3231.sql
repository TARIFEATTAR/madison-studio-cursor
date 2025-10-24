-- Extend prompts table for enhanced auto-save functionality
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS content_id UUID REFERENCES master_content(id) ON DELETE SET NULL;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES brand_products(id) ON DELETE SET NULL;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS deliverable_format TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS audience TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS goal TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS style_overlay TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS custom_instructions TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS additional_context JSONB;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS auto_generated_name TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS user_custom_name TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_auto_saved BOOLEAN DEFAULT FALSE;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS is_favorited BOOLEAN DEFAULT FALSE;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS on_brand_score DECIMAL(3,2);
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS was_multiplied BOOLEAN DEFAULT FALSE;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS was_scheduled BOOLEAN DEFAULT FALSE;
ALTER TABLE prompts ADD COLUMN IF NOT EXISTS edit_percentage INTEGER;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_prompts_auto_saved 
ON prompts(organization_id, is_auto_saved, created_at DESC) 
WHERE is_auto_saved = true;

CREATE INDEX IF NOT EXISTS idx_prompts_favorited 
ON prompts(organization_id, is_favorited, last_used_at DESC) 
WHERE is_favorited = true;

CREATE INDEX IF NOT EXISTS idx_prompts_category 
ON prompts(organization_id, category);

CREATE INDEX IF NOT EXISTS idx_prompts_format 
ON prompts(organization_id, deliverable_format);

-- Add comments for documentation
COMMENT ON COLUMN prompts.is_auto_saved IS 'True if prompt was auto-saved during content generation (vs manually created template)';
COMMENT ON COLUMN prompts.is_favorited IS 'True if user marked this prompt as a favorite via Madison suggestion';
COMMENT ON COLUMN prompts.auto_generated_name IS 'Smart-generated name like "Blog Post - Jasmine Attar"';
COMMENT ON COLUMN prompts.user_custom_name IS 'User can optionally rename the prompt';
COMMENT ON COLUMN prompts.category IS 'Auto-detected category: product_launch, seasonal_campaign, newsletter, etc.';

-- Create trigger to track prompt performance based on content lifecycle
CREATE OR REPLACE FUNCTION update_prompt_performance()
RETURNS TRIGGER AS $$
BEGIN
  -- Only track significant state changes, not every edit
  
  -- Track when content status changes to scheduled
  IF NEW.status = 'scheduled' AND (OLD.status IS NULL OR OLD.status != 'scheduled') THEN
    UPDATE prompts 
    SET was_scheduled = true,
        updated_at = NOW()
    WHERE content_id = NEW.id;
  END IF;

  -- Track when content is published (published_at changes from null to a value)
  IF NEW.published_at IS NOT NULL AND (OLD.published_at IS NULL) THEN
    UPDATE prompts 
    SET effectiveness_score = COALESCE(effectiveness_score, 0) + 10,
        updated_at = NOW()
    WHERE content_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS track_prompt_performance ON master_content;
CREATE TRIGGER track_prompt_performance
AFTER UPDATE ON master_content
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status OR NEW.published_at IS DISTINCT FROM OLD.published_at)
EXECUTE FUNCTION update_prompt_performance();

-- Separate trigger for tracking multiplication
CREATE OR REPLACE FUNCTION update_prompt_multiplication()
RETURNS TRIGGER AS $$
BEGIN
  -- When derivatives are created, mark parent prompt as multiplied (only once)
  UPDATE prompts
  SET was_multiplied = true,
      updated_at = NOW()
  WHERE content_id = NEW.master_content_id
    AND was_multiplied = false;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS track_prompt_multiplication ON derivative_assets;
CREATE TRIGGER track_prompt_multiplication
AFTER INSERT ON derivative_assets
FOR EACH ROW
EXECUTE FUNCTION update_prompt_multiplication();