/**
 * Photography Ontology - Professional Camera & Lighting Specifications
 *
 * Extracted from Madison Studio. Maps Pro Mode controls to
 * professional photography terminology for AI image prompts.
 */

export interface ProModeControls {
  camera?: string;
  lighting?: string;
  environment?: string;
}

export interface PhotographySpecs {
  lightingSetup?: string;
  lightQuality?: string;
  contrastRatio?: string;
  moodPalette?: string;
  atmosphere?: boolean;
  lensCharacter?: string;
  cameraSpec?: string;
  surfaceType?: string;
  environmentSetting?: string;
}

// ============================================
// CAMERA/LENS MAPPINGS
// ============================================
export const CAMERA_FULL_SPECS: Record<string, string> = {
  "PROFESSIONAL.DSLR_SHALLOW": "Canon EOS R5 with 35mm f/1.4 lens, shallow depth of field (f/1.4-f/2), creamy bokeh, professional DSLR quality",
  "PROFESSIONAL.DSLR_SHARP": "Canon EOS R5 with 50mm f/1.8 lens, sharp focus throughout (f/8-f/11), professional DSLR clarity",
  "PROFESSIONAL.MACRO": "Canon RF 100mm f/2.8L Macro lens, extreme close-up detail (1:1 magnification), f/2.8 aperture, razor-sharp subject isolation",
  "PROFESSIONAL.WIDE": "Canon RF 24mm f/1.4L lens, wide-angle perspective, environmental context, f/5.6 aperture for sharpness",
  "PROFESSIONAL.TELEPHOTO": "Canon RF 85mm f/1.2L lens, portrait compression, ultra-shallow depth of field (f/1.2), professional bokeh",
  "PROFESSIONAL.NIKON_SHALLOW": "Nikon Z9 with 50mm f/1.2 lens, ultra-shallow depth of field, creamy bokeh, cinematic look",
  "PROFESSIONAL.SONY_SHARP": "Sony A7R IV with 85mm f/1.4 GM lens, tack-sharp focus, professional portrait quality",
  "FILM.POLAROID": "Polaroid SX-70 instant film aesthetic, square format, soft vintage colors, slight vignette, nostalgic warmth",
  "FILM.35MM_FILM": "35mm film camera with Kodak Portra 400, film grain texture, natural color reproduction, analog warmth",
  "FILM.MEDIUM_FORMAT": "Hasselblad 500C/M medium format film, 6x6 square format, exceptional detail and tonal range, professional film aesthetic",
  "FILM.CINESTILL": "35mm CineStill 800T film, halation glow around lights, cinematic color grading, night photography aesthetic",
  "FILM.FUJIFILM": "Fujifilm X100V with 23mm f/2 lens, classic chrome film simulation, street photography aesthetic",
  "MOBILE.IPHONE": "iPhone 14 Pro portrait mode, computational photography, natural depth blur, smartphone quality",
  "MOBILE.ANDROID": "Google Pixel 7 Pro camera, computational HDR+, vibrant color processing, modern smartphone aesthetic",
  "SPECIALTY.LEICA": "Leica M11 rangefinder with 50mm Summilux f/1.4 lens, classic rangefinder rendering, exceptional color and contrast",
  "SPECIALTY.HASSELBLAD_DIGITAL": "Hasselblad X2D 100C medium format digital, 100MP resolution, exceptional detail and color depth",
  "SPECIALTY.PHASE_ONE": "Phase One XF IQ4 150MP, medium format digital back, maximum resolution and tonal range",
};

// ============================================
// LIGHTING MAPPINGS
// ============================================
export const LIGHTING_FULL_SPECS: Record<string, string> = {
  "NATURAL.GOLDEN_HOUR": "warm golden hour sunlight, soft shadows, romantic warm tones",
  "NATURAL.OVERCAST": "diffused overcast natural light, soft even illumination",
  "NATURAL.BACKLIT": "dramatic backlighting, rim light, silhouette potential",
  "NATURAL.SIDE_LIT": "soft side lighting from window, natural shadows",
  "STUDIO.SOFT_BOX": "soft box studio lighting, even illumination, professional quality",
  "STUDIO.DRAMATIC": "dramatic studio lighting with hard shadows, high contrast",
  "STUDIO.THREE_POINT": "professional three-point lighting setup, key/fill/back lights",
  "STUDIO.MINIMALIST": "clean minimalist studio lighting, subtle shadows",
  "AMBIENT.CANDLE": "warm candlelight ambiance, flickering orange glow, intimate mood",
  "AMBIENT.SUNSET": "warm sunset glow, golden hour colors, romantic atmosphere",
  "AMBIENT.MORNING": "cool morning light, fresh blue tones, crisp atmosphere",
};

// ============================================
// ENVIRONMENT MAPPINGS
// ============================================
export const ENVIRONMENT_FULL_SPECS: Record<string, string> = {
  "SURFACES.MARBLE": "white marble surface, elegant veined texture, luxury feel",
  "SURFACES.WOOD": "rustic wooden table, warm natural grain, organic texture",
  "SURFACES.SANDSTONE": "weathered sandstone blocks, desert texture, ancient feel",
  "SURFACES.CONCRETE": "textured concrete platform, industrial modern, urban aesthetic",
  "SURFACES.FABRIC": "draped silk fabric background, soft luxurious folds, elegant",
  "SETTINGS.MINIMALIST": "clean white minimalist background, pure simplicity, modern",
  "SETTINGS.LUXURY": "luxury editorial setting with gold accents, opulent, refined",
  "SETTINGS.BOTANICAL": "botanical garden setting with natural elements, lush greenery",
  "SETTINGS.DESERT": "desert landscape with natural textures, sand dunes, warm earth tones, arid beauty",
  "SETTINGS.STUDIO": "professional studio setup, seamless backdrop, controlled environment",
  "CONTEXTS.VANITY": "luxury vanity table setup, mirrors, elegant accessories",
  "CONTEXTS.GARDEN": "imperial garden setting, manicured hedges, formal elegance",
  "CONTEXTS.WORKSHOP": "artisan workshop environment, craft tools, authentic atmosphere",
};

/**
 * Maps Pro Mode controls to Photography Ontology concepts
 */
export function mapProModeToOntology(proMode: ProModeControls): PhotographySpecs {
  const specs: PhotographySpecs = {};

  if (proMode.camera) {
    const fullSpec = CAMERA_FULL_SPECS[proMode.camera];
    if (fullSpec) {
      specs.cameraSpec = fullSpec;
      const cameraLower = proMode.camera.toLowerCase();
      if (cameraLower.includes("film") || cameraLower.includes("polaroid") || cameraLower.includes("cinestill")) {
        specs.lensCharacter = "Film/Analog";
      } else if (cameraLower.includes("macro")) {
        specs.lensCharacter = "Macro/Probe";
      } else if (cameraLower.includes("hasselblad") || cameraLower.includes("phase_one") || cameraLower.includes("medium_format")) {
        specs.lensCharacter = "Medium Format";
      } else {
        specs.lensCharacter = "Spherical";
      }
    }
  }

  if (proMode.lighting) {
    const fullSpec = LIGHTING_FULL_SPECS[proMode.lighting];
    if (fullSpec) {
      specs.lightingSetup = fullSpec;
      const lightingLower = proMode.lighting.toLowerCase();
      if (lightingLower.includes("soft") || lightingLower.includes("overcast")) {
        specs.lightQuality = "Soft/Diffused";
      } else if (lightingLower.includes("dramatic") || lightingLower.includes("hard")) {
        specs.lightQuality = "Hard/Specular";
        specs.contrastRatio = "8:1";
      } else if (lightingLower.includes("candle") || lightingLower.includes("ambient")) {
        specs.lightQuality = "Available/Ambient";
        specs.atmosphere = true;
      } else if (lightingLower.includes("golden") || lightingLower.includes("sunset")) {
        specs.lightQuality = "Soft/Diffused";
        specs.moodPalette = "Warm Golden";
      }
    }
  }

  if (proMode.environment) {
    const fullSpec = ENVIRONMENT_FULL_SPECS[proMode.environment];
    if (fullSpec) {
      specs.environmentSetting = fullSpec;
      const envLower = proMode.environment.toLowerCase();
      if (envLower.includes("surfaces.")) {
        specs.surfaceType = fullSpec;
      }
      if (envLower.includes("desert")) {
        specs.moodPalette = "Warm Earth Tones";
        specs.atmosphere = true;
      } else if (envLower.includes("botanical") || envLower.includes("garden")) {
        specs.moodPalette = "Natural Greens";
      } else if (envLower.includes("luxury")) {
        specs.moodPalette = "Rich & Opulent";
      }
    }
  }

  return specs;
}

/**
 * Builds a professional photography specification string
 */
export function buildPhotographySpecs(specs: PhotographySpecs): string {
  const parts: string[] = [];

  if (specs.cameraSpec) parts.push(`CAMERA & LENS: ${specs.cameraSpec}`);
  if (specs.lensCharacter && !specs.cameraSpec) parts.push(`LENS CHARACTER: ${specs.lensCharacter}`);
  if (specs.lightingSetup) parts.push(`LIGHTING: ${specs.lightingSetup}`);
  if (specs.lightQuality) parts.push(`LIGHT QUALITY: ${specs.lightQuality}`);
  if (specs.contrastRatio) parts.push(`CONTRAST RATIO: ${specs.contrastRatio}`);
  if (specs.environmentSetting) parts.push(`ENVIRONMENT: ${specs.environmentSetting}`);
  if (specs.surfaceType && specs.surfaceType !== specs.environmentSetting) parts.push(`SURFACE: ${specs.surfaceType}`);
  if (specs.moodPalette) parts.push(`COLOR MOOD: ${specs.moodPalette}`);
  if (specs.atmosphere) parts.push(`ATMOSPHERE: Atmospheric depth, subtle haze for dimension`);

  return parts.join("\n");
}

/**
 * Enhance a prompt with professional photography ontology
 */
export function enhancePromptWithOntology(
  basePrompt: string,
  proModeControls: ProModeControls | null | undefined
): string {
  if (!proModeControls || Object.keys(proModeControls).length === 0) {
    return basePrompt;
  }

  const specs = mapProModeToOntology(proModeControls);
  const specsString = buildPhotographySpecs(specs);

  if (!specsString) return basePrompt;

  return `${basePrompt}

PROFESSIONAL PHOTOGRAPHY ONTOLOGY:
${specsString}

Apply these specifications with precision. Use the exact lighting setup, lens character, and color grading specified above.`;
}
