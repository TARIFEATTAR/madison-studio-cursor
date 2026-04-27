/**
 * 4-layer prompt assembler for the SKU-driven grid/thumbnail/hero workflow.
 *
 * FINAL PROMPT =
 *   [GLOBAL SYSTEM]  ← always on, never changes
 * + [PRESET]         ← canvas + background + lighting + shadow + composition + quality
 * + [SKU DATA]       ← structured facts from the Convex product row
 * + [CHIP OVERRIDES] ← optional variant overrides (material / cap / fitment)
 * + [LIQUID]         ← optional fill state
 * + [CONSTRAINTS]    ← always on, never changes
 *
 * Returns the assembled prompt string plus the canvas dimensions from the
 * preset, so the caller can pass both into the image endpoint.
 */

import {
  applicatorFramingOverride,
  buildPresetBlock,
  getImagePreset,
  type ImagePreset,
} from "@/config/imagePresets";
import {
  buildBestBottlesBrandBlock,
  isBestBottlesFamily,
} from "@/config/bestBottlesBrand";
import { getBodyShapeDescriptor } from "@/config/familyShapeDescriptors";
import { getApplicatorShapeDescriptor } from "@/config/applicatorShapeDescriptors";
import {
  buildProductSpecBlock,
  type ComponentScope,
  type ConvexProductLike,
} from "./skuInjector";

/**
 * Paper-doll body variant. Two bodies cover every SKU in a family/capacity/
 * color cohort:
 *   - "no-tube":  used by closures (Reducer, Stopper, Cap, Over Cap)
 *   - "with-tube": used by sprayers + pumps + droppers (the tube lives in
 *                  the body layer, fitments are tube-less)
 * See applicatorShapeDescriptors.APPLICATORS_REQUIRING_TUBE_BODY.
 */
export type PaperDollBodyVariant = "no-tube" | "with-tube";

export const GLOBAL_SYSTEM_BLOCK = [
  "GLOBAL SYSTEM:",
  "You are a high-end product photography engine specialized in luxury glass perfume bottles.",
  "",
  "NON-NEGOTIABLE RULES:",
  "- Preserve exact geometry and proportions of the product",
  "- No warping, stretching, or redesigning the bottle shape",
  "- Maintain physically accurate glass behavior (refraction, reflection, transparency)",
  "- Lighting must be realistic and consistent with physical studio or natural conditions",
  "- Avoid artificial, CGI, or plastic-looking outputs",
  "",
  "VISUAL QUALITY:",
  "- Photo-realistic, editorial-grade output",
  "- High dynamic range, no clipped highlights",
  "- Subtle imperfections allowed for realism (faint mould seam, tooling marks at the base)",
  "",
  "COMPOSITION RULES:",
  "- The product remains the focal point",
  "- Clean framing, no clutter",
  "- Maintain consistent scale across images",
  "",
  "If a request conflicts with realism or geometry, prioritize realism and product accuracy.",
].join("\n");

export const CONSTRAINT_BLOCK = [
  "CONSTRAINT LAYER:",
  "- Do not modify bottle proportions under any circumstances",
  "- Maintain the camera angle defined by the preset (front-facing, eye-level, 85mm product lens at f/8 unless otherwise stated)",
  "- Keep the bottle centered unless the preset explicitly specifies otherwise",
  "- Do not exaggerate thickness, curvature, or reflections",
  "- Ensure all reflections align with the environment and light source described by the preset",
  "",
  "SCALING CONSISTENCY:",
  "- Every SKU rendered through this preset must appear as if photographed in the same studio system",
  "- Maintain consistent lighting ratios across all renders",
  "- Maintain visual uniformity across batch outputs — no per-image art direction drift",
  "",
  "OUTPUT RULES:",
  "- Never add labels, text, badges, watermarks, packaging, or brand names",
  "- Never add hands, props, spray mist, flowers, or secondary objects",
  "- Never render a transparent or checkerboard background unless the preset is a paper-doll component layer",
].join("\n");

export interface ChipOverrides {
  /** Maps onto BOTTLE_COLORS ids in src/config/consistencyVariations.ts. */
  bottleMaterialPrompt?: string | null;
  /** Maps onto CAP_COLORS ids. */
  capFinishPrompt?: string | null;
  /** Maps onto FITMENT_TYPES ids. */
  fitmentPrompt?: string | null;
}

export interface LiquidSpec {
  present: boolean;
  /** e.g. "warm amber perfume", "deep rose oil", "pale champagne gold". */
  color?: string;
  /** 0–100. Defaults to 75 when `present` is true and no level is given. */
  fillPercent?: number;
}

export function buildChipOverrideBlock(overrides: ChipOverrides): string | null {
  const parts: string[] = [];
  if (overrides.bottleMaterialPrompt) {
    parts.push(`- BOTTLE BODY OVERRIDE: ${overrides.bottleMaterialPrompt}`);
  }
  if (overrides.capFinishPrompt) {
    parts.push(`- CAP OVERRIDE: ${overrides.capFinishPrompt}`);
  }
  if (overrides.fitmentPrompt) {
    parts.push(`- FITMENT OVERRIDE: ${overrides.fitmentPrompt}`);
  }
  if (parts.length === 0) return null;
  return ["CHIP OVERRIDES (these override the SKU defaults where set):", ...parts].join("\n");
}

export function buildLiquidBlock(liquid: LiquidSpec | null | undefined): string | null {
  if (!liquid) return null;
  if (!liquid.present) {
    return [
      "LIQUID STATE:",
      "- Liquid present: false",
      "- Bottle must be fully empty",
      "- Emphasize internal reflections and transparency through the empty cavity",
    ].join("\n");
  }
  const level = Math.max(0, Math.min(100, liquid.fillPercent ?? 75));
  const color = liquid.color?.trim() || "neutral champagne-gold";
  return [
    "LIQUID STATE:",
    "- Liquid present: true",
    `- Color: ${color}`,
    `- Fill level: ${level}%`,
    "- Include a subtle gradient (slightly darker at the base than at the surface)",
    "- Include a visible meniscus at the glass edge where the liquid meets the inner wall",
    "- Render realistic light absorption and refraction through the liquid and surrounding glass",
  ].join("\n");
}

export interface AssemblePromptInput {
  presetId: string;
  sku: ConvexProductLike;
  chipOverrides?: ChipOverrides;
  liquid?: LiquidSpec | null;
  /**
   * Paper-doll component scope. "full" = bottle + fitment + cap (default).
   * "body" = body-only PNG. "fitment" = fitment/cap-only PNG.
   * Forwarded to buildProductSpecBlock and used to choose the prompt shape
   * (focused template for paper-doll body/fitment, full 4-layer for "full").
   */
  componentScope?: ComponentScope;
  /**
   * For body scope only — selects the body variant prompt language. Default
   * "no-tube" if unspecified.
   */
  bodyVariant?: PaperDollBodyVariant;
}

/**
 * Reference-deferential paper-doll prompt template for body and fitment.
 *
 * The operator's directive: every paper-doll image is purely an
 * ENHANCEMENT of an attached reference. Same shape, same components,
 * same composition, same proportions, same position. Do not redraw,
 * add, remove, or invent. Only the photographic quality changes.
 *
 * Family/applicator shape descriptors are kept as supporting context at
 * the bottom of the prompt — fallback for the rare no-reference case
 * where the model has nothing to anchor to. With a reference attached
 * (the normal flow), the preservation directives at the top dominate.
 */
function buildPaperDollComponentPrompt(
  sku: ConvexProductLike,
  preset: ImagePreset,
  scope: "body" | "fitment",
  bodyVariant?: PaperDollBodyVariant,
): string {
  const family = sku.family ?? "perfume";
  const capacity = sku.capacityMl ?? null;
  const color = (sku.color ?? "clear").toLowerCase();
  const canvasW = preset.canvas.widthPx;
  const canvasH = preset.canvas.heightPx;

  // Universal enhance-only preservation block — identical for body + fitment.
  const preservationBlock = [
    `Polish the attached reference image into editorial-grade luxury product photography.`,
    ``,
    `PRESERVE EVERYTHING ABOUT THE REFERENCE EXACTLY:`,
    `- Same shape — every silhouette and outline identical`,
    `- Same components — every element shown in the reference is in the output, nothing added, nothing removed`,
    `- Same composition — subject in the same position on the canvas`,
    `- Same proportions — height-to-width ratio and every relative sizing identical`,
    `- Same orientation — no rotation, no flipping, no perspective change`,
    ``,
    `DO NOT change geometry.`,
    `DO NOT redraw the subject.`,
    `DO NOT add decorations, ornamentation, hoses, tassels, tubes, or other elements not present in the reference.`,
    `DO NOT remove elements present in the reference.`,
    ``,
    `The output must be visually identical to the reference in form. ONLY the photographic quality should differ.`,
    ``,
    `ENHANCE ONLY:`,
    `- Glass quality: editorial-grade specular reflective highlights along edges and curves, beautiful clean rim-light, realistic refraction through transparent areas, subtle internal caustics, believable wall thickness, natural rim highlights — luxury glass-photography quality, the kind of specular reflection seen on premium fragrance bottles in high-end campaigns`,
    `- Material rendering: authentic surface treatment for each material (polished metal reads as polished metal, mesh reads as mesh, silk reads as silk, rubber reads as rubber)`,
    `- Lighting: soft multi-directional studio lighting with crisp specular accents — IDENTICAL key direction, color temperature, and intensity to companion paper-doll layers in this family so all components composite as one coherent scene`,
    `- Color fidelity: clean, true-to-reference colors with no shift`,
    ``,
    `Background: smooth seamless parchment-cream plate (#EEE6D4), edge-to-edge, no gradient, no texture, no vignette. Canvas: ${canvasW} × ${canvasH}.`,
    ``,
    `Style: editorial, high-end, luxurious, print-ready product photography — Hasselblad-grade. Ultra-detailed, photorealistic. No CGI sheen, no plastic-looking artifacts, no painterly stylization.`,
  ].join("\n");

  // Scope-specific addendum — context for what's IN the reference. With a
  // reference attached, this is supplementary; without one, it carries the
  // creative weight.
  let contextBlock: string;
  if (scope === "body") {
    const variant: PaperDollBodyVariant = bodyVariant ?? "no-tube";
    const familyShape = getBodyShapeDescriptor(sku.family);
    const tubeClause =
      variant === "with-tube"
        ? `Inside the bottle — visible through the clear glass walls with subtle refraction distortion — a thin clear plastic dip tube descends from the center of the neck opening straight downward to within a few millimeters of the interior base. The tube is a structural element of THIS BODY VARIANT and must be present in the output.`
        : `The bottle interior is empty — no tube, no fitment, no liquid, no mechanism. Pure clear glass interior.`;
    contextBlock = [
      ``,
      `CONTEXT (subject of the reference):`,
      `Isolated ${color} glass bottle BODY (no cap, no fitment, no sprayer above the neck) for a ${capacity ? `${capacity}ml ` : ""}${family} bottle. ${familyShape}`,
      tubeClause,
      `Composition: only the bottle in the frame. No labels, text, logos, badges, watermarks, or secondary objects. Subtle soft contact shadow directly beneath the base for grounding.`,
    ].join("\n");
  } else {
    const applicator = sku.applicator ?? "fitment";
    const capStyle = sku.capStyle;
    const capColor = sku.capColor;
    const trim = sku.trimColor;
    const colorwayDesc = [applicator, capStyle, capColor, trim ? `with ${trim} trim` : null]
      .filter(Boolean)
      .join(", ");
    const applicatorShape = getApplicatorShapeDescriptor(sku.applicator);
    contextBlock = [
      ``,
      `CONTEXT (subject of the reference):`,
      `Isolated ${colorwayDesc} fitment component for a ${family} glass bottle. ${applicatorShape}`,
      `Composition: only the fitment in the frame. NO bottle, no glass body, no labels, no text, no badges, no watermarks, no secondary objects. Subtle soft contact shadow only for grounding.`,
    ].join("\n");
  }

  return `${preservationBlock}\n${contextBlock}`;
}

export interface AssembledPrompt {
  prompt: string;
  canvas: { widthPx: number; heightPx: number };
  preset: ImagePreset;
  blocks: {
    global: string;
    /**
     * Brand-context block — populated only for SKUs in
     * `BEST_BOTTLES_FAMILIES`. Gives the model explicit Best Bottles
     * visual-language guardrails (palette, typography, retired legacy
     * aesthetic). Null for non-Best-Bottles SKUs and for paper-doll
     * component-scope renders.
     */
    brand: string | null;
    preset: string;
    sku: string;
    chipOverrides: string | null;
    liquid: string | null;
    constraints: string;
  };
}

export function assemblePrompt(input: AssemblePromptInput): AssembledPrompt {
  const preset = getImagePreset(input.presetId);
  const scope = input.componentScope ?? "full";

  // PAPER-DOLL BODY / FITMENT — focused, reference-anchored template.
  // The verbose 4-layer assembly was producing prompts so dense that
  // gpt-image-2 ignored the reference and generated whatever it wanted.
  // The focused template (operator-tested structure) is more directive
  // and treats the attached reference as authoritative geometry.
  if (
    preset.kind === "paper_doll_layer" &&
    (scope === "body" || scope === "fitment")
  ) {
    const focused = buildPaperDollComponentPrompt(
      input.sku,
      preset,
      scope,
      input.bodyVariant,
    );
    return {
      prompt: focused,
      canvas: preset.canvas,
      preset,
      blocks: {
        global: "",
        // Paper-doll component renders are transparent layer assets — no
        // brand context needed (the brand language is for full-scene
        // catalog imagery, not isolated transparent components).
        brand: null,
        preset: buildPresetBlock(preset),
        sku: focused,
        chipOverrides: null,
        liquid: null,
        constraints: "",
      },
    };
  }

  // FULL SCENE — keep the 4-layer assembly for masters / hero / grid tiles.
  // Applicator-aware framing override: tassel / bulb / stopper SKUs need a
  // smaller body fill so the assembly doesn't get cropped at the canvas
  // edge. Falls back to the preset's default for plain caps.
  const compositionOverride =
    applicatorFramingOverride(input.sku.applicator) ?? undefined;
  const presetBlock = buildPresetBlock(preset, { compositionOverride });
  const skuBlock = buildProductSpecBlock(input.sku, {
    componentScope: input.componentScope,
  });
  const chipBlock = input.chipOverrides ? buildChipOverrideBlock(input.chipOverrides) : null;
  const liquidBlock = buildLiquidBlock(input.liquid ?? null);

  // BRAND CONTEXT — only injected for Best Bottles family SKUs. The block
  // gives the image model explicit guardrails about Best Bottles' visual
  // language (warm-neutral palette, editorial restraint, muted-gold-only
  // accent, retired legacy navy aesthetic) so generated catalog imagery
  // matches the 2026 design system instead of regressing to the wholesale-
  // supplier flyer treatment in the legacy catalog. See
  // `src/config/bestBottlesBrand.ts` and `docs/best-bottles-brand/`.
  const brandBlock = isBestBottlesFamily(input.sku.family)
    ? buildBestBottlesBrandBlock()
    : null;

  const sections = [
    GLOBAL_SYSTEM_BLOCK,
    brandBlock,
    presetBlock,
    skuBlock,
    chipBlock,
    liquidBlock,
    CONSTRAINT_BLOCK,
  ].filter((section): section is string => section !== null);

  return {
    prompt: sections.join("\n\n"),
    canvas: preset.canvas,
    preset,
    blocks: {
      global: GLOBAL_SYSTEM_BLOCK,
      brand: brandBlock,
      preset: presetBlock,
      sku: skuBlock,
      chipOverrides: chipBlock,
      liquid: liquidBlock,
      constraints: CONSTRAINT_BLOCK,
    },
  };
}
