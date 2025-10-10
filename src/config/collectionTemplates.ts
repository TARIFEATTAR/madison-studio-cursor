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
      name: "Signature Collection",
      description: "Our most iconic fragrances representing the essence of our brand",
      transparency_statement: "Premium ingredients sourced globally, crafted with traditional perfumery techniques",
      color_theme: "#8B7355",
      industry: "fragrance",
    },
    {
      name: "Seasonal Editions",
      description: "Limited edition fragrances inspired by the changing seasons",
      transparency_statement: "Time-limited releases featuring seasonal botanicals and materials",
      color_theme: "#6B8E23",
      industry: "fragrance",
    },
    {
      name: "Heritage Line",
      description: "Classic compositions honoring our brand's legacy",
      transparency_statement: "Traditional formulations preserved from our founding era",
      color_theme: "#4A4A4A",
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
