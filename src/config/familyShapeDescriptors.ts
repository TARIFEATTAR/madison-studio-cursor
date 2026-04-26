/**
 * Family-specific shape descriptors for paper-doll body generation.
 *
 * Numeric dimensions alone (height, diameter, capacity) don't tell the model
 * what a specific bottle family looks like — it'll draw a generic shape that
 * matches the dimensions. These descriptors carry the visual silhouette
 * language so gpt-image-2 generates the correct family geometry.
 *
 * Each entry describes the body's defining geometric features:
 * silhouette, edge profile, base contour, neck transition.
 *
 * Add a family here when its first-time generation produces drift from the
 * intended shape. Default fallback is generic and works for unfamiliar
 * families until they're explicitly characterized.
 */

export const FAMILY_BODY_SHAPE_DESCRIPTORS: Record<string, string> = {
  Empire:
    "Tall, rectangular silhouette with flat front and back surfaces, sharp vertical edges, and a thick, heavy base. The inner panel curves gently inward near the base, creating a distinctive U-shaped inner contour. Short threaded neck with multiple visible screw threads and a slight collar at the base of the neck. Crisp prismatic geometry, not rounded.",

  Cylinder:
    "The bottle is cylindrical with smooth rounded sides, uniform diameter from base to shoulder, a flat circular base, and a short threaded neck. No edges, no corners — pure tube geometry.",

  "Tall Cylinder":
    "Tall slender cylindrical bottle with smooth rounded sides, uniform diameter, flat circular base, and a short threaded neck. Aspect ratio more elongated than the standard Cylinder.",

  "Boston Round":
    "Rounded apothecary-style bottle with smooth shoulders curving inward to a short threaded neck. Flat circular base, mild taper from shoulder down to base.",

  Bell:
    "Bell-shaped silhouette — wide rounded base tapering smoothly upward into a narrower shoulder and short threaded neck. Curvilinear profile, no sharp edges.",

  Diamond:
    "Diamond-faceted bottle with multiple flat angled panels around the body, sharp vertical edges between facets, and a short threaded neck.",

  Teardrop:
    "Teardrop silhouette with a rounded base widening into a fuller shoulder, then tapering up to a short threaded neck. Smooth curves throughout.",

  Round:
    "Spherical / globe-shaped bottle with a fully rounded body, short threaded neck rising from the top, flat or slightly indented base for stability.",

  Apothecary:
    "Apothecary bottle with flared shoulder, slightly tapered body, flat round base, and a short threaded neck. Classic pharmacy silhouette.",

  Pillar:
    "Tall column-like bottle with mostly straight vertical sides, slight shoulder curvature into a short threaded neck, flat round or slightly oval base.",

  Tulip:
    "Tulip-flower silhouette — narrow base widening upward into a fuller mid-body, then narrowing back to a short threaded neck.",

  Flair:
    "Flared shoulder bottle with a narrower base, dramatic outward curve at the shoulder, then tapering quickly to a short threaded neck.",

  Diva:
    "Curvy hourglass-leaning silhouette with a defined waist, fuller shoulder, and short threaded neck. Feminine, sculpted profile.",

  Sleek:
    "Sleek elongated bottle with smooth subtle curves, gently tapered shoulder into a short threaded neck. Minimalist, modern profile.",

  Slim:
    "Slim narrow-profile bottle with mostly vertical sides, very subtle shoulder curve into a short threaded neck. Compact silhouette.",

  Elegant:
    "Elegant sculpted profile with refined curves at shoulder and base, short threaded neck. Premium presentation.",

  Circle:
    "Disc-shaped bottle viewed face-on with circular silhouette, short threaded neck rising from one side or the top, flat front and back surfaces.",

  Rectangle:
    "Rectangular flask-like bottle with flat front and back, sharp vertical edges, square or rectangular base, short threaded neck.",

  Vial:
    "Small slender vial with straight cylindrical sides, flat round base, and a narrow short neck. Laboratory / sample-bottle proportions.",

  "Cream Jar":
    "Wide low cylindrical jar with a broad flat circular base, short straight sides, wide threaded mouth (no narrow neck — mouth is nearly the full diameter of the body).",
};

const GENERIC_FALLBACK =
  "Standard glass bottle silhouette with proportionate body, smooth shoulder transition into a short threaded neck, and a stable flat base.";

export function getBodyShapeDescriptor(
  family: string | null | undefined,
): string {
  if (!family) return GENERIC_FALLBACK;
  return FAMILY_BODY_SHAPE_DESCRIPTORS[family] ?? GENERIC_FALLBACK;
}
