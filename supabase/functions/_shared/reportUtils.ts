/**
 * Report Utilities
 * 
 * Utility functions for domain normalization, color normalization,
 * and safe LLM calls that always return expected JSON structure.
 */

/**
 * Normalize domain to canonical form
 * Examples:
 * - "https://www.example.com/path" → "example.com"
 * - "www.example.com" → "example.com"
 * - "example.com" → "example.com"
 */
export function normalizeDomain(urlOrDomain: string): string {
  // Remove protocol
  let domain = urlOrDomain.replace(/^https?:\/\//i, '');
  // Remove www.
  domain = domain.replace(/^www\./i, '');
  // Remove trailing slash
  domain = domain.replace(/\/$/, '');
  // Remove path and query
  domain = domain.split('/')[0];
  // Remove port
  domain = domain.split(':')[0];
  // Remove fragment
  domain = domain.split('#')[0];
  // Trim and lowercase
  domain = domain.trim().toLowerCase();
  
  return domain;
}

/**
 * Normalize color to hex format
 * Handles: rgb(), rgba(), hsl(), named colors, hex with/without #
 */
export function normalizeColor(color: string): string | null {
  if (!color) return null;
  
  // Already hex format
  if (/^#?[0-9A-Fa-f]{6}$/.test(color)) {
    return color.startsWith('#') ? color.toUpperCase() : `#${color.toUpperCase()}`;
  }
  
  // RGB/RGBA format: rgb(255, 0, 0) or rgba(255, 0, 0, 0.5)
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase()}`;
  }
  
  // HSL format: hsl(0, 100%, 50%)
  const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseInt(hslMatch[2], 10) / 100;
    const l = parseInt(hslMatch[3], 10) / 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (h < 1/6) { r = c; g = x; }
    else if (h < 2/6) { r = x; g = c; }
    else if (h < 3/6) { g = c; b = x; }
    else if (h < 4/6) { g = x; b = c; }
    else if (h < 5/6) { r = x; b = c; }
    else { r = c; b = x; }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${[r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase()}`;
  }
  
  // Named colors (basic set)
  const namedColors: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'gray': '#808080',
    'grey': '#808080',
  };
  
  if (namedColors[color.toLowerCase()]) {
    return namedColors[color.toLowerCase()];
  }
  
  return null;
}

/**
 * Normalize and deduplicate color array
 * - Converts all colors to hex format
 * - Removes duplicates
 * - Orders by frequency (if provided) or alphabetically
 */
export function normalizeColorPalette(
  colors: string[],
  options?: {
    orderBy?: 'frequency' | 'alphabetical' | 'hue';
    frequencies?: Map<string, number>;
  }
): string[] {
  const normalized = colors
    .map(c => normalizeColor(c))
    .filter((c): c is string => c !== null);
  
  // Deduplicate
  const unique = Array.from(new Set(normalized));
  
  // Order
  if (options?.orderBy === 'frequency' && options.frequencies) {
    return unique.sort((a, b) => {
      const freqA = options.frequencies!.get(a) || 0;
      const freqB = options.frequencies!.get(b) || 0;
      return freqB - freqA;
    });
  }
  
  if (options?.orderBy === 'hue') {
    return unique.sort((a, b) => {
      const hueA = hexToHue(a);
      const hueB = hexToHue(b);
      return hueA - hueB;
    });
  }
  
  // Default: alphabetical
  return unique.sort();
}

/**
 * Convert hex to hue (0-360)
 */
function hexToHue(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  
  if (delta === 0) return 0;
  
  let hue = 0;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }
  
  hue *= 60;
  return hue < 0 ? hue + 360 : hue;
}

/**
 * Safe LLM call that always returns expected JSON structure
 * Wraps LLM calls with retry logic and fallback handling
 */
export async function safeLLMCall<T>(
  callFn: () => Promise<T>,
  fallback: T,
  options?: {
    maxRetries?: number;
    retryDelay?: number;
    validate?: (result: T) => boolean;
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3;
  const retryDelay = options?.retryDelay ?? 1000;
  const validate = options?.validate;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await callFn();
      
      // Validate result if validator provided
      if (validate && !validate(result)) {
        console.warn(`[safeLLMCall] Validation failed on attempt ${attempt + 1}`);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
        return fallback;
      }
      
      return result;
    } catch (error) {
      console.error(`[safeLLMCall] Attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        continue;
      }
      
      return fallback;
    }
  }
  
  return fallback;
}

/**
 * Parse JSON with fallback
 */
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch (error) {
    console.error('[safeJSONParse] Failed to parse JSON:', error);
    return fallback;
  }
}

/**
 * Clean LLM JSON response (remove markdown code blocks)
 */
export function cleanLLMJSONResponse(text: string): string {
  return text
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .replace(/^[\s\n]*/, '')
    .replace(/[\s\n]*$/, '')
    .trim();
}

/**
 * Validate BrandReport structure
 */
export function validateBrandReport(report: any): boolean {
  return (
    report &&
    typeof report === 'object' &&
    report.site &&
    typeof report.site.domain === 'string' &&
    typeof report.site.url === 'string' &&
    report.colors &&
    Array.isArray(report.colors.primary) &&
    Array.isArray(report.colors.secondary) &&
    Array.isArray(report.colors.neutrals) &&
    report.scanMeta &&
    typeof report.scanMeta.scannedAt === 'string' &&
    typeof report.scanMeta.sourceUrl === 'string'
  );
}

