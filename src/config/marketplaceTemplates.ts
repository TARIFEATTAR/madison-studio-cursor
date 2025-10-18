import { Tag, ShoppingCart, Package } from "lucide-react";

export interface PlatformField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'tags';
  maxLength?: number;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helpText?: string;
}

export interface MarketplacePlatform {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
  fields: PlatformField[];
  validation: {
    titleMaxLength: number;
    descriptionMaxLength: number;
    tagsMax: number;
  };
  exportFormats: string[];
  aiPromptTemplate: string;
  categories: Array<{ value: string; label: string }>;
}

export const MARKETPLACE_PLATFORMS: Record<string, MarketplacePlatform> = {
  etsy: {
    id: 'etsy',
    name: 'Etsy',
    icon: Tag,
    color: 'orange-500',
    description: 'Handmade & vintage marketplace - Artisan storytelling',
    fields: [
      {
        id: 'title',
        label: 'Listing Title',
        type: 'text',
        maxLength: 140,
        required: true,
        placeholder: 'e.g., Noir de Nuit – Luxury Artisan Perfume...',
        helpText: 'Max 140 characters. Include primary keywords for search.'
      },
      {
        id: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        helpText: 'Choose the most relevant Etsy category'
      },
      {
        id: 'price',
        label: 'Price (USD)',
        type: 'number',
        required: true,
        placeholder: '0.00'
      },
      {
        id: 'quantity',
        label: 'Quantity',
        type: 'number',
        required: true,
        placeholder: '1'
      },
      {
        id: 'description',
        label: 'Product Description',
        type: 'textarea',
        maxLength: 5000,
        required: true,
        placeholder: 'Describe your product in detail...',
        helpText: 'Tell the story behind your product. Max 5000 characters.'
      },
      {
        id: 'tags',
        label: 'Tags',
        type: 'tags',
        maxLength: 13,
        required: true,
        helpText: 'Max 13 tags. Use long-tail keywords (e.g., "luxury perfume oil", "artisan fragrance").'
      }
    ],
    validation: {
      titleMaxLength: 140,
      descriptionMaxLength: 5000,
      tagsMax: 13
    },
    exportFormats: ['csv', 'json'],
    aiPromptTemplate: `Create an Etsy listing that captures the artisan, handmade quality with:
- Story-driven, emotional language
- Emphasis on craft, uniqueness, and artistry
- SEO-optimized tags using long-tail keywords
- Personal connection and authenticity
- Sensory, evocative descriptions`,
    categories: [
      { value: 'bath_beauty', label: 'Bath & Beauty' },
      { value: 'home_fragrance', label: 'Home Fragrance' },
      { value: 'perfume', label: 'Perfume & Cologne' },
      { value: 'candles', label: 'Candles' },
      { value: 'home_living', label: 'Home & Living' },
      { value: 'jewelry', label: 'Jewelry' },
      { value: 'accessories', label: 'Accessories' }
    ]
  },

  tiktok_shop: {
    id: 'tiktok_shop',
    name: 'TikTok Shop',
    icon: ShoppingCart,
    color: 'pink-500',
    description: 'Social commerce for Gen Z - Viral-worthy products',
    fields: [
      {
        id: 'title',
        label: 'Product Name',
        type: 'text',
        maxLength: 255,
        required: true,
        placeholder: 'e.g., ✨ Luxury Perfume That Goes VIRAL 🔥',
        helpText: 'Max 255 characters. Emojis encouraged!'
      },
      {
        id: 'category',
        label: 'Category',
        type: 'select',
        required: true,
        helpText: 'Choose TikTok Shop category'
      },
      {
        id: 'price',
        label: 'Price (USD)',
        type: 'number',
        required: true,
        placeholder: '0.00'
      },
      {
        id: 'description',
        label: 'Description',
        type: 'textarea',
        maxLength: 3000,
        required: true,
        placeholder: 'Tell them why they NEED this...',
        helpText: 'Use Gen Z language, emojis, and FOMO-driven copy. Max 3000 characters.'
      },
      {
        id: 'selling_points',
        label: 'Key Selling Points',
        type: 'tags',
        maxLength: 5,
        helpText: 'Up to 5 bullet points (e.g., "Trending", "Viral Worthy", "Limited Drop")'
      }
    ],
    validation: {
      titleMaxLength: 255,
      descriptionMaxLength: 3000,
      tagsMax: 10
    },
    exportFormats: ['csv', 'json'],
    aiPromptTemplate: `Create a TikTok Shop listing with viral appeal:
- Snappy, Gen Z slang and emojis
- FOMO-driven language ("limited", "trending", "going viral")
- Short, punchy sentences
- Call-outs to trends and viral moments
- Social proof language`,
    categories: [
      { value: 'beauty', label: 'Beauty & Personal Care' },
      { value: 'home', label: 'Home & Garden' },
      { value: 'fashion', label: 'Fashion' },
      { value: 'lifestyle', label: 'Lifestyle' },
      { value: 'wellness', label: 'Wellness' }
    ]
  }
};

export function getPlatform(platformId: string): MarketplacePlatform | null {
  return MARKETPLACE_PLATFORMS[platformId] || null;
}

export function getAllPlatforms(): MarketplacePlatform[] {
  return Object.values(MARKETPLACE_PLATFORMS);
}
