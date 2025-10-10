export interface IndustryTemplate {
  id: string;
  name: string;
  section_title: string;
  fields: Array<{
    id: string;
    label: string;
  }>;
}

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  fragrance: {
    id: "fragrance",
    name: "Fragrance & Perfume",
    section_title: "Fragrance Profile",
    fields: [
      { id: "field_1", label: "Top Notes" },
      { id: "field_2", label: "Middle Notes" },
      { id: "field_3", label: "Base Notes" },
    ],
  },
  food_beverage: {
    id: "food_beverage",
    name: "Food & Beverage",
    section_title: "Dish Details",
    fields: [
      { id: "field_1", label: "Main Ingredients" },
      { id: "field_2", label: "Dietary Info" },
      { id: "field_3", label: "Flavor Profile" },
    ],
  },
  coffee_specialty: {
    id: "coffee_specialty",
    name: "Coffee & Specialty Drinks",
    section_title: "Bean Profile",
    fields: [
      { id: "field_1", label: "Origin & Terroir" },
      { id: "field_2", label: "Tasting Notes" },
      { id: "field_3", label: "Roast & Process" },
    ],
  },
  beauty_cosmetics: {
    id: "beauty_cosmetics",
    name: "Beauty & Cosmetics",
    section_title: "Product Details",
    fields: [
      { id: "field_1", label: "Key Ingredients" },
      { id: "field_2", label: "Skin Type" },
      { id: "field_3", label: "Benefits" },
    ],
  },
  fashion_apparel: {
    id: "fashion_apparel",
    name: "Fashion & Apparel",
    section_title: "Product Specs",
    fields: [
      { id: "field_1", label: "Materials" },
      { id: "field_2", label: "Fit & Style" },
      { id: "field_3", label: "Care Instructions" },
    ],
  },
  education: {
    id: "education",
    name: "Education",
    section_title: "Message Context",
    fields: [
      { id: "field_1", label: "Audience" },
      { id: "field_2", label: "Purpose" },
      { id: "field_3", label: "Tone" },
    ],
  },
  professional_services: {
    id: "professional_services",
    name: "Professional Services",
    section_title: "Service Details",
    fields: [
      { id: "field_1", label: "Target Audience" },
      { id: "field_2", label: "Key Outcomes" },
      { id: "field_3", label: "Approach" },
    ],
  },
  personal_care: {
    id: "personal_care",
    name: "Personal Care",
    section_title: "Product Details",
    fields: [
      { id: "field_1", label: "Key Ingredients" },
      { id: "field_2", label: "Skin/Hair Type" },
      { id: "field_3", label: "Benefits & Claims" },
    ],
  },
  jewelry: {
    id: "jewelry",
    name: "Jewelry & Fine Accessories",
    section_title: "Piece Specifications",
    fields: [
      { id: "field_1", label: "Materials & Gemstones" },
      { id: "field_2", label: "Craftsmanship & Design" },
      { id: "field_3", label: "Collection & Occasion" },
    ],
  },
  luxury_watches: {
    id: "luxury_watches",
    name: "Luxury Watches",
    section_title: "Timepiece Specifications",
    fields: [
      { id: "field_1", label: "Materials & Craftsmanship" },
      { id: "field_2", label: "Movement & Complications" },
      { id: "field_3", label: "Heritage & Collection" },
    ],
  },
  other: {
    id: "other",
    name: "Other",
    section_title: "Product Details",
    fields: [
      { id: "field_1", label: "Feature 1" },
      { id: "field_2", label: "Feature 2" },
      { id: "field_3", label: "Feature 3" },
    ],
  },
};

export function getIndustryTemplate(industryKey: string): IndustryTemplate {
  return INDUSTRY_TEMPLATES[industryKey] || INDUSTRY_TEMPLATES.other;
}

export function getIndustryOptions() {
  return Object.values(INDUSTRY_TEMPLATES).map(template => ({
    value: template.id,
    label: template.name,
  }));
}
