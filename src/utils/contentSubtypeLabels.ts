/**
 * Utility for converting content type keys into friendly display labels
 * for the two-tier badge system
 */

export function getContentSubtypeLabel(contentType: string | undefined): string {
  if (!contentType) return '';
  
  const subtypeMap: Record<string, string> = {
    // Email subtypes
    'email_newsletter': 'Newsletter',
    'email_3part': '3-Part Sequence',
    'email_5part': '5-Part Sequence',
    'email_7part': '7-Part Sequence',
    'email': 'Standard',
    
    // Social subtypes
    'instagram': 'Instagram',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'facebook': 'Facebook',
    'youtube': 'YouTube',
    
    // Other content types (generic label)
    'blog_post': 'Article',
    'product_story': 'Story',
    'brand_announcement': 'Announcement',
    'sms': 'Text',
    'image': 'Image',
    'visual': 'Graphic',
    'graphic': 'Graphic',
  };
  
  return subtypeMap[contentType] || contentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get the category badge label from content type
 * Uses the contentTypeMapping to determine the category
 */
export function getContentCategoryLabel(contentType: string | undefined): string | null {
  if (!contentType) return null;
  
  // Import inline to avoid circular dependency
  const categoryMap: Record<string, string> = {
    // Email
    'email_newsletter': 'Email',
    'email_3part': 'Email',
    'email_5part': 'Email',
    'email_7part': 'Email',
    'email': 'Email',
    
    // Social
    'instagram': 'Social',
    'twitter': 'Social',
    'linkedin': 'Social',
    'facebook': 'Social',
    'youtube': 'Social',
    
    // Other
    'blog_post': 'Blog',
    'product_story': 'Product Stories',
    'brand_announcement': 'Brand Announcements',
    'sms': 'SMS',
    'image': 'Visual',
    'visual': 'Visual',
    'graphic': 'Visual',
  };
  
  return categoryMap[contentType] || null;
}
