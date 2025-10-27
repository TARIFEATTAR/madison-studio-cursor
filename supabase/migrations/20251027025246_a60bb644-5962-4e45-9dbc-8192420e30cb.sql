-- Phase 1: Database Foundation for Madison Intelligence System

-- 1.1: Add industry intelligence columns to organizations table
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS industry_type TEXT,
ADD COLUMN IF NOT EXISTS business_model TEXT,
ADD COLUMN IF NOT EXISTS target_audience_type TEXT;

COMMENT ON COLUMN organizations.industry_type IS 'Primary industry: luxury, b2b_saas, dtc_ecommerce, professional_services, nonprofit, local_business, education_coaching, health_wellness, creative_agency';
COMMENT ON COLUMN organizations.business_model IS 'Business model type: b2c, b2b, b2b2c, nonprofit, hybrid';
COMMENT ON COLUMN organizations.target_audience_type IS 'Primary audience: consumer_mass, consumer_luxury, business_smb, business_enterprise, nonprofit_donors, nonprofit_beneficiaries';

-- 1.2: Create copywriting style mappings table
CREATE TABLE IF NOT EXISTS copywriting_style_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_type TEXT NOT NULL,
  content_format TEXT NOT NULL,
  primary_copywriter TEXT NOT NULL,
  secondary_copywriter TEXT,
  persuasion_framework TEXT NOT NULL,
  voice_spectrum TEXT NOT NULL,
  urgency_level TEXT NOT NULL,
  key_hooks TEXT[],
  example_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE copywriting_style_mappings IS 'Maps industry + format combinations to optimal copywriting techniques';
COMMENT ON COLUMN copywriting_style_mappings.primary_copywriter IS 'Lead copywriter: ogilvy, hopkins, reeves, burnett, peterman, schwartz';
COMMENT ON COLUMN copywriting_style_mappings.persuasion_framework IS 'Framework to use: AIDA, PAS, FAB, BAB, cialdini_social_proof, schwartz_awareness, jtbd';
COMMENT ON COLUMN copywriting_style_mappings.voice_spectrum IS 'Voice style: authoritative, conversational, aspirational, empathetic, educational, provocative';
COMMENT ON COLUMN copywriting_style_mappings.urgency_level IS 'Urgency: none, soft, medium, hard';

-- 1.3: Create marketing frameworks library table
CREATE TABLE IF NOT EXISTS marketing_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_code TEXT UNIQUE NOT NULL,
  framework_name TEXT NOT NULL,
  framework_category TEXT NOT NULL,
  description TEXT NOT NULL,
  when_to_use TEXT NOT NULL,
  structure_template JSONB NOT NULL,
  examples JSONB NOT NULL,
  strengths TEXT[],
  weaknesses TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE marketing_frameworks IS 'Library of marketing and persuasion frameworks Madison can reference';
COMMENT ON COLUMN marketing_frameworks.framework_code IS 'Unique code: AIDA, PAS, FAB, BAB, CIALDINI_SOCIAL_PROOF, etc.';
COMMENT ON COLUMN marketing_frameworks.framework_category IS 'Category: conversion_formula, persuasion_psychology, positioning, customer_insight';
COMMENT ON COLUMN marketing_frameworks.structure_template IS 'JSON template with placeholders for each framework component';
COMMENT ON COLUMN marketing_frameworks.examples IS 'JSON array of real-world examples across industries';

-- 1.4: Create copywriter techniques table
CREATE TABLE IF NOT EXISTS copywriter_techniques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  copywriter_name TEXT NOT NULL,
  copywriter_era TEXT NOT NULL,
  core_philosophy TEXT NOT NULL,
  signature_techniques JSONB NOT NULL,
  writing_style_traits TEXT[],
  best_use_cases TEXT[],
  example_headlines TEXT[],
  example_body_copy TEXT,
  blending_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE copywriter_techniques IS 'Detailed documentation of master copywriter techniques and styles';
COMMENT ON COLUMN copywriter_techniques.copywriter_name IS 'Master copywriter: David Ogilvy, Claude Hopkins, Rosser Reeves, Leo Burnett, John Peterman, Eugene Schwartz';
COMMENT ON COLUMN copywriter_techniques.signature_techniques IS 'JSON object with technique name, description, application, and examples';
COMMENT ON COLUMN copywriter_techniques.blending_notes IS 'How to blend this copywriter with others for hybrid approaches';

-- Enable RLS on new tables
ALTER TABLE copywriting_style_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE copywriter_techniques ENABLE ROW LEVEL SECURITY;

-- RLS Policies: These are reference tables, all authenticated users can read
CREATE POLICY "All authenticated users can read copywriting style mappings"
  ON copywriting_style_mappings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can read marketing frameworks"
  ON marketing_frameworks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "All authenticated users can read copywriter techniques"
  ON copywriter_techniques FOR SELECT
  TO authenticated
  USING (true);

-- Only super admins can modify these reference tables
CREATE POLICY "Super admins can manage copywriting style mappings"
  ON copywriting_style_mappings FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage marketing frameworks"
  ON marketing_frameworks FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()));

CREATE POLICY "Super admins can manage copywriter techniques"
  ON copywriter_techniques FOR ALL
  TO authenticated
  USING (is_super_admin(auth.uid()));

-- Add updated_at trigger for new tables
CREATE TRIGGER update_copywriting_style_mappings_updated_at
  BEFORE UPDATE ON copywriting_style_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_marketing_frameworks_updated_at
  BEFORE UPDATE ON marketing_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_copywriter_techniques_updated_at
  BEFORE UPDATE ON copywriter_techniques
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();