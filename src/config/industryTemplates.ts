export interface IndustryTemplate {
  id: string;
  name: string;
  section_title: string;
  fields: Array<{
    id: string;
    label: string;
  }>;
}

// Legacy industry templates - DEPRECATED
// Use src/config/categoryTemplates.ts instead for the new 3-category system
export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  luxury_beauty: {
    id: "luxury_beauty",
    name: "Luxury Beauty",
    section_title: "Product Details",
    fields: [
      { id: "category", label: "Category" },
      { id: "product_type", label: "Product Type" },
      { id: "key_details", label: "Key Details" },
    ],
  },
};

export function getIndustryTemplate(industryKey: string): IndustryTemplate {
  return INDUSTRY_TEMPLATES.luxury_beauty;
}

export function getIndustryOptions() {
  return [{ value: 'luxury_beauty', label: 'Home Fragrance' }];
}
