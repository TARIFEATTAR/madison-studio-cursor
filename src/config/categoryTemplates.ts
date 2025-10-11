export interface ProductType {
  id: string;
  name: string;
  description: string;
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  product_types: ProductType[];
}

export const CATEGORY_TEMPLATES: Record<string, CategoryTemplate> = {
  personal_fragrance: {
    id: 'personal_fragrance',
    name: 'Personal Fragrance',
    description: 'Wearable fragrances including oils, sprays, and attars',
    product_types: [
      { id: 'oil', name: 'Perfume Oil', description: 'Concentrated oil-based fragrances' },
      { id: 'spray', name: 'Perfume Spray', description: 'Alcohol-based spray perfumes' },
      { id: 'attar', name: 'Attar', description: 'Traditional natural perfume oils' },
      { id: 'essential_oil', name: 'Essential Oil', description: 'Pure essential oil fragrances' },
      { id: 'solid_perfume', name: 'Solid Perfume', description: 'Wax-based portable fragrances' }
    ]
  },
  home_fragrance: {
    id: 'home_fragrance',
    name: 'Home Fragrance',
    description: 'Ambient scenting products for spaces',
    product_types: [
      { id: 'incense', name: 'Incense', description: 'Traditional incense sticks and cones' },
      { id: 'bakhoor', name: 'Bakhoor', description: 'Wood chips infused with fragrant oils' },
      { id: 'oud_wood_chips', name: 'Oud Wood Chips', description: 'Premium agarwood chips' },
      { id: 'candle', name: 'Scented Candle', description: 'Wax candles with fragrance' },
      { id: 'reed_diffuser', name: 'Reed Diffuser', description: 'Continuous ambient scenting' },
      { id: 'room_spray', name: 'Room Spray', description: 'Instant space fragrance' }
    ]
  },
  skincare: {
    id: 'skincare',
    name: 'Skincare',
    description: 'Luxury skincare and beauty products',
    product_types: [
      { id: 'serum', name: 'Serum', description: 'Concentrated treatment formulas' },
      { id: 'cream', name: 'Cream', description: 'Rich moisturizing creams' },
      { id: 'cleanser', name: 'Cleanser', description: 'Gentle facial cleansers' },
      { id: 'toner', name: 'Toner', description: 'Balancing and refreshing toners' },
      { id: 'mask', name: 'Face Mask', description: 'Treatment and ritual masks' }
    ]
  }
};

export function getCategoryTemplate(categoryId: string): CategoryTemplate | null {
  return CATEGORY_TEMPLATES[categoryId] || null;
}

export function getAllCategories(): CategoryTemplate[] {
  return Object.values(CATEGORY_TEMPLATES);
}

export function getProductTypesForCategory(categoryId: string): ProductType[] {
  return CATEGORY_TEMPLATES[categoryId]?.product_types || [];
}
