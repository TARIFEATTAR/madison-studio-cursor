// ============================================
// INGREDIENT LIBRARY - Common INCI Names
// For Fragrance & Skincare Products
// ============================================
// This file provides client-side autocomplete data
// Full database is seeded via scripts/seed_ingredient_library.sql
// ============================================

export type IngredientCategory =
  | "Base"
  | "Carrier Oil"
  | "Essential Oil"
  | "Fragrance"
  | "Preservative"
  | "Emulsifier"
  | "Thickener"
  | "Active"
  | "Botanical"
  | "Surfactant"
  | "Butter"
  | "Wax"
  | "Silicone"
  | "Colorant"
  | "pH Adjuster"
  | "Chelator"
  | "Aroma Chemical"
  | "Miscellaneous";

export interface IngredientSuggestion {
  inci: string;
  common: string;
  category: IngredientCategory;
  isAllergen?: boolean;
  allergenType?: string;
  vegan?: boolean;
}

// ============================================
// EU 26 ALLERGENS - Must be declared on labels
// ============================================
export const EU_26_ALLERGENS: IngredientSuggestion[] = [
  { inci: "LIMONENE", common: "Limonene", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "LINALOOL", common: "Linalool", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "CITRONELLOL", common: "Citronellol", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "GERANIOL", common: "Geraniol", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "CITRAL", common: "Citral", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "EUGENOL", common: "Eugenol", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "COUMARIN", common: "Coumarin", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "CINNAMAL", common: "Cinnamaldehyde", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "HYDROXYCITRONELLAL", common: "Hydroxycitronellal", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "ISOEUGENOL", common: "Isoeugenol", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "AMYL CINNAMAL", common: "Amyl Cinnamal", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "BENZYL ALCOHOL", common: "Benzyl Alcohol", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "BENZYL BENZOATE", common: "Benzyl Benzoate", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "BENZYL CINNAMATE", common: "Benzyl Cinnamate", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "BENZYL SALICYLATE", common: "Benzyl Salicylate", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "CINNAMYL ALCOHOL", common: "Cinnamyl Alcohol", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "FARNESOL", common: "Farnesol", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "HEXYL CINNAMAL", common: "Hexyl Cinnamal", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "BUTYLPHENYL METHYLPROPIONAL", common: "Lilial", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "ALPHA-ISOMETHYL IONONE", common: "Alpha-Isomethyl Ionone", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "EVERNIA PRUNASTRI EXTRACT", common: "Oakmoss Extract", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "EVERNIA FURFURACEA EXTRACT", common: "Treemoss Extract", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "METHYL 2-OCTYNOATE", common: "Methyl Heptine Carbonate", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
  { inci: "ANISE ALCOHOL", common: "Anise Alcohol", category: "Fragrance", isAllergen: true, allergenType: "EU26" },
];

// ============================================
// COMMON INGREDIENTS BY CATEGORY
// ============================================
export const COMMON_INGREDIENTS: IngredientSuggestion[] = [
  // ========== BASES & SOLVENTS ==========
  { inci: "AQUA", common: "Water", category: "Base", vegan: true },
  { inci: "ALCOHOL DENAT.", common: "Denatured Alcohol", category: "Base", vegan: true },
  { inci: "ETHANOL", common: "Ethyl Alcohol", category: "Base", vegan: true },
  { inci: "DIPROPYLENE GLYCOL", common: "DPG", category: "Base", vegan: true },
  { inci: "PROPYLENE GLYCOL", common: "PG", category: "Base", vegan: true },
  { inci: "GLYCERIN", common: "Glycerine", category: "Base", vegan: true },
  { inci: "BUTYLENE GLYCOL", common: "BG", category: "Base", vegan: true },
  { inci: "PENTYLENE GLYCOL", common: "Pentanediol", category: "Base", vegan: true },

  // ========== CARRIER OILS ==========
  { inci: "PRUNUS AMYGDALUS DULCIS OIL", common: "Sweet Almond Oil", category: "Carrier Oil", vegan: true },
  { inci: "SIMMONDSIA CHINENSIS SEED OIL", common: "Jojoba Oil", category: "Carrier Oil", vegan: true },
  { inci: "COCOS NUCIFERA OIL", common: "Coconut Oil", category: "Carrier Oil", vegan: true },
  { inci: "ARGANIA SPINOSA KERNEL OIL", common: "Argan Oil", category: "Carrier Oil", vegan: true },
  { inci: "ROSA CANINA SEED OIL", common: "Rosehip Oil", category: "Carrier Oil", vegan: true },
  { inci: "HELIANTHUS ANNUUS SEED OIL", common: "Sunflower Seed Oil", category: "Carrier Oil", vegan: true },
  { inci: "OLEA EUROPAEA FRUIT OIL", common: "Olive Oil", category: "Carrier Oil", vegan: true },
  { inci: "PERSEA GRATISSIMA OIL", common: "Avocado Oil", category: "Carrier Oil", vegan: true },
  { inci: "VITIS VINIFERA SEED OIL", common: "Grape Seed Oil", category: "Carrier Oil", vegan: true },
  { inci: "RICINUS COMMUNIS SEED OIL", common: "Castor Oil", category: "Carrier Oil", vegan: true },
  { inci: "SQUALANE", common: "Squalane", category: "Carrier Oil", vegan: true },
  { inci: "CAPRYLIC/CAPRIC TRIGLYCERIDE", common: "MCT Oil", category: "Carrier Oil", vegan: true },
  { inci: "ISOPROPYL MYRISTATE", common: "IPM", category: "Carrier Oil", vegan: true },

  // ========== ESSENTIAL OILS ==========
  { inci: "LAVANDULA ANGUSTIFOLIA OIL", common: "Lavender Essential Oil", category: "Essential Oil", vegan: true },
  { inci: "CITRUS AURANTIUM DULCIS PEEL OIL", common: "Sweet Orange Oil", category: "Essential Oil", vegan: true },
  { inci: "CITRUS LIMON PEEL OIL", common: "Lemon Essential Oil", category: "Essential Oil", vegan: true },
  { inci: "MENTHA PIPERITA OIL", common: "Peppermint Oil", category: "Essential Oil", vegan: true },
  { inci: "EUCALYPTUS GLOBULUS LEAF OIL", common: "Eucalyptus Oil", category: "Essential Oil", vegan: true },
  { inci: "MELALEUCA ALTERNIFOLIA LEAF OIL", common: "Tea Tree Oil", category: "Essential Oil", vegan: true },
  { inci: "ROSMARINUS OFFICINALIS LEAF OIL", common: "Rosemary Oil", category: "Essential Oil", vegan: true },
  { inci: "CEDRUS ATLANTICA BARK OIL", common: "Cedarwood Oil", category: "Essential Oil", vegan: true },
  { inci: "SANTALUM ALBUM OIL", common: "Sandalwood Oil", category: "Essential Oil", vegan: true },
  { inci: "VETIVERIA ZIZANOIDES ROOT OIL", common: "Vetiver Oil", category: "Essential Oil", vegan: true },
  { inci: "PELARGONIUM GRAVEOLENS OIL", common: "Geranium Oil", category: "Essential Oil", vegan: true },
  { inci: "CITRUS BERGAMIA PEEL OIL", common: "Bergamot Oil", category: "Essential Oil", vegan: true },
  { inci: "YLANG YLANG OIL", common: "Ylang Ylang Oil", category: "Essential Oil", vegan: true },
  { inci: "JASMINUM OFFICINALE OIL", common: "Jasmine Oil", category: "Essential Oil", vegan: true },
  { inci: "ROSA DAMASCENA FLOWER OIL", common: "Rose Otto", category: "Essential Oil", vegan: true },
  { inci: "BOSWELLIA CARTERII OIL", common: "Frankincense Oil", category: "Essential Oil", vegan: true },
  { inci: "COMMIPHORA MYRRHA OIL", common: "Myrrh Oil", category: "Essential Oil", vegan: true },
  { inci: "POGOSTEMON CABLIN OIL", common: "Patchouli Oil", category: "Essential Oil", vegan: true },
  { inci: "CITRUS AURANTIUM AMARA FLOWER OIL", common: "Neroli Oil", category: "Essential Oil", vegan: true },
  { inci: "PARFUM", common: "Fragrance", category: "Fragrance", vegan: true },

  // ========== PRESERVATIVES ==========
  { inci: "PHENOXYETHANOL", common: "Phenoxyethanol", category: "Preservative", vegan: true },
  { inci: "ETHYLHEXYLGLYCERIN", common: "Ethylhexylglycerin", category: "Preservative", vegan: true },
  { inci: "SODIUM BENZOATE", common: "Sodium Benzoate", category: "Preservative", vegan: true },
  { inci: "POTASSIUM SORBATE", common: "Potassium Sorbate", category: "Preservative", vegan: true },
  { inci: "TOCOPHEROL", common: "Vitamin E", category: "Preservative", vegan: true },
  { inci: "CITRIC ACID", common: "Citric Acid", category: "Preservative", vegan: true },

  // ========== EMULSIFIERS & THICKENERS ==========
  { inci: "CETEARYL ALCOHOL", common: "Cetearyl Alcohol", category: "Emulsifier", vegan: true },
  { inci: "CETYL ALCOHOL", common: "Cetyl Alcohol", category: "Emulsifier", vegan: true },
  { inci: "GLYCERYL STEARATE", common: "Glyceryl Stearate", category: "Emulsifier", vegan: true },
  { inci: "POLYSORBATE 20", common: "Tween 20", category: "Emulsifier", vegan: true },
  { inci: "POLYSORBATE 80", common: "Tween 80", category: "Emulsifier", vegan: true },
  { inci: "LECITHIN", common: "Lecithin", category: "Emulsifier", vegan: true },
  { inci: "XANTHAN GUM", common: "Xanthan Gum", category: "Thickener", vegan: true },
  { inci: "CARBOMER", common: "Carbomer", category: "Thickener", vegan: true },
  { inci: "HYDROXYETHYLCELLULOSE", common: "HEC", category: "Thickener", vegan: true },

  // ========== ACTIVE INGREDIENTS ==========
  { inci: "RETINOL", common: "Vitamin A", category: "Active", vegan: true },
  { inci: "NIACINAMIDE", common: "Vitamin B3", category: "Active", vegan: true },
  { inci: "ASCORBYL GLUCOSIDE", common: "Vitamin C Derivative", category: "Active", vegan: true },
  { inci: "PANTHENOL", common: "Pro-Vitamin B5", category: "Active", vegan: true },
  { inci: "TOCOPHERYL ACETATE", common: "Vitamin E Acetate", category: "Active", vegan: true },
  { inci: "HYALURONIC ACID", common: "Hyaluronic Acid", category: "Active", vegan: true },
  { inci: "SODIUM HYALURONATE", common: "Sodium Hyaluronate", category: "Active", vegan: true },
  { inci: "GLYCOLIC ACID", common: "Glycolic Acid", category: "Active", vegan: true },
  { inci: "LACTIC ACID", common: "Lactic Acid", category: "Active", vegan: true },
  { inci: "SALICYLIC ACID", common: "Salicylic Acid", category: "Active", vegan: true },
  { inci: "AZELAIC ACID", common: "Azelaic Acid", category: "Active", vegan: true },
  { inci: "CERAMIDE NP", common: "Ceramide 3", category: "Active", vegan: true },
  { inci: "BAKUCHIOL", common: "Bakuchiol", category: "Active", vegan: true },
  { inci: "ALLANTOIN", common: "Allantoin", category: "Active", vegan: true },
  { inci: "BISABOLOL", common: "Alpha-Bisabolol", category: "Active", vegan: true },
  { inci: "CENTELLA ASIATICA EXTRACT", common: "Cica Extract", category: "Active", vegan: true },
  { inci: "CAFFEINE", common: "Caffeine", category: "Active", vegan: true },

  // ========== BOTANICAL EXTRACTS ==========
  { inci: "ALOE BARBADENSIS LEAF JUICE", common: "Aloe Vera", category: "Botanical", vegan: true },
  { inci: "CAMELLIA SINENSIS LEAF EXTRACT", common: "Green Tea Extract", category: "Botanical", vegan: true },
  { inci: "CHAMOMILLA RECUTITA FLOWER EXTRACT", common: "Chamomile Extract", category: "Botanical", vegan: true },
  { inci: "CALENDULA OFFICINALIS FLOWER EXTRACT", common: "Calendula Extract", category: "Botanical", vegan: true },
  { inci: "HAMAMELIS VIRGINIANA EXTRACT", common: "Witch Hazel", category: "Botanical", vegan: true },
  { inci: "GLYCYRRHIZA GLABRA ROOT EXTRACT", common: "Licorice Root Extract", category: "Botanical", vegan: true },
  { inci: "GINKGO BILOBA LEAF EXTRACT", common: "Ginkgo Extract", category: "Botanical", vegan: true },
  { inci: "CURCUMA LONGA ROOT EXTRACT", common: "Turmeric Extract", category: "Botanical", vegan: true },
  { inci: "PUNICA GRANATUM EXTRACT", common: "Pomegranate Extract", category: "Botanical", vegan: true },
  { inci: "COFFEE ARABICA SEED EXTRACT", common: "Coffee Extract", category: "Botanical", vegan: true },

  // ========== SURFACTANTS ==========
  { inci: "COCAMIDOPROPYL BETAINE", common: "CAPB", category: "Surfactant", vegan: true },
  { inci: "SODIUM COCOYL ISETHIONATE", common: "SCI", category: "Surfactant", vegan: true },
  { inci: "DECYL GLUCOSIDE", common: "Decyl Glucoside", category: "Surfactant", vegan: true },
  { inci: "COCO-GLUCOSIDE", common: "Coco Glucoside", category: "Surfactant", vegan: true },

  // ========== BUTTERS & WAXES ==========
  { inci: "BUTYROSPERMUM PARKII BUTTER", common: "Shea Butter", category: "Butter", vegan: true },
  { inci: "THEOBROMA CACAO SEED BUTTER", common: "Cocoa Butter", category: "Butter", vegan: true },
  { inci: "MANGIFERA INDICA SEED BUTTER", common: "Mango Butter", category: "Butter", vegan: true },
  { inci: "CERA ALBA", common: "Beeswax", category: "Wax", vegan: false },
  { inci: "CANDELILLA CERA", common: "Candelilla Wax", category: "Wax", vegan: true },
  { inci: "COPERNICIA CERIFERA CERA", common: "Carnauba Wax", category: "Wax", vegan: true },

  // ========== SILICONES ==========
  { inci: "DIMETHICONE", common: "Dimethicone", category: "Silicone", vegan: true },
  { inci: "CYCLOPENTASILOXANE", common: "D5", category: "Silicone", vegan: true },
  { inci: "PHENYL TRIMETHICONE", common: "Phenyl Trimethicone", category: "Silicone", vegan: true },

  // ========== COLORANTS ==========
  { inci: "CI 77891", common: "Titanium Dioxide (white)", category: "Colorant", vegan: true },
  { inci: "CI 77491", common: "Iron Oxide Red", category: "Colorant", vegan: true },
  { inci: "CI 77492", common: "Iron Oxide Yellow", category: "Colorant", vegan: true },
  { inci: "CI 77499", common: "Iron Oxide Black", category: "Colorant", vegan: true },
  { inci: "MICA", common: "Mica", category: "Colorant", vegan: true },

  // ========== AROMA CHEMICALS ==========
  { inci: "ISO E SUPER", common: "Iso E Super", category: "Aroma Chemical", vegan: true },
  { inci: "HEDIONE", common: "Hedione", category: "Aroma Chemical", vegan: true },
  { inci: "AMBROXAN", common: "Ambroxan", category: "Aroma Chemical", vegan: true },
  { inci: "GALAXOLIDE", common: "Galaxolide", category: "Aroma Chemical", vegan: true },
  { inci: "CASHMERAN", common: "Cashmeran", category: "Aroma Chemical", vegan: true },
  { inci: "JAVANOL", common: "Javanol", category: "Aroma Chemical", vegan: true },
  { inci: "VANILLIN", common: "Vanillin", category: "Aroma Chemical", vegan: true },

  // ========== MISCELLANEOUS ==========
  { inci: "SODIUM CHLORIDE", common: "Salt", category: "Miscellaneous", vegan: true },
  { inci: "KAOLIN", common: "Kaolin Clay", category: "Miscellaneous", vegan: true },
  { inci: "BENTONITE", common: "Bentonite Clay", category: "Miscellaneous", vegan: true },
  { inci: "CHARCOAL POWDER", common: "Activated Charcoal", category: "Miscellaneous", vegan: true },
];

// ============================================
// COMBINED LIST FOR AUTOCOMPLETE
// ============================================
export const ALL_INGREDIENTS: IngredientSuggestion[] = [
  ...EU_26_ALLERGENS,
  ...COMMON_INGREDIENTS,
];

// ============================================
// HELPER: Search ingredients by name
// ============================================
export function searchIngredients(
  query: string,
  limit = 10
): IngredientSuggestion[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase();
  
  return ALL_INGREDIENTS
    .filter(
      (ing) =>
        ing.inci.toLowerCase().includes(normalizedQuery) ||
        ing.common.toLowerCase().includes(normalizedQuery)
    )
    .slice(0, limit);
}

// ============================================
// HELPER: Get ingredients by category
// ============================================
export function getIngredientsByCategory(
  category: IngredientCategory
): IngredientSuggestion[] {
  return ALL_INGREDIENTS.filter((ing) => ing.category === category);
}

// ============================================
// HELPER: Check if ingredient is an allergen
// ============================================
export function isAllergen(inciName: string): boolean {
  const normalized = inciName.toUpperCase();
  return EU_26_ALLERGENS.some((a) => a.inci === normalized);
}

// ============================================
// HELPER: Get all allergens in a list
// ============================================
export function detectAllergens(
  inciNames: string[]
): IngredientSuggestion[] {
  const normalizedNames = inciNames.map((n) => n.toUpperCase());
  return EU_26_ALLERGENS.filter((a) => normalizedNames.includes(a.inci));
}

// ============================================
// CATEGORIES LIST
// ============================================
export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "Base",
  "Carrier Oil",
  "Essential Oil",
  "Fragrance",
  "Preservative",
  "Emulsifier",
  "Thickener",
  "Active",
  "Botanical",
  "Surfactant",
  "Butter",
  "Wax",
  "Silicone",
  "Colorant",
  "pH Adjuster",
  "Chelator",
  "Aroma Chemical",
  "Miscellaneous",
];

// ============================================
// STATS
// ============================================
export const INGREDIENT_STATS = {
  totalCount: ALL_INGREDIENTS.length,
  allergenCount: EU_26_ALLERGENS.length,
  categoryCount: INGREDIENT_CATEGORIES.length,
};
