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
  }
};

export type ImagePromptType = keyof typeof IMAGE_PROMPT_TEMPLATES;

/**
 * Build a complete image generation prompt based on product details and template
 */
export function buildImagePrompt(
  productName: string,
  template: ImagePromptType,
  customInstructions?: string
): string {
  const guideline = IMAGE_PROMPT_TEMPLATES[template];
  
  let prompt = guideline.prompt;
  
  // Inject product name into the prompt
  prompt = prompt.replace(/attar bottle/gi, `${productName} attar bottle`);
  
  // Add technical specifications
  prompt += `\n\nAspect Ratio: ${guideline.aspectRatio}`;
  prompt += `\nLighting: ${guideline.lighting}`;
  prompt += `\nComposition: ${guideline.composition}`;
  prompt += `\nStyle: ${guideline.style}`;
  
  // Add custom instructions if provided
  if (customInstructions) {
    prompt += `\n\nAdditional Instructions: ${customInstructions}`;
  }
  
  return prompt;
}
