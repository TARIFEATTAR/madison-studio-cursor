/**
 * Utility for converting content type keys into friendly display labels
 * for the two-tier badge system
 * 
 * IMPORTANT: Keep in sync with:
 * - src/config/deliverableFormats.ts (source of truth for deliverable values)
 * - src/config/libraryContentTypes.ts (filter groups)
 */

export function getContentSubtypeLabel(contentType: string | undefined): string {
  if (!contentType) return '';
  
  const subtypeMap: Record<string, string> = {
    // Email subtypes
    'email': 'Single Email',
    'email_newsletter': 'Newsletter',
    'email_3part': '3-Part Sequence',
    'email_5part': '5-Part Sequence',
    'email_7part': '7-Part Sequence',
    'email_campaign': 'Campaign',
    'email_subject_lines': 'Subject Lines',
    
    // Social subtypes
    'social_media_post': 'Social Post',
    'instagram': 'Instagram',
    'linkedin': 'LinkedIn',
    'facebook': 'Facebook',
    'twitter': 'Twitter/X',
    'youtube': 'YouTube',
    'carousel_copy': 'Carousel',
    'short_form_video_script': 'Short Video',
    
    // Blog/Article subtypes
    'blog_article': 'Article',
    'blog_post': 'Article',
    'blog': 'Article',
    
    // Product & Brand
    'product_description': 'Description',
    'product_story': 'Story',
    'collection_page_copy': 'Collection',
    'brand_story_page': 'Brand Story',
    'faq_page_copy': 'FAQ',
    
    // Conversion
    'ad_copy': 'Ad Copy',
    'landing_page_copy': 'Landing Page',
    'website_hero_copy': 'Hero Copy',
    
    // Announcements
    'launch_announcement': 'Launch',
    'press_release': 'Press Release',
    'sms_campaign_copy': 'SMS',
    
    // Visual
    'visual-asset': 'Visual',
    'image_prompt': 'Image Recipe',
    'campaign_concept_visual': 'Campaign Visual',
    'ad_creative_prompt': 'Ad Creative',
    
    // Legacy/fallback
    'brand_announcement': 'Announcement',
    'sms': 'SMS',
    'image': 'Image',
    'visual': 'Visual',
    'graphic': 'Graphic',
    'customer_testimonial_story': 'Testimonial',
    'quote_hook_generator': 'Quote/Hook',
    'video_script': 'Video Script',
    'podcast_script': 'Podcast Script',
  };
  
  return subtypeMap[contentType] || contentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get the category badge label from content type
 * Uses the contentTypeMapping to determine the category
 */
export function getContentCategoryLabel(contentType: string | undefined): string | null {
  if (!contentType) return null;
  
  const categoryMap: Record<string, string> = {
    // Email - all email types
    'email': 'Email',
    'email_newsletter': 'Email',
    'email_3part': 'Email',
    'email_5part': 'Email',
    'email_7part': 'Email',
    'email_campaign': 'Email',
    'email_subject_lines': 'Email',
    
    // Social - all social types
    'social_media_post': 'Social',
    'instagram': 'Social',
    'linkedin': 'Social',
    'facebook': 'Social',
    'twitter': 'Social',
    'youtube': 'Social',
    'carousel_copy': 'Social',
    'short_form_video_script': 'Social',
    
    // Blog/Article
    'blog_article': 'Blog',
    'blog_post': 'Blog',
    'blog': 'Blog',
    
    // Product & Brand
    'product_description': 'Product',
    'product_story': 'Product',
    'collection_page_copy': 'Product',
    'brand_story_page': 'Brand',
    'faq_page_copy': 'Brand',
    
    // Conversion
    'ad_copy': 'Ads',
    'landing_page_copy': 'Web',
    'website_hero_copy': 'Web',
    
    // Announcements
    'launch_announcement': 'Announcement',
    'press_release': 'PR',
    'sms_campaign_copy': 'SMS',
    'brand_announcement': 'Announcement',
    'sms': 'SMS',
    
    // Visual
    'visual-asset': 'Visual',
    'image_prompt': 'Visual',
    'campaign_concept_visual': 'Visual',
    'ad_creative_prompt': 'Visual',
    'image': 'Visual',
    'visual': 'Visual',
    'graphic': 'Visual',
    
    // Video/Audio
    'video_script': 'Video',
    'podcast_script': 'Audio',
    
    // Other
    'customer_testimonial_story': 'Social',
    'quote_hook_generator': 'Social',
  };
  
  return categoryMap[contentType] || null;
}
