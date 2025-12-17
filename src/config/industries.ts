/**
 * MADISON STUDIO - INDUSTRY CONFIGURATION
 * Single source of truth for all industry-specific content
 * 
 * When adding a new industry:
 * 1. Add the config block here
 * 2. Everything else (selectors, defaults, placeholders) updates automatically
 */

import { Sparkles, Gem, Building2, UserCircle } from "lucide-react";

export type IndustryId = 
  | "fragrance-beauty" 
  | "luxury-goods" 
  | "hospitality-realestate" 
  | "expert-brands";

export interface SubIndustry {
  id: string;
  name: string;
}

export interface IndustryDefaults {
  personalityTraits: string[];
  tones: string[];
  wordsWeLove: string[];
  wordsWeAvoid: string[];
}

export interface IndustryPlaceholders {
  brandEssence: string;
  customerAvatar: string;
  customerDescription: string;
  exampleCopy: string;
}

export interface IndustryContentTypes {
  name: string;
  description: string;
}

export interface IndustryConfig {
  id: IndustryId;
  name: string;
  shortName: string;
  description: string;
  icon: typeof Sparkles;
  subIndustries: SubIndustry[];
  defaults: IndustryDefaults;
  placeholders: IndustryPlaceholders;
  contentTypes: IndustryContentTypes[];
}

export const INDUSTRIES: Record<IndustryId, IndustryConfig> = {
  "fragrance-beauty": {
    id: "fragrance-beauty",
    name: "Fragrance & Beauty",
    shortName: "Fragrance",
    description: "Perfumery, skin care, home fragrance, and personal care brands",
    icon: Sparkles,
    subIndustries: [
      { id: "perfumery", name: "Perfumery" },
      { id: "home-fragrance", name: "Home Fragrance" },
      { id: "skin-care", name: "Skin Care" },
      { id: "hair-care", name: "Hair Care" },
      { id: "essential-oils", name: "Essential Oils & Attär" },
      { id: "wellness", name: "Wellness & Aromatherapy" },
      { id: "cosmetics", name: "Cosmetics & Makeup" },
    ],
    defaults: {
      personalityTraits: ["Sensorial", "Artisanal", "Refined", "Luxurious", "Warm"],
      tones: ["Evocative", "Intimate", "Poetic", "Warm", "Confident"],
      wordsWeLove: ["essence", "notes", "ritual", "crafted", "artisan", "bespoke", "curated", "indulgent"],
      wordsWeAvoid: ["cheap", "synthetic", "generic", "mass-produced", "discount", "basic"],
    },
    placeholders: {
      brandEssence: "e.g., Artisanal Sophistication",
      customerAvatar: "e.g., Sarah, 35-45",
      customerDescription: "Values quality ingredients, appreciates self-care rituals, seeks authentic sensory experiences over mass-market products",
      exampleCopy: "Discover the essence of Mediterranean craftsmanship, where ancient botanicals meet modern artistry...",
    },
    contentTypes: [
      { name: "Product Launch", description: "Introduce new fragrances or products" },
      { name: "Ingredient Story", description: "Deep dive into hero ingredients" },
      { name: "Ritual Guide", description: "How-to content for self-care routines" },
      { name: "Brand Story", description: "Origin, heritage, and mission" },
      { name: "Seasonal Collection", description: "Limited editions and seasonal offerings" },
      { name: "Gift Guide", description: "Curated recommendations for gifting" },
    ],
  },

  "luxury-goods": {
    id: "luxury-goods",
    name: "Luxury Goods & Craft",
    shortName: "Luxury Goods",
    description: "Leather goods, watches, jewelry, and artisan craftsmanship",
    icon: Gem,
    subIndustries: [
      { id: "leather-goods", name: "Leather Goods & Accessories" },
      { id: "watches", name: "Watches & Timepieces" },
      { id: "jewelry", name: "Fine Jewelry" },
      { id: "fashion", name: "Fashion & Apparel" },
      { id: "artisan", name: "Artisan & Handcrafted Goods" },
      { id: "lifestyle", name: "Lifestyle & Home Objects" },
    ],
    defaults: {
      personalityTraits: ["Heritage", "Meticulous", "Timeless", "Sophisticated", "Exclusive"],
      tones: ["Confident", "Refined", "Authoritative", "Understated", "Expert"],
      wordsWeLove: ["craftsmanship", "heritage", "bespoke", "atelier", "provenance", "patina", "heirloom", "master"],
      wordsWeAvoid: ["cheap", "trendy", "fast", "knockoff", "replica", "budget", "mass-market"],
    },
    placeholders: {
      brandEssence: "e.g., Timeless Craftsmanship",
      customerAvatar: "e.g., James, 40-55",
      customerDescription: "Appreciates quality over quantity, values provenance and story behind objects, seeks pieces that appreciate with age",
      exampleCopy: "Each piece begins with a single sheet of full-grain leather, hand-selected from our partner tannery in Tuscany...",
    },
    contentTypes: [
      { name: "Product Story", description: "The making of a signature piece" },
      { name: "Craftsman Profile", description: "Behind the scenes with artisans" },
      { name: "Heritage Narrative", description: "Brand history and legacy" },
      { name: "Material Guide", description: "Deep dive into materials and sourcing" },
      { name: "Collection Launch", description: "New collection announcements" },
      { name: "Care Guide", description: "How to maintain and care for products" },
    ],
  },

  "hospitality-realestate": {
    id: "hospitality-realestate",
    name: "Hospitality & Real Estate",
    shortName: "Hospitality",
    description: "Boutique hotels, luxury real estate, and premium experiences",
    icon: Building2,
    subIndustries: [
      { id: "boutique-hotels", name: "Boutique Hotels & Resorts" },
      { id: "luxury-realestate", name: "Luxury Real Estate" },
      { id: "vacation-rentals", name: "Vacation Rentals & Villas" },
      { id: "restaurants", name: "Fine Dining & Restaurants" },
      { id: "spas", name: "Spas & Wellness Retreats" },
      { id: "private-clubs", name: "Private Clubs & Membership" },
    ],
    defaults: {
      personalityTraits: ["Welcoming", "Sophisticated", "Curated", "Memorable", "Exclusive"],
      tones: ["Inviting", "Evocative", "Warm", "Aspirational", "Descriptive"],
      wordsWeLove: ["retreat", "sanctuary", "bespoke", "curated", "experience", "destination", "haven", "residence"],
      wordsWeAvoid: ["cheap", "basic", "standard", "generic", "typical", "ordinary", "budget"],
    },
    placeholders: {
      brandEssence: "e.g., Curated Escapes",
      customerAvatar: "e.g., The Discerning Traveler, 35-60",
      customerDescription: "Seeks unique experiences over tourist traps, values privacy and personalized service, willing to pay premium for authenticity",
      exampleCopy: "Perched above the Mediterranean, where ancient olive groves meet the azure sea, your private sanctuary awaits...",
    },
    contentTypes: [
      { name: "Property Description", description: "Listing copy that evokes experience" },
      { name: "Destination Story", description: "The location and its unique character" },
      { name: "Experience Guide", description: "What guests can expect" },
      { name: "Seasonal Feature", description: "Time-specific offerings and events" },
      { name: "Amenity Spotlight", description: "Highlight specific features" },
      { name: "Local Guide", description: "Curated recommendations for the area" },
    ],
  },

  "expert-brands": {
    id: "expert-brands",
    name: "Expert Brands",
    shortName: "Expert",
    description: "Coaches, consultants, advisors, and thought leaders",
    icon: UserCircle,
    subIndustries: [
      { id: "executive-coach", name: "Executive & Leadership Coaching" },
      { id: "business-consultant", name: "Business Consulting" },
      { id: "creative-agency", name: "Creative & Brand Agencies" },
      { id: "financial-advisor", name: "Financial Advisory" },
      { id: "wellness-coach", name: "Wellness & Life Coaching" },
      { id: "thought-leader", name: "Thought Leaders & Authors" },
    ],
    defaults: {
      personalityTraits: ["Authoritative", "Insightful", "Approachable", "Transformative", "Trusted"],
      tones: ["Confident", "Expert", "Conversational", "Inspiring", "Direct"],
      wordsWeLove: ["transform", "insight", "strategy", "growth", "clarity", "expertise", "results", "partnership"],
      wordsWeAvoid: ["guru", "hack", "secret", "guaranteed", "easy", "quick fix", "hustle", "grind"],
    },
    placeholders: {
      brandEssence: "e.g., Transformative Clarity",
      customerAvatar: "e.g., The Ambitious Leader, 35-50",
      customerDescription: "Successful but seeking next level, values expertise and proven track record, invests in themselves and their growth",
      exampleCopy: "After 20 years guiding Fortune 500 executives through pivotal transitions, I've learned that clarity precedes breakthrough...",
    },
    contentTypes: [
      { name: "Thought Leadership", description: "Point of view articles and insights" },
      { name: "Case Study", description: "Client transformation stories" },
      { name: "LinkedIn Post", description: "Professional social content" },
      { name: "Newsletter", description: "Regular audience communication" },
      { name: "Service Description", description: "What you offer and how you work" },
      { name: "About / Bio", description: "Personal brand story and credentials" },
    ],
  },
};

// Helper functions

export function getIndustryById(id: string): IndustryConfig | undefined {
  return INDUSTRIES[id as IndustryId];
}

export function getIndustryList(): IndustryConfig[] {
  return Object.values(INDUSTRIES);
}

export function getSubIndustriesForIndustry(industryId: string): SubIndustry[] {
  const industry = getIndustryById(industryId);
  return industry?.subIndustries || [];
}

export function getIndustryDefaults(industryId: string): IndustryDefaults | undefined {
  const industry = getIndustryById(industryId);
  return industry?.defaults;
}

export function getIndustryPlaceholders(industryId: string): IndustryPlaceholders | undefined {
  const industry = getIndustryById(industryId);
  return industry?.placeholders;
}

// Legacy mapping - maps old industry values to new ones
export const LEGACY_INDUSTRY_MAP: Record<string, IndustryId> = {
  "Skin Care": "fragrance-beauty",
  "Perfumery": "fragrance-beauty",
  "Home Fragrance": "fragrance-beauty",
  "Wellness": "fragrance-beauty",
  "Fashion": "luxury-goods",
  "Consulting": "expert-brands",
  "Agency": "expert-brands",
  "Marketing": "expert-brands",
  "Other": "expert-brands", // Default fallback - most generic category
};

export function migrateIndustry(oldIndustry: string): IndustryId {
  // Default to expert-brands (most generic) instead of fragrance-beauty
  return LEGACY_INDUSTRY_MAP[oldIndustry] || "expert-brands";
}
