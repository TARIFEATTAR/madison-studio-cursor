/**
 * SKU data injector — reads a Best Bottles Convex `products` row and emits
 * the `[SKU DATA]` layer of the 4-layer prompt assembly.
 *
 * The Convex schema lives in the best-bottles-website repo. This module
 * defines a narrow structural type for the subset of fields this pipeline
 * actually uses, so madison-app doesn't need to take a dependency on the
 * Convex generated types.
 *
 * Field-density notes (from a real audit of 2,325 rows):
 *   heightWithoutCap   95.3%     heightWithCap  99.8%
 *   diameter           99.4%     neckThreadSize 97.4%
 *   color              90.5%     capStyle       95.7%
 *   capColor           98.8%     applicator     86.5%
 *   itemDescription   100%       useCaseDesc    67.4%
 *   capHeight           0.6%  (skip)     graceDescription 0.6% (skip)
 *   ballMaterial       20.0%  (use when present)
 *   paperDollReady      0%    (future landing zone)
 */

import { getBodyShapeDescriptor } from "@/config/familyShapeDescriptors";

export interface ConvexProductLike {
  websiteSku?: string | null;
  graceSku?: string | null;
  productId?: string | null;
  category?: string | null;
  family?: string | null;
  shape?: string | null;
  bottleCollection?: string | null;
  color?: string | null;
  capacity?: string | null;
  capacityMl?: number | null;
  capacityOz?: number | null;
  heightWithCap?: string | null;
  heightWithoutCap?: string | null;
  diameter?: string | null;
  neckThreadSize?: string | null;
  applicator?: string | null;
  capStyle?: string | null;
  capColor?: string | null;
  trimColor?: string | null;
  ballMaterial?: string | null;
  bottleWeightG?: number | null;
  itemName?: string | null;
  itemDescription?: string | null;
  useCaseDescription?: string | null;
  imageUrl?: string | null;
}

/**
 * Parse dimension strings like "88 ±1 mm", "72 ± 0.5 mm", "75", "43.7"
 * into a numeric millimeter value. Returns null if no number is present.
 */
export function parseDimensionMm(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Map the 14 distinct Convex `applicator` enum values onto the Madison
 * Consistency Mode chip identifiers in `src/config/consistencyVariations.ts`.
 *
 * Values not present on a product row (applicator is null in ~13.5% of rows)
 * return null — the prompt assembler falls back to the chip selection instead.
 */
export function mapConvexApplicatorToChipId(applicator: string | null | undefined): string | null {
  if (!applicator) return null;
  switch (applicator) {
    case "Metal Roller Ball":
      return "roller-ball";
    case "Plastic Roller Ball":
      return "roller-ball-plastic";
    case "Fine Mist Sprayer":
      return "fine-mist-metal";
    case "Perfume Spray Pump":
      return "perfume-spray-pump";
    case "Vintage Bulb Sprayer":
    case "Antique Bulb Sprayer":
      return "vintage-bulb-sprayer";
    case "Vintage Bulb Sprayer with Tassel":
    case "Antique Bulb Sprayer with Tassel":
      return "vintage-bulb-sprayer-tassel";
    case "Lotion Pump":
      return "lotion-pump";
    case "Dropper":
      return "dropper";
    case "Reducer":
      return "reducer";
    case "Glass Stopper":
      return "glass-stopper";
    case "Cap/Closure":
      return "cap-closure";
    case "Atomizer":
    case "Metal Atomizer":
    case "Applicator Cap":
      return "fine-mist-metal";
    case "Glass Rod":
    case "N/A":
    default:
      return null;
  }
}

/**
 * Infer fillability from the applicator. Glass Rod assemblies are sealed
 * display-only containers; everything else is fillable.
 */
export function inferFillable(applicator: string | null | undefined): boolean {
  if (!applicator) return true;
  return applicator !== "Glass Rod";
}

/**
 * Per-family default wall thickness in mm. Convex does not store this; the
 * values below are reasonable defaults for the dominant families. For families
 * not listed, the block omits wall thickness rather than guessing.
 */
const WALL_THICKNESS_BY_FAMILY_MM: Record<string, number> = {
  Empire: 3.0,
  Cylinder: 2.5,
  "Tall Cylinder": 2.5,
  "Boston Round": 3.0,
  Apothecary: 3.0,
  "Cream Jar": 3.5,
  Rectangle: 3.0,
  Teardrop: 2.5,
  Bell: 3.0,
  Diamond: 3.0,
  Flair: 2.5,
  Tulip: 2.5,
  Pillar: 3.0,
  Circle: 2.5,
  Diva: 2.5,
  Elegant: 2.5,
};

export function defaultWallThicknessMm(family: string | null | undefined): number | null {
  if (!family) return null;
  return WALL_THICKNESS_BY_FAMILY_MM[family] ?? null;
}

/**
 * Families with non-circular cross-sections. For these, the Convex `diameter`
 * field is misleading — it represents the longer face-width or diagonal, not
 * a true cylindrical diameter. Including "Diameter: X mm" in the prompt
 * makes gpt-image-2 produce a near-square cylindrical bottle instead of the
 * actual rectangular/faceted silhouette. We suppress the diameter line and
 * the height-to-diameter ratio for these families and let the family shape
 * descriptor (which contains explicit "rectangular silhouette, sharp vertical
 * edges, flat front and back" language) carry the geometric anchor instead.
 */
const NON_CYLINDRICAL_FAMILIES: ReadonlySet<string> = new Set([
  "Empire",
  "Rectangle",
  "Slim",
  "Sleek",
  "Diamond",
  "Square",
  "Footed Rectangular",
  "Tall Rectangular",
]);

export function isCylindricalFamily(family: string | null | undefined): boolean {
  if (!family) return true;
  return !NON_CYLINDRICAL_FAMILIES.has(family);
}

/**
 * Paper-doll component scope.
 *
 * - "full":     normal catalog render, bottle + fitment + cap described together
 * - "body":     bottle body only — drops applicator / cap / trim. Used for the
 *               transparent 1000×1300 body PNG on the paper-doll lane.
 * - "fitment":  applicator + cap only — drops bottle dimensions / glass color.
 *               Used for the transparent fitment-component PNGs that composite
 *               onto the body.
 */
export type ComponentScope = "full" | "body" | "fitment";

export interface BuildProductSpecBlockOptions {
  /** Which parts of the SKU to describe. Defaults to "full". */
  componentScope?: ComponentScope;
}

/**
 * Emit the `[SKU DATA]` layer of the 4-layer prompt assembly. Null-safe:
 * fields that are missing on the row are dropped rather than rendered
 * as "null" or "undefined".
 */
export function buildProductSpecBlock(
  product: ConvexProductLike,
  options: BuildProductSpecBlockOptions = {},
): string {
  const scope: ComponentScope = options.componentScope ?? "full";
  const lines: string[] = [
    scope === "body"
      ? "PRODUCT SPECIFICATIONS (BOTTLE BODY ONLY — no fitment, no cap):"
      : scope === "fitment"
        ? "PRODUCT SPECIFICATIONS (FITMENT / CAP ONLY — no bottle body):"
        : "PRODUCT SPECIFICATIONS:",
  ];

  const identifier =
    product.graceSku ||
    product.websiteSku ||
    product.productId ||
    "unspecified";
  lines.push(`- SKU: ${identifier}`);

  const bodyFields = scope !== "fitment";
  const fitmentFields = scope !== "body";

  if (bodyFields && product.family) {
    const collection =
      product.bottleCollection && product.bottleCollection !== product.family
        ? ` (${product.bottleCollection} collection)`
        : "";
    lines.push(`- Bottle family: ${product.family}${collection}`);
    // Inject the canonical silhouette descriptor for this family so the
    // model has explicit geometric language (rectangular vs cylindrical,
    // sharp edges vs rounded, etc.) rather than relying on the family
    // name alone or on a possibly misleading "Diameter" value below.
    const shapeDescriptor = getBodyShapeDescriptor(product.family);
    lines.push(`- Silhouette: ${shapeDescriptor}`);
  }

  if (bodyFields) {
    if (product.capacityMl != null) {
      const oz = product.capacityOz != null ? ` (${product.capacityOz} oz)` : "";
      lines.push(`- Capacity: ${product.capacityMl} ml${oz}`);
    } else if (product.capacity) {
      lines.push(`- Capacity: ${product.capacity}`);
    }
  }

  const heightMm = parseDimensionMm(product.heightWithoutCap);
  if (bodyFields && heightMm != null) {
    lines.push(`- Height (body, without cap): ${heightMm} mm`);
  }
  const heightWithCapMm = parseDimensionMm(product.heightWithCap);
  if (scope === "full" && heightWithCapMm != null) {
    lines.push(`- Height (assembled, with cap): ${heightWithCapMm} mm`);
  }

  const diameterMm = parseDimensionMm(product.diameter);
  const familyIsCylindrical = isCylindricalFamily(product.family);
  if (bodyFields && diameterMm != null) {
    if (familyIsCylindrical) {
      lines.push(`- Diameter: ${diameterMm} mm`);
    } else {
      // For rectangular/faceted families the Convex "diameter" is the
      // longer face-width or diagonal, not a true diameter. Surface it
      // as cross-section width to keep the model from producing a
      // cylindrical bottle.
      lines.push(
        `- Cross-section: rectangular / faceted (NOT cylindrical) — face dimension approximately ${diameterMm} mm`,
      );
    }
  }

  const wallMm = defaultWallThicknessMm(product.family);
  if (bodyFields && wallMm != null) {
    lines.push(`- Wall thickness: approximately ${wallMm} mm (family default)`);
  }

  if (bodyFields && product.color) {
    lines.push(`- Glass color: ${product.color}`);
  }

  if (product.neckThreadSize) {
    // Neck thread matters for both body (where fitment seats) and fitment
    // (which must match the thread spec) — always include.
    lines.push(`- Neck thread: ${product.neckThreadSize}`);
  }

  if (fitmentFields && product.applicator) {
    lines.push(`- Applicator / fitment: ${product.applicator}`);
  }

  if (fitmentFields && (product.capStyle || product.capColor)) {
    const style = product.capStyle ?? "";
    const color = product.capColor ? ` in ${product.capColor}` : "";
    const trim = product.trimColor ? ` with ${product.trimColor} trim` : "";
    lines.push(`- Cap: ${style}${color}${trim}`.trim());
  }

  if (fitmentFields && product.ballMaterial) {
    lines.push(`- Ball material: ${product.ballMaterial}`);
  }

  if (scope === "full") {
    lines.push(`- Fillable: ${inferFillable(product.applicator)}`);
  }

  lines.push("");
  if (scope === "body") {
    lines.push("COMPONENT CONSTRAINTS (body only):");
    if (heightMm != null && diameterMm != null) {
      if (familyIsCylindrical) {
        const ratio = (heightMm / diameterMm).toFixed(2);
        lines.push(
          `- Maintain exact proportions: height-to-diameter ratio of ${ratio} (${heightMm} mm / ${diameterMm} mm)`,
        );
      } else {
        lines.push(
          `- Maintain exact proportions per the silhouette descriptor above. Body height ${heightMm} mm; rectangular/faceted cross-section, NOT a cylinder.`,
        );
      }
    }
    if (wallMm != null) {
      lines.push(
        `- Glass thickness must be visually consistent with approximately ${wallMm} mm wall`,
      );
    }
    lines.push("- Render ONLY the bottle body — no fitment, no sprayer, no cap, no dip tube");
    lines.push("- The neck opening should be visible and unobstructed at the top of the bottle");
    lines.push(
      "- Background is the cream parchment plate specified in the PRESET section above; do NOT render on transparent or any other color",
    );
  } else if (scope === "fitment") {
    lines.push("COMPONENT CONSTRAINTS (fitment only):");
    lines.push("- Render ONLY the fitment / applicator / cap assembly — no bottle, no glass body");
    lines.push(
      "- The neck-seating collar sits at the bottom of the frame, ready to attach to a bottle neck at the paper-doll canonical anchor position",
    );
    lines.push(
      "- Background is the cream parchment plate specified in the PRESET section above; do NOT render on transparent or any other color",
    );
  } else {
    lines.push("PHYSICAL CONSTRAINTS:");
    if (heightMm != null && diameterMm != null) {
      if (familyIsCylindrical) {
        const ratio = (heightMm / diameterMm).toFixed(2);
        lines.push(
          `- Maintain exact proportions: height-to-diameter ratio of ${ratio} (${heightMm} mm / ${diameterMm} mm)`,
        );
      } else {
        lines.push(
          `- Maintain exact proportions per the silhouette descriptor in the SKU section above. Body height ${heightMm} mm. Cross-section is rectangular/faceted (NOT cylindrical) — do not produce a round-bottle silhouette.`,
        );
      }
    } else {
      lines.push("- Maintain exact proportions from the SKU's stated dimensions and silhouette descriptor");
    }
    if (wallMm != null) {
      lines.push(
        `- Glass thickness must be visually consistent with approximately ${wallMm} mm wall`,
      );
    }
    lines.push(
      "- Bottle must appear structurally realistic at the stated dimensions; do not exaggerate curvature, neck, or base",
    );
    lines.push(
      "- Internal tube length (for fitments with a dip tube) must match bottle height realistically",
    );
  }

  return lines.join("\n");
}
