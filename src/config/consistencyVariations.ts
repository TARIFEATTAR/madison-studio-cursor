/**
 * Consistency Mode variation axes.
 *
 * Default taxonomy tuned for BestBottles.com (B2B perfume / personal-care
 * vessel supplier): bottle body + cap + fitment. The same schema can be
 * reused for other clients by extending the axis lists.
 *
 * Each value's `prompt` string is what gets injected into the generation
 * prompt as the VARIATION DETAILS line. Keep these short and specific —
 * one or two descriptive phrases — to avoid overwhelming the rest of the
 * locked-down scene description.
 */

export interface VariationOption {
  /** Stable identifier (used as React keys and to build descriptors). */
  id: string;
  /** User-facing label shown in the chip grid. */
  label: string;
  /** Prompt fragment injected into the generation call. */
  prompt: string;
  /** Optional swatch colour for the chip UI. */
  swatch?: string;
}

export interface VariationAxisConfig {
  id: VariationAxis;
  label: string;
  helper: string;
  options: VariationOption[];
}

export type VariationAxis = "bottleColor" | "capColor" | "fitmentType";

/**
 * BOTTLE MATERIALS — applied to the BOTTLE BODY ONLY.
 *
 * Each prompt is written with explicit "body only" scope plus a negation
 * clause (the cap must stay its own separate material). Without this,
 * Gemini tends to smear the body material onto the cap — especially for
 * distinctive finishes like swirl, which was landing on the gold cap
 * instead of the glass body in our first test run.
 *
 * All options describe the *glass material itself* (integrated into the
 * vessel), never a surface coating or external paint job.
 */
export const BOTTLE_COLORS: VariationOption[] = [
  {
    id: "clear",
    label: "Clear",
    prompt:
      "The BOTTLE BODY is clear flint glass — fully transparent, colourless, reveals anything inside. The glass has crystalline clarity, subtle edge refraction, a faint seam down the side of the body, and clean commercial-product highlights. The CAP remains exactly as specified in the CAP section below; do not tint or recolour the cap.",
    swatch: "#EDEDE8",
  },
  {
    id: "frosted",
    label: "Frosted",
    prompt:
      "The BOTTLE BODY is frosted glass — matte acid-etched finish across the entire body, soft translucent white, slight diffusion of any contents behind it. No shine, no gloss on the body surface. The CAP remains exactly as specified in the CAP section below; the cap is NOT frosted.",
    swatch: "#E4E1DB",
  },
  {
    id: "blue",
    label: "Cobalt Blue",
    prompt:
      "The BOTTLE BODY is deep cobalt blue glass — jewel-toned, richly saturated blue tint integrated throughout the glass, still transparent with deep colour. The CAP remains exactly as specified in the CAP section below; the cap is NOT blue.",
    swatch: "#1E3A8A",
  },
  {
    id: "amber",
    label: "Amber",
    prompt:
      "The BOTTLE BODY is warm amber glass — honey-brown apothecary tint integrated into the glass, transparent with rich colour. The CAP remains exactly as specified in the CAP section below; the cap is NOT amber.",
    swatch: "#9A5A1C",
  },
  {
    id: "swirl",
    label: "Swirl",
    prompt:
      "The BOTTLE BODY is swirl-fluted clear glass — diagonal helical flutes (rounded ribs and grooves) are physically moulded into the surface of the glass, running at approximately a 45-degree angle and spiralling around the entire body from shoulder to base. The glass itself is FULLY CLEAR AND COLOURLESS — do not tint, do not frost, do not add any colour. The 'swirl' effect comes entirely from the SPIRAL FLUTE TEXTURE in the glass surface: each smoothly rounded groove catches light to form bright curved highlights, with darker channels between them, creating a classical pressed-glass look like a traditional Italian perfume bottle or an antique ribbed tumbler. The flutes are regularly spaced and wrap the full circumference of the body. The texture stops cleanly at the shoulder of the bottle and does NOT extend onto the neck or cap. The CAP remains exactly as specified in the CAP section below: the cap is a simple smooth metal or wood cap as specified, NOT fluted, NOT ribbed, NOT patterned, NOT textured, NOT decorated.",
    swatch: "#D6D2CB",
  },
];

export const CAP_COLORS: VariationOption[] = [
  // ─── Metal finishes ────────────────────────────────────────────────────
  {
    id: "polished-gold",
    label: "Polished Gold",
    prompt:
      "polished gold metal cap with a mirror-bright reflective finish, warm yellow-gold tone, crisp specular highlights",
    swatch: "#C9A24B",
  },
  {
    id: "brushed-gold",
    label: "Brushed Gold",
    prompt:
      "brushed gold metal cap with a satin finish, fine horizontal grain texture, soft warm-gold sheen, no mirror reflection",
    swatch: "#B28C3C",
  },
  {
    id: "matte-gold",
    label: "Matte Gold",
    prompt:
      "matte gold metal cap with a completely non-reflective soft-touch finish, warm muted gold tone, no specular highlights, no grain, no mirror quality",
    swatch: "#9E7E3D",
  },
  {
    id: "rose-gold",
    label: "Rose Gold",
    prompt:
      "polished rose-gold metal cap with a warm pink-copper tone and a soft reflective finish",
    swatch: "#B76E6E",
  },
  {
    id: "polished-silver",
    label: "Polished Silver",
    prompt:
      "polished silver metal cap with a mirror-bright chrome-like finish, cool neutral silver tone, crisp reflective highlights",
    swatch: "#C7CBD0",
  },
  {
    id: "brushed-silver",
    label: "Brushed Silver",
    prompt:
      "brushed silver metal cap with a satin finish, fine horizontal grain, soft neutral sheen, no mirror reflection",
    swatch: "#A7ABAE",
  },
  {
    id: "matte-silver",
    label: "Matte Silver",
    prompt:
      "matte silver metal cap with a completely non-reflective soft-touch finish, cool muted silver-grey tone, no specular highlights, no grain, no mirror quality",
    swatch: "#8F9398",
  },
  {
    id: "matte-black",
    label: "Matte Black",
    prompt:
      "matte black cap with a completely non-reflective soft-touch coating, deep neutral black, no shine, no highlights",
    swatch: "#1E1E1E",
  },
  {
    id: "natural-wood",
    label: "Natural Wood",
    prompt:
      "natural light-wood cap with a fine vertical grain visible through a matte-sealed surface, warm neutral wood tone",
    swatch: "#B08B5E",
  },
  // ─── Decorated caps (rhinestone-embellished) ───────────────────────────
  //
  // Rhinestones are a physical embellishment — faceted clear-crystal stones
  // embedded around the top circumference of the cap, NOT a painted or
  // printed pattern. The prompts explicitly describe the stones' geometry
  // and light behaviour so Gemini produces real-looking embellishments
  // instead of a decorative graphic.
  {
    id: "black-rhinestones",
    label: "Black Rhinestones",
    prompt:
      "matte black cap with a band of FACETED CLEAR-CRYSTAL rhinestones physically embedded around the entire top edge of the cap. The rhinestones are individually cut three-dimensional crystals that catch light with distinct small bright sparkle highlights and subtle internal refractions. The body of the cap is a matte non-reflective black. The rhinestones sit proud of the surface as real physical embellishments, not as a printed pattern, painted texture, or flat graphic.",
    swatch: "#2A2A2A",
  },
  {
    id: "pink-rhinestones",
    label: "Pink Rhinestones",
    prompt:
      "soft muted-pink cap with a satin finish and a band of FACETED CLEAR-CRYSTAL rhinestones physically embedded around the entire top edge of the cap. The rhinestones are individually cut three-dimensional crystals that catch light with distinct small bright sparkle highlights and subtle internal refractions. The base cap is a muted rose-pink with a soft smooth satin finish. The rhinestones sit proud of the surface as real physical embellishments, not as a printed pattern, painted texture, or flat graphic.",
    swatch: "#D9A3B2",
  },
  {
    id: "silver-rhinestones",
    label: "Silver Rhinestones",
    prompt:
      "polished silver cap with a band of FACETED CLEAR-CRYSTAL rhinestones physically embedded around the entire top edge of the cap. The rhinestones are individually cut three-dimensional crystals that catch light with distinct small bright sparkle highlights and subtle internal refractions. The silver has a bright reflective mirror-like finish. The rhinestones sit proud of the surface as real physical embellishments, not as a printed pattern, painted texture, or flat graphic.",
    swatch: "#D6D9DE",
  },
];

export const FITMENT_TYPES: VariationOption[] = [
  {
    id: "fine-mist-metal",
    label: "Metal Fine Mist",
    prompt: "metal fine-mist sprayer atomizer with crimped metal collar, perfume-grade",
    swatch: "#B0B0B0",
  },
  {
    id: "fine-mist-plastic",
    label: "Plastic Fine Mist",
    prompt: "plastic fine-mist sprayer atomizer in a colour-matched plastic collar, perfume-grade",
    swatch: "#D4D0C8",
  },
  {
    id: "lotion-pump",
    label: "Lotion Pump",
    prompt: "disc-top lotion pump dispenser with smooth-action actuator, personal-care grade",
    swatch: "#D6D1C4",
  },
  {
    id: "roller-ball",
    label: "Roller Ball",
    prompt: "stainless-steel roller-ball applicator seated in the bottle neck, polished finish",
    swatch: "#B8BAB8",
  },
  {
    id: "over-cap",
    label: "Over Cap",
    prompt: "solid over-cap that fully covers the neck and fitment, no exposed sprayer",
    swatch: "#9E9B93",
  },
];

export const VARIATION_AXES: VariationAxisConfig[] = [
  {
    id: "bottleColor",
    label: "Bottle Material",
    helper: "Glass finish — applied to the body only. Shape is preserved from the master reference.",
    options: BOTTLE_COLORS,
  },
  {
    id: "capColor",
    label: "Cap Finish",
    helper: "Cap / closure colour and finish.",
    options: CAP_COLORS,
  },
  {
    id: "fitmentType",
    label: "Fitment",
    helper: "Sprayer, pump, roller, or over-cap.",
    options: FITMENT_TYPES,
  },
];

/** Hard safety cap on set size — keeps a single run under ~5 minutes. */
export const MAX_VARIATION_SET_SIZE = 50;

/**
 * Shared language appended to every variation in a set regardless of
 * composition — the "universal" rules that prevent reference-image
 * literalism and cap-bleed. Composition-specific framing (where the bottle
 * sits, whether the cap is on or off, etc.) lives in the individual
 * CONSISTENCY_COMPOSITIONS below.
 */
const UNIVERSAL_SCENE_RULES = [
  "Seamless off-white studio backdrop (#F5F3EF), no gradient, no texture.",
  "Soft top-key lighting at a 45° angle from camera-right, gentle fill from the left.",
  "No labels, no branding, no text, no packaging, no props.",
  "Crisp commercial-catalog clarity, true-to-life material rendering (glass transparency, metal reflectivity, matte coatings) with no stylisation.",
  // Reference-image role
  "The attached reference image is a SHAPE and PROPORTION guide only — use it to reproduce the bottle's silhouette, neck, shoulder, and overall geometry exactly. Do NOT copy the reference's colour or material literally; the final bottle material is determined by the VARIATION DETAILS below. The final image must always look like a freshly photographed studio shot, not a recoloured cut-out of the reference.",
  // Global cap-protection rule
  "STRICT RULE: The cap's appearance is determined ONLY by the CAP description in the VARIATION DETAILS. Never apply the bottle-body material, pattern, colour, or finish to the cap. If no cap variation is specified, keep the cap identical to the reference image's cap.",
].join(" ");

export interface CompositionPreset {
  id: CompositionId;
  label: string;
  helper: string;
  /** Used on the chip UI as a mini diagram cue. */
  icon: "bottle" | "exploded";
  /** Composition-specific framing rules prepended to UNIVERSAL_SCENE_RULES. */
  framing: string;
}

export type CompositionId = "assembled" | "exploded-uncapped";

export const CONSISTENCY_COMPOSITIONS: CompositionPreset[] = [
  {
    id: "assembled",
    label: "Assembled",
    helper: "Fully capped bottle, centered hero.",
    icon: "bottle",
    framing: [
      "COMPOSITION — ASSEMBLED HERO:",
      "E-commerce hero product shot for a luxury perfume / personal-care grid tile.",
      "The bottle is fully assembled with the cap on.",
      "Camera: straight-on eye-level, product perfectly centred horizontally, base resting on the implied floor line at ~20% from the bottom of the frame.",
      "Product fills ~70% of the frame's vertical height.",
      "Subtle soft contact shadow directly beneath the base of the product — not a cast shadow.",
    ].join(" "),
  },
  {
    id: "exploded-uncapped",
    label: "Exploded",
    helper: "Uncapped bottle + cap standing upright beside it.",
    icon: "exploded",
    framing: [
      "COMPOSITION — SIMPLE EXPLODED PRODUCT LAYOUT:",
      "Clean, catalog-style product arrangement. NO creative staging, NO artistic tilts, NO dramatic angles, NO lifestyle flourishes. Think standard e-commerce SKU photo of two parts laid out for the customer to see both.",
      "The BOTTLE stands UPRIGHT, slightly LEFT of the frame's horizontal centre, with the CAP REMOVED so the fitment at the top of the neck is fully visible (match whatever fitment is implied by the master reference or the FITMENT variation — roller-ball applicator, sprayer actuator, lotion pump, etc.).",
      "The CAP stands UPRIGHT IN ITS NATURAL ORIENTATION to the RIGHT of the bottle — opening-side DOWN, resting on its circular opening rim exactly the way a cap naturally sits on a flat surface. Do NOT lay the cap on its side. Do NOT tilt the cap. Do NOT show the cap's inside cavity. Do NOT pose the cap creatively. The cap is simply standing beside the bottle as if someone unscrewed it and set it down.",
      "Both the BOTTLE and the CAP share the same implied floor line with their own individual soft contact shadow directly beneath each — two separate contact shadows, not a merged shadow.",
      "Horizontal spacing: the cap is positioned approximately 25-30% of the frame width to the right of the bottle's vertical axis, at the same ground level as the bottle's base. The cap's top is roughly level with the bottle's shoulder (the cap is clearly smaller than the bottle).",
      "The bottle fills approximately 65-70% of the frame's vertical height; the cap is visibly smaller and to the right, consistent with its actual real-world size.",
      "Camera: straight-on eye-level, no creative angles.",
      "IMPORTANT: There is exactly ONE bottle and exactly ONE cap in the frame — never duplicate the product.",
    ].join(" "),
  },
];

export const DEFAULT_COMPOSITION_ID: CompositionId = "assembled";

export function getComposition(id?: CompositionId | null): CompositionPreset {
  const found = CONSISTENCY_COMPOSITIONS.find((c) => c.id === id);
  return found ?? CONSISTENCY_COMPOSITIONS[0];
}

/**
 * Build the full scene anchor for a given composition. Combines the
 * composition-specific framing with the universal rules that apply to every
 * shot in the set.
 */
export function buildSceneAnchor(compositionId?: CompositionId | null): string {
  const comp = getComposition(compositionId);
  return `${comp.framing} ${UNIVERSAL_SCENE_RULES}`;
}

/**
 * Back-compat export — older callers that imported the legacy constant
 * still get the Assembled framing by default. Prefer `buildSceneAnchor()`.
 */
export const CONSISTENCY_SCENE_ANCHOR = buildSceneAnchor("assembled");

/**
 * Build the VARIATION DETAILS line sent with every generation in the set.
 * Only the selected axes contribute — axes the user didn't tick are omitted
 * so the master reference image drives them.
 *
 * Each section is clearly labelled ("BOTTLE BODY:", "CAP:", "FITMENT:") so
 * the model can attach the right material to the right element. These labels
 * are referenced by name in CONSISTENCY_SCENE_ANCHOR's cap-protection rule.
 */
export function buildVariationDescriptor(selection: {
  bottleColor?: VariationOption;
  capColor?: VariationOption;
  fitmentType?: VariationOption;
}): string {
  const parts: string[] = [];
  if (selection.bottleColor) parts.push(`BOTTLE BODY: ${selection.bottleColor.prompt}`);
  if (selection.capColor) parts.push(`CAP: ${selection.capColor.prompt}`);
  if (selection.fitmentType) parts.push(`FITMENT: ${selection.fitmentType.prompt}`);
  return parts.join(" ");
}

/**
 * Build a short human-readable label for a variation, used as the
 * `variation_descriptor` column in the DB and as the card title in the
 * results grid.
 */
export function buildVariationLabel(selection: {
  bottleColor?: VariationOption;
  capColor?: VariationOption;
  fitmentType?: VariationOption;
}): string {
  const parts: string[] = [];
  if (selection.bottleColor) parts.push(selection.bottleColor.label);
  if (selection.capColor) parts.push(selection.capColor.label);
  if (selection.fitmentType) parts.push(selection.fitmentType.label);
  return parts.join(" · ") || "Variation";
}

/**
 * Expand the user's chip selection into the full Cartesian product of
 * combinations. Axes with zero selections are treated as "no variation on
 * this axis" (omitted from descriptor — the master reference drives them).
 */
export function expandVariationMatrix(selected: {
  bottleColor: VariationOption[];
  capColor: VariationOption[];
  fitmentType: VariationOption[];
}): Array<{
  bottleColor?: VariationOption;
  capColor?: VariationOption;
  fitmentType?: VariationOption;
}> {
  const bottleAxis = selected.bottleColor.length ? selected.bottleColor : [undefined];
  const capAxis = selected.capColor.length ? selected.capColor : [undefined];
  const fitmentAxis = selected.fitmentType.length ? selected.fitmentType : [undefined];

  const out: Array<{
    bottleColor?: VariationOption;
    capColor?: VariationOption;
    fitmentType?: VariationOption;
  }> = [];

  for (const b of bottleAxis) {
    for (const c of capAxis) {
      for (const f of fitmentAxis) {
        // If the user selected nothing at all, skip (caller should validate).
        if (!b && !c && !f) continue;
        out.push({
          bottleColor: b,
          capColor: c,
          fitmentType: f,
        });
      }
    }
  }

  return out;
}
