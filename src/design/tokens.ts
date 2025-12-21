/**
 * MADISON STUDIO - DESIGN TOKENS
 * Single source of truth for all design decisions
 * 
 * Philosophy: "Black Books & Cream Paper" - museum-quality luxury
 * 
 * This file defines the canonical values. Tailwind config references these.
 * When making design changes, update THIS file first.
 */

export const DesignTokens = {

  // ============================================
  // COLORS - "Black Books & Cream Paper"
  // ============================================

  colors: {
    // Core Neutrals (Foundation - 4 colors)
    neutral: {
      ink: '#1A1816',           // Darkest - primary text, headers
      charcoal: '#2F2A26',      // Dark - secondary text, muted content
      vellum: '#F5F1E8',        // Cream - primary backgrounds
      parchment: '#FFFCF5',     // Lightest - cards, elevated surfaces
    },

    // Support Colors
    support: {
      stone: '#E5DFD1',         // Default input borders, subtle dividers
      'stone-dark': '#C4B5A0',  // Tertiary elements, borders
    },

    // Brand Accent (Brass Family)
    brand: {
      brass: '#B8956A',         // Primary brand color - interactive elements
      'brass-light': '#C4B5A0', // Subtle backgrounds, tertiary
      'brass-gradient': 'linear-gradient(135deg, #B8956A 0%, #C4B5A0 100%)',
    },

    // Semantic/Functional Colors (Muted, sophisticated)
    semantic: {
      success: '#8B9474',       // Muted Sage - approval, positive
      warning: '#C4975C',       // Aged Amber - attention, caution
      error: '#A85C5C',         // Faded Rust - error, deletion
    },

    // Platform Badge Colors (Small indicators ONLY)
    platform: {
      email: '#4A90E2',         // Muted blue
      instagram: '#8B5CF6',     // Muted purple
      twitter: '#38BDF8',       // Sky blue
      linkedin: '#0A66C2',      // LinkedIn blue
      product: '#F97316',       // Muted orange
      sms: '#10B981',           // Muted green
      blog: '#6366F1',          // Indigo
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================

  typography: {
    // Font Families
    fonts: {
      serif: '"Cormorant Garamond", Georgia, serif',       // Headlines, luxury
      sans: '"Lato", -apple-system, system-ui, sans-serif', // Body, UI
      accent: '"Crimson Text", Georgia, serif',            // Italics, quotes
    },

    // Font Sizes (Modular Scale)
    sizes: {
      xxs: '0.625rem',   // 10px - tiny labels
      xs: '0.75rem',     // 12px - captions, labels
      sm: '0.875rem',    // 14px - secondary text
      base: '1rem',      // 16px - body text (default)
      lg: '1.125rem',    // 18px - emphasized body
      xl: '1.25rem',     // 20px - section headers
      '2xl': '1.5rem',   // 24px - card titles
      '3xl': '2rem',     // 32px - page headers
      '4xl': '2.5rem',   // 40px - hero headlines
      '5xl': '3rem',     // 48px - display
    },

    // Font Weights
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    // Line Heights
    leading: {
      tight: '1.2',    // Headlines
      snug: '1.4',     // Subheadings
      normal: '1.6',   // Body text
      relaxed: '1.8',  // Long-form content
    },
  },

  // ============================================
  // SPACING (4px base unit)
  // ============================================

  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
  },

  // ============================================
  // BORDERS & CORNERS
  // ============================================

  borders: {
    width: {
      none: '0',
      thin: '1px',
      medium: '2px',
    },

    radius: {
      none: '0',
      sm: '0.125rem',  // 2px - subtle
      md: '0.25rem',   // 4px - default (--radius)
      lg: '0.5rem',    // 8px - cards
      xl: '1rem',      // 16px - special
      full: '9999px',  // Pills, avatars
    },
  },

  // ============================================
  // SHADOWS (Sophisticated elevation system)
  // ============================================

  shadows: {
    // Level 1: Resting cards
    'level-1': `
      0 1px 3px rgba(26, 24, 22, 0.08),
      0 1px 2px rgba(26, 24, 22, 0.06),
      0 0 0 1px rgba(184, 149, 106, 0.03)
    `,

    // Level 2: Hover state
    'level-2': `
      0 3px 8px rgba(26, 24, 22, 0.12),
      0 1px 3px rgba(184, 149, 106, 0.08)
    `,

    // Level 3: Modals, dropdowns
    'level-3': `
      0 8px 24px rgba(26, 24, 22, 0.15),
      0 2px 6px rgba(184, 149, 106, 0.12)
    `,

    // Level 4: Maximum elevation
    'level-4': `
      0 16px 48px rgba(26, 24, 22, 0.20),
      0 4px 12px rgba(184, 149, 106, 0.15)
    `,

    // Brass glow: Focus/active states
    'brass-glow': `
      0 0 0 3px rgba(184, 149, 106, 0.15),
      0 4px 16px rgba(184, 149, 106, 0.25)
    `,
  },

  // ============================================
  // ANIMATIONS & TRANSITIONS
  // ============================================

  animations: {
    duration: {
      instant: '100ms',
      fast: '150ms',
      normal: '300ms',
      slow: '400ms',
      slower: '500ms',
    },

    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // ============================================
  // Z-INDEX LAYERS
  // ============================================

  zIndex: {
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    modalBackdrop: '1100',
    modal: '1101',
    popover: '1200',
    tooltip: '1300',
  },

} as const;

// Type exports for type-safe access
export type DesignTokens = typeof DesignTokens;
export type ColorTokens = typeof DesignTokens.colors;
export type TypographyTokens = typeof DesignTokens.typography;
export type SpacingTokens = typeof DesignTokens.spacing;
