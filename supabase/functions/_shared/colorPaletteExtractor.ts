/**
 * Color Palette Extractor
 * 
 * Extracts color palettes from websites using multiple strategies:
 * 1. Brandfetch API (primary) - comprehensive brand colors
 * 2. Colorize.design API (alternative) - URL → palette extraction
 * 3. CSS parsing (fallback) - extract from CSS variables and frequent colors
 * 4. HTML analysis (last resort) - parse inline styles and computed colors
 */

export interface ColorPalette {
  primary: string[];      // 3-5 primary brand colors
  secondary: string[];     // 3-5 secondary/accent colors
  neutrals: string[];     // Background, text, neutral colors
  accent?: string[];      // Special accent colors (CTAs, highlights)
  confidenceScore: number; // 0-1, where 1 is highest confidence
  source: 'brandfetch' | 'colorize' | 'css_parsing' | 'html_analysis' | 'none';
}

/**
 * Extract color palette from a domain/URL
 * @param domain - Domain name (e.g., "example.com")
 * @param htmlContent - Optional HTML content for CSS parsing
 * @returns ColorPalette object with organized colors
 */
export async function extractColorPalette(
  domain: string,
  htmlContent?: string
): Promise<ColorPalette> {
  const normalizedDomain = normalizeDomain(domain);
  
  console.log(`[colorPalette] Extracting colors for domain: ${normalizedDomain}`);

  // Strategy 1: Try Brandfetch API (most comprehensive)
  try {
    const brandfetchPalette = await tryBrandfetchColors(normalizedDomain);
    if (brandfetchPalette.primary.length > 0) {
      console.log(`[colorPalette] ✅ Found colors via Brandfetch`);
      return brandfetchPalette;
    }
  } catch (error) {
    console.log(`[colorPalette] Brandfetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Strategy 2: Try Colorize.design API
  try {
    const colorizePalette = await tryColorizeDesign(normalizedDomain);
    if (colorizePalette.primary.length > 0) {
      console.log(`[colorPalette] ✅ Found colors via Colorize`);
      return colorizePalette;
    }
  } catch (error) {
    console.log(`[colorPalette] Colorize failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Strategy 3: Parse CSS (if HTML content provided)
  if (htmlContent) {
    try {
      const cssPalette = await tryCssParsing(htmlContent);
      if (cssPalette.primary.length > 0 || cssPalette.neutrals.length > 0) {
        console.log(`[colorPalette] ✅ Found colors via CSS parsing`);
        return cssPalette;
      }
    } catch (error) {
      console.log(`[colorPalette] CSS parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Strategy 4: HTML analysis (last resort)
  if (htmlContent) {
    try {
      const htmlPalette = await tryHtmlAnalysis(htmlContent);
      if (htmlPalette.primary.length > 0 || htmlPalette.neutrals.length > 0) {
        console.log(`[colorPalette] ✅ Found colors via HTML analysis`);
        return htmlPalette;
      }
    } catch (error) {
      console.log(`[colorPalette] HTML analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // No colors found
  console.log(`[colorPalette] ❌ No colors found for ${normalizedDomain}`);
  return {
    primary: [],
    secondary: [],
    neutrals: [],
    confidenceScore: 0,
    source: 'none',
  };
}

/**
 * Normalize domain name
 */
function normalizeDomain(domain: string): string {
  domain = domain.replace(/^https?:\/\//, '');
  domain = domain.replace(/^www\./, '');
  domain = domain.replace(/\/$/, '');
  domain = domain.split('/')[0];
  domain = domain.split(':')[0];
  return domain.toLowerCase().trim();
}

/**
 * Try Brandfetch API for colors
 */
async function tryBrandfetchColors(domain: string): Promise<ColorPalette> {
  const apiKey = Deno.env.get('BRANDFETCH_API_KEY');
  if (!apiKey) {
    throw new Error('BRANDFETCH_API_KEY not configured');
  }

  try {
    const response = await fetch(`https://api.brandfetch.io/v2/brands/${domain}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Brandfetch API returned ${response.status}`);
    }

    const data = await response.json();
    
    const palette: ColorPalette = {
      primary: [],
      secondary: [],
      neutrals: [],
      confidenceScore: 0.95,
      source: 'brandfetch',
    };

    // Brandfetch returns colors in various formats
    if (data.colors && Array.isArray(data.colors)) {
      for (const color of data.colors) {
        const hex = normalizeColor(color.hex || color.value || color);
        if (!hex) continue;

        // Categorize colors based on Brandfetch's type or infer from usage
        if (color.type === 'primary' || color.usage === 'primary') {
          palette.primary.push(hex);
        } else if (color.type === 'secondary' || color.usage === 'secondary') {
          palette.secondary.push(hex);
        } else if (color.type === 'neutral' || color.usage === 'neutral' || color.usage === 'background') {
          palette.neutrals.push(hex);
        } else if (color.type === 'accent' || color.usage === 'accent') {
          if (!palette.accent) palette.accent = [];
          palette.accent.push(hex);
        } else {
          // Default: add to primary if we don't have many, otherwise secondary
          if (palette.primary.length < 3) {
            palette.primary.push(hex);
          } else {
            palette.secondary.push(hex);
          }
        }
      }
    }

    // Limit to reasonable counts
    palette.primary = palette.primary.slice(0, 5);
    palette.secondary = palette.secondary.slice(0, 5);
    palette.neutrals = palette.neutrals.slice(0, 5);
    if (palette.accent) palette.accent = palette.accent.slice(0, 3);

    return palette;
  } catch (error) {
    throw new Error(`Brandfetch API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Try Colorize.design API
 * Note: This is a conceptual implementation - adjust API endpoint as needed
 */
async function tryColorizeDesign(domain: string): Promise<ColorPalette> {
  try {
    // Colorize.design API endpoint (adjust if different)
    const url = `https://api.colorize.design/v1/palette?url=https://${domain}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MadisonBot/1.0)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Colorize API returned ${response.status}`);
    }

    const data = await response.json();
    
    const palette: ColorPalette = {
      primary: [],
      secondary: [],
      neutrals: [],
      confidenceScore: 0.85,
      source: 'colorize',
    };

    // Parse Colorize response format (adjust based on actual API response)
    if (data.colors && Array.isArray(data.colors)) {
      data.colors.forEach((color: any, index: number) => {
        const hex = normalizeColor(color.hex || color.value || color);
        if (!hex) return;

        // First 3-5 colors are usually primary
        if (index < 3) {
          palette.primary.push(hex);
        } else if (index < 6) {
          palette.secondary.push(hex);
        } else {
          palette.neutrals.push(hex);
        }
      });
    }

    return palette;
  } catch (error) {
    // Colorize API might not exist or have different endpoint
    // This is expected - just throw to continue to next strategy
    throw new Error(`Colorize API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse CSS for color variables and frequent colors
 */
async function tryCssParsing(htmlContent: string): Promise<ColorPalette> {
  const palette: ColorPalette = {
    primary: [],
    secondary: [],
    neutrals: [],
    confidenceScore: 0.7,
    source: 'css_parsing',
  };

  // Extract CSS variables
  const cssVarPattern = /--(?:primary|accent|brand|color)[\w-]*:\s*([^;]+);/gi;
  const cssVars: string[] = [];
  let match;
  
  while ((match = cssVarPattern.exec(htmlContent)) !== null) {
    const colorValue = match[1].trim();
    const hex = normalizeColor(colorValue);
    if (hex) cssVars.push(hex);
  }

  // Extract all CSS color values (hex, rgb, rgba)
  const colorPatterns = [
    /#[0-9a-fA-F]{3,6}\b/g,                    // Hex colors
    /rgb\([^)]+\)/g,                           // RGB colors
    /rgba\([^)]+\)/g,                          // RGBA colors
  ];

  const colorCounts = new Map<string, number>();
  
  for (const pattern of colorPatterns) {
    let colorMatch;
    while ((colorMatch = pattern.exec(htmlContent)) !== null) {
      const color = normalizeColor(colorMatch[0]);
      if (color && !isCommonColor(color)) {
        colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
      }
    }
  }

  // Sort by frequency and categorize
  const sortedColors = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color)
    .slice(0, 15); // Top 15 colors

  // Categorize colors
  for (const color of sortedColors) {
    const hsl = hexToHsl(color);
    
    // Neutrals: low saturation or very light/dark
    if (hsl.s < 0.1 || hsl.l < 0.15 || hsl.l > 0.9) {
      if (palette.neutrals.length < 5) {
        palette.neutrals.push(color);
      }
    }
    // Primary: high saturation, medium-lightness (most prominent)
    else if (hsl.s > 0.4 && hsl.l > 0.3 && hsl.l < 0.8) {
      if (palette.primary.length < 5) {
        palette.primary.push(color);
      }
    }
    // Secondary: medium saturation
    else if (palette.secondary.length < 5) {
      palette.secondary.push(color);
    }
  }

  // Add CSS variables to primary if we found them
  if (cssVars.length > 0) {
    palette.primary = [...cssVars, ...palette.primary].slice(0, 5);
  }

  return palette;
}

/**
 * Analyze HTML for inline styles and color usage
 */
async function tryHtmlAnalysis(htmlContent: string): Promise<ColorPalette> {
  const palette: ColorPalette = {
    primary: [],
    secondary: [],
    neutrals: [],
    confidenceScore: 0.5,
    source: 'html_analysis',
  };

  // Extract inline style colors
  const stylePattern = /style=["']([^"']+)["']/gi;
  const colorPattern = /(?:color|background|border-color|fill|stroke):\s*([^;]+)/gi;
  
  const colors = new Set<string>();
  
  let styleMatch;
  while ((styleMatch = stylePattern.exec(htmlContent)) !== null) {
    const styles = styleMatch[1];
    let colorMatch;
    while ((colorMatch = colorPattern.exec(styles)) !== null) {
      const hex = normalizeColor(colorMatch[1].trim());
      if (hex && !isCommonColor(hex)) {
        colors.add(hex);
      }
    }
  }

  // Categorize found colors
  const colorArray = Array.from(colors).slice(0, 10);
  for (const color of colorArray) {
    const hsl = hexToHsl(color);
    
    if (hsl.s < 0.1 || hsl.l < 0.15 || hsl.l > 0.9) {
      if (palette.neutrals.length < 5) {
        palette.neutrals.push(color);
      }
    } else if (hsl.s > 0.4 && palette.primary.length < 5) {
      palette.primary.push(color);
    } else if (palette.secondary.length < 5) {
      palette.secondary.push(color);
    }
  }

  return palette;
}

/**
 * Normalize color to hex format
 */
function normalizeColor(color: string): string | null {
  if (!color) return null;
  
  color = color.trim().toLowerCase();
  
  // Already hex
  if (/^#[0-9a-f]{3,6}$/.test(color)) {
    // Expand 3-digit hex to 6-digit
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    return color;
  }
  
  // RGB/RGBA
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]);
    const g = parseInt(rgbMatch[2]);
    const b = parseInt(rgbMatch[3]);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // Named colors (basic set)
  const namedColors: Record<string, string> = {
    'white': '#ffffff',
    'black': '#000000',
    'red': '#ff0000',
    'green': '#008000',
    'blue': '#0000ff',
    'yellow': '#ffff00',
    'orange': '#ffa500',
    'purple': '#800080',
    'pink': '#ffc0cb',
    'gray': '#808080',
    'grey': '#808080',
  };
  
  if (namedColors[color]) {
    return namedColors[color];
  }
  
  return null;
}

/**
 * Check if color is too common (white, black, transparent, etc.)
 */
function isCommonColor(hex: string): boolean {
  const common = [
    '#ffffff', '#fff', '#000000', '#000',
    '#transparent', 'transparent',
    '#f5f5f5', '#e5e5e5', '#cccccc',
  ];
  return common.includes(hex.toLowerCase());
}

/**
 * Convert hex to HSL for categorization
 */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  return { h, s, l };
}

