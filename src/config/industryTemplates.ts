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
// Updated for new 4-category system
export const ECOMMERCE_INDUSTRIES = [
  // New industry IDs
  'fragrance-beauty',
  'luxury-goods',
  // Legacy IDs for backwards compatibility
  'skincare',
  'perfume',
  'home_fragrance',
  'fashion',
  'jewelry',
  'cosmetics'
];

export const isEcommerceIndustry = (industryId: string | undefined): boolean => {
  if (!industryId) return false;
  // Hospitality/Real Estate and Expert Brands are NOT e-commerce
  if (industryId === 'hospitality-realestate' || industryId === 'expert-brands') {
    return false;
  }
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
  // New 4-category system - imports from industries.ts
  return [
    { value: 'fragrance-beauty', label: 'Fragrance & Beauty' },
    { value: 'luxury-goods', label: 'Luxury Goods & Craft' },
    { value: 'hospitality-realestate', label: 'Hospitality & Real Estate' },
    { value: 'expert-brands', label: 'Expert Brands' }
  ];
}

// Legacy mapping for backwards compatibility
export function migrateLegacyIndustry(oldValue: string): string {
  const mapping: Record<string, string> = {
    'skincare': 'fragrance-beauty',
    'perfume': 'fragrance-beauty',
    'home_fragrance': 'fragrance-beauty',
    'fashion': 'luxury-goods',
    'jewelry': 'luxury-goods',
    'cosmetics': 'fragrance-beauty',
    'consulting': 'expert-brands',
    'saas': 'expert-brands',
    'real_estate': 'hospitality-realestate',
    'other': 'fragrance-beauty',
  };
  return mapping[oldValue] || oldValue;
}
