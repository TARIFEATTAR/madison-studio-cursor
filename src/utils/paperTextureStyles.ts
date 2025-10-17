/**
 * PAPER TEXTURE STYLES
 * Reusable paper texture utilities for MADISON components
 * Based on warm, editorial aesthetic throughout the application
 */

/**
 * getPaperTexture
 * Returns the appropriate CSS class string for paper texture variants
 * 
 * @param variant - The paper texture variant to apply
 * @returns CSS class string
 */
export const getPaperTexture = (variant: 'pageBackground' | 'cardPaper' | 'manuscriptPaper' | 'minimalTexture' | 'agedPaper' | 'darkPaper'): string => {
  const textures = {
    // Main page containers
    pageBackground: 'bg-[#F5F1E8]', // Vellum cream - warm page background
    
    // Content cards
    cardPaper: 'bg-[#FFFCF5]', // Parchment white - clean card surfaces
    
    // Editorial areas
    manuscriptPaper: 'bg-[#FAF8F3]', // Slightly warmer than card, editorial content
    
    // High-performance areas
    minimalTexture: 'bg-white', // Clean white for high-performance components
    
    // Archived content
    agedPaper: 'bg-[#F0EDE5]', // Slightly aged, darker cream
    
    // Dark backgrounds
    darkPaper: 'bg-[#1A1816] text-[#FFFCF5]', // Ink black with parchment text
  };

  return textures[variant];
};

/**
 * Predefined paper texture classes for direct use in components
 */
export const paperTextures = {
  pageBackground: 'bg-[#F5F1E8]',
  cardPaper: 'bg-[#FFFCF5]',
  manuscriptPaper: 'bg-[#FAF8F3]',
  minimalTexture: 'bg-white',
  agedPaper: 'bg-[#F0EDE5]',
  darkPaper: 'bg-[#1A1816] text-[#FFFCF5]',
} as const;

/**
 * Usage Example:
 * 
 * import { getPaperTexture } from '@/utils/paperTextureStyles';
 * 
 * // In your component
 * <div className={`${getPaperTexture('pageBackground')} p-8`}>
 *   Your content here
 * </div>
 */
