export interface IndustryTemplate {
  id: string;
  name: string;
  section_title: string;
  fields: Array<{
    id: string;
    label: string;
  }>;
}

// E-commerce industries that have access to Marketplace features
export const ECOMMERCE_INDUSTRIES = [
  'skincare',
  'perfume',
  'home_fragrance',
  'fashion',
  'jewelry',
  'cosmetics'
];

export const isEcommerceIndustry = (industryId: string | undefined): boolean => {
  if (!industryId) return false;
  return ECOMMERCE_INDUSTRIES.includes(industryId);
};

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

export function getAllIndustryOptions() {
  return [
    { value: 'skincare', label: 'Skin Care', isEcommerce: true },
    { value: 'perfume', label: 'Perfumery', isEcommerce: true },
    { value: 'home_fragrance', label: 'Home Fragrance', isEcommerce: true },
    { value: 'fashion', label: 'Fashion & Apparel', isEcommerce: true },
    { value: 'jewelry', label: 'Jewelry & Accessories', isEcommerce: true },
    { value: 'cosmetics', label: 'Cosmetics & Makeup', isEcommerce: true },
    { value: 'consulting', label: 'Consulting', isEcommerce: false },
    { value: 'saas', label: 'Software/SaaS', isEcommerce: false },
    { value: 'real_estate', label: 'Real Estate', isEcommerce: false },
    { value: 'other', label: 'Other', isEcommerce: false }
  ];
}

export function getIndustryOptions() {
  return [
    { value: 'skincare', label: 'Skin Care' },
    { value: 'perfume', label: 'Perfumery' },
    { value: 'home_fragrance', label: 'Home Fragrance' },
    { value: 'other', label: 'Other' }
  ];
}
