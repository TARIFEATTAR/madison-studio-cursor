import type { LucideIcon } from "lucide-react";
import {
  Package,
  Sparkles,
  ShoppingBag,
  Users,
  Camera,
  Palette,
  Grid3x3,
  Trees,
  Gem,
  Store,
  Newspaper,
  Image as ImageIcon,
  Smartphone,
  User,
  Box,
} from "lucide-react";

// ============================================================================
// USE CASES: Primary Selection (What the user is creating)
// ============================================================================
export type UseCaseKey = 
  | "product_shot"
  | "hero_image"
  | "mobile_hero"
  | "social_media"
  | "editorial"
  | "influencer";

export type UseCaseDefinition = {
  key: UseCaseKey;
  label: string;
  icon: LucideIcon;
  description: string;
  defaultAspectRatio: string;
  aspectRatioOptions: string[]; // Simplified options for this use case
  recommendedStyles: string[]; // Style keys that are recommended
};

export const USE_CASES: UseCaseDefinition[] = [
  {
    key: "product_shot",
    label: "Product Shot",
    icon: Package,
    description: "E-commerce product listings (Shopify, Etsy, Amazon)",
    defaultAspectRatio: "5:4",
    aspectRatioOptions: ["1:1", "4:3", "5:4", "4:5"],
    recommendedStyles: ["product_on_white", "reflective_surface"],
  },
  {
    key: "hero_image",
    label: "Hero Image",
    icon: ImageIcon,
    description: "Website homepage hero banners",
    defaultAspectRatio: "16:9",
    aspectRatioOptions: ["16:9", "21:9", "4:3"], // Simplified to 3 options
    recommendedStyles: ["editorial_luxury", "lifestyle_scene"],
  },
  {
    key: "mobile_hero",
    label: "Mobile Hero",
    icon: Smartphone,
    description: "Mobile app or mobile-first hero images",
    defaultAspectRatio: "9:16",
    aspectRatioOptions: ["9:16", "4:5", "1:1"],
    recommendedStyles: ["lifestyle_scene", "natural_setting"],
  },
  {
    key: "social_media",
    label: "Social Media",
    icon: Users,
    description: "Instagram, Facebook, TikTok posts",
    defaultAspectRatio: "1:1",
    aspectRatioOptions: ["1:1", "4:5", "9:16", "16:9"],
    recommendedStyles: ["lifestyle_scene", "natural_setting", "flat_lay", "product_on_white"],
  },
  {
    key: "editorial",
    label: "Editorial",
    icon: Newspaper,
    description: "Magazines, blogs, press releases",
    defaultAspectRatio: "4:3",
    aspectRatioOptions: ["4:3", "16:9", "3:2"],
    recommendedStyles: ["editorial_luxury", "lifestyle_scene"],
  },
  {
    key: "influencer",
    label: "Influencer/Person",
    icon: User,
    description: "Images featuring people, influencers, models",
    defaultAspectRatio: "4:5",
    aspectRatioOptions: ["4:5", "9:16", "1:1"],
    recommendedStyles: ["lifestyle_scene", "natural_setting"],
  },
];

export const DEFAULT_USE_CASE: UseCaseKey = "product_shot";

export const getUseCaseByKey = (key?: UseCaseKey) =>
  USE_CASES.find((uc) => uc.key === key) || USE_CASES[0];

// ============================================================================
// BROAD CATEGORIES: For Library Filtering
// ============================================================================
export const BROAD_IMAGE_CATEGORIES = [
  { 
    key: "ecommerce", 
    label: "E-commerce", 
    icon: ShoppingBag,
    description: "Shopify, Etsy, Amazon product listings"
  },
  { 
    key: "social", 
    label: "Social Media", 
    icon: Users,
    description: "Instagram, Facebook, TikTok posts"
  },
  { 
    key: "editorial", 
    label: "Editorial", 
    icon: Newspaper,
    description: "Magazines, blogs, press releases"
  },
  { 
    key: "lifestyle", 
    label: "Lifestyle", 
    icon: Sparkles,
    description: "Brand storytelling, people in scenes"
  },
  { 
    key: "flat_lay", 
    label: "Flat Lay", 
    icon: Grid3x3,
    description: "Overhead compositions for social & e-commerce"
  },
  { 
    key: "creative", 
    label: "Creative & Artistic", 
    icon: Palette,
    description: "Artistic, conceptual, experimental"
  },
] as const;

export type BroadCategoryKey = typeof BROAD_IMAGE_CATEGORIES[number]["key"];

// ============================================================================
// MAPPING: Use Case → Library Category
// ============================================================================
// This ensures images are categorized by USE CASE (what user selected) not style
export const mapUseCaseToLibraryCategory = (useCaseKey: UseCaseKey): BroadCategoryKey => {
  const mapping: Record<UseCaseKey, BroadCategoryKey> = {
    product_shot: "ecommerce",
    hero_image: "ecommerce", // Hero images are typically for e-commerce sites
    mobile_hero: "social", // Mobile heroes are often for social/apps
    social_media: "social",
    editorial: "editorial",
    influencer: "lifestyle",
  };
  return mapping[useCaseKey] || "ecommerce";
};

// ============================================================================
// SHOT TYPE PRESETS: Style-Based (How the image looks)
// ============================================================================
export type ImageCategoryDefinition = {
  key: string;
  label: string;
  prompt: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  broadCategory: BroadCategoryKey; // Maps to USE CASE for library filtering
  useCases?: UseCaseKey[]; // Which use cases this style works best for
};

export const imageCategories: ImageCategoryDefinition[] = [
  // PRODUCT SHOT STYLES
  {
    key: "product_on_white",
    label: "Product on White",
    prompt:
      "A clean studio product shot on a pure white background, soft shadow, high-resolution lighting.",
    description: "Classic e-commerce ready imagery with crisp lighting.",
    icon: Package,
    gradient: "from-slate-500 to-slate-700",
    broadCategory: "ecommerce",
    useCases: ["product_shot", "social_media"],
  },
  {
    key: "reflective_surface",
    label: "Reflective Surface",
    prompt:
      "A luxury product photo on a glossy marble or mirrored surface with balanced reflections.",
    description: "High-shine compositions with polished surfaces.",
    icon: Gem,
    gradient: "from-cyan-500 to-blue-600",
    broadCategory: "ecommerce",
    useCases: ["product_shot", "hero_image"],
  },
  {
    key: "prop_styled",
    label: "Prop Styled",
    prompt:
      "Product displayed on a styled pedestal or themed surface with carefully selected props that enhance the product's aesthetic.",
    description: "Themed compositions with props, pedestals, and styled surfaces.",
    icon: Box,
    gradient: "from-amber-500 to-orange-600",
    broadCategory: "ecommerce",
    useCases: ["product_shot", "lifestyle", "social_media"],
  },
  
  // LIFESTYLE & SOCIAL STYLES
  {
    key: "lifestyle_scene",
    label: "Lifestyle Scene",
    prompt:
      "A lifestyle product photo placed in a cozy real-world environment that matches the brand mood.",
    description: "Real-world scenes showing the product in use.",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-600",
    broadCategory: "social",
    useCases: ["social_media", "influencer", "hero_image", "product_shot"],
  },
  {
    key: "natural_setting",
    label: "Natural Setting",
    prompt:
      "Product displayed outdoors on natural surfaces like stone or wood with diffused daylight.",
    description: "Organic textures, daylight, and nature-inspired styling.",
    icon: Trees,
    gradient: "from-emerald-500 to-lime-600",
    broadCategory: "lifestyle",
    useCases: ["social_media", "influencer", "mobile_hero", "product_shot"],
  },
  
  // EDITORIAL STYLES
  {
    key: "editorial_luxury",
    label: "Editorial Luxury",
    prompt:
      "High-end editorial perfume shot, dramatic lighting, deep contrast, cinematic tone.",
    description: "Magazine-worthy styling with dramatic light.",
    icon: Camera,
    gradient: "from-purple-500 to-indigo-600",
    broadCategory: "editorial",
    useCases: ["editorial", "hero_image"],
  },
  
  // FLAT LAY
  {
    key: "flat_lay",
    label: "Flat Lay",
    prompt:
      "Flat lay arrangement shot from above, thoughtfully styled props, balanced composition, crisp diffused lighting.",
    description: "Overhead compositions with styled props.",
    icon: Grid3x3,
    gradient: "from-pink-500 to-rose-600",
    broadCategory: "flat_lay",
    useCases: ["social_media", "product_shot", "editorial"],
  },
];

export const DEFAULT_IMAGE_CATEGORY_KEY = imageCategories[0].key;

export const getImageCategoryByKey = (key?: string) =>
  imageCategories.find((category) => category.key === key);

export const getImageCategoryByLabel = (label?: string) =>
  imageCategories.find(
    (category) => category.label.toLowerCase() === (label || "").toLowerCase()
  );

// Helper to get recommended styles for a use case
export const getRecommendedStylesForUseCase = (useCaseKey: UseCaseKey) => {
  const useCase = getUseCaseByKey(useCaseKey);
  return imageCategories.filter((style) =>
    useCase.recommendedStyles.includes(style.key)
  );
};

// Helper to check if a style is recommended for a use case
export const isStyleRecommended = (styleKey: string, useCaseKey: UseCaseKey) => {
  const useCase = getUseCaseByKey(useCaseKey);
  return useCase.recommendedStyles.includes(styleKey);
};
