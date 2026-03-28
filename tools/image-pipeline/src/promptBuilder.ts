/**
 * Prompt Builder - The Orchestrator
 *
 * Assembles the final image generation prompt from all components:
 * visual masters, photography ontology, bottle type, brand context, etc.
 *
 * This is the simplified standalone version of Madison Studio's
 * generate-madison-image edge function (1,400 lines → ~200 lines).
 */

import { type VisualSquad, getVisualStyleDirective, getVisualMasterContext } from './visualMasters.js';
import { type ProModeControls, enhancePromptWithOntology } from './photographyOntology.js';
import { type ProductData, buildBottleTypePrompt, detectBottleType } from './bottleType.js';
import { type BrandContext } from './promptFormula.js';

export interface GenerationRequest {
  /** User's creative prompt / description */
  prompt: string;
  /** Use case: product_hero, hero_banner_standard, instagram_feed, etc. */
  imageType?: string;
  /** Visual squad override (auto-detected from prompt if not set) */
  visualSquad?: VisualSquad;
  /** Aspect ratio like "1:1", "16:9", "9:16" */
  aspectRatio?: string;
  /** Pro mode camera/lighting/environment controls */
  proMode?: ProModeControls;
  /** Product data for bottle type detection */
  product?: ProductData;
  /** Brand context (colors, style keywords) */
  brand?: BrandContext;
  /** Reference image URLs */
  referenceImages?: Array<{ url: string; label?: string; description?: string }>;
}

export interface BuiltPrompt {
  /** The final assembled prompt to send to Freepik/Gemini */
  prompt: string;
  /** Which visual squad was selected */
  visualSquad: VisualSquad;
  /** Which visual master was selected */
  visualMaster: string;
  /** Negative prompt (things to avoid) */
  negativePrompt: string;
}

/**
 * Build a complete image generation prompt from all inputs
 */
export function buildPrompt(req: GenerationRequest): BuiltPrompt {
  const parts: string[] = [];
  const negativeParts: string[] = [
    "blurry", "out-of-focus", "distorted text", "unrealistic proportions",
    "watermarks", "low quality", "pixelation", "frames", "borders",
    "white borders", "beige frames"
  ];

  // 1. BOTTLE TYPE (highest priority — goes first)
  if (req.product) {
    const bottlePrompt = buildBottleTypePrompt(req.product);
    if (bottlePrompt) {
      parts.push(bottlePrompt);

      // Add to negative prompt
      const bt = detectBottleType(req.product);
      if (bt.isOil) {
        negativeParts.push("spray mechanism", "atomizer", "pump", "dip tube", "hose");
      } else if (bt.isSpray) {
        negativeParts.push("dropper", "pipette", "roller ball", "glass wand");
      }
    }
  }

  // 2. REFERENCE IMAGE INSTRUCTIONS
  if (req.referenceImages && req.referenceImages.length > 0) {
    parts.push("=== REFERENCE IMAGE DIRECTIVES ===");
    parts.push("CRITICAL: Use the EXACT product from the reference image.");
    parts.push("DO NOT create a new product - COPY the exact product shown.");
    parts.push("MANDATORY PRESERVATION:");
    parts.push("- EXACT product shape, proportions, and design");
    parts.push("- EXACT product colors, texture, and material finish");
    parts.push("- EXACT branding, labels, and decorative elements");
    parts.push("");
  }

  // 3. USER'S CREATIVE DIRECTION
  parts.push("=== CREATIVE DIRECTION ===");
  parts.push(req.prompt);
  parts.push("");

  // 4. VISUAL MASTER TRAINING
  const imageType = req.imageType || 'default';
  const { strategy, directive } = getVisualMasterContext(imageType, req.prompt);

  // Allow squad override
  const effectiveSquad = req.visualSquad || strategy.visualSquad;
  const effectiveDirective = req.visualSquad
    ? getVisualStyleDirective(req.visualSquad)
    : directive;

  if (effectiveDirective) {
    parts.push("=== VISUAL MASTER TRAINING ===");
    parts.push(effectiveDirective);
    parts.push("");
  }

  // 5. PROFESSIONAL PHOTOGRAPHY SPECS
  if (req.proMode && Object.keys(req.proMode).length > 0) {
    const ontologySpecs = enhancePromptWithOntology("", req.proMode);
    if (ontologySpecs) {
      parts.push("=== PHOTOGRAPHY SPECIFICATIONS ===");
      parts.push(ontologySpecs);
      parts.push("");
    }
  } else {
    // Default professional specs
    const lightingVariations = [
      "Butterfly (Paramount) — Soft/Diffused, 3:1 contrast",
      "Rembrandt — Soft with subtle shadow, 4:1 contrast",
      "Loop — Soft directional, 3.5:1 contrast",
      "Split — Dramatic but controlled, 5:1 contrast",
      "Broad — Even and flattering, 2.5:1 contrast",
    ];
    const idx = Date.now() % lightingVariations.length;
    parts.push("=== PHOTOGRAPHY SPECIFICATIONS ===");
    parts.push(`LIGHTING SETUP: ${lightingVariations[idx]}`);
    parts.push("LENS CHARACTER: Spherical (clean, modern commercial look)");
    parts.push("");
  }

  // 6. TECHNICAL REQUIREMENTS
  parts.push("TECHNICAL REQUIREMENTS:");
  parts.push("- 8K resolution, sharp focus");
  parts.push("- Professional color grading");
  parts.push("- Realistic shadows and reflections");
  parts.push("- Accurate material physics (glass refraction, metal specular highlights)");
  parts.push("- No distortion, artifacts, or watermarks");
  parts.push("- Image fills entire canvas edge-to-edge");
  parts.push("");

  // 7. BRAND CONTEXT
  if (req.brand) {
    if (req.brand.colors && req.brand.colors.length > 0) {
      parts.push(`BRAND COLORS: ${req.brand.colors.join(", ")}`);
    }
    if (req.brand.styleKeywords && req.brand.styleKeywords.length > 0) {
      parts.push(`BRAND AESTHETIC: ${req.brand.styleKeywords.join(", ")}`);
    }
    if (req.brand.productName) {
      parts.push(`PRODUCT: ${req.brand.productName}`);
    }
    parts.push("");
  }

  // 8. ASPECT RATIO
  if (req.aspectRatio) {
    parts.push(`OUTPUT ASPECT RATIO: ${req.aspectRatio}`);
    parts.push("Compose the image to work perfectly at this ratio.");
    parts.push("");
  }

  return {
    prompt: parts.join("\n"),
    visualSquad: effectiveSquad,
    visualMaster: req.visualSquad
      ? (effectiveSquad === 'THE_MINIMALISTS' ? 'AVEDON_ISOLATION'
        : effectiveSquad === 'THE_STORYTELLERS' ? 'LEIBOVITZ_ENVIRONMENT'
        : 'RICHARDSON_RAW')
      : strategy.primaryVisualMaster,
    negativePrompt: negativeParts.join(", "),
  };
}
