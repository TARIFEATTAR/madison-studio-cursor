/**
 * Bottle Type Detection System
 *
 * Extracted from Madison Studio. Critical for fragrance/beauty product rendering.
 * Detects whether a product is an OIL (dropper/roller) or SPRAY (atomizer)
 * and injects mandatory rendering rules into prompts.
 */

export interface ProductData {
  name?: string;
  format?: string;
  product_type?: string;
  category?: string;
  description?: string;
  bottle_type?: string; // 'oil' | 'spray' | 'auto' | null
}

export interface BottleTypeResult {
  isOil: boolean;
  isSpray: boolean;
  confidence: 'high' | 'medium' | 'low';
}

// OIL INDICATORS (comprehensive list)
const OIL_INDICATORS = [
  'oil', 'attar', 'concentrate', 'roller', 'dropper', 'roll-on', 'roll on',
  'perfume oil', 'fragrance oil', 'essential oil', 'carrier oil',
  'diluted oil', 'pure oil', 'oil-based', 'oil based', 'viscous',
  'thick oil', 'dense oil'
];

// SPRAY INDICATORS (comprehensive list)
const SPRAY_INDICATORS = [
  'spray', 'atomizer', 'pump', 'mist', 'eau de', 'cologne',
  'perfume spray', 'spray bottle', 'sprayer', 'atomizing', 'aerosol'
];

/**
 * Detect bottle type from product data
 */
export function detectBottleType(productData: ProductData | null): BottleTypeResult {
  if (!productData) {
    return { isOil: false, isSpray: false, confidence: 'low' };
  }

  // PRIORITY 1: Explicit bottle_type field
  const explicitType = productData.bottle_type?.toLowerCase();
  if (explicitType === 'oil') return { isOil: true, isSpray: false, confidence: 'high' };
  if (explicitType === 'spray') return { isOil: false, isSpray: true, confidence: 'high' };

  // PRIORITY 2: Auto-detection from fields
  const fields = [
    (productData.name || '').toLowerCase(),
    (productData.format || '').toLowerCase(),
    (productData.product_type || '').toLowerCase(),
    (productData.description || '').toLowerCase(),
  ];
  const categoryLower = (productData.category || '').toLowerCase();

  const hasOilIndicator = OIL_INDICATORS.some(ind => fields.some(f => f.includes(ind)));
  const hasSprayIndicator = SPRAY_INDICATORS.some(ind => fields.some(f => f.includes(ind)));

  const isPerfumeOil = fields.some(f => f.includes('perfume oil') || f.includes('fragrance oil'));
  const isSkincare = categoryLower === 'skincare';

  if (isPerfumeOil || isSkincare || hasOilIndicator) {
    return {
      isOil: true,
      isSpray: false,
      confidence: isPerfumeOil ? 'high' : hasOilIndicator ? 'medium' : 'low'
    };
  }

  if (hasSprayIndicator && !hasOilIndicator) {
    return { isOil: false, isSpray: true, confidence: 'medium' };
  }

  return { isOil: false, isSpray: false, confidence: 'low' };
}

/**
 * Build bottle type prompt section (injected at top of prompt for maximum priority)
 */
export function buildBottleTypePrompt(productData: ProductData | null): string {
  if (!productData) return '';

  const result = detectBottleType(productData);

  if (result.isOil) {
    return `
CRITICAL BOTTLE SPECIFICATION (MANDATORY - NO EXCEPTIONS):

PRODUCT TYPE: OIL-BASED FRAGRANCE (NON-SPRAY)

REQUIRED CLOSURE TYPES (ONLY THESE):
  - Glass dropper with pipette
  - Roller ball applicator
  - Screw cap (if dropper/roller is separate)
  - Glass wand (dipstick applicator)

ABSOLUTELY FORBIDDEN (NEVER INCLUDE):
  - Perfume sprayer / atomizer / pump mechanism
  - Crimped metal spray neck
  - Spray nozzle / misting device
  - Dip tube / hose / straw
  - Any form of spray dispenser
  - ANY visible tube, hose, or pipe extending into the liquid

VISUAL CHARACTERISTICS:
  - The liquid is viscous oil (thicker, more dense)
  - Bottle designed for direct application (not spraying)
  - Closure is for controlled dispensing, not atomization

If you render a spray mechanism, the image is INCORRECT and unusable.
`;
  }

  if (result.isSpray) {
    return `
CRITICAL BOTTLE SPECIFICATION (MANDATORY - NO EXCEPTIONS):

PRODUCT TYPE: SPRAY PERFUME (ALCOHOL-BASED)

REQUIRED CLOSURE TYPE:
  - Spray pump mechanism with atomizer
  - Visible crimped metal neck
  - Spray nozzle for misting

ABSOLUTELY FORBIDDEN:
  - Dropper / pipette
  - Roller ball applicator
  - Glass wand / dipstick

VISUAL CHARACTERISTICS:
  - The liquid is alcohol-based (thinner, more fluid)
  - Bottle designed for atomization and misting
  - Closure includes spray mechanism
`;
  }

  return '';
}
