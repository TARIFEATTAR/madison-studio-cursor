/**
 * Advanced Prompt Formulation System
 * Based on core controllable variables for photorealistic image generation
 * 
 * Structure: [Shot Type], [Subject/Action], [Environment], [Color/Tone], 
 *           [Camera/Lens], [Lighting], [Mood/Effect]
 */

export interface PromptComponents {
  shotType?: string;
  subject?: string;
  action?: string;
  environment?: string;
  colorScheme?: string;
  camera?: string;
  lens?: string;
  lighting?: string;
  mood?: string;
  additionalDetails?: string;
}

export interface BrandContext {
  colors?: string[];
  styleKeywords?: string[];
  voiceTone?: string;
  productName?: string;
}

/**
 * Shot Type Presets
 * Defines perspective, location, and capture method
 */
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

/**
 * Camera & Lens Presets with Professional Specifications
 * Each preset includes technical details for photorealistic AI generation
 */
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

/**
 * Lighting Presets
 */
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

/**
 * Environment Presets for E-commerce/Product
 */
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

/**
 * Build a structured prompt following the formula
 */
export function buildPromptFromComponents(
  components: PromptComponents,
  brandContext?: BrandContext
): string {
  const parts: string[] = [];

  // Shot Type (Perspective & Capture)
  if (components.shotType) {
    parts.push(components.shotType);
  }

  // Subject & Action
  const subjectParts: string[] = [];
  if (components.subject) subjectParts.push(components.subject);
  if (components.action) subjectParts.push(components.action);
  if (subjectParts.length > 0) {
    parts.push(subjectParts.join(" "));
  }

  // Environment
  if (components.environment) {
    parts.push(components.environment);
  }

  // Color Scheme (Brand colors override)
  let colorInfo = components.colorScheme || "";
  if (brandContext?.colors && brandContext.colors.length > 0) {
    colorInfo = `${brandContext.colors.join(", ")} color palette${colorInfo ? ", " + colorInfo : ""}`;
  }
  if (colorInfo) {
    parts.push(colorInfo);
  }

  // Camera & Lens
  const cameraLensParts: string[] = [];
  if (components.camera) cameraLensParts.push(components.camera);
  if (components.lens) cameraLensParts.push(components.lens);
  if (cameraLensParts.length > 0) {
    parts.push(cameraLensParts.join(", "));
  }

  // Lighting
  if (components.lighting) {
    parts.push(components.lighting);
  }

  // Mood & Effect
  if (components.mood) {
    parts.push(components.mood);
  }

  // Brand Voice/Aesthetic (if provided)
  if (brandContext?.styleKeywords && brandContext.styleKeywords.length > 0) {
    parts.push(`aesthetic: ${brandContext.styleKeywords.join(", ")}`);
  }

  // Additional Details
  if (components.additionalDetails) {
    parts.push(components.additionalDetails);
  }

  return parts.filter(Boolean).join(", ");
}

/**
 * Extract scene description from user input and enhance with formula
 * This analyzes user input and structures it according to the formula
 */
export function enhanceUserPromptWithFormula(
  userPrompt: string,
  brandContext?: BrandContext
): string {
  const lowerPrompt = userPrompt.toLowerCase();

  // Try to extract components from user's natural language
  const components: PromptComponents = {
    additionalDetails: userPrompt // Start with their full prompt
  };

  // Detect shot type keywords
  if (lowerPrompt.includes("close-up") || lowerPrompt.includes("closeup")) {
    components.shotType = SHOT_TYPES.PRODUCT.CLOSE_UP;
  } else if (lowerPrompt.includes("hero")) {
    components.shotType = SHOT_TYPES.PRODUCT.HERO;
  } else if (lowerPrompt.includes("flat lay")) {
    components.shotType = SHOT_TYPES.PRODUCT.FLAT_LAY;
  }

  // Detect lighting keywords
  if (lowerPrompt.includes("golden hour") || lowerPrompt.includes("sunset")) {
    components.lighting = LIGHTING.NATURAL.GOLDEN_HOUR;
  } else if (lowerPrompt.includes("studio lighting")) {
    components.lighting = LIGHTING.STUDIO.THREE_POINT;
  } else if (lowerPrompt.includes("soft light")) {
    components.lighting = LIGHTING.STUDIO.SOFT_BOX;
  }

  // Detect camera/lens if mentioned
  if (lowerPrompt.includes("35mm") || lowerPrompt.includes("shallow")) {
    components.camera = CAMERA_LENS.PROFESSIONAL.DSLR_SHALLOW;
  } else if (lowerPrompt.includes("macro")) {
    components.camera = CAMERA_LENS.PROFESSIONAL.MACRO;
  }

  // For now, if no components were detected, return enhanced version with brand context
  if (!components.shotType && !components.lighting && !components.camera) {
    // User gave natural description, enhance it with brand elements
    let enhanced = userPrompt;
    
    if (brandContext?.colors && brandContext.colors.length > 0) {
      enhanced += `, incorporating ${brandContext.colors.join(" and ")} tones`;
    }
    
    if (brandContext?.styleKeywords && brandContext.styleKeywords.length > 0) {
      enhanced += `, ${brandContext.styleKeywords.join(", ")} aesthetic`;
    }
    
    return enhanced;
  }

  // Build structured prompt from detected components
  return buildPromptFromComponents(components, brandContext);
}

/**
 * Product Placement Prompt Builder
 * Specialized for placing reference products into new scenes
 */
export function buildProductPlacementPrompt(
  sceneDescription: string,
  brandContext?: BrandContext
): string {
  // Apply formula enhancement to the scene description
  const enhancedScene = enhanceUserPromptWithFormula(sceneDescription, brandContext);

  return `PRODUCT PLACEMENT INSTRUCTION:
The reference image shows a product (bottle, item, object). Take this EXACT product and place it into the scene described below. Maintain the product's appearance, colors, shape, and design exactly as shown in the reference image.

SCENE TO CREATE:
${enhancedScene}

PHOTOGRAPHIC REQUIREMENTS:
- The product should be the focal point and hero of the composition
- Maintain photorealistic quality with careful attention to lighting and shadows
- Ensure proper depth of field and perspective
- Product must be clearly visible and well-lit
- Background elements should complement, not compete with the product

IMPORTANT: Do not regenerate or alter the product - use it as-is from the reference image. Only the scene, environment, and context around it should change.`;
}

/**
 * Get camera/lens options for Pro Mode selector
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
 * Get lighting options for Pro Mode selector
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
 * Get environment options for Pro Mode selector
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
