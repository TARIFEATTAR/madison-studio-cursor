-- Create generated_images table for Madison Image Studio
CREATE TABLE generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  
  -- Image metadata
  goal_type text NOT NULL,
  aspect_ratio text NOT NULL,
  output_format text DEFAULT 'png',
  
  -- Prompt engineering
  selected_template text,
  user_refinements text,
  final_prompt text NOT NULL,
  
  -- Results
  image_url text NOT NULL,
  description text,
  
  -- Brand alignment
  brand_colors_used text[],
  brand_style_tags text[],
  
  -- Organization
  saved_to_library boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  archived_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org's generated images"
  ON generated_images FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create images for their org"
  ON generated_images FOR INSERT
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update their org's images"
  ON generated_images FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their org's images"
  ON generated_images FOR DELETE
  USING (organization_id IN (
    SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
  ));

-- Trigger for updated_at
CREATE TRIGGER update_generated_images_updated_at
  BEFORE UPDATE ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for archived_at
CREATE TRIGGER set_generated_images_archived_at
  BEFORE UPDATE ON generated_images
  FOR EACH ROW
  WHEN (NEW.is_archived = true AND OLD.is_archived = false)
  EXECUTE FUNCTION set_derivative_archived_at();