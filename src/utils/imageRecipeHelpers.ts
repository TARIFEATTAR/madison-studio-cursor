/**
 * Image Recipe Helper Utilities
 * Functions for managing image recipes, resolving image URLs, and category mapping
 */

import type { Prompt } from "@/pages/Templates";

export type ImageSource = 'generated' | 'uploaded';

export interface RecipeImageData {
  url: string | null;
  source: ImageSource | null;
  generatedImageId: string | null;
}

/**
 * Get the image URL for a recipe
 * Prioritizes generated image, falls back to uploaded image
 * Also checks additional_context.image_url as fallback for pre-migration data
 */
export function getRecipeImageUrl(
  prompt: Prompt,
  generatedImageUrl?: string | null
): string | null {
  // Priority 1: Generated image URL (if available)
  if (generatedImageUrl) {
    return generatedImageUrl;
  }

  // Priority 2: Direct image_url field (after migration)
  if ((prompt as any).image_url) {
    return (prompt as any).image_url;
  }

  // Priority 3: Fallback to additional_context.image_url (pre-migration data)
  const additionalContext = prompt.additional_context as any;
  if (additionalContext?.image_url) {
    return additionalContext.image_url;
  }

  return null;
}

/**
 * Get the image source for a recipe
 */
export function getRecipeImageSource(prompt: Prompt): ImageSource | null {
  return (prompt as any).image_source || null;
}

/**
 * Get category badge color based on image_type
 */
export function getCategoryBadgeColor(imageType?: string | null): string {
  const categoryColors: Record<string, string> = {
    'product_photography': 'bg-blue-500/20 text-blue-600 border-blue-500/30',
    'lifestyle': 'bg-green-500/20 text-green-600 border-green-500/30',
    'e-commerce': 'bg-purple-500/20 text-purple-600 border-purple-500/30',
    'social_media': 'bg-pink-500/20 text-pink-600 border-pink-500/30',
    'editorial': 'bg-orange-500/20 text-orange-600 border-orange-500/30',
    'creative': 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30',
  };

  return categoryColors[imageType || ''] || 'bg-muted/20 text-muted-foreground border-muted/30';
}

/**
 * Get category label from image_type
 */
export function getCategoryLabel(imageType?: string | null): string {
  const categoryLabels: Record<string, string> = {
    'product_photography': 'Product Photography',
    'lifestyle': 'Lifestyle',
    'e-commerce': 'E-commerce',
    'social_media': 'Social Media',
    'editorial': 'Editorial',
    'creative': 'Creative',
  };

  return categoryLabels[imageType || ''] || 'Uncategorized';
}

/**
 * Get category icon name from image_type
 */
export function getCategoryIcon(imageType?: string | null): string {
  const categoryIcons: Record<string, string> = {
    'product_photography': 'Camera',
    'lifestyle': 'Sun',
    'e-commerce': 'ShoppingCart',
    'social_media': 'Share2',
    'editorial': 'FileText',
    'creative': 'Lightbulb',
  };

  return categoryIcons[imageType || ''] || 'Image';
}

/**
 * Extract image type from prompt's additional_context
 */
export function getImageTypeFromPrompt(prompt: Prompt): string | null {
  const additionalContext = prompt.additional_context as any;
  return additionalContext?.image_type || null;
}

/**
 * Check if recipe has an image
 */
export function hasRecipeImage(prompt: Prompt, generatedImageUrl?: string | null): boolean {
  return !!getRecipeImageUrl(prompt, generatedImageUrl);
}

