-- Create copywriting_sequences table for Phase 3.5
CREATE TABLE copywriting_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_type TEXT NOT NULL,
  content_format TEXT NOT NULL,
  sequence_order INTEGER NOT NULL,
  copywriter_name TEXT NOT NULL,
  copywriter_role TEXT NOT NULL,
  framework_code TEXT,
  is_forbidden BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT copywriting_sequences_unique UNIQUE (industry_type, content_format, sequence_order)
);

CREATE INDEX idx_copywriting_sequences_lookup 
ON copywriting_sequences(industry_type, content_format);

-- Enable RLS
ALTER TABLE copywriting_sequences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "All authenticated users can read sequences"
ON copywriting_sequences FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Super admins can manage sequences"
ON copywriting_sequences FOR ALL
USING (is_super_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER set_copywriting_sequences_updated_at
BEFORE UPDATE ON copywriting_sequences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Populate sequences for all formats across 3 industries
-- Using Reeves → Ogilvy → Hopkins → Burnett as the core sequence for most formats

-- FRAGRANCE INDUSTRY
INSERT INTO copywriting_sequences (industry_type, content_format, sequence_order, copywriter_name, copywriter_role) VALUES
-- Product Description
('fragrance', 'product_description', 1, 'Rosser Reeves', 'USP Lead'),
('fragrance', 'product_description', 2, 'David Ogilvy', 'Specifics Support'),
('fragrance', 'product_description', 3, 'Claude Hopkins', 'Justification'),
('fragrance', 'product_description', 4, 'Leo Burnett', 'Emotion Close'),
-- Product Story
('fragrance', 'product_story', 1, 'Leo Burnett', 'Emotion Lead'),
('fragrance', 'product_story', 2, 'J. Peterman', 'Narrative Build'),
('fragrance', 'product_story', 3, 'David Ogilvy', 'Specifics Support'),
('fragrance', 'product_story', 4, 'Rosser Reeves', 'USP Close'),
-- Blog Article
('fragrance', 'blog_article', 1, 'Claude Hopkins', 'Reason Lead'),
('fragrance', 'blog_article', 2, 'David Ogilvy', 'Specifics Build'),
('fragrance', 'blog_article', 3, 'J. Peterman', 'Narrative Layer'),
('fragrance', 'blog_article', 4, 'Leo Burnett', 'Emotion Close'),
-- Email Campaign
('fragrance', 'email_campaign', 1, 'Rosser Reeves', 'USP Hook'),
('fragrance', 'email_campaign', 2, 'Claude Hopkins', 'Reason Build'),
('fragrance', 'email_campaign', 3, 'David Ogilvy', 'Specifics Support'),
('fragrance', 'email_campaign', 4, 'Leo Burnett', 'Emotion CTA'),
-- Email Subject Lines
('fragrance', 'email_subject_lines', 1, 'Rosser Reeves', 'USP Hook'),
('fragrance', 'email_subject_lines', 2, 'David Ogilvy', 'Specificity'),
-- Ad Copy
('fragrance', 'ad_copy', 1, 'Rosser Reeves', 'USP Lead'),
('fragrance', 'ad_copy', 2, 'David Ogilvy', 'Specifics Support'),
('fragrance', 'ad_copy', 3, 'Leo Burnett', 'Emotion Close'),
-- Landing Page Copy
('fragrance', 'landing_page_copy', 1, 'Rosser Reeves', 'USP Hero'),
('fragrance', 'landing_page_copy', 2, 'Claude Hopkins', 'Reason Build'),
('fragrance', 'landing_page_copy', 3, 'David Ogilvy', 'Specifics Support'),
('fragrance', 'landing_page_copy', 4, 'Leo Burnett', 'Emotion CTA'),
-- Website Hero Copy
('fragrance', 'website_hero_copy', 1, 'Leo Burnett', 'Emotion Hook'),
('fragrance', 'website_hero_copy', 2, 'Rosser Reeves', 'USP Support'),
-- Social Media Post
('fragrance', 'social_media_post', 1, 'Leo Burnett', 'Emotion Lead'),
('fragrance', 'social_media_post', 2, 'Rosser Reeves', 'USP Punch'),
-- SMS Campaign Copy
('fragrance', 'sms_campaign_copy', 1, 'Rosser Reeves', 'USP Only'),
('fragrance', 'sms_campaign_copy', 2, 'David Ogilvy', 'Specificity'),
-- Collection Page Copy
('fragrance', 'collection_page_copy', 1, 'J. Peterman', 'Theme Lead'),
('fragrance', 'collection_page_copy', 2, 'David Ogilvy', 'Specifics Build'),
('fragrance', 'collection_page_copy', 3, 'Leo Burnett', 'Emotion Close'),
-- Brand Story Page
('fragrance', 'brand_story_page', 1, 'J. Peterman', 'Narrative Lead'),
('fragrance', 'brand_story_page', 2, 'Leo Burnett', 'Emotion Build'),
('fragrance', 'brand_story_page', 3, 'David Ogilvy', 'Specifics Support'),
-- FAQ Page Copy
('fragrance', 'faq_page_copy', 1, 'David Ogilvy', 'Clarity Lead'),
('fragrance', 'faq_page_copy', 2, 'Claude Hopkins', 'Reason Support'),
-- Video Script
('fragrance', 'video_script', 1, 'Leo Burnett', 'Emotion Hook'),
('fragrance', 'video_script', 2, 'J. Peterman', 'Story Build'),
('fragrance', 'video_script', 3, 'David Ogilvy', 'Specifics Support'),
('fragrance', 'video_script', 4, 'Rosser Reeves', 'USP Close'),
-- Podcast Script
('fragrance', 'podcast_script', 1, 'J. Peterman', 'Narrative Lead'),
('fragrance', 'podcast_script', 2, 'David Ogilvy', 'Specifics Build'),
('fragrance', 'podcast_script', 3, 'Claude Hopkins', 'Reason Support'),
-- Carousel Copy
('fragrance', 'carousel_copy', 1, 'Leo Burnett', 'Emotion Hook'),
('fragrance', 'carousel_copy', 2, 'Rosser Reeves', 'USP Slide'),
('fragrance', 'carousel_copy', 3, 'David Ogilvy', 'Specifics Slide'),
-- Short Form Video Script
('fragrance', 'short_form_video_script', 1, 'Leo Burnett', 'Emotion Hook'),
('fragrance', 'short_form_video_script', 2, 'Rosser Reeves', 'USP Punch'),
-- Customer Testimonial Story
('fragrance', 'customer_testimonial_story', 1, 'Leo Burnett', 'Emotion Lead'),
('fragrance', 'customer_testimonial_story', 2, 'Claude Hopkins', 'Reason Build'),
('fragrance', 'customer_testimonial_story', 3, 'David Ogilvy', 'Specifics Close'),
-- Quote Hook Generator
('fragrance', 'quote_hook_generator', 1, 'Rosser Reeves', 'USP Punch'),
('fragrance', 'quote_hook_generator', 2, 'Leo Burnett', 'Emotion Layer'),
-- Launch Announcement
('fragrance', 'launch_announcement', 1, 'Rosser Reeves', 'USP Lead'),
('fragrance', 'launch_announcement', 2, 'David Ogilvy', 'Specifics Build'),
('fragrance', 'launch_announcement', 3, 'Leo Burnett', 'Emotion Close'),
-- Press Release
('fragrance', 'press_release', 1, 'David Ogilvy', 'Facts Lead'),
('fragrance', 'press_release', 2, 'Claude Hopkins', 'Reason Build'),
('fragrance', 'press_release', 3, 'Rosser Reeves', 'USP Close'),
-- Visual Asset (note: hyphen)
('fragrance', 'visual-asset', 1, 'Leo Burnett', 'Emotion Visual'),
('fragrance', 'visual-asset', 2, 'Rosser Reeves', 'USP Support'),
-- Image Prompt
('fragrance', 'image_prompt', 1, 'Leo Burnett', 'Emotion Visual'),
('fragrance', 'image_prompt', 2, 'David Ogilvy', 'Specifics Layer'),
-- Campaign Concept Visual
('fragrance', 'campaign_concept_visual', 1, 'Leo Burnett', 'Emotion Core'),
('fragrance', 'campaign_concept_visual', 2, 'J. Peterman', 'Narrative Layer'),
-- Ad Creative Prompt
('fragrance', 'ad_creative_prompt', 1, 'Rosser Reeves', 'USP Core'),
('fragrance', 'ad_creative_prompt', 2, 'Leo Burnett', 'Emotion Visual');

-- Add forbidden copywriters for specific formats
INSERT INTO copywriting_sequences (industry_type, content_format, sequence_order, copywriter_name, copywriter_role, is_forbidden) VALUES
('fragrance', 'sms_campaign_copy', 99, 'J. Peterman', 'Forbidden', true),
('fragrance', 'sms_campaign_copy', 98, 'Claude Hopkins', 'Forbidden', true),
('fragrance', 'sms_campaign_copy', 97, 'Leo Burnett', 'Forbidden', true),
('fragrance', 'email_subject_lines', 99, 'J. Peterman', 'Forbidden', true);

-- SKINCARE INDUSTRY (same sequences as fragrance)
INSERT INTO copywriting_sequences (industry_type, content_format, sequence_order, copywriter_name, copywriter_role)
SELECT 'skincare', content_format, sequence_order, copywriter_name, copywriter_role
FROM copywriting_sequences
WHERE industry_type = 'fragrance' AND is_forbidden = false;

INSERT INTO copywriting_sequences (industry_type, content_format, sequence_order, copywriter_name, copywriter_role, is_forbidden)
SELECT 'skincare', content_format, sequence_order, copywriter_name, copywriter_role, true
FROM copywriting_sequences
WHERE industry_type = 'fragrance' AND is_forbidden = true;

-- HOME_FRAGRANCE INDUSTRY (same sequences as fragrance)
INSERT INTO copywriting_sequences (industry_type, content_format, sequence_order, copywriter_name, copywriter_role)
SELECT 'home_fragrance', content_format, sequence_order, copywriter_name, copywriter_role
FROM copywriting_sequences
WHERE industry_type = 'fragrance' AND is_forbidden = false;

INSERT INTO copywriting_sequences (industry_type, content_format, sequence_order, copywriter_name, copywriter_role, is_forbidden)
SELECT 'home_fragrance', content_format, sequence_order, copywriter_name, copywriter_role, true
FROM copywriting_sequences
WHERE industry_type = 'fragrance' AND is_forbidden = true;