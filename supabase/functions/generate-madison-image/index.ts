import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encode, decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { formatVisualContext } from "../_shared/productFieldFilters.ts";
import { callGeminiImage } from "../_shared/aiProviders.ts";
import { enhancePromptWithOntology } from "../_shared/photographyOntology.ts";
import { generateImage as generateFreepikImage, type FreepikModel, type FreepikResolution } from "../_shared/freepikProvider.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/**
 * ------------------------------
 * REFERENCE IMAGE CATEGORIZATION
 * ------------------------------
 */

interface CategorizedReferences {
  product: Array<{ url: string; description?: string; label?: string }>;
  background: Array<{ url: string; description?: string; label?: string }>;
  style: Array<{ url: string; description?: string; label?: string }>;
}

function categorizeReferences(
  references: Array<{ url: string; description?: string; label?: string }>
): CategorizedReferences {
  const categorized: CategorizedReferences = {
    product: [],
    background: [],
    style: [],
  };

  for (const ref of references || []) {
    const label = (ref.label || "").toLowerCase();
    if (label.includes("product") || label.includes("subject")) {
      categorized.product.push(ref);
    } else if (label.includes("background") || label.includes("scene")) {
      categorized.background.push(ref);
    } else if (label.includes("style") || label.includes("lighting") || label.includes("reference")) {
      categorized.style.push(ref);
    } else {
      // Default: if no label, assume it's the product (backward compatibility)
      categorized.product.push(ref);
    }
  }

  return categorized;
}

/**
 * ------------------------------
 * BOTTLE TYPE DETECTION (CRITICAL)
 * ------------------------------
 * This function determines if a product is an OIL (dropper/roller) or SPRAY (atomizer)
 * This is CRITICAL for accurate product rendering - wrong bottle type breaks the workflow
 */

function detectBottleType(productData: any): {
  isOil: boolean;
  isSpray: boolean;
  confidence: 'high' | 'medium' | 'low';
} {
  if (!productData) {
    return { isOil: false, isSpray: false, confidence: 'low' };
  }

  // PRIORITY 1: Check explicit bottle_type field (user-set, highest priority)
  const explicitBottleType = productData.bottle_type?.toLowerCase();
  if (explicitBottleType === 'oil') {
    return { isOil: true, isSpray: false, confidence: 'high' };
  }
  if (explicitBottleType === 'spray') {
    return { isOil: false, isSpray: true, confidence: 'high' };
  }
  // If bottle_type is 'auto' or null, fall through to auto-detection

  // PRIORITY 2: Auto-detection from product fields (only if bottle_type is 'auto' or null)
  const productNameLower = (productData.name || '').toLowerCase();
  const formatLower = (productData.format || '').toLowerCase();
  const productTypeLower = (productData.product_type || '').toLowerCase();
  const categoryLower = (productData.category || '').toLowerCase();
  const descriptionLower = (productData.description || '').toLowerCase();
  
  // OIL INDICATORS (comprehensive list)
  const oilIndicators = [
    'oil',
    'attar',
    'concentrate',
    'roller',
    'dropper',
    'roll-on',
    'roll on',
    'perfume oil',
    'fragrance oil',
    'essential oil',
    'carrier oil',
    'diluted oil',
    'pure oil',
    'oil-based',
    'oil based',
    'viscous',
    'thick oil',
    'dense oil',
  ];
  
  // SPRAY INDICATORS (comprehensive list)
  const sprayIndicators = [
    'spray',
    'atomizer',
    'pump',
    'mist',
    'eau de',
    'cologne',
    'perfume spray',
    'spray bottle',
    'sprayer',
    'atomizing',
    'aerosol',
  ];
  
  // Check all fields for oil indicators
  const hasOilIndicator = oilIndicators.some(indicator => 
    productNameLower.includes(indicator) ||
    formatLower.includes(indicator) ||
    productTypeLower.includes(indicator) ||
    descriptionLower.includes(indicator)
  );
  
  // Check all fields for spray indicators
  const hasSprayIndicator = sprayIndicators.some(indicator =>
    productNameLower.includes(indicator) ||
    formatLower.includes(indicator) ||
    productTypeLower.includes(indicator) ||
    descriptionLower.includes(indicator)
  );
  
  // Special case: "perfume oil" or "fragrance oil" = OIL (not spray)
  const isPerfumeOil = 
    productNameLower.includes('perfume oil') ||
    productNameLower.includes('fragrance oil') ||
    formatLower.includes('perfume oil') ||
    formatLower.includes('fragrance oil');
  
  // Special case: category = 'skincare' usually means oil
  const isSkincare = categoryLower === 'skincare';
  
  // Decision logic: OIL takes precedence if detected
  let isOil = false;
  let isSpray = false;
  let confidence: 'high' | 'medium' | 'low' = 'low';
  
  if (isPerfumeOil || isSkincare || hasOilIndicator) {
    isOil = true;
    confidence = isPerfumeOil ? 'high' : hasOilIndicator ? 'medium' : 'low';
  } else if (hasSprayIndicator && !hasOilIndicator) {
    isSpray = true;
    confidence = 'medium';
  }
  
  return { isOil, isSpray, confidence };
}

/**
 * ------------------------------
 * VIRTUAL ART DIRECTOR PROMPT CONSTRUCTION
 * ------------------------------
 */

function buildDirectorModePrompt(
  userPrompt: string,
  categorizedRefs: CategorizedReferences,
  proModeControls: any,
  brandKnowledge: any,
  productData: any,
  aspectRatio?: string
): string {
  let prompt = "";

  // === SECTION 0: CRITICAL BOTTLE TYPE SPECIFICATION (HIGHEST PRIORITY - MUST BE FIRST) ===
  // This MUST come before ANY other instructions, including reference images
  // Reference images might show wrong bottle type - this overrides them
  if (productData) {
    const bottleType = detectBottleType(productData);
    
    if (bottleType.isOil) {
      prompt += "╔══════════════════════════════════════════════════════════════════╗\n";
      prompt += "║  ⚠️ CRITICAL BOTTLE SPECIFICATION (MANDATORY - NO EXCEPTIONS)   ║\n";
      prompt += "║  THIS OVERRIDES ALL REFERENCE IMAGES AND OTHER INSTRUCTIONS      ║\n";
      prompt += "╚══════════════════════════════════════════════════════════════════╝\n\n";
      prompt += "PRODUCT TYPE: OIL-BASED FRAGRANCE (NON-SPRAY)\n";
      prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
      prompt += "✅ REQUIRED CLOSURE TYPES (ONLY THESE):\n";
      prompt += "  • Glass dropper with pipette\n";
      prompt += "  • Roller ball applicator\n";
      prompt += "  • Screw cap (if dropper/roller is separate)\n";
      prompt += "  • Glass wand (dipstick applicator)\n\n";
      prompt += "❌ ABSOLUTELY FORBIDDEN (NEVER INCLUDE - EVEN IF IN REFERENCE IMAGES):\n";
      prompt += "  • Perfume sprayer / atomizer / pump mechanism\n";
      prompt += "  • Crimped metal spray neck\n";
      prompt += "  • Spray nozzle / misting device\n";
      prompt += "  • Dip tube / hose / straw (the tube inside spray bottles)\n";
      prompt += "  • Any form of spray dispenser\n";
      prompt += "  • Aerosol mechanism\n";
      prompt += "  • ANY visible tube, hose, or pipe extending into the liquid\n\n";
      prompt += "VISUAL CHARACTERISTICS:\n";
      prompt += "  • The liquid is viscous oil (thicker, more dense)\n";
      prompt += "  • Bottle designed for direct application (not spraying)\n";
      prompt += "  • Closure is for controlled dispensing, not atomization\n";
      prompt += "  • NO internal tubes, hoses, or dip sticks visible inside the bottle\n\n";
      prompt += "⚠️ CRITICAL: If you render a spray mechanism, dip tube, hose, or ANY tube extending into the liquid, the image is INCORRECT and unusable.\n";
      prompt += "⚠️ CRITICAL: Even if reference images show a spray mechanism, you MUST render an oil bottle with dropper/roller instead.\n";
      prompt += "This is a fundamental product accuracy requirement. There are NO exceptions.\n\n";
    } else if (bottleType.isSpray) {
      prompt += "╔══════════════════════════════════════════════════════════════════╗\n";
      prompt += "║  ⚠️ CRITICAL BOTTLE SPECIFICATION (MANDATORY - NO EXCEPTIONS)   ║\n";
      prompt += "║  THIS OVERRIDES ALL REFERENCE IMAGES AND OTHER INSTRUCTIONS      ║\n";
      prompt += "╚══════════════════════════════════════════════════════════════════╝\n\n";
      prompt += "PRODUCT TYPE: SPRAY PERFUME (ALCOHOL-BASED)\n";
      prompt += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
      prompt += "✅ REQUIRED CLOSURE TYPE:\n";
      prompt += "  • Spray pump mechanism with atomizer\n";
      prompt += "  • Visible crimped metal neck\n";
      prompt += "  • Spray nozzle for misting\n";
      prompt += "  • Dip tube / hose extending into the liquid (for spray mechanism)\n\n";
      prompt += "❌ ABSOLUTELY FORBIDDEN:\n";
      prompt += "  • Dropper / pipette\n";
      prompt += "  • Roller ball applicator\n";
      prompt += "  • Glass wand / dipstick\n\n";
      prompt += "VISUAL CHARACTERISTICS:\n";
      prompt += "  • The liquid is alcohol-based (thinner, more fluid)\n";
      prompt += "  • Bottle designed for atomization and misting\n";
      prompt += "  • Closure includes spray mechanism with dip tube\n\n";
    }
  }

  // === SECTION 1: REFERENCE IMAGE INSTRUCTIONS ===
  prompt += "=== REFERENCE IMAGE DIRECTIVES ===\n\n";

  if (categorizedRefs.product.length > 0) {
    prompt += `PRODUCT REFERENCE (${categorizedRefs.product.length} image${categorizedRefs.product.length > 1 ? "s" : ""}):\n`;
    prompt += "Use the product reference image(s) for visual guidance. Maintain:\n";
    prompt += "- Product shape, proportions, and overall design\n";
    prompt += "- Product color accuracy (match hex values precisely)\n";
    prompt += "- Product texture and material finish\n";
    prompt += "- Branding, labels, and decorative elements\n";
    if (productData) {
      const bottleType = detectBottleType(productData);
      if (bottleType.isOil) {
        prompt += "\n⚠️ IMPORTANT: If the reference image shows a spray mechanism, IGNORE IT.\n";
        prompt += "You MUST render an oil bottle with dropper/roller instead (as specified in Section 0).\n";
        prompt += "The bottle type specification in Section 0 takes absolute priority over reference images.\n";
      } else if (bottleType.isSpray) {
        prompt += "\n⚠️ IMPORTANT: If the reference image shows a dropper/roller, IGNORE IT.\n";
        prompt += "You MUST render a spray bottle with atomizer instead (as specified in Section 0).\n";
        prompt += "The bottle type specification in Section 0 takes absolute priority over reference images.\n";
      }
    }
    prompt += "\n";
    
    categorizedRefs.product.forEach((ref, idx) => {
      if (ref.description) {
        prompt += `Product Ref ${idx + 1} Note: ${ref.description}\n`;
      }
    });
    prompt += "\n";
  }

  if (categorizedRefs.background.length > 0) {
    prompt += `BACKGROUND REFERENCE (${categorizedRefs.background.length} image${categorizedRefs.background.length > 1 ? "s" : ""}):\n`;
    prompt += "Use this/these as the ENVIRONMENTAL CONTEXT:\n";
    prompt += "- Replicate the scene, setting, or backdrop\n";
    prompt += "- Match the mood and atmosphere\n";
    prompt += "- Preserve spatial relationships and depth\n\n";
    
    categorizedRefs.background.forEach((ref, idx) => {
      if (ref.description) {
        prompt += `Background Ref ${idx + 1} Note: ${ref.description}\n`;
      }
    });
    prompt += "\n";
  }

  if (categorizedRefs.style.length > 0) {
    prompt += `STYLE REFERENCE (${categorizedRefs.style.length} image${categorizedRefs.style.length > 1 ? "s" : ""}):\n`;
    prompt += "Extract and apply these PHOTOGRAPHIC ELEMENTS:\n";
    prompt += "- Lighting style (direction, quality, color temperature)\n";
    prompt += "- Composition and framing\n";
    prompt += "- Color grading and post-processing aesthetic\n";
    prompt += "- Camera angle and perspective\n";
    prompt += "- Depth of field and focus technique\n\n";
    
    categorizedRefs.style.forEach((ref, idx) => {
      if (ref.description) {
        prompt += `Style Ref ${idx + 1} Note: ${ref.description}\n`;
      }
    });
    prompt += "\n";
  }

  // === SECTION 2: USER'S CREATIVE INTENT ===
  prompt += "=== CREATIVE DIRECTION ===\n";
  prompt += `${userPrompt}\n\n`;

  // === SECTION 3: PROFESSIONAL PHOTOGRAPHY SPECIFICATIONS ===
  prompt += "=== PHOTOGRAPHIC SPECIFICATIONS ===\n";
  prompt += "You are a Virtual Art Director with expertise in high-end commercial photography.\n";
  prompt += "Apply professional photography ontology concepts:\n\n";

  // Apply Photography Ontology if Pro Mode is active
  if (proModeControls && Object.keys(proModeControls).length > 0) {
    // Use the ontology mapper to translate Pro Mode controls into professional terminology
    const ontologySpecs = enhancePromptWithOntology("", proModeControls);
    prompt += ontologySpecs + "\n\n";
  } else {
    // Default specifications when Pro Mode is not active
    // Add variety to prevent repetitive images
    const lightingVariations = [
      { setup: "Butterfly (Paramount)", quality: "Soft/Diffused", contrast: "3:1" },
      { setup: "Rembrandt", quality: "Soft with subtle shadow", contrast: "4:1" },
      { setup: "Loop", quality: "Soft directional", contrast: "3.5:1" },
      { setup: "Split", quality: "Dramatic but controlled", contrast: "5:1" },
      { setup: "Broad", quality: "Even and flattering", contrast: "2.5:1" },
    ];
    
    // Randomly select a lighting variation (using timestamp for pseudo-randomness)
    const lightingIndex = Date.now() % lightingVariations.length;
    const selectedLighting = lightingVariations[lightingIndex];
    
    if (categorizedRefs.style.length > 0) {
      prompt += "LIGHTING: Match the lighting style from the style reference(s)\n";
    } else {
      prompt += `LIGHTING SETUP: ${selectedLighting.setup} - Commercial standard\n`;
      prompt += `LIGHT QUALITY: ${selectedLighting.quality} (flattering, commercial look)\n`;
      prompt += `CONTRAST RATIO: ${selectedLighting.contrast} (balanced, professional)\n`;
    }
    
    // Add composition variety
    const compositionStyles = [
      "Rule of Thirds (classic, balanced)",
      "Centered composition (symmetrical, bold)",
      "Leading lines (dynamic, engaging)",
      "Negative space (minimalist, elegant)",
      "Diagonal composition (energetic, modern)",
    ];
    const compositionIndex = (Date.now() + 1) % compositionStyles.length;
    prompt += `COMPOSITION: ${compositionStyles[compositionIndex]}\n`;
    
    prompt += "LENS CHARACTER: Spherical (clean, modern commercial look)\n";
  }

  // Technical defaults for high-end output
  prompt += "\nTECHNICAL REQUIREMENTS:\n";
  prompt += "- 8K resolution, sharp focus\n";
  prompt += "- Professional color grading\n";
  prompt += "- Realistic shadows and reflections\n";
  prompt += "- Accurate material physics (glass refraction IOR 1.5, metal specular highlights, fabric diffuse reflection)\n";
  prompt += "- No distortion, artifacts, or watermarks\n\n";

  // === SECTION 5: BRAND CONTEXT ===
  if (brandKnowledge?.visualStandards) {
    const vs = brandKnowledge.visualStandards;
    prompt += "=== BRAND VISUAL STANDARDS (MANDATORY) ===\n";
    
    // GOLDEN RULE: Most important - the overarching visual philosophy
    if (vs.golden_rule) {
      prompt += `\n✨ GOLDEN RULE (HIGHEST PRIORITY): ${vs.golden_rule}\n`;
      prompt += `This is the PRIMARY directive. All other specifications must align with this philosophy.\n\n`;
    }
    
    if (vs.color_palette?.length > 0) {
      prompt += `COLOR PALETTE (MANDATORY): ${vs.color_palette.slice(0, 5).map((c: any) => `${c.name} (${c.hex})`).join(", ")}\n`;
      prompt += `Use these exact colors. Do not deviate from this palette.\n`;
    }
    if (vs.lighting_mandates) {
      prompt += `LIGHTING MANDATE (MANDATORY): ${vs.lighting_mandates}\n`;
      prompt += `Override default lighting specifications with this mandate.\n`;
    }
    if (vs.approved_props?.length > 0) {
      prompt += `APPROVED PROPS: ${vs.approved_props.slice(0, 10).join(", ")}\n`;
      prompt += `Only use props from this approved list.\n`;
    }
    if (vs.forbidden_elements?.length > 0) {
      prompt += `FORBIDDEN ELEMENTS (NEVER INCLUDE): ${vs.forbidden_elements.join(", ")}\n`;
      prompt += `These elements are explicitly prohibited. Do not include them under any circumstances.\n`;
    }
    
    // Add bottle type to forbidden elements if it's an oil product
    if (productData) {
      const bottleType = detectBottleType(productData);
      if (bottleType.isOil && vs.forbidden_elements) {
        // Ensure spray mechanisms are in forbidden list
        const forbiddenList = Array.isArray(vs.forbidden_elements) ? vs.forbidden_elements : [];
        if (!forbiddenList.some((el: string) => el.toLowerCase().includes('spray') || el.toLowerCase().includes('atomizer'))) {
          prompt += `FORBIDDEN ELEMENTS (ADDITIONAL): Perfume sprayer, atomizer, pump, spray nozzle, misting device\n`;
        }
      }
    }
    
    // Include raw document context if available (for AI to understand full context)
    if (vs.raw_document) {
      prompt += `\nADDITIONAL CONTEXT: Refer to the full visual standards document for complete brand guidelines.\n`;
    }
    
    prompt += "\n";
  }

  // === SECTION 6: PRODUCT-SPECIFIC CONTEXT ===
  if (productData) {
    prompt += "=== PRODUCT VISUAL DNA ===\n";
    // This will be enhanced by formatVisualContext, but we add a header
    prompt += "Apply product-specific visual characteristics from the product data.\n\n";
  }

  // === SECTION 7: ASPECT RATIO ===
  if (aspectRatio) {
    prompt += `=== OUTPUT SPECIFICATIONS ===\n`;
    prompt += `ASPECT RATIO: ${aspectRatio}\n`;
    prompt += `Compose the image to work perfectly at this ratio.\n\n`;
  }

  // === SECTION 8: NEGATIVE PROMPT (What to Avoid) ===
  prompt += "=== AVOID ===\n";
  prompt += "- Blurry or out-of-focus elements\n";
  prompt += "- Distorted text or logos\n";
  prompt += "- Unrealistic proportions\n";
  prompt += "- Watermarks or signatures\n";
  prompt += "- Low quality or pixelation\n";
  prompt += "- Frames, borders, or decorative edges around the image\n";
  prompt += "- White borders, beige frames, or any background frame elements\n";
  prompt += "- The image should fill the entire canvas edge-to-edge with no visible frame\n";
  
  // Add bottle-type-specific negative prompts (reinforce Section 0)
  if (productData) {
    const bottleType = detectBottleType(productData);
    if (bottleType.isOil) {
      prompt += "- ⚠️ CRITICAL: Perfume sprayers, atomizers, pumps, spray nozzles, misting devices, or ANY spray mechanism\n";
      prompt += "- ⚠️ CRITICAL: Crimped metal spray necks or aerosol mechanisms\n";
      prompt += "- ⚠️ CRITICAL: Dip tubes, hoses, straws, or ANY tube extending into the liquid (these are ONLY for spray bottles)\n";
      prompt += "- ⚠️ CRITICAL: Any visible internal tube, pipe, or hose inside the bottle\n";
    } else if (bottleType.isSpray) {
      prompt += "- ⚠️ CRITICAL: Droppers, pipettes, roller balls, glass wands, or ANY non-spray applicator\n";
    }
  }

  return prompt;
}

function buildEssentialModePrompt(
  userPrompt: string,
  productRef: { url: string; description?: string } | null,
  brandContext: any,
  productData?: any
): string {
  let prompt = "";

  // === CRITICAL BOTTLE TYPE SPECIFICATION (MUST BE FIRST) ===
  if (productData) {
    const bottleType = detectBottleType(productData);
    
    if (bottleType.isOil) {
      prompt += "╔══════════════════════════════════════════════════════════════════╗\n";
      prompt += "║     ⚠️ CRITICAL: OIL BOTTLE - NO SPRAY MECHANISM ALLOWED         ║\n";
      prompt += "╚══════════════════════════════════════════════════════════════════╝\n\n";
      prompt += "This is an OIL-BASED FRAGRANCE. REQUIRED: Dropper or roller ball ONLY.\n";
      prompt += "FORBIDDEN: Perfume sprayer, atomizer, pump, spray nozzle, dip tube, hose, or ANY spray mechanism.\n";
      prompt += "FORBIDDEN: ANY visible tube, hose, or pipe extending into the liquid (these are ONLY for spray bottles).\n";
      prompt += "If you render a spray mechanism, dip tube, or any internal tube, the image is INCORRECT.\n\n";
    } else if (bottleType.isSpray) {
      prompt += "╔══════════════════════════════════════════════════════════════════╗\n";
      prompt += "║     ⚠️ CRITICAL: SPRAY PERFUME - ATOMIZER REQUIRED               ║\n";
      prompt += "╚══════════════════════════════════════════════════════════════════╝\n\n";
      prompt += "This is a SPRAY PERFUME. REQUIRED: Spray pump with atomizer.\n";
      prompt += "FORBIDDEN: Dropper, roller ball, or any non-spray applicator.\n\n";
    }
  }

  prompt += userPrompt;

  if (productRef) {
    prompt += "\n\nUse the uploaded product image as the exact subject. Place it in the scene described above.";
  }

  if (brandContext?.colors?.length > 0) {
    prompt += ` Incorporate ${brandContext.colors.join(" and ")} color tones.`;
  }

  if (brandContext?.styleKeywords?.length > 0) {
    prompt += ` Apply ${brandContext.styleKeywords.join(", ")} aesthetic.`;
  }

  return prompt;
}

function buildChainPrompt(originalPrompt: string, refinement: string, depth: number) {
  const base = originalPrompt.replace(
    /\b(with|featuring|showing|adjust:|refinement:)\b.*/gi,
    ""
  ).trim();

  const r = refinement.toLowerCase();

  if (r.match(/\b(darker|lighter|brighter|cooler|warmer)\b/)) {
    return `${originalPrompt}. Adjust: ${refinement}`;
  }
  if (r.match(/\b(add|include|with)\b/)) {
    return `${originalPrompt}. ${refinement}`;
  }
  if (r.match(/\b(remove|without|exclude)\b/)) {
    return `${base}. ${refinement}`;
  }

  return `${originalPrompt}. Refinement: ${refinement}`;
}

/**
 * ------------------------------
 * MAIN EDGE FUNCTION
 * ------------------------------
 */

function extractMissingColumn(message: string) {
  const patterns = [
    /column generated_images\.([a-zA-Z0-9_]+)/i,
    /"generated_images"\."([a-zA-Z0-9_]+)"/i,
    /'([a-zA-Z0-9_]+)' column of 'generated_images'/i,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }
  return null;
}

async function insertGeneratedImageRecord(
  supabase: ReturnType<typeof createClient>,
  payload: Record<string, unknown>,
) {
  let attemptPayload = { ...payload };
  const maxAttempts = Object.keys(payload).length + 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const { data, error } = await supabase
      .from("generated_images")
      .insert(attemptPayload)
      .select()
      .single();

    if (!error) {
      return data;
    }

    const column = extractMissingColumn(error.message ?? "");
    if (column && column in attemptPayload) {
      console.warn(
        `[generate-madison-image] Column '${column}' missing in generated_images. Retrying without it.`,
      );

      delete attemptPayload[column];
      continue;
    }

    throw error;
  }

  throw new Error(
    "Failed to insert generated_images record after removing missing columns.",
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    /**
     * 1. Parse incoming request
     */
    const body = await req.json();

    const {
      prompt,
      organizationId,
      userId,
      goalType,
      aspectRatio,
      outputFormat = "png",
      selectedTemplate,
      userRefinements,
      referenceImages,
      brandContext,
      imageConstraints,

      parentImageId,
      isRefinement,
      refinementInstruction,
      parentPrompt,

      proModeControls,

      sessionId,

      product_id,

      // Provider selection (new)
      provider = "auto", // "auto" | "gemini" | "freepik"
      freepikModel, // "mystic" | "flux-dev" | "flux-pro-v1-1"
      freepikResolution, // "1k" | "2k" | "4k"
      
      // Frontend-friendly aliases (Pro Settings)
      aiProvider, // "auto" | "gemini" | "freepik-mystic" | "freepik-flux"
      resolution, // "standard" | "high" | "4k"
    } = body;
    
    // Map frontend-friendly names to backend values
    // aiProvider maps to: provider + freepikModel
    // resolution maps to: freepikResolution
    let effectiveProvider = provider;
    let effectiveFreepikModel = freepikModel;
    let effectiveFreepikResolution = freepikResolution;
    
    if (aiProvider) {
      if (aiProvider === "gemini") {
        effectiveProvider = "gemini";
      } else if (aiProvider === "freepik-mystic") {
        effectiveProvider = "freepik";
        effectiveFreepikModel = effectiveFreepikModel || "mystic";
      } else if (aiProvider === "freepik-flux") {
        effectiveProvider = "freepik";
        effectiveFreepikModel = effectiveFreepikModel || "flux-pro-v1-1";
      } else if (aiProvider === "auto") {
        effectiveProvider = "auto";
      }
    }
    
    if (resolution) {
      if (resolution === "standard") {
        effectiveFreepikResolution = "1k";
      } else if (resolution === "high") {
        effectiveFreepikResolution = "2k";
      } else if (resolution === "4k") {
        effectiveFreepikResolution = "4k";
      }
    }

    console.log("🎨 Incoming Request", {
      goalType,
      aspectRatio,
      isRefinement,
      references: referenceImages?.length || 0,
      proMode: !!proModeControls,
      productId: product_id || "none",
    });

    /**
     * 2. Supabase Client
     */
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    /**
     * 3. Resolve organizationId if missing
     */
    let resolvedOrgId = organizationId;

    console.log("🔍 Organization Resolution:", {
      providedOrgId: organizationId,
      userId,
      parentImageId,
    });

    if (!resolvedOrgId && parentImageId) {
      const { data, error } = await supabase
        .from("generated_images")
        .select("organization_id")
        .eq("id", parentImageId)
        .single();

      if (error) {
        console.log("⚠️ Could not fetch from generated_images:", error.message);
      }
      if (data?.organization_id) {
        resolvedOrgId = data.organization_id;
        console.log("✅ Resolved org from parent image:", resolvedOrgId);
      }
    }

    if (!resolvedOrgId && userId) {
      const { data, error } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", userId)
        .limit(1)
        .single();

      if (error) {
        console.log("⚠️ Could not fetch from organization_members:", error.message, { userId });
      }
      if (data?.organization_id) {
        resolvedOrgId = data.organization_id;
        console.log("✅ Resolved org from membership:", resolvedOrgId);
      }
    }

    // Last resort: check if user created any organizations
    if (!resolvedOrgId && userId) {
      const { data, error } = await supabase
        .from("organizations")
        .select("id")
        .eq("created_by", userId)
        .limit(1)
        .single();

      if (error) {
        console.log("⚠️ Could not fetch from organizations:", error.message);
      }
      if (data?.id) {
        resolvedOrgId = data.id;
        console.log("✅ Resolved org from created_by:", resolvedOrgId);
        
        // Auto-create the missing membership
        await supabase.from("organization_members").upsert({
          organization_id: resolvedOrgId,
          user_id: userId,
        }, { onConflict: "organization_id,user_id" });
        console.log("✅ Auto-created missing organization membership");
      }
    }

    if (!resolvedOrgId) {
      console.error("❌ Could not resolve organization for user:", userId);
      return new Response(
        JSON.stringify({
          error: "Could not resolve organization. Please ensure you have completed onboarding.",
          debug: { userId, providedOrgId: organizationId, parentImageId }
        }),
        { status: 400, headers: corsHeaders }
      );
    }
    
    console.log("✅ Final resolved organization:", resolvedOrgId);

    /**
     * 4. Load Brand Knowledge
     */
    const { data: brandKnowledgeData } = await supabase
      .from("brand_knowledge")
      .select("knowledge_type, content")
      .eq("organization_id", resolvedOrgId)
      .eq("is_active", true);

    const brandKnowledge = {
      visualStandards:
        brandKnowledgeData?.find((k) => k.knowledge_type === "visual_standards")
          ?.content || null,
      vocabulary:
        brandKnowledgeData?.find((k) => k.knowledge_type === "vocabulary")
          ?.content || null,
      brandVoice:
        brandKnowledgeData?.find((k) => k.knowledge_type === "brand_voice")
          ?.content || null,
    };

    /**
     * 5. Load Product Data (all 49 fields)
     */
    let productData = null;
    if (product_id) {
      const { data } = await supabase
        .from("brand_products")
        .select("*")
        .eq("id", product_id)
        .eq("organization_id", resolvedOrgId)
        .maybeSingle();
      productData = data || null;
    }

    /**
     * 6. Categorize and prepare reference images
     */
    let actualReferenceImages = referenceImages || [];

    // Auto-include parent image for refinements
    if (isRefinement && parentImageId) {
      const { data: parent } = await supabase
        .from("generated_images")
        .select("image_url, final_prompt, chain_depth")
        .eq("id", parentImageId)
        .single();

      if (parent) {
        actualReferenceImages = [
          {
            url: parent.image_url,
            label: "Previous iteration",
            description: "Auto-included parent reference",
          },
          ...actualReferenceImages,
        ];
      }
    }

    // Categorize references by type
    const categorizedRefs = categorizeReferences(actualReferenceImages);

    // Determine mode: "Essential" (simple) vs "Director" (pro)
    const isDirectorMode = 
      proModeControls && Object.keys(proModeControls).length > 0 ||
      categorizedRefs.style.length > 0 ||
      categorizedRefs.background.length > 0 ||
      categorizedRefs.product.length > 1;

    /**
     * 7. Build enhanced prompt based on mode
     */
    let enhancedPrompt: string;

    if (isRefinement && refinementInstruction) {
      // Refinements use chain logic
      enhancedPrompt = buildChainPrompt(parentPrompt || prompt, refinementInstruction, 0);
    } else if (isDirectorMode) {
      // DIRECTOR MODE: Full "Virtual Art Director" treatment
      enhancedPrompt = buildDirectorModePrompt(
        prompt,
        categorizedRefs,
        proModeControls,
        brandKnowledge,
        productData,
        aspectRatio
      );

      // Add product visual DNA if available
      if (productData) {
        const visualDNA = formatVisualContext(productData);
        enhancedPrompt += `\n\n${visualDNA}`;
      }
    } else {
      // ESSENTIAL MODE: Simple, fast workflow
      const productRef = categorizedRefs.product[0] || null;
      enhancedPrompt = buildEssentialModePrompt(prompt, productRef, brandContext, productData);

      // Add basic brand context
      if (brandKnowledge.visualStandards) {
        const vs = brandKnowledge.visualStandards;
        if (vs.color_palette?.length > 0) {
          enhancedPrompt += `\n\nBrand Colors: ${vs.color_palette
            .slice(0, 3)
            .map((c: any) => c.name)
            .join(", ")}`;
        }
      }

      if (aspectRatio) {
        enhancedPrompt += `\n\nAspect Ratio: ${aspectRatio}`;
      }
    }

    // Apply image constraints (rewrite rules, prohibited terms)
    if (imageConstraints?.rewriteRules) {
      for (const [from, to] of Object.entries(imageConstraints.rewriteRules)) {
        enhancedPrompt = enhancedPrompt.replace(new RegExp(from, "gi"), String(to || ""));
      }
    }

    if (imageConstraints?.prohibitedTerms) {
      for (const term of imageConstraints.prohibitedTerms) {
        enhancedPrompt = enhancedPrompt.replace(
          new RegExp(`\\b${term}\\b`, "gi"),
          ""
        );
      }
    }

    /**
     * -------------------------
     * 8. Convert reference images to base64 in ORDERED SEQUENCE
     * -------------------------
     * Order matters: Product → Background → Style
     * This helps Gemini understand the hierarchy
     */
    const referenceImagesPayload = [];

    // Order: Product references first (the "star")
    for (const ref of categorizedRefs.product) {
      if (!ref.url) continue;
      try {
        const response = await fetch(ref.url);
        if (!response.ok) {
          console.warn(`Failed to fetch product reference: ${ref.url}`);
          continue;
        }
        const buffer = await response.arrayBuffer();
        const base64 = encode(new Uint8Array(buffer));
        referenceImagesPayload.push({
          data: base64,
          mimeType: response.headers.get("content-type") || "image/png",
        });
      } catch (err) {
        console.error(`Error processing product reference ${ref.url}:`, err);
      }
    }

    // Then: Background references (the "stage")
    for (const ref of categorizedRefs.background) {
      if (!ref.url) continue;
      try {
        const response = await fetch(ref.url);
        if (!response.ok) {
          console.warn(`Failed to fetch background reference: ${ref.url}`);
          continue;
        }
        const buffer = await response.arrayBuffer();
        const base64 = encode(new Uint8Array(buffer));
        referenceImagesPayload.push({
          data: base64,
          mimeType: response.headers.get("content-type") || "image/png",
        });
      } catch (err) {
        console.error(`Error processing background reference ${ref.url}:`, err);
      }
    }

    // Finally: Style references (the "direction")
    for (const ref of categorizedRefs.style) {
      if (!ref.url) continue;
      try {
        const response = await fetch(ref.url);
        if (!response.ok) {
          console.warn(`Failed to fetch style reference: ${ref.url}`);
          continue;
        }
        const buffer = await response.arrayBuffer();
        const base64 = encode(new Uint8Array(buffer));
        referenceImagesPayload.push({
          data: base64,
          mimeType: response.headers.get("content-type") || "image/png",
        });
      } catch (err) {
        console.error(`Error processing style reference ${ref.url}:`, err);
      }
    }

    console.log(`📸 Reference Images Prepared:`, {
      product: categorizedRefs.product.length,
      background: categorizedRefs.background.length,
      style: categorizedRefs.style.length,
      total: referenceImagesPayload.length,
      mode: isDirectorMode ? "Director" : "Essential",
    });

    /**
     * -------------------------
     * 9. Check Subscription Tier & Determine Provider
     * -------------------------
     * 
     * TIER ACCESS:
     * - Essentials ($49): Gemini only
     * - Studio ($149): Gemini + Freepik Flux Pro (limited)
     * - Signature ($349): Full Freepik (Mystic 4K, Video, etc.)
     * - Super Admins: Full access to all features for testing
     * 
     * FALLBACK: Freepik fails → Gemini
     */
    
    // Fetch organization's subscription tier
    let subscriptionTier = "essentials"; // Default to lowest tier
    let freepikAllowed = false;
    let freepik4KAllowed = false;
    let freepikVideoAllowed = false;
    let isSuperAdmin = false;
    
    // Check if user is a super admin (gets full access for testing)
    if (userId) {
      try {
        const { data: superAdminData } = await supabase
          .from("super_admins")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle();
        
        if (superAdminData) {
          isSuperAdmin = true;
          freepikAllowed = true;
          freepik4KAllowed = true;
          freepikVideoAllowed = true;
          console.log("👑 Super Admin detected - Full Freepik access enabled");
        }
      } catch (saError) {
        console.warn("Could not check super admin status:", saError);
      }
    }
    
    // If not a super admin, check subscription tier
    if (!isSuperAdmin) {
      try {
        const { data: orgData } = await supabase
          .from("organizations")
          .select("subscription_tier, stripe_subscription_status")
          .eq("id", resolvedOrgId)
          .single();
        
        if (orgData) {
          subscriptionTier = (orgData.subscription_tier || "essentials").toLowerCase();
          const isActive = orgData.stripe_subscription_status === "active" || 
                          orgData.stripe_subscription_status === "trialing";
          
          // Determine Freepik access based on tier
          // Actual tiers: essentials ($49), studio ($149), signature ($349)
          if (isActive || subscriptionTier === "free_trial") {
            // Studio and Signature get basic Freepik access (Flux Pro)
            if (subscriptionTier === "studio" || subscriptionTier === "signature") {
              freepikAllowed = true;
            }
            // Only Signature gets 4K and Video (premium Freepik features)
            if (subscriptionTier === "signature") {
              freepik4KAllowed = true;
              freepikVideoAllowed = true;
            }
          }
        }
      } catch (tierError) {
        console.warn("Could not fetch subscription tier, defaulting to Gemini:", tierError);
      }
    }
    
    console.log(`📊 Subscription Tier Check:`, {
      tier: isSuperAdmin ? "super_admin" : subscriptionTier,
      isSuperAdmin,
      freepikAllowed,
      freepik4KAllowed,
      requestedProvider: effectiveProvider,
      requestedModel: effectiveFreepikModel,
      requestedResolution: effectiveFreepikResolution,
    });

    // Generate a random seed for variety (0-2147483647, max signed 32-bit integer)
    // Gemini API requires INT32, which is signed and maxes at 2147483647
    const randomSeed = Math.floor(Math.random() * 2147483647);

    // Determine which provider to use based on tier and request
    let selectedProvider: "gemini" | "freepik" = "gemini";
    let tierRestrictionApplied = false;
    
    if (effectiveProvider === "freepik" || effectiveFreepikModel) {
      // User explicitly requested Freepik
      if (freepikAllowed) {
        // Check if they're requesting 4K (requires higher tier)
        if (effectiveFreepikResolution === "4k" && !freepik4KAllowed) {
          console.log("⚠️ 4K requested but not allowed on this tier, downgrading to 2K");
          tierRestrictionApplied = true;
          selectedProvider = "freepik";
        } else {
          selectedProvider = "freepik";
        }
      } else {
        // Freepik not allowed on this tier - fall back to Gemini
        console.log("⚠️ Freepik requested but not available on Essentials tier, using Gemini");
        tierRestrictionApplied = true;
      }
    } else if (effectiveProvider === "auto") {
      // Auto-selection: Use Gemini by default (better for reference images)
      // Only use Freepik if explicitly beneficial AND allowed
      if (freepikAllowed && effectiveFreepikResolution === "4k" && freepik4KAllowed) {
        selectedProvider = "freepik";
      }
      // Otherwise default to Gemini
    }
    // effectiveProvider === "gemini" → stays as gemini

    let imageUrl: string;
    let usedProvider: string = selectedProvider;
    let didFallback = false;

    if (selectedProvider === "freepik") {
      /**
       * FREEPIK GENERATION PATH
       */
      // Ensure resolution is allowed
      const finalResolution = (effectiveFreepikResolution === "4k" && !freepik4KAllowed) 
        ? "2k" 
        : (effectiveFreepikResolution || "2k");
      
      console.log("🎨 Using Freepik for image generation...", {
        model: effectiveFreepikModel || "mystic",
        resolution: finalResolution,
        tierRestrictionApplied,
      });

      try {
        const freepikResult = await generateFreepikImage({
          prompt: enhancedPrompt,
          model: (effectiveFreepikModel as FreepikModel) || "mystic",
          resolution: finalResolution as FreepikResolution,
          aspectRatio: aspectRatio as any,
          seed: randomSeed,
        });

        imageUrl = freepikResult.imageUrl;
        usedProvider = `freepik-${freepikResult.model}`;

        console.log(`✅ Freepik Image Generated:`, {
          taskId: freepikResult.taskId,
          model: freepikResult.model,
        });
      } catch (freepikError) {
        console.error("❌ Freepik generation failed, falling back to Gemini:", freepikError);
        // Fall back to Gemini
        selectedProvider = "gemini";
        didFallback = true;
      }
    }

    if (selectedProvider === "gemini") {
      /**
       * GEMINI GENERATION PATH (default)
       */
      console.log("🎨 Using Gemini for image generation...");

      const geminiImage = await callGeminiImage({
        prompt: enhancedPrompt,
        aspectRatio,
        seed: randomSeed,
        referenceImages: referenceImagesPayload.length > 0
          ? referenceImagesPayload
          : undefined,
      });

      const base64Image = geminiImage?.data ?? geminiImage?.bytesBase64 ?? geminiImage?.base64;

      if (!base64Image) {
        throw new Error("Gemini returned no image. Check prompt and reference images.");
      }

      // Upload Gemini's base64 image to Supabase Storage
      const filename = `${resolvedOrgId}/${Date.now()}-${crypto.randomUUID()}.png`;

      const { error: uploadErr } = await supabase.storage
        .from("generated-images")
        .upload(filename, decode(base64Image), {
          contentType: "image/png",
        });

      if (uploadErr) {
        console.error("Storage upload error", uploadErr);
        throw uploadErr;
      }

      const { data: urlData } = supabase.storage
        .from("generated-images")
        .getPublicUrl(filename);

      imageUrl = urlData.publicUrl;
      usedProvider = didFallback ? "gemini (fallback)" : "gemini";

      console.log(`✅ Gemini Image Generated Successfully`, { didFallback });
    }

    console.log(`✅ Image Generation Complete`, {
      provider: usedProvider,
      subscriptionTier,
      didFallback,
      tierRestrictionApplied,
      mode: isDirectorMode ? "Director Mode" : "Essential Mode",
      promptLength: enhancedPrompt.length,
      referencesUsed: referenceImagesPayload.length,
    });

    /**
     * -------------------------
     * 10. Save DB record to generated_images
     * -------------------------
     */
    
    // Map goalType to library_category for proper filtering in Image Library
    // This determines which category tab the image appears under
    const categoryMap: Record<string, string> = {
      'product_photography': 'product',
      'product': 'product',
      'lifestyle': 'lifestyle',
      'ecommerce': 'ecommerce',
      'social_media': 'social',
      'social': 'social',
      'editorial': 'editorial',
      'creative': 'creative',
      'flat_lay': 'flat_lay',
      'refinement': 'product', // Refinements inherit parent category or default to product
      'variation': 'product',  // Variations inherit parent category or default to product
    };
    
    // Infer category from goalType or prompt keywords
    let libraryCategory = categoryMap[goalType] || 'product';
    
    // Smart inference from prompt keywords if goalType doesn't map
    if (!categoryMap[goalType]) {
      const promptLower = prompt.toLowerCase();
      if (promptLower.includes('flat lay') || promptLower.includes('flatlay') || promptLower.includes('overhead')) {
        libraryCategory = 'flat_lay';
      } else if (promptLower.includes('lifestyle') || promptLower.includes('real-world') || promptLower.includes('environment')) {
        libraryCategory = 'lifestyle';
      } else if (promptLower.includes('ecommerce') || promptLower.includes('e-commerce') || promptLower.includes('product listing')) {
        libraryCategory = 'ecommerce';
      } else if (promptLower.includes('social') || promptLower.includes('instagram') || promptLower.includes('facebook') || promptLower.includes('tiktok')) {
        libraryCategory = 'social';
      } else if (promptLower.includes('editorial') || promptLower.includes('magazine') || promptLower.includes('cinematic')) {
        libraryCategory = 'editorial';
      } else if (promptLower.includes('artistic') || promptLower.includes('creative') || promptLower.includes('abstract')) {
        libraryCategory = 'creative';
      }
    }
    
    console.log(`[generate-madison-image] Library category: ${libraryCategory} (from goalType: ${goalType})`);
    
    const insertPayload: Record<string, unknown> = {
      organization_id: resolvedOrgId,
      user_id: userId,
      session_id: sessionId,
      goal_type: goalType,
      library_category: libraryCategory, // For Image Library filtering
      aspect_ratio: aspectRatio,
      output_format: outputFormat,
      final_prompt: enhancedPrompt,
      image_url: imageUrl,
      generation_provider: usedProvider,
      media_type: "image",
      description: isDirectorMode 
        ? `${usedProvider} generated image (Director Mode - Pro Photography)` 
        : `${usedProvider} generated image (Essential Mode)`,
    };

    if (selectedTemplate) insertPayload.selected_template = selectedTemplate;
    if (userRefinements) insertPayload.user_refinements = userRefinements;
    if (actualReferenceImages?.length) {
      insertPayload.reference_images = actualReferenceImages;
    }

    if (brandContext || brandKnowledge.visualStandards) {
      insertPayload.brand_context_used = {
        ...brandContext,
        knowledgeUsed: {
          hasVisualStandards: !!brandKnowledge.visualStandards,
        },
      };
    }

    // Note: image_generator column doesn't exist in schema, removed
    insertPayload.saved_to_library = true;
    insertPayload.parent_image_id = isRefinement ? parentImageId : null;
    insertPayload.chain_depth = isRefinement ? 1 : 0;
    insertPayload.is_chain_origin = !isRefinement;
    insertPayload.refinement_instruction = isRefinement
      ? refinementInstruction
      : null;

    const savedImage = await insertGeneratedImageRecord(
      supabase,
      insertPayload,
    );

    /**
     * -------------------------
     * 11. NOTE: Images are saved to generated_images table ONLY
     * -------------------------
     * Previously, images were also saved to the prompts table, but this caused
     * them to appear in both Archives and Image Library. Now images only go to
     * generated_images table and the Image Library reads from there directly.
     * 
     * The prompts table is for TEXT prompts/recipes, not generated images.
     */
    console.log(`[generate-madison-image] ✅ Image saved to generated_images table: ${savedImage?.id}`);
    console.log(`[generate-madison-image] Image will appear in Image Library via generated_images table`);

    /**
     * -------------------------
     * 12. Return response
     * -------------------------
     */
    return new Response(
      JSON.stringify({
        imageUrl,
        savedImageId: savedImage?.id,
        description: "Generated via Gemini",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("❌ generate-madison-image Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Image generation failed.",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});