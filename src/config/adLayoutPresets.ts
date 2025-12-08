/**
 * Ad Layout Presets - Madison Studio
 * 
 * Professional ad overlay layouts for Facebook, Instagram, and social ads.
 * Inspired by Google Pomelli's smart layout engine.
 */

export interface AdLayoutPreset {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // CSS gradient or simple visual representation
  
  // Layout configuration
  layout: {
    textPosition: 'top' | 'center' | 'bottom' | 'left' | 'right';
    textAlign: 'left' | 'center' | 'right';
    hasColorBlock: boolean;
    colorBlockPosition?: 'top' | 'bottom' | 'left' | 'right' | 'full' | 'badge';
    colorBlockSize?: number; // percentage of image
    hasCTA: boolean;
    ctaPosition?: 'inline' | 'bottom' | 'right';
  };
  
  // Default styles
  defaultStyles: {
    colorBlockColor: string;
    colorBlockOpacity: number;
    textColor: string;
    ctaBackgroundColor: string;
    ctaTextColor: string;
    fontFamily: 'cormorant' | 'playfair' | 'montserrat' | 'oswald' | 'lato';
  };
}

export const AD_LAYOUT_PRESETS: AdLayoutPreset[] = [
  {
    id: 'hero-banner',
    name: 'Hero Banner',
    description: 'Bold headline at top with color block, perfect for announcements',
    thumbnail: 'linear-gradient(to bottom, #1A1816 35%, transparent 35%)',
    layout: {
      textPosition: 'top',
      textAlign: 'center',
      hasColorBlock: true,
      colorBlockPosition: 'top',
      colorBlockSize: 35,
      hasCTA: true,
      ctaPosition: 'bottom',
    },
    defaultStyles: {
      colorBlockColor: '#1A1816',
      colorBlockOpacity: 0.9,
      textColor: '#FFFFFF',
      ctaBackgroundColor: '#B8956A',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'cormorant',
    },
  },
  {
    id: 'cta-bottom',
    name: 'CTA Bottom Bar',
    description: 'Image focus with text and CTA bar at bottom',
    thumbnail: 'linear-gradient(to bottom, transparent 70%, #B8956A 70%)',
    layout: {
      textPosition: 'bottom',
      textAlign: 'left',
      hasColorBlock: true,
      colorBlockPosition: 'bottom',
      colorBlockSize: 30,
      hasCTA: true,
      ctaPosition: 'right',
    },
    defaultStyles: {
      colorBlockColor: '#B8956A',
      colorBlockOpacity: 0.95,
      textColor: '#FFFFFF',
      ctaBackgroundColor: '#1A1816',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'montserrat',
    },
  },
  {
    id: 'minimal-badge',
    name: 'Minimal Badge',
    description: 'Small, elegant text badge - subtle and classy',
    thumbnail: 'radial-gradient(ellipse at bottom right, #1A1816 20%, transparent 20%)',
    layout: {
      textPosition: 'bottom',
      textAlign: 'right',
      hasColorBlock: true,
      colorBlockPosition: 'badge',
      colorBlockSize: 15,
      hasCTA: false,
    },
    defaultStyles: {
      colorBlockColor: '#1A1816',
      colorBlockOpacity: 0.85,
      textColor: '#FFFFFF',
      ctaBackgroundColor: '#B8956A',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'lato',
    },
  },
  {
    id: 'split-left',
    name: 'Split Left',
    description: 'Left color block with text, image on right',
    thumbnail: 'linear-gradient(to right, #1A1816 40%, transparent 40%)',
    layout: {
      textPosition: 'left',
      textAlign: 'left',
      hasColorBlock: true,
      colorBlockPosition: 'left',
      colorBlockSize: 40,
      hasCTA: true,
      ctaPosition: 'inline',
    },
    defaultStyles: {
      colorBlockColor: '#1A1816',
      colorBlockOpacity: 0.95,
      textColor: '#FFFFFF',
      ctaBackgroundColor: '#B8956A',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'playfair',
    },
  },
  {
    id: 'full-overlay',
    name: 'Full Overlay',
    description: 'Semi-transparent overlay across entire image',
    thumbnail: 'linear-gradient(rgba(26,24,22,0.6), rgba(26,24,22,0.6))',
    layout: {
      textPosition: 'center',
      textAlign: 'center',
      hasColorBlock: true,
      colorBlockPosition: 'full',
      colorBlockSize: 100,
      hasCTA: true,
      ctaPosition: 'bottom',
    },
    defaultStyles: {
      colorBlockColor: '#1A1816',
      colorBlockOpacity: 0.5,
      textColor: '#FFFFFF',
      ctaBackgroundColor: '#B8956A',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'cormorant',
    },
  },
  {
    id: 'gradient-bottom',
    name: 'Gradient Bottom',
    description: 'Smooth gradient fade for text at bottom',
    thumbnail: 'linear-gradient(to bottom, transparent 40%, #1A1816 100%)',
    layout: {
      textPosition: 'bottom',
      textAlign: 'center',
      hasColorBlock: true,
      colorBlockPosition: 'bottom',
      colorBlockSize: 50,
      hasCTA: true,
      ctaPosition: 'inline',
    },
    defaultStyles: {
      colorBlockColor: '#1A1816',
      colorBlockOpacity: 0.85,
      textColor: '#FFFFFF',
      ctaBackgroundColor: '#B8956A',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'montserrat',
    },
  },
  {
    id: 'top-strip',
    name: 'Top Strip',
    description: 'Slim banner strip at top - great for sales',
    thumbnail: 'linear-gradient(to bottom, #B8956A 15%, transparent 15%)',
    layout: {
      textPosition: 'top',
      textAlign: 'center',
      hasColorBlock: true,
      colorBlockPosition: 'top',
      colorBlockSize: 15,
      hasCTA: false,
    },
    defaultStyles: {
      colorBlockColor: '#B8956A',
      colorBlockOpacity: 1,
      textColor: '#FFFFFF',
      ctaBackgroundColor: '#1A1816',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'oswald',
    },
  },
  {
    id: 'corner-badge',
    name: 'Corner Badge',
    description: 'Diagonal corner badge for promotions',
    thumbnail: 'linear-gradient(135deg, #B8956A 25%, transparent 25%)',
    layout: {
      textPosition: 'top',
      textAlign: 'left',
      hasColorBlock: true,
      colorBlockPosition: 'badge',
      colorBlockSize: 20,
      hasCTA: false,
    },
    defaultStyles: {
      colorBlockColor: '#B8956A',
      colorBlockOpacity: 1,
      textColor: '#FFFFFF',
      ctaBackgroundColor: '#1A1816',
      ctaTextColor: '#FFFFFF',
      fontFamily: 'oswald',
    },
  },
];

// Font options for the ad overlay
export const AD_FONT_OPTIONS = [
  { value: 'cormorant', label: 'Cormorant', style: "'Cormorant Garamond', serif", category: 'elegant' },
  { value: 'playfair', label: 'Playfair', style: "'Playfair Display', serif", category: 'elegant' },
  { value: 'montserrat', label: 'Montserrat', style: "'Montserrat', sans-serif", category: 'modern' },
  { value: 'oswald', label: 'Oswald', style: "'Oswald', sans-serif", category: 'bold' },
  { value: 'lato', label: 'Lato', style: "'Lato', sans-serif", category: 'clean' },
];

// Color presets for quick selection
export const AD_COLOR_PRESETS = [
  { name: 'Ink Black', value: '#1A1816' },
  { name: 'Charcoal', value: '#2F2A26' },
  { name: 'Aged Brass', value: '#B8956A' },
  { name: 'Cream', value: '#F5F1E8' },
  { name: 'Pure White', value: '#FFFFFF' },
  { name: 'Deep Navy', value: '#1a2744' },
  { name: 'Forest', value: '#2d4a3e' },
  { name: 'Burgundy', value: '#722f37' },
];

export function getPresetById(id: string): AdLayoutPreset | undefined {
  return AD_LAYOUT_PRESETS.find(preset => preset.id === id);
}
