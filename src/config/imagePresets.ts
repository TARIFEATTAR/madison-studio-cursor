/**
 * Image preset registry for the grid / thumbnail / hero lane.
 *
 * A preset is a named bundle of everything that isn't SKU-specific:
 * canvas size, background, studio lighting language, shadow language,
 * composition rules, quality language, and negative constraints.
 *
 * Four presets share the parchment-cream lineage (#EEE6D4) so the same
 * SKU rendered through any of them produces a matched set across catalog,
 * hero, marketplace, and Sanity-delivery surfaces. One preset is a
 * transparent paper-doll component layer for the configurator.
 *
 * Used by the SKU-driven prompt assembler:
 *   [GLOBAL] + [PRESET] + [SKU DATA] + [CHIPS] + [CONSTRAINTS]
 */

export type ImagePresetKind = "final_render" | "paper_doll_layer";

export type ImagePresetOrientation = "portrait" | "landscape" | "square";

export interface ImagePreset {
  id: string;
  label: string;
  purpose: string;
  kind: ImagePresetKind;
  canvas: { widthPx: number; heightPx: number };
  aspectRatio: string;
  orientation: ImagePresetOrientation;
  backgroundHex: string | "transparent";
  backgroundDescription: string;
  lightingLanguage: string;
  shadowLanguage: string;
  compositionLanguage: string;
  qualityLanguage: string;
  negativeLanguage: string;
}

const SHARED_LIGHTING_LANGUAGE =
  "single soft key light from upper-front-left at ~45° elevation (clock position 7:30–8:00 relative to the bottle base), " +
  "with gentle bounce-fill from the right at matched color temperature — no second hard source; " +
  "multiple small specular highlights scattered along the shoulder and curves — broken and irregular, " +
  "never a single broad CGI light stripe; one subtle specular kicker on glass edges where geometry suggests it; " +
  "single soft window-light feel, not multi-strobe drama; Hasselblad-grade color accuracy, neutral white balance";

const SHARED_SHADOW_LANGUAGE =
  "soft contact shadow casting BACK-RIGHT at the 2:00–2:30 clock position (opposite the upper-front-left key light), " +
  "extending approximately 30–40% of the bottle's height past the base on the back-right diagonal; " +
  "25–30% opacity at the densest point closest to the bottle base, fading to ~5% at the tip; " +
  "soft penumbra throughout (single soft source = soft edge), never crisp; " +
  "consistent direction across every component in a family so paper-doll layers composite as one lit scene; " +
  "no shadow directly underneath the bottle (would suggest overhead light, off-brand), no dramatic long cast, no double shadow, no harsh edge";

const SHARED_QUALITY_LANGUAGE =
  "photo-realistic editorial luxury product photography in the style of Aesop e-commerce hero photography crossed with Kinfolk magazine still-life — " +
  "warm cream backdrop, single soft directional key light, single-subject composition, gallery-like restraint, slow editorial pace, considered and contemplative; " +
  "MATCH THE PHOTOGRAPHIC STYLE ONLY — the subject is the Best Bottles glass bottle from the reference image; do not invent or substitute product designs from those brands; " +
  "enhanced glass clarity with realistic refraction; believable base thickness visible through the bottom of the glass; crisp readable neck threads where exposed; " +
  "faint mould seam and subtle tooling marks at the base allowed — real pressed-glass micro-imperfections, not CGI-perfect";

const SHARED_NEGATIVE_LANGUAGE =
  "no label, no text, no badge, no watermark, no brand name, no props, no secondary product, " +
  "no hands, no spray mist, no flowers; no chrome-CGI sheen on plastic caps; " +
  "no transparent or checkerboard background; no broad central reflection stripe on the glass body; " +
  "no surface texture, no stone, no wood, no fabric, no horizon line, no implied tabletop edge; " +
  "no overhead-flat shadow directly beneath the bottle, no shadow cast to the left or back-left; " +
  "no cool/blue light, no daylight-noon flat lighting, no rim light, no backlight haze; " +
  "no Aesop bottles, no Aesop labels, no Aesop product silhouettes — Aesop is a STYLE reference only; " +
  "no Kinfolk magazine page chrome (no titles, captions, page edges, fold lines, magazine bindings) — Kinfolk is a STYLE reference only; " +
  "no other brand's bottle shapes — the subject is the Best Bottles bottle from the reference image only";

const PARCHMENT_BACKGROUND_DESCRIPTION =
  "seamless parchment-cream backdrop (#EEE6D4) with a subtle paper grain, completely uncluttered, " +
  "no gradient, no texture pattern, no vignette";

function framingLanguage(productHeightPercent: [number, number]): string {
  const [lo, hi] = productHeightPercent;
  return (
    `product perfectly centered horizontally; base resting at the canonical anchor line with a natural contact shadow; ` +
    `product fills approximately ${lo}–${hi}% of the vertical canvas height; generous padding on all sides so nothing ` +
    `feels cramped and the full product assembly (including any bulb, tassel, or sprayer extending beyond the body) ` +
    `remains visible inside the frame`
  );
}

export const GRID_CARD_2000X2200: ImagePreset = {
  id: "grid-card-2000x2200",
  label: "Grid Card · 2000 × 2200",
  purpose:
    "Catalog grid tile for bestbottles.com. Matches the current image-gen pipeline output dimensions.",
  kind: "final_render",
  canvas: { widthPx: 2000, heightPx: 2200 },
  aspectRatio: "10:11",
  orientation: "portrait",
  backgroundHex: "#EEE6D4",
  backgroundDescription: PARCHMENT_BACKGROUND_DESCRIPTION,
  lightingLanguage: SHARED_LIGHTING_LANGUAGE,
  shadowLanguage: SHARED_SHADOW_LANGUAGE,
  compositionLanguage: framingLanguage([72, 78]),
  qualityLanguage: SHARED_QUALITY_LANGUAGE,
  negativeLanguage: SHARED_NEGATIVE_LANGUAGE,
};

export const SANITY_HERO_928X1152: ImagePreset = {
  id: "sanity-hero-928x1152",
  label: "Sanity Hero · 928 × 1152",
  purpose:
    "Matches CDN hero dimensions for already-delivered paper-doll productGroups. Use for parity with live assets.",
  kind: "final_render",
  canvas: { widthPx: 928, heightPx: 1152 },
  aspectRatio: "4:5",
  orientation: "portrait",
  backgroundHex: "#EEE6D4",
  backgroundDescription: PARCHMENT_BACKGROUND_DESCRIPTION,
  lightingLanguage: SHARED_LIGHTING_LANGUAGE,
  shadowLanguage: SHARED_SHADOW_LANGUAGE,
  compositionLanguage: framingLanguage([74, 80]),
  qualityLanguage: SHARED_QUALITY_LANGUAGE,
  negativeLanguage: SHARED_NEGATIVE_LANGUAGE,
};

/**
 * Wider paper-doll variant for families with horizontally-extending fitment
 * assemblies (Empire bulb-sprayer + tassel mass extends ~500px left of the
 * bottle axis). Same lighting / material / cream-background language as the
 * 1000×1300 variant — only the canvas width changes. Bottle center anchored
 * at x=1000 so the extra 500px lands on the LEFT where the bulb hangs.
 *
 * Cylinder family continues to use the 1000×1300 variant; existing Cylinder
 * PSDs do not need re-export.
 */
export const PAPER_DOLL_COMPONENT_1500X1300: ImagePreset = {
  id: "paper-doll-component-1500x1300",
  label: "Paper-Doll Layer · 1500 × 1300 (wide)",
  purpose:
    "Wider paper-doll layer for families with side-extending fitments (Empire bulb-sprayer + tassel). 500px of extra width lands on the LEFT of the bottle axis to accommodate the bulb/hose/tassel assembly without clipping.",
  kind: "paper_doll_layer",
  canvas: { widthPx: 1500, heightPx: 1300 },
  aspectRatio: "15:13",
  orientation: "portrait",
  backgroundHex: "#EEE6D4",
  backgroundDescription:
    "seamless parchment-cream backdrop (#EEE6D4), matching the fixed paper-doll canvas color on bestbottles.com so glass refraction through the bottle body reads as a coherent photograph once composited",
  lightingLanguage:
    "single soft key light from upper-front-left at ~45° elevation (clock position 7:30–8:00 relative to the bottle base), " +
    "with gentle bounce-fill from the right at matched color temperature; " +
    "IDENTICAL lighting direction, color temperature, and intensity across every component layer in this family " +
    "(body, fitment, cap, overcap) so they read as one coherent scene when composited; " +
    "Hasselblad-grade color accuracy, neutral white balance",
  shadowLanguage:
    "soft contact shadow casting BACK-RIGHT at the 2:00–2:30 clock position (opposite the upper-front-left key light), " +
    "extending ~30–40% of the bottle's height past the base on the back-right diagonal; " +
    "25–30% opacity at the densest point closest to the base, soft penumbra throughout; " +
    "shadow direction and length IDENTICAL across every component in the family so composited assemblies read as one lit scene; " +
    "no shadow directly underneath the component — the directional cast at 2:00–2:30 is the brand standard",
  compositionLanguage:
    "component rendered at its canonical z-anchor for this family so layers composite at (0,0); " +
    "bottle body anchored at canvas x=1000 (right of canvas center) so the extra 500px on the LEFT accommodates bulb-sprayer, tassel, and hose extensions without clipping; " +
    "bottle base at the bottom of the canvas; fitments anchor so their neck-seating collar sits at the bottle's neck y-coordinate; " +
    "caps anchor above the fitment — identical anchor positions preserved across every component within the family",
  qualityLanguage:
    "photo-realistic editorial luxury product photography in the style of Aesop e-commerce hero photography crossed with Kinfolk magazine still-life — " +
    "warm cream backdrop, single soft directional key light, gallery-like restraint, slow editorial pace, considered and contemplative; " +
    "MATCH THE PHOTOGRAPHIC STYLE ONLY — the subject is the Best Bottles component from the reference image; do not invent or substitute product designs from those brands; " +
    "enhanced glass clarity with realistic refraction; believable base thickness visible through the bottom of the glass; accurate material rendering " +
    "(glass / polished metal / phenolic plastic / silk tassel / rubber bulb) at the same level as the final-render presets; " +
    "MATERIAL AND LIGHTING LOCKED across every component in this family so body + fitment + cap read as one photograph",
  negativeLanguage:
    "no secondary components (render only the targeted body, fitment, or cap — never combine); no label, no text, no badge, no watermark; " +
    "no shadow directly underneath the component (the directional 2:00–2:30 cast is the brand standard); no broad central CGI stripe on glass; " +
    "no color variation in the cream background — must be exactly #EEE6D4; no checkerboard alpha visualization; " +
    "no Aesop bottles, no Aesop labels, no Aesop product silhouettes — Aesop is a STYLE reference only; " +
    "no Kinfolk magazine page chrome (no titles, captions, page edges, fold lines, magazine bindings) — Kinfolk is a STYLE reference only; " +
    "no other brand's bottle shapes — the subject is the Best Bottles component from the reference image only",
};

export const PAPER_DOLL_COMPONENT_1000X1300: ImagePreset = {
  id: "paper-doll-component-1000x1300",
  label: "Paper-Doll Layer · 1000 × 1300",
  purpose:
    "Layered PNG for the Sanity-backed configurator. Rendered on the SAME cream backdrop the website uses for its paper-doll canvas so glass refraction reads correctly once composited. Layers composite at (0,0).",
  kind: "paper_doll_layer",
  canvas: { widthPx: 1000, heightPx: 1300 },
  aspectRatio: "10:13",
  orientation: "portrait",
  // NOT transparent. Glass refracts the background color through its body; if
  // we render on white and then strip to alpha, the glass retains white-
  // through-glass which looks visibly wrong against a cream website canvas.
  // We render on the EXACT cream the website displays, then fal.ai BiRefNet
  // strips only the background *outside* the bottle silhouette — the
  // cream-through-glass inside the body stays baked in and matches the final
  // website canvas perfectly.
  backgroundHex: "#EEE6D4",
  backgroundDescription:
    "seamless parchment-cream backdrop (#EEE6D4), matching the fixed paper-doll canvas color on bestbottles.com so glass refraction through the bottle body reads as a coherent photograph once composited",
  lightingLanguage:
    "single soft key light from upper-front-left at ~45° elevation (clock position 7:30–8:00 relative to the bottle base), " +
    "with gentle bounce-fill from the right at matched color temperature; " +
    "IDENTICAL lighting direction, color temperature, and intensity across every component layer in this family " +
    "(body, fitment, cap, overcap) so they read as one coherent scene when composited; " +
    "Hasselblad-grade color accuracy, neutral white balance",
  shadowLanguage:
    "soft contact shadow casting BACK-RIGHT at the 2:00–2:30 clock position (opposite the upper-front-left key light), " +
    "extending ~30–40% of the bottle's height past the base on the back-right diagonal; " +
    "25–30% opacity at the densest point closest to the base, soft penumbra throughout; " +
    "shadow direction and length IDENTICAL across every component in the family so composited assemblies read as one lit scene; " +
    "no shadow directly underneath the component — the directional cast at 2:00–2:30 is the brand standard",
  compositionLanguage:
    "component rendered at its canonical z-anchor for this family so layers composite at (0,0); " +
    "bottle body base anchors at the bottom of the canvas, fitments anchor so their neck-seating collar sits at the bottle's neck y-coordinate, " +
    "caps anchor above the fitment — identical anchor positions preserved across every component within the family",
  qualityLanguage:
    "photo-realistic editorial luxury product photography in the style of Aesop e-commerce hero photography crossed with Kinfolk magazine still-life — " +
    "warm cream backdrop, single soft directional key light, gallery-like restraint, slow editorial pace, considered and contemplative; " +
    "MATCH THE PHOTOGRAPHIC STYLE ONLY — the subject is the Best Bottles component from the reference image; do not invent or substitute product designs from those brands; " +
    "enhanced glass clarity with realistic refraction; believable base thickness visible through the bottom of the glass; accurate material rendering " +
    "(glass / polished metal / phenolic plastic / silk tassel / rubber bulb) at the same level as the final-render presets; " +
    "MATERIAL AND LIGHTING LOCKED across every component in this family so body + fitment + cap read as one photograph",
  negativeLanguage:
    "no secondary components (render only the targeted body, fitment, or cap — never combine); no label, no text, no badge, no watermark; " +
    "no shadow directly underneath the component (the directional 2:00–2:30 cast is the brand standard); no broad central CGI stripe on glass; " +
    "no color variation in the cream background — must be exactly #EEE6D4; no checkerboard alpha visualization; " +
    "no Aesop bottles, no Aesop labels, no Aesop product silhouettes — Aesop is a STYLE reference only; " +
    "no Kinfolk magazine page chrome (no titles, captions, page edges, fold lines, magazine bindings) — Kinfolk is a STYLE reference only; " +
    "no other brand's bottle shapes — the subject is the Best Bottles component from the reference image only",
};

export const LANDSCAPE_HERO_2400X1350: ImagePreset = {
  id: "landscape-hero-2400x1350",
  label: "Landscape Hero · 2400 × 1350",
  purpose:
    "Product-detail hero banner, marketing surfaces, campaign imagery. 16:9 landscape for wide editorial framing.",
  kind: "final_render",
  canvas: { widthPx: 2400, heightPx: 1350 },
  aspectRatio: "16:9",
  orientation: "landscape",
  backgroundHex: "#EEE6D4",
  backgroundDescription: PARCHMENT_BACKGROUND_DESCRIPTION,
  lightingLanguage: SHARED_LIGHTING_LANGUAGE,
  shadowLanguage: SHARED_SHADOW_LANGUAGE,
  compositionLanguage:
    "product horizontally centered within the right two-thirds of the frame to leave cinematic negative space on the left for " +
    "editorial breathing room; base at the canonical anchor line; product fills approximately 70–78% of the vertical canvas height; " +
    "full product assembly (including any bulb, tassel, or sprayer) remains entirely visible with generous padding on every side",
  qualityLanguage: SHARED_QUALITY_LANGUAGE,
  negativeLanguage: SHARED_NEGATIVE_LANGUAGE,
};

/**
 * Exploded "uncapped + cap-beside" variant of the Grid Card preset for SKUs
 * where the catalog photography traditionally shows the bottle with its
 * over-cap removed and standing upright next to it (Lotion Pump · Clear
 * Overcap variants, decorative cap+stopper SKUs, etc.). Same canvas, same
 * background, same lighting — only the composition language changes.
 *
 * Use when the productGroup's primary differentiator is the over-cap and
 * showing it integrated would obscure the inner mechanism. Otherwise stick
 * with the standard Grid Card.
 */
export const GRID_CARD_EXPLODED_2000X2200: ImagePreset = {
  id: "grid-card-exploded-2000x2200",
  label: "Grid Card · Exploded (cap beside) · 2000 × 2200",
  purpose:
    "Catalog grid tile for SKUs where the over-cap is shown removed and standing beside the bottle (e.g. Lotion Pump · Clear Overcap, decorative stopper variants). Same canvas, lighting, and background as the standard Grid Card — composition is the only change.",
  kind: "final_render",
  canvas: { widthPx: 2000, heightPx: 2200 },
  aspectRatio: "10:11",
  orientation: "portrait",
  backgroundHex: "#EEE6D4",
  backgroundDescription: PARCHMENT_BACKGROUND_DESCRIPTION,
  lightingLanguage: SHARED_LIGHTING_LANGUAGE,
  shadowLanguage: SHARED_SHADOW_LANGUAGE,
  compositionLanguage:
    "EXPLODED PRODUCT LAYOUT — clean catalog-style two-element arrangement, NO creative staging, NO artistic tilts, NO dramatic angles. " +
    "The BOTTLE stands UPRIGHT, slightly LEFT of the frame's horizontal centre, with its cap or over-cap REMOVED so the fitment / pump / dropper / sprayer assembly at the top of the neck is fully visible. " +
    "The CAP (or over-cap) stands UPRIGHT IN ITS NATURAL ORIENTATION to the RIGHT of the bottle — opening-side DOWN, resting on its circular opening rim exactly the way a cap naturally sits on a flat surface. Do NOT lay the cap on its side. Do NOT tilt the cap. Do NOT show the cap's inside cavity. " +
    "Both the BOTTLE and the CAP share the same implied floor line so their contact shadows align as one ground plane. " +
    "Horizontal spacing: the cap is positioned approximately 25–30% of the frame width to the right of the bottle's vertical axis, at the same ground level as the bottle's base. The cap's top is roughly level with the bottle's shoulder (the cap is clearly smaller than the bottle). " +
    "The bottle fills approximately 65–70% of the frame's vertical height; the cap is visibly smaller and to the right, consistent with its actual real-world size. " +
    "Each object has its OWN individual contact shadow casting BACK-RIGHT (matching the preset's shadow direction), not merged into one shadow. " +
    "IMPORTANT: there is exactly ONE bottle and exactly ONE cap in the frame — never duplicate the product. No creative props, no flowers, no secondary objects.",
  qualityLanguage: SHARED_QUALITY_LANGUAGE,
  negativeLanguage:
    SHARED_NEGATIVE_LANGUAGE +
    "; no cap lying on its side, no tilted cap, no cap inverted (opening-up), no cap floating; no merged single shadow under both objects (each gets its own contact shadow); no third object in the frame",
};

export const SQUARE_MARKETPLACE_1800X1800: ImagePreset = {
  id: "square-marketplace-1800x1800",
  label: "Square Marketplace · 1800 × 1800",
  purpose:
    "Shopify / Amazon / Etsy square product tile. Derived from the same parchment lineage so it matches the Grid Card visually.",
  kind: "final_render",
  canvas: { widthPx: 1800, heightPx: 1800 },
  aspectRatio: "1:1",
  orientation: "square",
  backgroundHex: "#EEE6D4",
  backgroundDescription: PARCHMENT_BACKGROUND_DESCRIPTION,
  lightingLanguage: SHARED_LIGHTING_LANGUAGE,
  shadowLanguage: SHARED_SHADOW_LANGUAGE,
  compositionLanguage: framingLanguage([72, 80]),
  qualityLanguage: SHARED_QUALITY_LANGUAGE,
  negativeLanguage: SHARED_NEGATIVE_LANGUAGE,
};

export const IMAGE_PRESETS: Record<string, ImagePreset> = {
  [GRID_CARD_2000X2200.id]: GRID_CARD_2000X2200,
  [GRID_CARD_EXPLODED_2000X2200.id]: GRID_CARD_EXPLODED_2000X2200,
  [SANITY_HERO_928X1152.id]: SANITY_HERO_928X1152,
  [PAPER_DOLL_COMPONENT_1000X1300.id]: PAPER_DOLL_COMPONENT_1000X1300,
  [PAPER_DOLL_COMPONENT_1500X1300.id]: PAPER_DOLL_COMPONENT_1500X1300,
  [LANDSCAPE_HERO_2400X1350.id]: LANDSCAPE_HERO_2400X1350,
  [SQUARE_MARKETPLACE_1800X1800.id]: SQUARE_MARKETPLACE_1800X1800,
};

export const IMAGE_PRESET_LIST: ImagePreset[] = [
  GRID_CARD_2000X2200,
  GRID_CARD_EXPLODED_2000X2200,
  SANITY_HERO_928X1152,
  PAPER_DOLL_COMPONENT_1000X1300,
  PAPER_DOLL_COMPONENT_1500X1300,
  LANDSCAPE_HERO_2400X1350,
  SQUARE_MARKETPLACE_1800X1800,
];

export const DEFAULT_IMAGE_PRESET_ID = GRID_CARD_2000X2200.id;

/**
 * Per-family paper-doll preset map. The Components tab uses this to pick the
 * correct canvas size based on the loaded family. Families not listed here
 * fall back to PAPER_DOLL_COMPONENT_1000X1300 (the safe narrow default that
 * works for slim profiles like Cylinder).
 *
 * Add a family here only when its widest fitment assembly clips the default
 * 1000×1300 canvas (e.g. Empire's bulb-sprayer extends ~500px left of the
 * bottle axis and needs the 1500×1300 variant).
 */
export const PAPER_DOLL_FAMILY_PRESETS: Record<string, string> = {
  Empire: PAPER_DOLL_COMPONENT_1500X1300.id,
};

export function getPaperDollPresetIdForFamily(family: string | null | undefined): string {
  if (family && PAPER_DOLL_FAMILY_PRESETS[family]) {
    return PAPER_DOLL_FAMILY_PRESETS[family];
  }
  return PAPER_DOLL_COMPONENT_1000X1300.id;
}

export function getImagePreset(id: string): ImagePreset {
  const preset = IMAGE_PRESETS[id];
  if (!preset) {
    throw new Error(
      `Unknown image preset "${id}". Registered ids: ${Object.keys(IMAGE_PRESETS).join(", ")}`,
    );
  }
  return preset;
}

/**
 * Returns the `[PRESET]` layer of the 4-layer prompt assembly as one
 * labeled block, ready to concatenate with GLOBAL / SKU / CHIPS / CONSTRAINTS.
 */
export function buildPresetBlock(preset: ImagePreset): string {
  const orientationLabel =
    preset.orientation === "landscape"
      ? "landscape"
      : preset.orientation === "square"
        ? "square"
        : "portrait";

  return [
    "PRESET:",
    `- Purpose: ${preset.purpose}`,
    `- Canvas: ${preset.canvas.widthPx} × ${preset.canvas.heightPx} px, ${preset.aspectRatio} ${orientationLabel}`,
    `- Background: ${preset.backgroundDescription}`,
    `- Lighting: ${preset.lightingLanguage}`,
    `- Shadow: ${preset.shadowLanguage}`,
    `- Composition: ${preset.compositionLanguage}`,
    `- Quality: ${preset.qualityLanguage}`,
    `- Negatives: ${preset.negativeLanguage}`,
  ].join("\n");
}
