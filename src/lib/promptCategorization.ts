/**
 * Detects prompt category using client-side rule-based logic
 * Fast, deterministic, and free (no AI calls needed)
 */
export function detectCategory(brief: {
  deliverable_format: string;
  goal?: string;
  audience?: string;
  style_overlay?: string;
  custom_instructions?: string;
}): string {
  const format = (brief.deliverable_format || '').toLowerCase();
  const goal = (brief.goal || '').toLowerCase();
  const audience = (brief.audience || '').toLowerCase();
  const instructions = (brief.custom_instructions || '').toLowerCase();
  
  // Combine all text for pattern matching
  const allText = `${format} ${goal} ${audience} ${instructions}`;

  // Product launches
  if (
    format.includes('product') || 
    allText.includes('launch') || 
    allText.includes('announcement') ||
    allText.includes('new product') ||
    allText.includes('introducing')
  ) {
    return 'product_launch';
  }

  // Seasonal campaigns
  if (
    allText.includes('holiday') || 
    allText.includes('season') || 
    allText.includes('valentine') ||
    allText.includes('christmas') ||
    allText.includes('black friday') ||
    allText.includes('summer') ||
    allText.includes('winter') ||
    allText.includes('spring') ||
    allText.includes('fall')
  ) {
    return 'seasonal_campaign';
  }

  // Newsletter
  if (
    format.includes('newsletter') || 
    (format.includes('email') && audience.includes('subscriber')) ||
    allText.includes('weekly') ||
    allText.includes('monthly update')
  ) {
    return 'newsletter';
  }

  // Social engagement
  if (
    format.includes('social') || 
    format.includes('instagram') || 
    format.includes('facebook') ||
    format.includes('twitter') ||
    format.includes('tiktok') ||
    format.includes('linkedin')
  ) {
    return 'social_engagement';
  }

  // Educational content
  if (
    allText.includes('educate') || 
    allText.includes('teach') || 
    allText.includes('explain') ||
    allText.includes('how-to') ||
    allText.includes('tutorial') ||
    allText.includes('guide') ||
    format.includes('blog')
  ) {
    return 'educational_content';
  }

  // Promotional
  if (
    allText.includes('promote') || 
    allText.includes('discount') || 
    allText.includes('offer') ||
    allText.includes('sale') ||
    allText.includes('promo') ||
    allText.includes('deal') ||
    allText.includes('limited time')
  ) {
    return 'promotional';
  }

  // Marketplace listings
  if (
    format.includes('marketplace') || 
    format.includes('etsy') || 
    format.includes('shopify') ||
    format.includes('listing') ||
    format.includes('product description')
  ) {
    return 'marketplace_listing';
  }

  // Storytelling (long-form narrative)
  if (
    format.includes('article') ||
    format.includes('story') ||
    allText.includes('narrative') ||
    allText.includes('behind the scenes')
  ) {
    return 'storytelling';
  }

  // Fallback
  return 'general';
}

/**
 * Get human-readable category label
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    product_launch: 'Product Launch',
    seasonal_campaign: 'Seasonal Campaign',
    newsletter: 'Newsletter',
    social_engagement: 'Social Media',
    educational_content: 'Educational',
    promotional: 'Promotional',
    marketplace_listing: 'Marketplace',
    storytelling: 'Storytelling',
    general: 'General'
  };
  
  return labels[category] || 'General';
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    product_launch: '🚀',
    seasonal_campaign: '🎄',
    newsletter: '📧',
    social_engagement: '📱',
    educational_content: '📚',
    promotional: '🎯',
    marketplace_listing: '🛍️',
    storytelling: '✨',
    general: '📝'
  };
  
  return icons[category] || '📝';
}
