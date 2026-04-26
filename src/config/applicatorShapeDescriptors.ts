/**
 * Applicator-specific shape descriptors for paper-doll fitment generation.
 *
 * The string "Vintage Bulb Sprayer" without context lets gpt-image-2 reach
 * into its training data and draw whatever it associates with that phrase
 * — usually Victorian/Edwardian ornate atomizers with tassels and hoses,
 * NOT the modern simple Best-Bottles version. These descriptors anchor each
 * applicator type in Best-Bottles-specific visual language with explicit
 * negation ("NO tassel", "NO hose", etc.) so the model lands in the right
 * product category.
 *
 * Used as supporting context when generating fitment-scope assets. When a
 * reference image is attached (the normal Enhance flow), the prompt's
 * preservation language dominates — these descriptors are mostly insurance
 * against the model drifting away from the reference.
 *
 * IMPORTANT: dip tube belongs to the BODY layer, not the fitment layer.
 * The bottle is rendered with the tube inside; the fitment is rendered
 * tube-less. This way one tube-bearing body + N tube-less fitments cover
 * every sprayer SKU in the family.
 */

export const APPLICATOR_SHAPE_DESCRIPTORS: Record<string, string> = {
  "Vintage Bulb Sprayer":
    "Silver chrome collar with a soft mesh squeeze bulb attached DIRECTLY to one side of the collar. " +
    "COLLAR PROPORTIONS — CRITICAL: the collar is a SHORT DISK shape, wider than it is tall, like a small tin can or hockey puck. The collar diameter is greater than the collar height. NOT a tall column, NOT vase-shaped, NOT chalice-shaped, NOT spire-like, NOT chess-piece shape. Think disk, not tower. " +
    "The bottom edge of the collar is finely knurled/ridged for grip (where it screws onto the bottle). " +
    "The TOP of the collar is FLAT, with a SMALL LOW-PROFILE dome finial centered on it — the finial is tiny, barely 1/4 the height of the collar itself, just a little chrome bump with a small ball on top. NO tall finial, NO multi-tier finial, NO ornate spire. " +
    "The mesh bulb attaches to one SIDE of the collar (not the top), close to the level of the top plate, via a short fixed connector — direct attachment, NO hose, NO tube, NO cord between collar and bulb. " +
    "NO tassel. NO Victorian or Edwardian ornamentation. NO dip tube in this layer (tube belongs to the body layer). " +
    "Modern minimalist apothecary design.",

  "Vintage Bulb Sprayer with Tassel":
    "Identical to Vintage Bulb Sprayer (SHORT DISK-shaped silver chrome collar — wider than tall — with knurled bottom edge, flat top with TINY low-profile dome finial, mesh bulb attached directly to one SIDE of the collar via a short fixed connector with NO hose), " +
    "PLUS a decorative silk tassel of the specified color hanging from the side of the collar opposite the bulb (or from a small loop on the collar). " +
    "Tassel is a simple braided silk fringe, modest length (about 1.5x the bulb diameter), NOT ornate. " +
    "NO hose between collar and bulb. NO Victorian ornamentation. NO multi-tier finials. NO dip tube in this layer. " +
    "Collar proportions are critical: SHORT, DISK-shaped, wider than tall — NOT a tall column or chalice.",

  "Antique Bulb Sprayer":
    "Same as Vintage Bulb Sprayer — SHORT DISK-shaped silver chrome collar (wider than tall, knurled bottom, flat top, tiny low-profile dome finial), mesh squeeze bulb attached directly to one side of the collar, no hose, no tassel, no dip tube in this layer. Modern minimalist apothecary design.",

  "Antique Bulb Sprayer with Tassel":
    "Same as Vintage Bulb Sprayer with Tassel — SHORT DISK-shaped silver chrome collar with knurled bottom, flat top, tiny dome finial, mesh squeeze bulb attached directly to one side, simple silk tassel hanging from the opposite side, no hose, no dip tube in this layer.",

  "Perfume Spray Pump":
    "Crimped polished metal collar that fits over a bottle neck, with a small spray actuator button on top (about half the diameter of the collar) and a tiny atomizer hole in the actuator's side or front. NO bulb. NO tassel. NO hose. NO dip tube in this layer (tube belongs to the body layer). Tall and slim profile compared to fine-mist — typically used on larger bottles.",

  "Fine Mist Sprayer":
    "Crimped polished metal collar that fits over a bottle neck, with a small spray actuator button on top and a tiny atomizer hole on the side. Shorter, more compact profile than the perfume spray pump. NO bulb. NO tassel. NO hose. NO dip tube in this layer.",

  "Lotion Pump":
    "Pump dispenser with a colored or metallized cap that screws onto the bottle neck, a curved spout extending up and over (with the dispensing nozzle at the end of the curve), and a press-down actuator. NO bulb. NO tassel. NO atomizer. NO dip tube visible in this layer (tube belongs to the body layer).",

  "Dropper":
    "Glass-eyedropper-style assembly. UNLIKE OTHER FITMENTS, the dropper KEEPS its glass pipette tube — the pipette IS the dropper's functional element, not a removable dip tube. " +
    "COLLAR PROPORTIONS — CRITICAL: the metallized collar is a SHORT, FLAT cylindrical disk (wider than tall, similar to the bulb-sprayer collar — disk profile, not tower profile). The collar diameter is greater than the collar height. NOT tall, NOT vase-shaped, NOT chalice. Think disk, not column. " +
    "On TOP of the collar sits a small, low-profile soft rubber bulb — round, compressible, modest size (NOT exaggerated, NOT towering). The bulb diameter is similar to the collar diameter or slightly smaller. " +
    "From the BOTTOM of the collar, a thin clear glass pipette tube extends straight downward — narrow consistent diameter (standard eyedropper width, NOT a wide tube), smooth glass surface, with a slightly rounded tip at the bottom for drawing drops. The pipette length is about 2x the collar height. " +
    "Material: collar is polished or matte metal in the specified colorway; bulb is soft black/colored rubber; pipette is clear transparent glass with subtle refraction. " +
    "NO sprayer mechanism, NO atomizer, NO mesh, NO tassel, NO hose.",

  "Metal Roller Ball":
    "Polished stainless-steel roller ball seated in a small clear or frosted plastic neck plug — the plug fits inside the bottle neck and holds the ball flush. A separate threaded over-cap covers the ball when not in use. The ball is bright mirror-polished steel, the plug is translucent, the over-cap is in the specified colorway. NO sprayer mechanism. NO bulb. NO dip tube.",

  "Plastic Roller Ball":
    "Matte white plastic roller ball seated in a clear or color-matched plastic neck plug — the plug fits inside the bottle neck and holds the ball flush. A separate threaded over-cap covers the ball when not in use. NO sprayer mechanism. NO bulb. NO dip tube.",

  Reducer:
    "A small threaded reducer cap that screws onto the bottle neck. Restricts the bottle opening to a small drip orifice for splash application. Cap top is in the specified colorway/material (smooth metal, leather-wrapped, etc.). NO bulb. NO sprayer mechanism. NO dip tube. NO atomizer. Simple closure with a reduced central opening.",

  "Glass Stopper":
    "Solid clear glass stopper with a tapered ground-glass bottom that plugs directly into the bottle neck (no external thread). Decorative finial top in the specified shape. NO mechanism. NO tube. NO sprayer.",

  "Glass Rod":
    "Sealed display rod / decorative glass element. NO mechanism. NO sprayer. NO bulb. Pure decorative glass component.",

  Atomizer:
    "Crimped metal collar with a small spray actuator on top (similar to fine-mist sprayer but typically with more decorative styling). NO dip tube in this layer.",

  "Metal Atomizer":
    "Polished metal crimped collar with an integrated spray actuator. NO bulb. NO tassel. NO hose. NO dip tube in this layer.",

  "Cap/Closure":
    "Plain threaded closure cap that screws onto the bottle neck. Solid top in the specified colorway. NO mechanism, NO sprayer, NO dip tube — purely a sealing cap.",

  "Applicator Cap":
    "Threaded cap with an integrated wick or applicator stick on the underside (visible only when removed from the bottle). Cap top in the specified colorway. NO sprayer, NO bulb, NO dip tube.",

  "Over Cap":
    "Decorative threaded cap that fits over a smaller inner mechanism (such as a roller ball plug). Solid styled top in the specified colorway. NO mechanism — purely a cover.",
};

const GENERIC_FITMENT_FALLBACK =
  "Threaded fitment component that attaches to a bottle neck. Render only the component above-the-neck — no dip tube extending below (tube belongs to the body layer). NO unspecified ornamentation.";

export function getApplicatorShapeDescriptor(
  applicator: string | null | undefined,
): string {
  if (!applicator) return GENERIC_FITMENT_FALLBACK;
  return APPLICATOR_SHAPE_DESCRIPTORS[applicator] ?? GENERIC_FITMENT_FALLBACK;
}

/**
 * Applicators that require a dip tube inside the bottle to draw liquid up
 * (sprayers, pumps, droppers). The dip tube lives in the BODY layer for
 * these — operator should generate / approve a "with-tube" body variant
 * and composite these fitments onto it.
 *
 * Other applicators (reducers, stoppers, plain caps, roller balls) sit on
 * a "no-tube" body since they don't have an internal mechanism.
 */
export const APPLICATORS_REQUIRING_TUBE_BODY: ReadonlySet<string> = new Set([
  "Vintage Bulb Sprayer",
  "Vintage Bulb Sprayer with Tassel",
  "Antique Bulb Sprayer",
  "Antique Bulb Sprayer with Tassel",
  "Perfume Spray Pump",
  "Fine Mist Sprayer",
  "Lotion Pump",
  "Dropper",
  "Atomizer",
  "Metal Atomizer",
]);

export function applicatorRequiresTubeBody(
  applicator: string | null | undefined,
): boolean {
  return Boolean(applicator && APPLICATORS_REQUIRING_TUBE_BODY.has(applicator));
}
