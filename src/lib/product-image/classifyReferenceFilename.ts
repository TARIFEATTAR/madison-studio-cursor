/**
 * Classify an operator-uploaded reference filename into the structural
 * fields Madison needs to match it against a Convex SKU.
 *
 * Used by:
 *  - ComponentsTabPanel (paper-doll folder ingestion — body / fitment slots)
 *  - MastersTabPanel    (assembled grid-tile reference folder — auto-match
 *                        a reference to the SKU selected in the left rail)
 *
 * Matching is case-insensitive and tolerant of `-`, `_`, `.` separators.
 * Returns null when the filename has no recognizable applicator OR body
 * keyword — caller surfaces those files as "unclassified" for manual
 * routing.
 */

export type ReferenceClassification =
  | { kind: "body"; capacityMl?: number; color?: string }
  | {
      kind: "fitment";
      applicator: string;
      capColor?: string;
      capacityMl?: number;
      color?: string;
    };

export function classifyReferenceFilename(
  filename: string,
): ReferenceClassification | null {
  const stem = filename.toLowerCase().replace(/\.[a-z]+$/, "");
  const normalized = stem.replace(/[-_.]/g, " ");

  // Capacity hint (e.g. "50ml", "100ml") — helps the matcher scope to the
  // right Convex variant.
  let capacityMl: number | undefined;
  const capMatch = normalized.match(/\b(\d{1,4})\s*ml\b/);
  if (capMatch) capacityMl = Number(capMatch[1]);

  // Glass-color hint. Empire/Cylinder catalogs use these eight values.
  let color: string | undefined;
  const colorMatch = normalized.match(
    /\b(clear|amber|cobalt blue|cobalt|frosted|black|green|pink|swirl)\b/,
  );
  if (colorMatch) {
    const c = colorMatch[1];
    color = c === "cobalt" ? "Cobalt Blue" : c.replace(/\b\w/g, (m) => m.toUpperCase());
  }

  const hasBody = /\b(body|bottle)\b/.test(normalized);
  const hasCap = /\bcap\b/.test(normalized);
  if (hasBody && !hasCap) {
    return { kind: "body", capacityMl, color };
  }

  // Applicator detection — order matters (more-specific first so longer
  // matches win).
  let applicator: string | undefined;
  if (/\btassel\b/.test(normalized) && /\bbulb\b/.test(normalized)) {
    applicator = "Vintage Bulb Sprayer with Tassel";
  } else if (/\bbulb\b/.test(normalized) || /\bantique\b/.test(normalized)) {
    applicator = "Vintage Bulb Sprayer";
  } else if (/\breducer\b/.test(normalized)) {
    applicator = "Reducer";
  } else if (/\blotion\b/.test(normalized)) {
    applicator = "Lotion Pump";
  } else if (
    /\bperfume\b.*\bpump\b|\bpump\b.*\bperfume\b|\bspray\b.*\bpump\b|\bpump\b.*\bspray\b/.test(
      normalized,
    )
  ) {
    applicator = "Perfume Spray Pump";
  } else if (/\bmist\b|\bfine\b/.test(normalized)) {
    applicator = "Fine Mist Sprayer";
  } else if (/\bdropper\b/.test(normalized)) {
    applicator = "Dropper";
  } else if (/\bmetal\b.*\broller\b|\broller\b.*\bmetal\b/.test(normalized)) {
    applicator = "Metal Roller Ball";
  } else if (
    /\bplastic\b.*\broller\b|\broller\b.*\bplastic\b|\broller\b/.test(normalized)
  ) {
    applicator = "Plastic Roller Ball";
  } else if (/\bstopper\b/.test(normalized)) {
    applicator = "Glass Stopper";
  } else if (/\bovercap\b/.test(normalized)) {
    applicator = "Cap/Closure";
  }

  if (!applicator) return null;

  // Cap-color detection — longest-match first. "ivory shiny gold" / "ivory
  // shiny silver" map to Ivory because they describe an ivory bulb with a
  // shiny-gold/silver collar (the trim metal is on a separate trimColor
  // field in Convex). Without this precedence rule, the model picks "Shiny
  // Gold" and routes the file to the wrong slot.
  const colorTokens: Array<{ match: RegExp; label: string }> = [
    { match: /\bivory\s+shiny\s+gold\b/, label: "Ivory" },
    { match: /\bivory\s+shiny\s+silver\b/, label: "Ivory" },
    { match: /\blight\s*brown\s*leather\b/, label: "Light Brown Leather" },
    { match: /\bblack\s*leather\b/, label: "Black Leather" },
    { match: /\bbrown\s*leather\b/, label: "Brown Leather" },
    { match: /\bivory\s*leather\b/, label: "Ivory Leather" },
    { match: /\bpink\s*leather\b/, label: "Pink Leather" },
    { match: /\bclear\s*overcap\b/, label: "Clear Overcap" },
    { match: /\bmatte\s*silver\b/, label: "Matte Silver" },
    { match: /\bshiny\s*silver\b/, label: "Shiny Silver" },
    { match: /\bmatte\s*gold\b/, label: "Matte Gold" },
    { match: /\bshiny\s*gold\b/, label: "Shiny Gold" },
    { match: /\bmatte\s*copper\b/, label: "Matte Copper" },
    { match: /\bshiny\s*black\b/, label: "Shiny Black" },
    { match: /\blavender\b/, label: "Lavender" },
    { match: /\bivory\b/, label: "Ivory" },
    { match: /\bblack\b/, label: "Black" },
    { match: /\bred\b/, label: "Red" },
    { match: /\bwhite\b/, label: "White" },
    { match: /\bgold\b/, label: "Gold" },
    { match: /\bsilver\b/, label: "Silver" },
    { match: /\bcopper\b/, label: "Copper" },
    { match: /\bpink\b/, label: "Pink" },
  ];
  let capColor: string | undefined;
  for (const { match, label } of colorTokens) {
    if (match.test(normalized)) {
      capColor = label;
      break;
    }
  }

  return { kind: "fitment", applicator, capColor, capacityMl, color };
}

/**
 * Build a stable matching key from a SKU's metadata so the references
 * folder can be looked up by SKU at generation time.
 *
 * Pattern: `${capacityMl}|${color}|${applicator}|${capColor}` for fitments
 * and `${capacityMl}|${color}|body` for bodies. Lowercased and trimmed.
 */
export function referenceMatchKeyFor(input: {
  kind: "body" | "fitment";
  capacityMl: number | null | undefined;
  glassColor: string | null | undefined;
  applicator?: string | null;
  capColor?: string | null;
}): string {
  const cap = input.capacityMl != null ? String(input.capacityMl) : "?";
  const color = (input.glassColor ?? "?").toLowerCase();
  if (input.kind === "body") {
    return `${cap}|${color}|body`;
  }
  const app = (input.applicator ?? "?").toLowerCase();
  const capColor = (input.capColor ?? "?").toLowerCase();
  return `${cap}|${color}|${app}|${capColor}`;
}

/** Same key shape, but built from a `ReferenceClassification` result. */
export function referenceMatchKeyForClassification(
  c: ReferenceClassification,
): string {
  const cap = c.capacityMl != null ? String(c.capacityMl) : "?";
  const color = (c.color ?? "?").toLowerCase();
  if (c.kind === "body") return `${cap}|${color}|body`;
  return `${cap}|${color}|${c.applicator.toLowerCase()}|${(c.capColor ?? "?").toLowerCase()}`;
}
