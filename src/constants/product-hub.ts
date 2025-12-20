/**
 * Product Hub Constants
 * Consolidated configuration for all product-related features
 */

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS & STAGE OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const PRODUCT_STATUS = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  archived: { label: "Archived", color: "bg-amber-100 text-amber-700" },
  discontinued: { label: "Discontinued", color: "bg-red-100 text-red-700" },
} as const;

export const SDS_STATUS = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  review: { label: "In Review", color: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", color: "bg-green-100 text-green-800" },
  expired: { label: "Expired", color: "bg-red-100 text-red-800" },
} as const;

export const DEVELOPMENT_STAGES = [
  { value: "concept", label: "Concept", icon: "💡" },
  { value: "formulation", label: "Formulation", icon: "🧪" },
  { value: "testing", label: "Testing", icon: "🔬" },
  { value: "production", label: "Production", icon: "🏭" },
  { value: "launched", label: "Launched", icon: "🚀" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT CATEGORIES & TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const PRODUCT_CATEGORIES = [
  "Skincare", "Haircare", "Body Care", "Cosmetics", "Fragrance",
  "Wellness", "Sun Care", "Men's Grooming", "Nail Care", "Oral Care", "Baby & Kids",
] as const;

export const PRODUCT_TYPES: Record<string, readonly string[]> = {
  Skincare: ["Cleanser", "Toner", "Serum", "Moisturizer", "Eye Cream", "Mask", "Exfoliant", "Oil", "Mist", "SPF"],
  Haircare: ["Shampoo", "Conditioner", "Treatment", "Styling", "Oil", "Mask", "Serum", "Spray"],
  "Body Care": ["Body Wash", "Body Lotion", "Body Oil", "Body Scrub", "Hand Cream", "Deodorant"],
  Cosmetics: ["Foundation", "Concealer", "Powder", "Blush", "Bronzer", "Highlighter", "Lipstick", "Lip Gloss", "Mascara", "Eyeliner", "Eyeshadow"],
  Fragrance: ["Attär", "Eau de Parfum", "Eau de Toilette", "Perfume Oil", "Body Mist", "Solid Perfume", "Room Spray", "Candle", "Incense"],
  Wellness: ["Aromatherapy", "Essential Oil", "Bath Soak", "Supplement", "CBD", "Sleep Aid"],
  "Sun Care": ["Sunscreen", "After Sun", "Self Tanner", "Bronzing Oil"],
  "Men's Grooming": ["Shave Cream", "Aftershave", "Beard Oil", "Pomade", "Cologne"],
  "Nail Care": ["Polish", "Treatment", "Remover", "Cuticle Oil"],
  "Oral Care": ["Toothpaste", "Mouthwash", "Whitening"],
  "Baby & Kids": ["Lotion", "Wash", "Diaper Cream", "Sunscreen"],
};

// ═══════════════════════════════════════════════════════════════════════════════
// FORMULATION OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const CONCENTRATION_TYPES = [
  { value: "parfum", label: "Parfum / Extrait", range: "20-30%" },
  { value: "eau_de_parfum", label: "Eau de Parfum", range: "15-20%" },
  { value: "eau_de_toilette", label: "Eau de Toilette", range: "5-15%" },
  { value: "eau_de_cologne", label: "Eau de Cologne", range: "2-4%" },
  { value: "eau_fraiche", label: "Eau Fraîche", range: "1-3%" },
  { value: "perfume_oil", label: "Perfume Oil", range: "15-30%" },
  { value: "attar", label: "Attär", range: "Traditional" },
  { value: "solid_perfume", label: "Solid Perfume", range: "Wax-based" },
  { value: "body_mist", label: "Body Mist", range: "1-3%" },
] as const;

export const BASE_CARRIERS = [
  { value: "alcohol", label: "Perfumer's Alcohol", desc: "Traditional, quick evaporation" },
  { value: "fractionated_coconut", label: "MCT Oil", desc: "Light, non-greasy" },
  { value: "jojoba", label: "Jojoba Oil", desc: "Closest to skin sebum" },
  { value: "sweet_almond", label: "Sweet Almond", desc: "Nourishing, subtle" },
  { value: "argan", label: "Argan Oil", desc: "Luxurious, fast-absorbing" },
  { value: "squalane", label: "Squalane", desc: "Ultra-light" },
  { value: "sandalwood_oil", label: "Sandalwood Oil", desc: "Traditional attar base" },
  { value: "dpg", label: "DPG", desc: "Scentless, extends longevity" },
] as const;

export const LONGEVITY = [
  { value: "fleeting", label: "Fleeting", duration: "< 2h" },
  { value: "moderate", label: "Moderate", duration: "2-4h" },
  { value: "long_lasting", label: "Long Lasting", duration: "4-8h" },
  { value: "very_long", label: "Very Long", duration: "8-12h" },
  { value: "extreme", label: "Extreme", duration: "12h+" },
] as const;

export const SILLAGE = [
  { value: "intimate", label: "Intimate", desc: "Skin scent" },
  { value: "moderate", label: "Moderate", desc: "Arm's length" },
  { value: "strong", label: "Strong", desc: "Room-filling" },
  { value: "enormous", label: "Enormous", desc: "Announces arrival" },
] as const;

export const SEASONS = [
  { value: "spring", label: "Spring", icon: "🌸" },
  { value: "summer", label: "Summer", icon: "☀️" },
  { value: "fall", label: "Fall", icon: "🍂" },
  { value: "winter", label: "Winter", icon: "❄️" },
  { value: "all_season", label: "All Season", icon: "🌍" },
] as const;

export const OCCASIONS = [
  { value: "daily", label: "Daily Wear" },
  { value: "office", label: "Office" },
  { value: "casual", label: "Casual" },
  { value: "evening", label: "Evening" },
  { value: "formal", label: "Formal" },
  { value: "romantic", label: "Romantic" },
  { value: "special_occasion", label: "Special Occasion" },
] as const;

export const SCENT_FAMILIES = [
  "Citrus", "Floral", "Oriental", "Woody", "Fresh",
  "Fougère", "Chypre", "Gourmand", "Aquatic", "Green", "Leather", "Spicy",
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SKINCARE OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const SKIN_TYPES = [
  { value: "normal", label: "Normal" },
  { value: "dry", label: "Dry" },
  { value: "oily", label: "Oily" },
  { value: "combination", label: "Combination" },
  { value: "sensitive", label: "Sensitive" },
  { value: "mature", label: "Mature" },
] as const;

export const SKIN_CONCERNS = [
  { value: "acne", label: "Acne & Breakouts" },
  { value: "aging", label: "Aging & Fine Lines" },
  { value: "dryness", label: "Dryness" },
  { value: "dullness", label: "Dullness" },
  { value: "hyperpigmentation", label: "Hyperpigmentation" },
  { value: "sensitivity", label: "Sensitivity" },
  { value: "redness", label: "Redness" },
  { value: "pores", label: "Large Pores" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// INGREDIENTS & COMPLIANCE
// ═══════════════════════════════════════════════════════════════════════════════

export const INGREDIENT_ORIGINS = [
  { value: "natural", label: "Natural", desc: "From plants/animals/minerals" },
  { value: "natural_derived", label: "Nature-Derived", desc: "Modified from natural sources" },
  { value: "synthetic", label: "Synthetic", desc: "Chemical synthesis" },
  { value: "biotechnology", label: "Biotechnology", desc: "Fermentation/bioengineering" },
  { value: "mineral", label: "Mineral", desc: "Mineral sources" },
] as const;

export const COSMETIC_FUNCTIONS = [
  "Emollient", "Humectant", "Preservative", "Fragrance", "Colorant",
  "Surfactant", "Emulsifier", "Thickener", "Antioxidant", "pH Adjuster",
  "Chelating Agent", "Solvent", "Film Former", "Conditioning Agent",
  "UV Filter", "Active Ingredient", "Botanical Extract", "Essential Oil", "Carrier Oil",
] as const;

export const CERTIFICATIONS = [
  { value: "cruelty_free", label: "Cruelty-Free", icon: "🐰" },
  { value: "vegan", label: "Vegan", icon: "🌱" },
  { value: "organic", label: "Organic", icon: "🌿" },
  { value: "natural", label: "Natural", icon: "🍃" },
  { value: "halal", label: "Halal", icon: "☪️" },
  { value: "kosher", label: "Kosher", icon: "✡️" },
  { value: "fair_trade", label: "Fair Trade", icon: "🤝" },
  { value: "leaping_bunny", label: "Leaping Bunny", icon: "🐇" },
  { value: "peta", label: "PETA Approved", icon: "🐾" },
  { value: "ecocert", label: "ECOCERT", icon: "🌍" },
  { value: "cosmos", label: "COSMOS", icon: "✨" },
  { value: "usda_organic", label: "USDA Organic", icon: "🇺🇸" },
  { value: "b_corp", label: "B Corp", icon: "🅱️" },
  { value: "climate_neutral", label: "Climate Neutral", icon: "🌡️" },
  { value: "plastic_free", label: "Plastic-Free", icon: "♻️" },
] as const;

export const GHS_PICTOGRAMS = [
  { code: "GHS01", symbol: "💥", name: "Explosive" },
  { code: "GHS02", symbol: "🔥", name: "Flammable" },
  { code: "GHS03", symbol: "⭕", name: "Oxidizer" },
  { code: "GHS04", symbol: "🫧", name: "Compressed Gas" },
  { code: "GHS05", symbol: "⚗️", name: "Corrosive" },
  { code: "GHS06", symbol: "☠️", name: "Toxic" },
  { code: "GHS07", symbol: "⚠️", name: "Irritant" },
  { code: "GHS08", symbol: "🫁", name: "Health Hazard" },
  { code: "GHS09", symbol: "🌊", name: "Environmental" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// PACKAGING OPTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTAINER_TYPES = [
  { value: "bottle", label: "Bottle" },
  { value: "jar", label: "Jar" },
  { value: "tube", label: "Tube" },
  { value: "pump", label: "Pump Bottle" },
  { value: "dropper", label: "Dropper Bottle" },
  { value: "roller", label: "Roller Bottle" },
  { value: "spray", label: "Spray Bottle" },
  { value: "airless", label: "Airless Pump" },
  { value: "tin", label: "Tin" },
  { value: "pouch", label: "Pouch/Sachet" },
  { value: "stick", label: "Stick/Twist-up" },
] as const;

export const CONTAINER_MATERIALS = [
  { value: "glass", label: "Glass" },
  { value: "glass_frosted", label: "Frosted Glass" },
  { value: "glass_amber", label: "Amber Glass" },
  { value: "pet", label: "PET Plastic" },
  { value: "hdpe", label: "HDPE Plastic" },
  { value: "pp", label: "PP Plastic" },
  { value: "aluminum", label: "Aluminum" },
  { value: "bamboo", label: "Bamboo" },
  { value: "pcr", label: "Post-Consumer Recycled" },
] as const;

export const CLOSURE_TYPES = [
  { value: "pump", label: "Pump" },
  { value: "spray", label: "Spray/Mist" },
  { value: "dropper", label: "Dropper" },
  { value: "screw_cap", label: "Screw Cap" },
  { value: "flip_top", label: "Flip Top" },
  { value: "disc_cap", label: "Disc Cap" },
  { value: "roller", label: "Roller Ball" },
] as const;

export const LABEL_TYPES = [
  { value: "pressure_sensitive", label: "Pressure Sensitive" },
  { value: "shrink_sleeve", label: "Shrink Sleeve" },
  { value: "screen_print", label: "Screen Print" },
  { value: "hot_stamp", label: "Hot Stamp" },
  { value: "embossed", label: "Embossed" },
] as const;

export const RECYCLING_CODES = [
  { value: "1", label: "#1 PETE" },
  { value: "2", label: "#2 HDPE" },
  { value: "5", label: "#5 PP" },
  { value: "7", label: "#7 Other" },
  { value: "70", label: "#70 Glass" },
  { value: "41", label: "#41 Aluminum" },
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// AI WRITING RULES (for product type context injection)
// ═══════════════════════════════════════════════════════════════════════════════

export const PRODUCT_WRITING_RULES: Record<string, {
  description: string;
  vocabulary: string[];
  tone: string;
  avoid?: string[];
}> = {
  Attär: {
    description: "Traditional botanical perfume oil using ancient distillation methods",
    vocabulary: ["attar", "attär", "botanical essence", "natural perfumery", "heritage fragrance", "concentrated oil", "alcohol-free"],
    tone: "Emphasize craftsmanship, tradition, and artisanal nature. Position as luxury heritage.",
    avoid: ["synthetic", "chemical", "spray", "cologne"],
  },
  "Eau de Parfum": {
    description: "Concentrated fragrance with 15-20% perfume oil",
    vocabulary: ["EDP", "sillage", "longevity", "top/heart/base notes", "dry down", "projection"],
    tone: "Emphasize luxury, sophistication, and lasting power.",
  },
  Serum: {
    description: "Concentrated treatment with active ingredients",
    vocabulary: ["actives", "concentrated", "lightweight", "fast-absorbing", "treatment", "potent", "targeted"],
    tone: "Lead with science and efficacy. Highlight clinical results.",
  },
  Moisturizer: {
    description: "Hydrating cream or lotion for daily use",
    vocabulary: ["hydration", "moisture barrier", "nourishing", "protective", "supple", "plump"],
    tone: "Focus on comfort, hydration, and daily ritual. Emphasize skin health.",
  },
};

// Helper to check product category
export const isFragranceCategory = (cat: string | null | undefined): boolean =>
  cat === "Fragrance" || ["Attär", "Eau de Parfum", "Eau de Toilette", "Perfume Oil", "Body Mist", "Solid Perfume"].includes(cat || "");

export const isSkincareCategory = (cat: string | null | undefined): boolean =>
  cat === "Skincare" || ["Serum", "Moisturizer", "Cleanser", "Toner", "Mask", "Oil"].includes(cat || "");
