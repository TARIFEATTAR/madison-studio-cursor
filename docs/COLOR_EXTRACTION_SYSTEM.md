# Color Extraction System

## Overview

The color extraction system uses a multi-strategy approach to reliably extract brand color palettes from websites. This replaces the previous AI-only approach with a more robust solution that combines API services, CSS parsing, and HTML analysis.

## Architecture

### Extraction Strategy (in order of priority)

1. **Brandfetch API** (Primary)
   - Comprehensive brand color data
   - Returns categorized colors (primary, secondary, neutrals, accents)
   - Requires `BRANDFETCH_API_KEY` environment variable
   - Confidence Score: 0.95

2. **Colorize.design API** (Alternative)
   - URL → palette extraction service
   - Fast and reliable for common brands
   - No API key required (may need adjustment based on actual API)
   - Confidence Score: 0.85

3. **CSS Parsing** (Fallback)
   - Extracts colors from CSS variables (`--primary`, `--accent`, etc.)
   - Analyzes frequent color usage in stylesheets
   - Categorizes colors by saturation/lightness (HSL)
   - Confidence Score: 0.7

4. **HTML Analysis** (Last Resort)
   - Parses inline styles for color values
   - Extracts colors from style attributes
   - Basic categorization
   - Confidence Score: 0.5

## Color Categorization

Colors are automatically categorized into:

- **Primary**: High saturation, medium lightness (most prominent brand colors)
- **Secondary**: Medium saturation (supporting colors)
- **Neutrals**: Low saturation or very light/dark (backgrounds, text)
- **Accent**: Special accent colors (CTAs, highlights)

### HSL-Based Categorization

The system uses HSL (Hue, Saturation, Lightness) to categorize colors:

- **Neutrals**: `saturation < 0.1` OR `lightness < 0.15` OR `lightness > 0.9`
- **Primary**: `saturation > 0.4` AND `0.3 < lightness < 0.8`
- **Secondary**: Medium saturation, other lightness values

## Setup

### Brandfetch API (Optional but Recommended)

1. Sign up at [Brandfetch](https://brandfetch.com)
2. Get your API key from the dashboard
3. Set environment variable in Supabase:
   ```bash
   supabase secrets set BRANDFETCH_API_KEY=your_api_key_here
   ```

**Note**: Brandfetch API is optional. The system will work without it, using CSS parsing and HTML analysis fallbacks.

### Colorize.design API

**Note**: This is a conceptual implementation. Adjust the API endpoint based on the actual Colorize.design API documentation.

## Usage

### In Supabase Functions

```typescript
import { extractColorPalette } from "../_shared/colorPaletteExtractor.ts";

const domain = "example.com";
const htmlContent = "<html>...</html>"; // Optional
const palette = await extractColorPalette(domain, htmlContent);

// palette.primary - Array of primary color hex codes
// palette.secondary - Array of secondary color hex codes
// palette.neutrals - Array of neutral color hex codes
// palette.accent - Array of accent color hex codes (optional)
// palette.confidenceScore - 0-1 confidence score
// palette.source - Which method succeeded
```

### Response Structure

```typescript
interface ColorPalette {
  primary: string[];      // 3-5 primary brand colors
  secondary: string[];   // 3-5 secondary/accent colors
  neutrals: string[];    // Background, text, neutral colors
  accent?: string[];     // Special accent colors (CTAs, highlights)
  confidenceScore: number; // 0-1
  source: 'brandfetch' | 'colorize' | 'css_parsing' | 'html_analysis' | 'none';
}
```

## Integration Points

### analyze-brand-dna Function

The `analyze-brand-dna` function automatically uses the new extraction system. Colors are merged with AI-generated colors (extracted colors take priority):

```json
{
  "primaryColor": "#EB008B",
  "colorPalette": [
    { "hex": "#EB008B", "name": "Hot Pink", "usage": "Primary brand color" },
    { "hex": "#FFF200", "name": "Neon Yellow", "usage": "Secondary/accent color" }
  ],
  "colorSource": "brandfetch",
  "colorConfidenceScore": 0.95
}
```

## Color Format Support

The system supports multiple color formats and normalizes them to hex:

- **Hex**: `#FF0000`, `#F00` (expanded to 6-digit)
- **RGB**: `rgb(255, 0, 0)`
- **RGBA**: `rgba(255, 0, 0, 0.5)`
- **Named Colors**: `white`, `black`, `red`, etc. (basic set)

## Benefits

1. **Higher Accuracy**: API services provide curated brand colors
2. **Better Coverage**: Multiple fallback strategies ensure colors are found
3. **Automatic Categorization**: Colors are automatically sorted into primary/secondary/neutral
4. **CSS Variable Support**: Extracts colors from modern CSS custom properties
5. **Confidence Scoring**: Helps UI decide how to display/trust color data

## Future Enhancements

### Screenshot-Based Color Clustering

For even more accurate extraction, a screenshot-based approach could be added:

1. Use headless browser (Playwright/Puppeteer) to render homepage
2. Take full-page screenshot and hero section screenshot
3. Run k-means clustering on pixels to extract dominant colors
4. Categorize by visual prominence

**Implementation Note**: This would require:
- Playwright or Puppeteer integration in Deno
- Image processing library for k-means clustering
- Additional processing time

### Vision Model Integration

Use AI vision models to:
- Identify color usage patterns from screenshots
- Extract brand-specific color relationships
- Understand color psychology and brand positioning

## Troubleshooting

### No Colors Found

If no colors are found:
1. Check that the domain is correct
2. Verify Brandfetch API key is set (if using Brandfetch)
3. Ensure HTML content is provided for CSS parsing
4. Check logs for which extraction methods were attempted

### Low Quality Colors

If colors are low quality:
1. Likely using HTML analysis (last resort)
2. Consider setting up Brandfetch API for better quality
3. Ensure website has CSS variables or inline styles

### Too Many Colors

The system limits colors to:
- Primary: 5 colors max
- Secondary: 5 colors max
- Neutrals: 5 colors max
- Accent: 3 colors max

Adjust these limits in `colorPaletteExtractor.ts` if needed.

## API Rate Limits

- **Brandfetch**: Check your plan limits
- **Colorize.design**: Check their documentation
- **CSS Parsing**: No limits (local processing)
- **HTML Analysis**: No limits (local processing)

