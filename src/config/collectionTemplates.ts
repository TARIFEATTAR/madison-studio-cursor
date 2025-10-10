export interface CollectionTemplate {
  name: string;
  description: string;
  transparency_statement: string;
  color_theme: string;
  industry: string;
}

export const COLLECTION_TEMPLATES: Record<string, CollectionTemplate[]> = {
  fragrance: [
    {
      name: "Prestige Collection",
      description: "Luxury tier fragrances representing the pinnacle of our artistry",
      transparency_statement: "Rare and precious ingredients, masterfully composed with traditional perfumery techniques",
      color_theme: "#8B7355",
      industry: "fragrance",
    },
    {
      name: "Signature Line",
      description: "Core products embodying our brand's essence and identity",
      transparency_statement: "Iconic compositions crafted with premium ingredients and time-honored methods",
      color_theme: "#B8956A",
      industry: "fragrance",
    },
    {
      name: "Olfactive Collection: Oriental",
      description: "Rich, warm, and exotic fragrances from the Oriental scent family",
      transparency_statement: "Opulent spices, resins, and amber notes creating sensual warmth",
      color_theme: "#8B4513",
      industry: "fragrance",
    },
    {
      name: "Olfactive Collection: Fresh",
      description: "Clean, crisp, and invigorating fragrances from the Fresh scent family",
      transparency_statement: "Citrus, aquatic, and green notes evoking natural freshness",
      color_theme: "#4682B4",
      industry: "fragrance",
    },
    {
      name: "Olfactive Collection: Floral",
      description: "Elegant and romantic fragrances from the Floral scent family",
      transparency_statement: "Beautiful blooms and delicate petals creating timeless femininity",
      color_theme: "#DDA0DD",
      industry: "fragrance",
    },
    {
      name: "Olfactive Collection: Woody",
      description: "Sophisticated and grounded fragrances from the Woody scent family",
      transparency_statement: "Sandalwood, cedar, and vetiver creating earthy elegance",
      color_theme: "#654321",
      industry: "fragrance",
    },
    {
      name: "Olfactive Collection: Citrus",
      description: "Vibrant and energizing fragrances from the Citrus scent family",
      transparency_statement: "Zesty bergamot, lemon, and orange creating sparkling freshness",
      color_theme: "#FFD700",
      industry: "fragrance",
    },
    {
      name: "Concentration Collection: Eau de Parfum",
      description: "Long-lasting fragrances with 15-20% perfume concentration",
      transparency_statement: "Premium EdP formulations offering 6-8 hours of wear",
      color_theme: "#9370DB",
      industry: "fragrance",
    },
    {
      name: "Concentration Collection: Eau de Toilette",
      description: "Lighter fragrances with 5-15% perfume concentration",
      transparency_statement: "Refreshing EdT formulations perfect for daily wear",
      color_theme: "#87CEEB",
      industry: "fragrance",
    },
    {
      name: "Concentration Collection: Perfume Oils",
      description: "Intense, alcohol-free oil-based fragrances",
      transparency_statement: "Pure perfume oils in traditional carrier bases for maximum longevity",
      color_theme: "#DAA520",
      industry: "fragrance",
    },
    {
      name: "Concentration Collection: Attārs",
      description: "Traditional steam-distilled perfume oils with no alcohol",
      transparency_statement: "Authentic attār techniques using natural botanicals and traditional methods",
      color_theme: "#CD853F",
      industry: "fragrance",
    },
    {
      name: "Concentration Collection: Essential Oils",
      description: "Pure plant essences for aromatherapy and layering",
      transparency_statement: "100% pure essential oils, steam-distilled or cold-pressed from botanicals",
      color_theme: "#556B2F",
      industry: "fragrance",
    },
    {
      name: "Limited Editions",
      description: "Exclusive seasonal releases and special collaborations",
      transparency_statement: "Time-limited creations featuring rare ingredients and artistic partnerships",
      color_theme: "#6B8E23",
      industry: "fragrance",
    },
    {
      name: "Discovery & Travel",
      description: "Sample sets and travel-sized fragrances for exploration",
      transparency_statement: "Curated discovery sets and TSA-friendly sizes for fragrance enthusiasts on the go",
      color_theme: "#4A90A4",
      industry: "fragrance",
    },
  ],
  beauty_cosmetics: [
    {
      name: "Daily Essentials",
      description: "Everyday products for maintaining healthy, beautiful skin",
      transparency_statement: "Dermatologist-tested, suitable for daily use",
      color_theme: "#E8B4B8",
      industry: "beauty_cosmetics",
    },
    {
      name: "Treatment Line",
      description: "Advanced formulations targeting specific skin concerns",
      transparency_statement: "Clinically proven actives, cruelty-free, vegan options available",
      color_theme: "#7B68EE",
      industry: "beauty_cosmetics",
    },
    {
      name: "Luxury Collection",
      description: "Premium formulations with rare and precious ingredients",
      transparency_statement: "Ethically sourced luxury ingredients, sustainable packaging",
      color_theme: "#DAA520",
      industry: "beauty_cosmetics",
    },
  ],
  personal_care: [
    {
      name: "Natural Care",
      description: "Plant-based personal care for mindful living",
      transparency_statement: "98% natural origin ingredients, biodegradable formulas",
      color_theme: "#90EE90",
      industry: "personal_care",
    },
    {
      name: "Performance Line",
      description: "Advanced care for active lifestyles",
      transparency_statement: "Tested for performance, long-lasting protection",
      color_theme: "#4169E1",
      industry: "personal_care",
    },
    {
      name: "Sensitive Care",
      description: "Gentle formulations for sensitive skin",
      transparency_statement: "Hypoallergenic, fragrance-free, dermatologically approved",
      color_theme: "#B0C4DE",
      industry: "personal_care",
    },
  ],
  jewelry: [
    {
      name: "Fine Jewelry",
      description: "Timeless pieces crafted with precious metals and gemstones",
      transparency_statement: "Ethically sourced materials, conflict-free diamonds",
      color_theme: "#C0C0C0",
      industry: "jewelry",
    },
    {
      name: "Designer Collection",
      description: "Contemporary designs by renowned jewelry artisans",
      transparency_statement: "Limited editions, certified authenticity, artisan crafted",
      color_theme: "#FFD700",
      industry: "jewelry",
    },
    {
      name: "Occasion Pieces",
      description: "Special pieces for life's most memorable moments",
      transparency_statement: "Heirloom quality, customization available",
      color_theme: "#E6E6FA",
      industry: "jewelry",
    },
  ],
  luxury_watches: [
    {
      name: "Haute Horlogerie",
      description: "Masterpiece timepieces with exceptional complications",
      transparency_statement: "Swiss-made movements, limited production, certified chronometers",
      color_theme: "#2F4F4F",
      industry: "luxury_watches",
    },
    {
      name: "Sport Collection",
      description: "Luxury timepieces engineered for performance",
      transparency_statement: "Water-resistant, shock-resistant, premium materials",
      color_theme: "#FF4500",
      industry: "luxury_watches",
    },
    {
      name: "Heritage Edition",
      description: "Vintage-inspired timepieces honoring our watchmaking legacy",
      transparency_statement: "Authentic restoration techniques, archival designs",
      color_theme: "#8B4513",
      industry: "luxury_watches",
    },
  ],
};

export function getCollectionTemplatesForIndustry(industryId: string): CollectionTemplate[] {
  return COLLECTION_TEMPLATES[industryId] || [];
}

export function getAllIndustries(): string[] {
  return Object.keys(COLLECTION_TEMPLATES);
}
