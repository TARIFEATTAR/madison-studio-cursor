import { Package, Sparkles, ShoppingBag, Users, Camera, Palette, Grid3x3 } from "lucide-react";

// Broad Categories (The "Parent" Types)
export const BROAD_IMAGE_CATEGORIES = [
  { key: "product", label: "Product Photography", icon: Package },
  { key: "lifestyle", label: "Lifestyle", icon: Sparkles },
  { key: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { key: "social", label: "Social Media", icon: Users },
  { key: "editorial", label: "Editorial", icon: Camera },
  { key: "creative", label: "Creative & Artistic", icon: Palette },
  { key: "flat_lay", label: "Flat Lay", icon: Grid3x3 },
] as const;

export type BroadCategoryKey = typeof BROAD_IMAGE_CATEGORIES[number]["key"];

import type { LucideIcon } from "lucide-react";
import {
  Trees,
  Gem,
} from "lucide-react";

export type ImageCategoryDefinition = {
  key: string;
  label: string;
  prompt: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  broadCategory: BroadCategoryKey; // Link to the broad category
};

// Specific Shot Presets (Mapped to Broad Categories)
export const imageCategories: ImageCategoryDefinition[] = [
  {
    key: "product_on_white",
    label: "Product on White",
    prompt:
      "A clean studio product shot on a pure white background, soft shadow, high-resolution lighting.",
    description: "Classic e-commerce ready imagery with crisp lighting.",
    icon: Package,
    gradient: "from-slate-500 to-slate-700",
    broadCategory: "product"
  },
  {
    key: "lifestyle_scene",
    label: "Lifestyle Scene",
    prompt:
      "A lifestyle product photo placed in a cozy real-world environment that matches the brand mood.",
    description: "Real-world scenes showing the product in use.",
    icon: Sparkles,
    gradient: "from-amber-500 to-orange-600",
    broadCategory: "lifestyle"
  },
  {
    key: "natural_setting",
    label: "Natural Setting",
    prompt:
      "Product displayed outdoors on natural surfaces like stone or wood with diffused daylight.",
    description: "Organic textures, daylight, and nature-inspired styling.",
    icon: Trees,
    gradient: "from-emerald-500 to-lime-600",
    broadCategory: "lifestyle"
  },
  {
    key: "reflective_surface",
    label: "Reflective Surface",
    prompt:
      "A luxury product photo on a glossy marble or mirrored surface with balanced reflections.",
    description: "High-shine compositions with polished surfaces.",
    icon: Gem,
    gradient: "from-cyan-500 to-blue-600",
    broadCategory: "creative"
  },
  {
    key: "editorial_luxury",
    label: "Editorial Luxury",
    prompt:
      "High-end editorial perfume shot, dramatic lighting, deep contrast, cinematic tone.",
    description: "Magazine-worthy styling with dramatic light.",
    icon: Camera,
    gradient: "from-purple-500 to-indigo-600",
    broadCategory: "editorial"
  },
  {
    key: "flat_lay",
    label: "Flat Lay",
    prompt:
      "Flat lay arrangement shot from above, thoughtfully styled props, balanced composition, crisp diffused lighting.",
    description: "Overhead compositions with styled props.",
    icon: Grid3x3,
    gradient: "from-pink-500 to-rose-600",
    broadCategory: "flat_lay"
  },
];

export const DEFAULT_IMAGE_CATEGORY_KEY = imageCategories[0].key;

export const getImageCategoryByKey = (key?: string) =>
  imageCategories.find((category) => category.key === key);

export const getImageCategoryByLabel = (label?: string) =>
  imageCategories.find(
    (category) => category.label.toLowerCase() === (label || "").toLowerCase()
  );
