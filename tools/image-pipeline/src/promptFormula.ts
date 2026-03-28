/**
 * Prompt Formula System - Shot Types, Camera, Lighting, Environment
 *
 * Extracted from Madison Studio. Provides structured prompt components
 * for photorealistic AI image generation.
 */

export interface PromptComponents {
  shotType?: string;
  subject?: string;
  action?: string;
  environment?: string;
  colorScheme?: string;
  camera?: string;
  lighting?: string;
  mood?: string;
  additionalDetails?: string;
}

export interface BrandContext {
  colors?: string[];
  styleKeywords?: string[];
  productName?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHOT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const SHOT_TYPES = {
  PRODUCT: {
    CLOSE_UP: "extreme close-up product shot",
    HERO: "hero product photography shot",
    LIFESTYLE: "lifestyle product photography",
    FLAT_LAY: "flat lay overhead shot",
    "3_4_ANGLE": "3/4 angle product view",
    SIDE_PROFILE: "side profile shot",
    FRONT_VIEW: "straight-on front view",
    "360_VIEW": "360-degree rotational view"
  },
  SCENE: {
    WIDE: "wide-angle environmental shot",
    MEDIUM: "medium shot with context",
    DETAIL: "detail-focused close shot"
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// CAMERA & LENS PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const CAMERA_LENS = {
  PROFESSIONAL: {
    DSLR_SHALLOW: "Canon EOS R5 with 35mm f/1.4 lens, shallow depth of field (f/1.4-f/2), creamy bokeh, professional DSLR quality",
    DSLR_SHARP: "Canon EOS R5 with 50mm f/1.8 lens, sharp focus throughout (f/8-f/11), professional DSLR clarity",
    MACRO: "Canon RF 100mm f/2.8L Macro lens, extreme close-up detail (1:1 magnification), f/2.8 aperture, razor-sharp subject isolation",
    WIDE: "Canon RF 24mm f/1.4L lens, wide-angle perspective, environmental context, f/5.6 aperture for sharpness",
    TELEPHOTO: "Canon RF 85mm f/1.2L lens, portrait compression, ultra-shallow depth of field (f/1.2), professional bokeh",
    NIKON_SHALLOW: "Nikon Z9 with 50mm f/1.2 lens, ultra-shallow depth of field, creamy bokeh, cinematic look",
    SONY_SHARP: "Sony A7R IV with 85mm f/1.4 GM lens, tack-sharp focus, professional portrait quality"
  },
  FILM: {
    POLAROID: "Polaroid SX-70 instant film aesthetic, square format, soft vintage colors, slight vignette, nostalgic warmth",
    "35MM_FILM": "35mm film camera with Kodak Portra 400, film grain texture, natural color reproduction, analog warmth",
    MEDIUM_FORMAT: "Hasselblad 500C/M medium format film, 6x6 square format, exceptional detail and tonal range, professional film aesthetic",
    CINESTILL: "35mm CineStill 800T film, halation glow around lights, cinematic color grading, night photography aesthetic",
    FUJIFILM: "Fujifilm X100V with 23mm f/2 lens, classic chrome film simulation, street photography aesthetic"
  },
  MOBILE: {
    IPHONE: "iPhone 14 Pro portrait mode, computational photography, natural depth blur, smartphone quality",
    ANDROID: "Google Pixel 7 Pro camera, computational HDR+, vibrant color processing, modern smartphone aesthetic"
  },
  SPECIALTY: {
    LEICA: "Leica M11 rangefinder with 50mm Summilux f/1.4 lens, classic rangefinder rendering, exceptional color and contrast",
    HASSELBLAD_DIGITAL: "Hasselblad X2D 100C medium format digital, 100MP resolution, exceptional detail and color depth",
    PHASE_ONE: "Phase One XF IQ4 150MP, medium format digital back, maximum resolution and tonal range"
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTING PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const LIGHTING = {
  NATURAL: {
    GOLDEN_HOUR: "warm golden hour sunlight, soft shadows",
    OVERCAST: "diffused overcast natural light",
    BACKLIT: "dramatic backlighting, rim light",
    SIDE_LIT: "soft side lighting from window"
  },
  STUDIO: {
    SOFT_BOX: "soft box studio lighting, even illumination",
    DRAMATIC: "dramatic studio lighting with hard shadows",
    THREE_POINT: "professional three-point lighting setup",
    MINIMALIST: "clean minimalist studio lighting"
  },
  AMBIENT: {
    CANDLE: "warm candlelight ambiance",
    SUNSET: "warm sunset glow",
    MORNING: "cool morning light"
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const ENVIRONMENTS = {
  SURFACES: {
    MARBLE: "white marble surface",
    WOOD: "rustic wooden table",
    SANDSTONE: "weathered sandstone blocks",
    CONCRETE: "textured concrete platform",
    FABRIC: "draped silk fabric background"
  },
  SETTINGS: {
    MINIMALIST: "clean white minimalist background",
    LUXURY: "luxury editorial setting with gold accents",
    BOTANICAL: "botanical garden setting with natural elements",
    DESERT: "desert landscape with natural textures",
    STUDIO: "professional studio setup, seamless backdrop"
  },
  CONTEXTS: {
    VANITY: "luxury vanity table setup",
    GARDEN: "imperial garden setting",
    WORKSHOP: "artisan workshop environment"
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// USE CASES (what the user is creating)
// ═══════════════════════════════════════════════════════════════════════════════

export const USE_CASES = {
  product_shot: {
    label: "Product Shot",
    description: "E-commerce product listings (Shopify, Etsy, Amazon)",
    defaultAspectRatio: "5:4",
    aspectRatioOptions: ["1:1", "4:3", "5:4", "4:5"],
    recommendedStyles: ["product_on_white", "reflective_surface"],
  },
  hero_image: {
    label: "Hero Image",
    description: "Website homepage hero banners",
    defaultAspectRatio: "16:9",
    aspectRatioOptions: ["16:9", "21:9", "4:3"],
    recommendedStyles: ["editorial_luxury", "lifestyle_scene"],
  },
  mobile_hero: {
    label: "Mobile Hero",
    description: "Mobile app or mobile-first hero images",
    defaultAspectRatio: "9:16",
    aspectRatioOptions: ["9:16", "4:5", "1:1"],
    recommendedStyles: ["lifestyle_scene", "natural_setting"],
  },
  social_media: {
    label: "Social Media",
    description: "Instagram, Facebook, TikTok posts",
    defaultAspectRatio: "1:1",
    aspectRatioOptions: ["1:1", "4:5", "9:16", "16:9"],
    recommendedStyles: ["lifestyle_scene", "natural_setting", "flat_lay"],
  },
  editorial: {
    label: "Editorial",
    description: "Magazines, blogs, press releases",
    defaultAspectRatio: "4:3",
    aspectRatioOptions: ["4:3", "16:9", "3:2"],
    recommendedStyles: ["editorial_luxury", "lifestyle_scene"],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE STYLE PRESETS (how the image looks)
// ═══════════════════════════════════════════════════════════════════════════════

export const IMAGE_STYLES = {
  product_on_white: {
    label: "Product on White",
    prompt: "A clean studio product shot on a pure white background, soft shadow, high-resolution lighting.",
    description: "Classic e-commerce ready imagery with crisp lighting.",
  },
  reflective_surface: {
    label: "Reflective Surface",
    prompt: "A luxury product photo on a glossy marble or mirrored surface with balanced reflections.",
    description: "High-shine compositions with polished surfaces.",
  },
  prop_styled: {
    label: "Prop Styled",
    prompt: "Product displayed on a styled pedestal or themed surface with carefully selected props that enhance the product's aesthetic.",
    description: "Themed compositions with props, pedestals, and styled surfaces.",
  },
  lifestyle_scene: {
    label: "Lifestyle Scene",
    prompt: "A lifestyle product photo placed in a cozy real-world environment that matches the brand mood.",
    description: "Real-world scenes showing the product in use.",
  },
  natural_setting: {
    label: "Natural Setting",
    prompt: "Product displayed outdoors on natural surfaces like stone or wood with diffused daylight.",
    description: "Organic textures, daylight, and nature-inspired styling.",
  },
  editorial_luxury: {
    label: "Editorial Luxury",
    prompt: "High-end editorial perfume shot, dramatic lighting, deep contrast, cinematic tone.",
    description: "Magazine-worthy styling with dramatic light.",
  },
  flat_lay: {
    label: "Flat Lay",
    prompt: "Flat lay arrangement shot from above, thoughtfully styled props, balanced composition, crisp diffused lighting.",
    description: "Overhead compositions with styled props.",
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

export function buildPromptFromComponents(
  components: PromptComponents,
  brandContext?: BrandContext
): string {
  const parts: string[] = [];

  if (components.shotType) parts.push(components.shotType);

  const subjectParts: string[] = [];
  if (components.subject) subjectParts.push(components.subject);
  if (components.action) subjectParts.push(components.action);
  if (subjectParts.length > 0) parts.push(subjectParts.join(" "));

  if (components.environment) parts.push(components.environment);

  let colorInfo = components.colorScheme || "";
  if (brandContext?.colors && brandContext.colors.length > 0) {
    colorInfo = `${brandContext.colors.join(", ")} color palette${colorInfo ? ", " + colorInfo : ""}`;
  }
  if (colorInfo) parts.push(colorInfo);

  if (components.camera) parts.push(components.camera);
  if (components.lighting) parts.push(components.lighting);
  if (components.mood) parts.push(components.mood);

  if (brandContext?.styleKeywords && brandContext.styleKeywords.length > 0) {
    parts.push(`aesthetic: ${brandContext.styleKeywords.join(", ")}`);
  }

  if (components.additionalDetails) parts.push(components.additionalDetails);

  return parts.filter(Boolean).join(", ");
}

/**
 * Get all camera options as a flat list for CLI selection
 */
export function getCameraOptions() {
  return Object.entries(CAMERA_LENS).flatMap(([category, lenses]) =>
    Object.entries(lenses).map(([key, value]) => ({
      value: `${category}.${key}`,
      label: value.split(',')[0].trim(),
      full: value
    }))
  );
}

/**
 * Get all lighting options as a flat list
 */
export function getLightingOptions() {
  return Object.entries(LIGHTING).flatMap(([category, lights]) =>
    Object.entries(lights).map(([key, value]) => ({
      value: `${category}.${key}`,
      label: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
      full: value
    }))
  );
}

/**
 * Get all environment options as a flat list
 */
export function getEnvironmentOptions() {
  return Object.entries(ENVIRONMENTS).flatMap(([category, envs]) =>
    Object.entries(envs).map(([key, value]) => ({
      value: `${category}.${key}`,
      label: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' '),
      full: value
    }))
  );
}
