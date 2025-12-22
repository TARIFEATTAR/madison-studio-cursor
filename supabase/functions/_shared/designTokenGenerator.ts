/**
 * DESIGN TOKEN GENERATOR
 * 
 * Generates Tailwind-compatible design tokens from Brand DNA.
 * Creates semantic color system, typography scale, and spacing.
 * 
 * Cost: $0.00 (pure computation)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DesignTokens {
  colors: {
    background: string;
    foreground: string;
    card: string;
    'card-foreground': string;
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    accent: string;
    'accent-foreground': string;
    muted: string;
    'muted-foreground': string;
    border: string;
    destructive: string;
    'destructive-foreground': string;
  };
  typography: {
    fontFamily: {
      serif: string;
      sans: string;
      mono: string;
    };
    fontSize: Record<string, [string, { lineHeight: string }]>;
    fontWeight: Record<string, number>;
  };
  spacing: Record<string, string>;
  borderRadius: {
    lg: string;
    md: string;
    sm: string;
  };
  shadows: {
    'level-1': string;
    'level-2': string;
    'level-3': string;
    'level-4': string;
    'brass-glow': string;
  };
}

interface BrandColors {
  primary?: string;
  secondary?: string;
  accent?: string;
  palette?: string[];
}

interface BrandTypography {
  headline?: { family?: string };
  body?: { family?: string };
  accent?: { family?: string };
}

interface BrandVisual {
  colors?: BrandColors;
  typography?: BrandTypography;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN TOKEN GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generates design tokens from brand visual identity
 */
export function generateDesignTokens(visual: BrandVisual): DesignTokens {
  const colors = visual.colors || {};
  const typography = visual.typography || {};

  // Extract primary color for derivations
  const primaryHex = colors.primary || '#B8956A';
  const secondaryHex = colors.secondary || '#1A1816';
  const accentHex = colors.accent || '#D4AF37';

  // Generate derived colors
  const derivedColors = deriveColorPalette(primaryHex, secondaryHex, accentHex);

  return {
    colors: {
      // Backgrounds
      background: derivedColors.background,
      foreground: derivedColors.foreground,
      card: derivedColors.card,
      'card-foreground': derivedColors.foreground,
      
      // Brand colors
      primary: primaryHex,
      'primary-foreground': getContrastColor(primaryHex),
      secondary: secondaryHex,
      'secondary-foreground': getContrastColor(secondaryHex),
      accent: accentHex,
      'accent-foreground': getContrastColor(accentHex),
      
      // Utility colors
      muted: derivedColors.muted,
      'muted-foreground': derivedColors.mutedForeground,
      border: derivedColors.border,
      destructive: '#DC2626',
      'destructive-foreground': '#FFFFFF',
    },
    typography: {
      fontFamily: {
        serif: typography.headline?.family || 'Cormorant Garamond',
        sans: typography.body?.family || 'Lato',
        mono: 'JetBrains Mono',
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
    },
    spacing: {
      '0': '0px',
      '1': '0.25rem',
      '2': '0.5rem',
      '3': '0.75rem',
      '4': '1rem',
      '5': '1.25rem',
      '6': '1.5rem',
      '8': '2rem',
      '10': '2.5rem',
      '12': '3rem',
      '16': '4rem',
      '20': '5rem',
      '24': '6rem',
    },
    borderRadius: {
      lg: '0.5rem',
      md: '0.375rem',
      sm: '0.25rem',
    },
    shadows: {
      'level-1': `0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)`,
      'level-2': `0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)`,
      'level-3': `0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)`,
      'level-4': `0 20px 25px rgba(0, 0, 0, 0.15), 0 10px 10px rgba(0, 0, 0, 0.04)`,
      'brass-glow': `0 0 0 3px ${hexToRgba(primaryHex, 0.3)}`,
    },
  };
}

/**
 * Generates CSS variables string from tokens
 */
export function generateCSSVariables(tokens: DesignTokens): string {
  const lines: string[] = [':root {'];
  
  // Colors
  Object.entries(tokens.colors).forEach(([key, value]) => {
    lines.push(`  --${key}: ${value};`);
  });
  
  // Typography
  lines.push(`  --font-serif: "${tokens.typography.fontFamily.serif}", Georgia, serif;`);
  lines.push(`  --font-sans: "${tokens.typography.fontFamily.sans}", -apple-system, sans-serif;`);
  lines.push(`  --font-mono: "${tokens.typography.fontFamily.mono}", monospace;`);
  
  // Border radius
  lines.push(`  --radius-lg: ${tokens.borderRadius.lg};`);
  lines.push(`  --radius-md: ${tokens.borderRadius.md};`);
  lines.push(`  --radius-sm: ${tokens.borderRadius.sm};`);
  
  lines.push('}');
  
  return lines.join('\n');
}

/**
 * Generates Tailwind config extend object from tokens
 */
export function generateTailwindConfig(tokens: DesignTokens): Record<string, unknown> {
  return {
    colors: Object.entries(tokens.colors).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>),
    fontFamily: {
      serif: [tokens.typography.fontFamily.serif, 'Georgia', 'serif'],
      sans: [tokens.typography.fontFamily.sans, '-apple-system', 'sans-serif'],
      mono: [tokens.typography.fontFamily.mono, 'monospace'],
    },
    borderRadius: tokens.borderRadius,
    boxShadow: tokens.shadows,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATABASE STORAGE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Stores design tokens in database
 */
export async function storeDesignTokens(
  orgId: string,
  visual: BrandVisual
): Promise<void> {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const tokens = generateDesignTokens(visual);
  const cssVariables = generateCSSVariables(tokens);
  const tailwindConfig = generateTailwindConfig(tokens);

  const { error } = await supabase
    .from('design_systems')
    .upsert({
      org_id: orgId,
      tokens,
      css_variables: cssVariables,
      tailwind_config: tailwindConfig,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'org_id' });

  if (error) {
    console.error('[Design Tokens] Failed to store tokens:', error);
    throw error;
  }

  console.log('[Design Tokens] Tokens stored successfully for org:', orgId);
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Derives a full color palette from brand colors
 */
function deriveColorPalette(
  primary: string,
  secondary: string,
  accent: string
): {
  background: string;
  foreground: string;
  card: string;
  muted: string;
  mutedForeground: string;
  border: string;
} {
  // Determine if brand is light or dark based on primary
  const primaryLuminance = getLuminance(primary);
  const isLightBrand = primaryLuminance > 0.5;

  if (isLightBrand) {
    // Light brand - dark backgrounds for contrast
    return {
      background: '#1A1816', // Dark background
      foreground: '#FFFCF5', // Light text
      card: '#2F2A26', // Slightly lighter dark
      muted: '#3D3935',
      mutedForeground: '#A8A29E',
      border: '#4A453F',
    };
  } else {
    // Dark/Rich brand - light backgrounds (Madison default)
    return {
      background: '#F5F1E8', // Vellum cream
      foreground: '#1A1816', // Ink black
      card: '#FFFCF5', // Parchment white
      muted: '#E5DFD1', // Stone
      mutedForeground: '#6B6560', // Charcoal
      border: '#D1C7B5', // Warm gray
    };
  }
}

/**
 * Gets contrasting text color for a background
 */
function getContrastColor(hex: string): string {
  const luminance = getLuminance(hex);
  return luminance > 0.5 ? '#1A1816' : '#FFFCF5';
}

/**
 * Calculates relative luminance of a color
 */
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0.5;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Converts hex to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converts hex to RGBA string
 */
function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/**
 * Lightens a color by a percentage
 */
export function lightenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = percent / 100;
  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Darkens a color by a percentage
 */
export function darkenColor(hex: string, percent: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;

  const factor = 1 - percent / 100;
  const r = Math.round(rgb.r * factor);
  const g = Math.round(rgb.g * factor);
  const b = Math.round(rgb.b * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}





















