/**
 * Photography Ontology Utility
 * Applies high-end commercial photography concepts to prompts
 */

interface ProModeControls {
  camera?: string;
  lighting?: string;
  environment?: string;
}

interface PhotographySpecs {
  lightingSetup?: string;
  lightQuality?: string;
  contrastRatio?: string;
  directionality?: string;
  moodPalette?: string;
  atmosphere?: boolean;
  lensCharacter?: string;
  compositionRule?: string;
  negativeSpace?: string;
  cameraAngle?: string;
  surfaceType?: string;
  textureResponse?: string[];
}

/**
 * Maps Pro Mode controls to Photography Ontology concepts
 */
export function mapProModeToOntology(proMode: ProModeControls): PhotographySpecs {
  const specs: PhotographySpecs = {};

  // Map lighting control to ontology
  if (proMode.lighting) {
    const lightingLower = proMode.lighting.toLowerCase();
    
    // Check for lighting setups
    const setups = [
      "Rembrandt", "Butterfly", "Paramount", "Split", "Loop", 
      "Clamshell", "Rim", "Edge", "Badger", "Broad", "Short"
    ];
    for (const setup of setups) {
      if (lightingLower.includes(setup.toLowerCase())) {
        specs.lightingSetup = setup === "Butterfly" ? "Butterfly (Paramount)" : setup;
        break;
      }
    }

    // Check for light quality
    if (lightingLower.includes("hard") || lightingLower.includes("specular")) {
      specs.lightQuality = "Hard/Specular";
    } else if (lightingLower.includes("soft") || lightingLower.includes("diffused") || lightingLower.includes("diffuse")) {
      specs.lightQuality = "Soft/Diffused";
    } else if (lightingLower.includes("ambient") || lightingLower.includes("natural")) {
      specs.lightQuality = "Available/Ambient";
    }

    // Check for contrast ratios
    if (lightingLower.includes("high contrast") || lightingLower.includes("dramatic")) {
      specs.contrastRatio = "8:1";
    } else if (lightingLower.includes("low contrast") || lightingLower.includes("high key")) {
      specs.contrastRatio = "2:1";
    }
  }

  // Map camera control to lens character
  if (proMode.camera) {
    const cameraLower = proMode.camera.toLowerCase();
    if (cameraLower.includes("anamorphic")) {
      specs.lensCharacter = "Anamorphic";
    } else if (cameraLower.includes("vintage") || cameraLower.includes("retro")) {
      specs.lensCharacter = "Vintage/Coated";
    } else if (cameraLower.includes("macro") || cameraLower.includes("probe")) {
      specs.lensCharacter = "Macro/Probe";
    } else {
      specs.lensCharacter = "Spherical";
    }
  }

  // Map environment to mood/atmosphere
  if (proMode.environment) {
    const envLower = proMode.environment.toLowerCase();
    if (envLower.includes("haze") || envLower.includes("fog") || envLower.includes("misty")) {
      specs.atmosphere = true;
    }
    if (envLower.includes("cinematic") || envLower.includes("teal")) {
      specs.moodPalette = "Teal & Orange";
    } else if (envLower.includes("monochrome") || envLower.includes("black and white")) {
      specs.moodPalette = "Monochromatic";
    } else if (envLower.includes("pastel") || envLower.includes("high key")) {
      specs.moodPalette = "Pastel/High-Key";
    }
  }

  return specs;
}

/**
 * Builds a professional photography specification string from ontology
 */
export function buildPhotographySpecs(specs: PhotographySpecs): string {
  const parts: string[] = [];

  if (specs.lightingSetup) {
    parts.push(`LIGHTING SETUP: ${specs.lightingSetup}`);
  }

  if (specs.lightQuality) {
    parts.push(`LIGHT QUALITY: ${specs.lightQuality}`);
  }

  if (specs.contrastRatio) {
    parts.push(`CONTRAST RATIO: ${specs.contrastRatio}`);
  }

  if (specs.directionality) {
    parts.push(`KEY LIGHT POSITION: ${specs.directionality}`);
  }

  if (specs.moodPalette) {
    parts.push(`COLOR GRADING: ${specs.moodPalette}`);
  }

  if (specs.atmosphere) {
    parts.push(`ATMOSPHERE: Volumetric lighting with haze/fog`);
  }

  if (specs.lensCharacter) {
    parts.push(`LENS CHARACTER: ${specs.lensCharacter}`);
  }

  if (specs.compositionRule) {
    parts.push(`COMPOSITION: ${specs.compositionRule}`);
  }

  if (specs.negativeSpace) {
    parts.push(`NEGATIVE SPACE: ${specs.negativeSpace} (reserve for text overlay)`);
  }

  if (specs.cameraAngle) {
    parts.push(`CAMERA ANGLE: ${specs.cameraAngle}`);
  }

  if (specs.surfaceType) {
    parts.push(`MATERIAL TYPE: ${specs.surfaceType}`);
  }

  if (specs.textureResponse && specs.textureResponse.length > 0) {
    parts.push(`TEXTURE RESPONSE: ${specs.textureResponse.join(", ")}`);
  }

  return parts.join("\n");
}

/**
 * Applies photography ontology to a prompt based on Pro Mode controls
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

  if (!specsString) {
    return basePrompt;
  }

  return `${basePrompt}

━━━ PROFESSIONAL PHOTOGRAPHY ONTOLOGY ━━━
${specsString}

Apply these specifications with precision. Use the exact lighting setup, lens character, and color grading specified above.`;
}











