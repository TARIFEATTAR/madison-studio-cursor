-- ═══════════════════════════════════════════════════════════════════════════════
-- MADISON STUDIO - ADD MARKETING AGENCY BUSINESS TYPE
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- Adds "marketing_agency" business type for B2B agencies that create content
-- for multiple client brands.
--
-- Created: December 20, 2025
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add new enum value
ALTER TYPE public.business_type ADD VALUE IF NOT EXISTS 'marketing_agency';

-- Insert marketing agency configuration
INSERT INTO public.business_type_config (
  business_type,
  display_name,
  description,
  icon,
  enabled_sections,
  vocabulary,
  default_categories,
  product_fields,
  ai_context,
  onboarding_config,
  sort_order
) VALUES (
  'marketing_agency',
  'Marketing Agency',
  'You create marketing content, campaigns, and brand strategy for beauty/cosmetic client brands',
  'briefcase',
  '{
    "products": true,
    "ingredients": true,
    "specifications": true,
    "packaging": true,
    "formulations": false,
    "customers": true,
    "retail_channels": true,
    "marketing_campaigns": true,
    "social_media": true,
    "email_marketing": true,
    "blog_content": true,
    "product_photography": true,
    "client_management": true,
    "campaign_reporting": true,
    "brand_strategy": true
  }'::jsonb,
  '{
    "product": "Product",
    "products": "Products",
    "ingredient": "Ingredient",
    "customer": "Client Brand",
    "order": "Project",
    "catalog": "Portfolio",
    "deliverable": "Deliverable",
    "campaign": "Campaign"
  }'::jsonb,
  '["Brand Strategy", "Content Creation", "Social Media", "Email Marketing", "Product Launch", "Campaign Management", "Photography", "Copywriting"]'::jsonb,
  '{
    "required": ["name"],
    "recommended": ["description", "client_brand"],
    "optional": ["campaign", "deliverable_type", "deadline"],
    "hidden": []
  }'::jsonb,
  '{
    "industry_terms": ["hero ingredient", "clean beauty", "sustainable", "cruelty-free", "vegan", "formulation", "texture", "finish", "campaign brief", "content calendar", "brand voice", "deliverables", "asset library", "approval workflow"],
    "content_focus": "Create compelling content for beauty/cosmetic brands. Focus on consumer marketing, lifestyle storytelling, ingredient education, and brand building. Adapt voice to match each client brand.",
    "tone_hints": "Versatile - match client brand voice. Default to aspirational yet authentic, educational, emotionally resonant for consumer-facing content. Professional for client communications.",
    "target_audience": "End consumers of client brands (beauty enthusiasts, conscious shoppers). Secondary: client brand stakeholders for approvals."
  }'::jsonb,
  '{
    "welcome_message": "Welcome to Madison Studio for Agencies! Create beautiful content for your beauty & cosmetics clients.",
    "suggested_first_steps": [
      "Set up your first client brand",
      "Upload brand guidelines",
      "Generate your first piece of content"
    ],
    "skip_sections": []
  }'::jsonb,
  5
) ON CONFLICT (business_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  enabled_sections = EXCLUDED.enabled_sections,
  vocabulary = EXCLUDED.vocabulary,
  default_categories = EXCLUDED.default_categories,
  product_fields = EXCLUDED.product_fields,
  ai_context = EXCLUDED.ai_context,
  onboarding_config = EXCLUDED.onboarding_config,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════════
-- COMPLETE
-- ═══════════════════════════════════════════════════════════════════════════════
