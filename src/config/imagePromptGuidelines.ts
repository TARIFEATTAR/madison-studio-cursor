/**
 * Standardized Image Prompt Guidelines
 * Reference for generating AI image prompts with consistent quality
 */

export const IMAGE_PROMPT_TEMPLATES = {
  'homepage-hero': {
    aspectRatio: '21:9',
    useCase: 'Website homepage, hero banners',
    prompt: 'Cinematic wide shot of multiple glass attar bottles arranged across an expansive weathered sandstone landscape. Varying heights of sandstone blocks create depth. Brass vessels scattered throughout with frankincense smoke gently rising. Dramatic golden hour lighting from the left creates long shadows. Massive negative space for text overlay.',
    lighting: 'Horizontal golden light, deep shadows',
    composition: 'Rule of thirds, products in lower third, sky/negative space dominates',
    style: 'Epic landscape meets intimate luxury, Terrence Malick cinematography aesthetic'
  },
  'product-page': {
    aspectRatio: '4:5 or 1:1',
    useCase: 'E-commerce product pages, catalog listings',
    prompt: 'Single glass attar bottle centered on a simple sandstone slab, slight angle to show dimension. Small brass accent piece (spoon or dish) to the side. Clean, minimal negative space around. Soft directional lighting emphasizes texture without drama.',
    lighting: 'Soft side lighting, minimal shadows',
    composition: 'Centered, breathing room on all sides',
    style: 'Editorial product photography, Aesop-level sophistication'
  },
  'email-header': {
    aspectRatio: '3:1',
    useCase: 'Email newsletters, website banners',
    prompt: 'Horizontal composition of 2-3 attar bottles on weathered sandstone ledge. Brass vessels with natural elements (oud chips, dried petals). Warm side lighting. Designed for text overlay on left side.',
    lighting: 'Warm golden hour, soft shadows',
    composition: 'Products grouped right, negative space left for text',
    style: 'Editorial luxury goods, magazine header aesthetic'
  },
  'instagram-stories': {
    aspectRatio: '9:16',
    useCase: 'Instagram Stories, TikTok, mobile-first content',
    prompt: 'Vertical composition showing hands performing attar application ritual. Glass bottle in foreground, sandstone texture below. Brass bowl with frankincense in background. Intimate, close-up perspective.',
    lighting: 'Soft natural light from above',
    composition: 'Hands and bottle fill frame, vertical flow',
    style: 'Intimate documentary, behind-the-scenes luxury'
  },
  'ritual-process': {
    aspectRatio: '4:5 or 1:1',
    useCase: 'About page, craftsmanship content, educational posts',
    prompt: 'Overhead view of ritual arrangement: open attar bottle, brass applicator, small brass bowl with raw ingredients, hands positioned to apply oil to wrist. All on aged sandstone surface with natural texture.',
    lighting: 'Soft overhead natural light',
    composition: 'Flat lay, circular arrangement',
    style: 'Anthropological documentation meets luxury editorial'
  },
  'seasonal-limited': {
    aspectRatio: '4:5',
    useCase: 'Seasonal campaigns, limited releases, holiday content',
    prompt: 'Glass attar bottles nestled among seasonal elements (dried autumn leaves, winter branches, spring botanicals) on weathered sandstone. Brass vessels complement seasonal colors. Maintains brand DNA while adding seasonal context.',
    lighting: 'Seasonal-appropriate (warm autumn, cool winter, fresh spring)',
    composition: 'Products integrated with natural seasonal elements',
    style: 'Seasonal editorial, maintains core aesthetic'
  },
  'collection-overview': {
    aspectRatio: '16:9 or 4:3',
    useCase: 'Collection pages, category headers, comparison shots',
    prompt: 'Five glass attar bottles arranged in ascending height order on multi-level sandstone platforms. Each bottle represents different scent family. Brass accents and natural materials (rose petals for floral, oud for woody, etc.) identify categories.',
    lighting: 'Even directional light across all products',
    composition: 'Linear arrangement, each product distinct',
    style: 'Museum display meets luxury retail'
  },
  'social-square': {
    aspectRatio: '1:1',
    useCase: 'Instagram feed posts, Facebook posts, Pinterest',
    prompt: 'Single attar bottle on weathered sandstone with brass bowl containing burning frankincense. Minimal composition with strong negative space. Designed for high impact in small format.',
    lighting: 'Dramatic chiaroscuro',
    composition: 'Bold, simple, high contrast',
    style: 'Gallery-worthy art piece, museum poster aesthetic'
  },
  'behind-scenes': {
    aspectRatio: '4:5',
    useCase: 'Brand story content, artisan process, transparency posts',
    prompt: 'Hands blending oils in brass vessel, attar bottles and raw ingredients scattered on ancient sandstone work surface. Shows the artisanal process while maintaining luxury aesthetic.',
    lighting: 'Workshop lighting - natural but functional',
    composition: 'Process-focused, hands active in frame',
    style: 'Artisan documentary, luxury craftsmanship'
  },
  'gift-set': {
    aspectRatio: '4:5',
    useCase: 'Holiday marketing, gift guides, premium packaging',
    prompt: 'Multiple attar bottles arranged in wooden box lined with natural linen, surrounded by brass vessels and dried botanicals on sandstone. Suggests gifting without being commercial.',
    lighting: 'Warm, inviting golden light',
    composition: 'Contained luxury, suggests precious contents',
    style: 'Luxury unboxing, artisanal gift aesthetic'
  },
  'macro-detail': {
    aspectRatio: '1:1 or 4:5',
    useCase: 'Quality focus, material story, artistic content',
    prompt: 'Extreme close-up of oil droplet on weathered sandstone surface next to brass vessel edge. Shows material quality and craftsmanship at microscopic level.',
    lighting: 'Dramatic side lighting reveals texture',
    composition: 'Abstract, focuses on material beauty',
    style: 'Scientific photography meets luxury materials'
  },
  'lifestyle-sanctuary': {
    aspectRatio: '4:5',
    useCase: 'Lifestyle content, meditation/wellness angle, sacred space',
    prompt: 'Attar bottles and brass incense vessels arranged in meditation space corner. Sandstone altar with soft natural light filtering through. Suggests daily ritual and sacred space.',
    lighting: 'Soft, spiritual natural light',
    composition: 'Environmental, suggests use context',
    style: 'Sanctuary photography, spiritual luxury aesthetic'
  },

  // E-commerce focused templates
  'etsy-listing': {
    aspectRatio: '1:1',
    useCase: 'Etsy product listing, clean and trustworthy',
    prompt: 'Studio product photography of {{PRODUCT_NAME}} on clean white background. Soft even lighting from 45-degree angle. Crisp focus, shows texture and quality. Professional e-commerce aesthetic, no distractions.',
    lighting: 'Soft studio lighting, shadowless',
    composition: 'Centered product, 20% breathing room, shows scale',
    style: 'E-commerce standard, clean and honest'
  },

  'etsy-lifestyle': {
    aspectRatio: '4:5',
    useCase: 'Etsy lifestyle shot, shows product in context',
    prompt: 'Lifestyle shot of {{PRODUCT_NAME}} in natural home setting. Wooden table, soft natural window light, authentic hands-on-product moment. Props suggest daily ritual. Warm inviting atmosphere.',
    lighting: 'Natural window light, warm tones',
    composition: 'Product in lower third, lifestyle context fills frame',
    style: 'Authentic lifestyle, Etsy editorial'
  },

  'facebook-ad': {
    aspectRatio: '1:1',
    useCase: 'Facebook/Instagram ad, scroll-stopping visual',
    prompt: 'Bold, eye-catching shot of {{PRODUCT_NAME}} with vibrant background gradient. High contrast, dramatic lighting creates depth. Product pops off screen. Designed for tiny mobile thumbnails.',
    lighting: 'Dramatic side lighting, high contrast',
    composition: 'Product dominates frame, bold negative space',
    style: 'Advertising bold, stops scrollers'
  },

  'instagram-ad-vertical': {
    aspectRatio: '9:16',
    useCase: 'Instagram Stories ad, vertical format',
    prompt: 'Vertical composition of {{PRODUCT_NAME}} with hands in frame showing scale/use. Blurred lifestyle background. Text-safe zones top and bottom. Eye-level perspective for intimacy.',
    lighting: 'Soft natural light, flattering',
    composition: 'Hands + product center, safe zones for text',
    style: 'Native Instagram Stories aesthetic'
  },

  'website-hero-banner': {
    aspectRatio: '21:9',
    useCase: 'Website hero banner, cinematic landscape',
    prompt: 'Cinematic ultra-wide shot of {{PRODUCT_NAME}} in epic environmental context. Dramatic lighting, massive negative space for headline text. Product small but identifiable, mood is everything.',
    lighting: 'Cinematic (golden hour or moody)',
    composition: 'Rule of thirds, product in lower/side third, sky/space dominates',
    style: 'Cinematic brand film aesthetic'
  },

  'social-feed-square': {
    aspectRatio: '1:1',
    useCase: 'Instagram feed post, polished editorial',
    prompt: 'Gallery-worthy shot of {{PRODUCT_NAME}} with editorial styling. Carefully curated props, tonal harmony, considered composition. Looks like it belongs in a design magazine.',
    lighting: 'Editorial perfect lighting',
    composition: 'Artfully arranged, balanced',
    style: 'Editorial luxury, Kinfolk magazine'
  },

  'tiktok-product': {
    aspectRatio: '9:16',
    useCase: 'TikTok product showcase, dynamic vertical',
    prompt: 'Dynamic vertical shot of {{PRODUCT_NAME}} with trendy props and textures. Bright colorful lighting, youthful energy, shows product clearly but with personality. Gen-Z aesthetic.',
    lighting: 'Bright, saturated, colorful',
    composition: 'Vertical, product fills frame with energy',
    style: 'TikTok native, youthful and bold'
  },

  'ritual-process-vertical': {
    aspectRatio: '9:16',
    useCase: 'Short-form video stills showing the ritual of product use',
    prompt: 'Cinematic vertical shot of hands slowly applying {{PRODUCT_NAME}}, captured mid-ritual. Warm side lighting, film grain texture. Focus on hands + product, blurred background suggests bathroom sanctuary. Intimate personal moment.',
    lighting: 'Warm directional light (candle-like), film grain',
    composition: 'Vertical, hands center, shallow depth',
    style: 'Cinematic ritual, analog film grain'
  }
};

export type ImagePromptType = keyof typeof IMAGE_PROMPT_TEMPLATES;

export const GOAL_TEMPLATES_MAP: Record<string, ImagePromptType[]> = {
  'etsy-listing': ['etsy-listing', 'etsy-lifestyle', 'product-page'],
  'facebook-ad': ['facebook-ad', 'instagram-ad-vertical', 'social-square'],
  'instagram-post': ['social-feed-square', 'instagram-stories', 'lifestyle-sanctuary'],
  'website-hero': ['website-hero-banner', 'homepage-hero', 'collection-overview'],
  'social-post': ['instagram-stories', 'social-square', 'ritual-process-vertical']
};

export function getTemplatesForGoal(goal: string): ImagePromptType[] {
  return GOAL_TEMPLATES_MAP[goal] || ['product-page', 'social-square', 'homepage-hero'];
}

/**
 * Build a complete image generation prompt based on product details and template
 * Supports placeholders for reusability: {{PRODUCT_NAME}}, {{CUSTOM_INSTRUCTIONS}}
 */
export function buildImagePrompt(
  productName: string,
  template: ImagePromptType,
  customInstructions?: string,
  usePlaceholders: boolean = false
): string {
  const guideline = IMAGE_PROMPT_TEMPLATES[template];
  
  let prompt = guideline.prompt;
  
  // Use placeholder or actual product name
  if (usePlaceholders) {
    prompt = prompt.replace(/attar bottle/gi, `{{PRODUCT_NAME}} attar bottle`);
  } else {
    prompt = prompt.replace(/attar bottle/gi, `${productName} attar bottle`);
  }
  
  // Add technical specifications
  prompt += `\n\nAspect Ratio: ${guideline.aspectRatio}`;
  prompt += `\nLighting: ${guideline.lighting}`;
  prompt += `\nComposition: ${guideline.composition}`;
  prompt += `\nStyle: ${guideline.style}`;
  
  // Add custom instructions or placeholder
  if (usePlaceholders) {
    prompt += `\n\nAdditional Instructions: {{CUSTOM_INSTRUCTIONS}}`;
  } else if (customInstructions) {
    prompt += `\n\nAdditional Instructions: ${customInstructions}`;
  }
  
  return prompt;
}
