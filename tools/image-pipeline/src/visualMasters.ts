/**
 * VISUAL MASTERS - Art Direction System
 *
 * Extracted from Madison Studio's visual squad system.
 * 3 visual squads with hardcoded art direction for AI image generation.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type VisualSquad = 'THE_MINIMALISTS' | 'THE_STORYTELLERS' | 'THE_DISRUPTORS';

export interface VisualStrategy {
  visualSquad: VisualSquad;
  primaryVisualMaster: string;
  secondaryVisualMaster?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL SQUAD DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const VISUAL_SQUAD_DEFINITIONS = `
━━━ THE MINIMALISTS ━━━
Philosophy: "Less is more. The product IS the hero."
Best for: Luxury skincare, tech products, high-price items, clinical positioning
Masters: AVEDON_ISOLATION — Stark white backgrounds, clinical precision, soft directional light
Style: Clean, precise, editorial, timeless
Avoid: Cluttered backgrounds, lifestyle props, warm color grading

━━━ THE STORYTELLERS ━━━
Philosophy: "Context creates desire. Show the life, not just the product."
Best for: Fragrance, candles, lifestyle brands, emotional products, heritage brands
Masters: LEIBOVITZ_ENVIRONMENT — Natural settings, warm window light, intimate atmosphere
Style: Lifestyle, editorial, magazine quality, film grain
Avoid: Clinical white backgrounds, harsh lighting, isolated products

━━━ THE DISRUPTORS ━━━
Philosophy: "Stop the scroll. Bold beats beautiful."
Best for: Social ads, TikTok, launches, attention-grabbing visuals
Masters:
  RICHARDSON_RAW — Direct flash, high contrast, raw energy, 90s aesthetic
  ANDERSON_SYMMETRY — Hyper-symmetry, bold colors, centered compositions
Style: Bold, graphic, high-contrast, scroll-stopping
Avoid: Subtle compositions, muted colors, traditional product photography
`;

// ═══════════════════════════════════════════════════════════════════════════════
// PLATFORM-SPECIFIC IMAGE SPECS
// ═══════════════════════════════════════════════════════════════════════════════

export interface PlatformImageSpec {
  aspectRatio: string;
  resolution: string;
  maxFileSize: string;
  notes: string;
}

export const PLATFORM_IMAGE_SPECS: Record<string, PlatformImageSpec> = {
  'instagram_feed': {
    aspectRatio: '1:1 (square) or 4:5 (portrait)',
    resolution: '1080x1080 (square) or 1080x1350 (portrait)',
    maxFileSize: '30MB',
    notes: 'Portrait (4:5) gets more screen real estate. Square for consistency.'
  },
  'instagram_story': {
    aspectRatio: '9:16 (vertical)',
    resolution: '1080x1920',
    maxFileSize: '30MB',
    notes: 'Full-screen vertical. Keep key content in safe zone (center 60%).'
  },
  'facebook_feed': {
    aspectRatio: '1:1 or 4:5',
    resolution: '1200x1200 (square) or 1200x1500 (portrait)',
    maxFileSize: '30MB',
    notes: '1:1 is safest. 4:5 for mobile-first.'
  },
  'facebook_ad': {
    aspectRatio: '1:1 (feed), 9:16 (stories), 16:9 (video)',
    resolution: '1080x1080 minimum',
    maxFileSize: '30MB',
    notes: 'Less than 20% text on image for best delivery.'
  },
  'linkedin_post': {
    aspectRatio: '1.91:1 (landscape) or 1:1 (square)',
    resolution: '1200x627 (landscape) or 1200x1200 (square)',
    maxFileSize: '8MB',
    notes: 'Landscape is default link preview. Square for standalone.'
  },
  'twitter_post': {
    aspectRatio: '16:9 or 1:1',
    resolution: '1200x675 (landscape) or 1200x1200 (square)',
    maxFileSize: '5MB (GIF: 15MB)',
    notes: 'Single image: 16:9. Multi-image: square.'
  },
  'pinterest_pin': {
    aspectRatio: '2:3 (vertical)',
    resolution: '1000x1500',
    maxFileSize: '32MB',
    notes: 'Vertical performs best. Include text overlay for context.'
  },
  'tiktok_cover': {
    aspectRatio: '9:16',
    resolution: '1080x1920',
    maxFileSize: '287.6MB video',
    notes: 'Cover image for video thumbnail.'
  },
  'youtube_thumbnail': {
    aspectRatio: '16:9',
    resolution: '1280x720 minimum (1920x1080 recommended)',
    maxFileSize: '2MB',
    notes: 'High contrast, readable text, expressive faces perform best.'
  },
  'hero_banner_wide': {
    aspectRatio: '21:9 (ultrawide)',
    resolution: '2520x1080',
    maxFileSize: 'No limit for web',
    notes: 'Desktop hero banners, cinematic feel. Keep subject centered for mobile crop.'
  },
  'hero_banner_standard': {
    aspectRatio: '2:1',
    resolution: '2000x1000',
    maxFileSize: 'No limit for web',
    notes: 'Standard website hero. Works well across devices.'
  },
  'hero_banner_16x9': {
    aspectRatio: '16:9',
    resolution: '1920x1080',
    maxFileSize: 'No limit for web',
    notes: 'Video-friendly aspect ratio. YouTube covers, presentations.'
  },
  'product_hero': {
    aspectRatio: '1:1 or 4:3',
    resolution: '2000x2000 minimum',
    maxFileSize: 'No limit for web',
    notes: 'High-res for zoom. White or lifestyle background.'
  },
  'product_detail': {
    aspectRatio: '1:1',
    resolution: '1000x1000 minimum',
    maxFileSize: 'No limit for web',
    notes: 'Close-up details, texture shots.'
  },
  'product_lifestyle': {
    aspectRatio: '4:5 or 3:4',
    resolution: '1500x1875 (4:5) or 1500x2000 (3:4)',
    maxFileSize: 'No limit for web',
    notes: 'Product in context/use. Environmental setting.'
  },
  'shopify_product': {
    aspectRatio: '1:1 (recommended)',
    resolution: '2048x2048 (zoom enabled)',
    maxFileSize: '20MB',
    notes: 'Square for consistency. Minimum 800x800 for zoom.'
  },
  'etsy_listing': {
    aspectRatio: '4:3',
    resolution: '2000x1500 minimum',
    maxFileSize: '20MB',
    notes: 'First image is most important. Variety of angles.'
  },
  'amazon_main': {
    aspectRatio: '1:1',
    resolution: '2000x2000 minimum',
    maxFileSize: '10MB',
    notes: 'Pure white background required. Product fills 85% of frame.'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENT TYPE TO VISUAL SQUAD MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

export const VISUAL_CONTENT_TO_SQUAD: Record<string, VisualSquad> = {
  'product_hero': 'THE_MINIMALISTS',
  'product_detail': 'THE_MINIMALISTS',
  'product_lifestyle': 'THE_STORYTELLERS',
  'instagram_feed': 'THE_STORYTELLERS',
  'instagram_story': 'THE_DISRUPTORS',
  'instagram_reel': 'THE_DISRUPTORS',
  'facebook_feed': 'THE_STORYTELLERS',
  'facebook_ad': 'THE_DISRUPTORS',
  'linkedin_post': 'THE_MINIMALISTS',
  'twitter_post': 'THE_DISRUPTORS',
  'pinterest_pin': 'THE_STORYTELLERS',
  'tiktok_cover': 'THE_DISRUPTORS',
  'youtube_thumbnail': 'THE_DISRUPTORS',
  'shopify_product': 'THE_MINIMALISTS',
  'etsy_listing': 'THE_STORYTELLERS',
  'amazon_main': 'THE_MINIMALISTS',
  'campaign_hero': 'THE_STORYTELLERS',
  'ad_creative': 'THE_DISRUPTORS',
  'email_hero': 'THE_STORYTELLERS',
  'landing_page_hero': 'THE_DISRUPTORS',
  'default': 'THE_STORYTELLERS'
};

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL STYLE DIRECTIVES (The actual prompt injection)
// ═══════════════════════════════════════════════════════════════════════════════

export function getVisualStyleDirective(squad: VisualSquad): string {
  switch (squad) {
    case 'THE_MINIMALISTS':
      return `
VISUAL STYLE: THE MINIMALISTS — "Less is more. Product as hero."

MANDATORY STYLE REQUIREMENTS:
BACKGROUND: Pure white (#FFFFFF) or neutral gray gradient. NO environmental props.
LIGHTING: Soft, diffused studio lighting. Even illumination. No harsh shadows.
COMPOSITION: Product centered, breathing room, negative space emphasized.
MOOD: Clinical, precise, editorial, timeless, sophisticated.
COLOR GRADING: Cool tones, desaturated, clean whites.

DO:
- Place product on pure white or light gray seamless background
- Use soft directional light from above-left (Avedon style)
- Keep composition minimal - product only, no props
- Emphasize product details and craftsmanship
- Sharp focus, high clarity

DO NOT:
- Add lifestyle props (books, plants, fabric, wood surfaces)
- Use warm color grading
- Include environmental context
- Add texture to background
- Use dramatic shadows

REFERENCE: Think Apple product photography, luxury skincare campaigns, Richard Avedon portraits.
`;

    case 'THE_STORYTELLERS':
      return `
VISUAL STYLE: THE STORYTELLERS — "Context creates desire."

MANDATORY STYLE REQUIREMENTS:
BACKGROUND: Natural environment, lifestyle setting, lived-in spaces.
LIGHTING: Warm window light, golden hour, soft natural illumination.
COMPOSITION: Product in context, environmental storytelling, magazine editorial.
MOOD: Warm, inviting, aspirational, intimate, nostalgic.
COLOR GRADING: Warm tones, golden highlights, rich shadows, film-like.

DO:
- Place product in a natural, lived-in environment
- Use warm, directional window light (Leibovitz style)
- Include lifestyle props (wood surfaces, fabric, books, botanicals)
- Create atmosphere and mood
- Add subtle film grain for editorial feel
- Show product being used or in context

DO NOT:
- Use pure white backgrounds
- Use harsh studio lighting
- Isolate product completely
- Use cool/clinical color grading
- Make it look like e-commerce

REFERENCE: Think Vanity Fair editorials, Annie Leibovitz environmental portraits, luxury fragrance campaigns.
`;

    case 'THE_DISRUPTORS':
      return `
VISUAL STYLE: THE DISRUPTORS — "Stop the scroll. Bold beats beautiful."

MANDATORY STYLE REQUIREMENTS:
BACKGROUND: Bold solid color, dramatic gradient, or high-contrast scene.
LIGHTING: Direct flash, hard light, dramatic shadows, high contrast.
COMPOSITION: Dynamic angles, bold framing, unexpected crops, graphic impact.
MOOD: Energetic, bold, provocative, attention-grabbing, raw.
COLOR GRADING: High contrast, saturated colors, punchy, bold.

DO:
- Use bold, solid color backgrounds (black, deep blue, vibrant colors)
- Add dramatic lighting with hard shadows
- Create high contrast imagery
- Use unexpected angles (low angle, Dutch angle)
- Make it scroll-stopping and attention-grabbing
- Add motion blur or action elements if appropriate

DO NOT:
- Use soft, diffused lighting
- Create muted, subtle compositions
- Use beige/neutral backgrounds
- Make it look traditional or safe
- Use warm, cozy aesthetics

REFERENCE: Think Terry Richardson flash photography, Wes Anderson symmetry, Nike ads, TikTok viral content.
`;

    default:
      return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUAL SQUAD ROUTING
// ═══════════════════════════════════════════════════════════════════════════════

export function routeToVisualSquad(
  imageType: string,
  brief: string,
): VisualStrategy {
  const briefLower = brief.toLowerCase();

  if (briefLower.includes('minimal') || briefLower.includes('white background') || briefLower.includes('clinical') || briefLower.includes('clean')) {
    return { visualSquad: 'THE_MINIMALISTS', primaryVisualMaster: 'AVEDON_ISOLATION' };
  }

  if (briefLower.includes('lifestyle') || briefLower.includes('natural') || briefLower.includes('warm') || briefLower.includes('cozy')) {
    return { visualSquad: 'THE_STORYTELLERS', primaryVisualMaster: 'LEIBOVITZ_ENVIRONMENT' };
  }

  if (briefLower.includes('bold') || briefLower.includes('scroll') || briefLower.includes('attention') || briefLower.includes('ad') || briefLower.includes('tiktok')) {
    const isSymmetric = briefLower.includes('symmetr') || briefLower.includes('flat lay') || briefLower.includes('overhead');
    return {
      visualSquad: 'THE_DISRUPTORS',
      primaryVisualMaster: isSymmetric ? 'ANDERSON_SYMMETRY' : 'RICHARDSON_RAW'
    };
  }

  const mappedSquad = VISUAL_CONTENT_TO_SQUAD[imageType] || VISUAL_CONTENT_TO_SQUAD['default'];

  let primaryMaster: string;
  switch (mappedSquad) {
    case 'THE_MINIMALISTS':
      primaryMaster = 'AVEDON_ISOLATION';
      break;
    case 'THE_STORYTELLERS':
      primaryMaster = 'LEIBOVITZ_ENVIRONMENT';
      break;
    case 'THE_DISRUPTORS':
      primaryMaster = imageType.includes('flat') || imageType.includes('overhead')
        ? 'ANDERSON_SYMMETRY'
        : 'RICHARDSON_RAW';
      break;
    default:
      primaryMaster = 'LEIBOVITZ_ENVIRONMENT';
  }

  return { visualSquad: mappedSquad, primaryVisualMaster: primaryMaster };
}

/**
 * Get visual master context for image generation (standalone — no DB needed)
 */
export function getVisualMasterContext(
  imageType: string,
  brief: string,
): { strategy: VisualStrategy; directive: string; platformSpec?: PlatformImageSpec } {
  const strategy = routeToVisualSquad(imageType, brief);
  const directive = getVisualStyleDirective(strategy.visualSquad);
  const platformSpec = PLATFORM_IMAGE_SPECS[imageType];

  return { strategy, directive, platformSpec };
}
