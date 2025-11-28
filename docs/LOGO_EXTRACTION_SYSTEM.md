# Logo Extraction System

## Overview

The logo extraction system uses a multi-tier fallback strategy to reliably extract brand logos and assets from domains. This replaces the previous Clearbit-only approach with a more robust solution.

## Architecture

### Extraction Strategy (in order of priority)

1. **Brandfetch API** (Primary)
   - Most comprehensive brand data
   - Returns primary logos, alternative logos, favicons, and more
   - Requires `BRANDFETCH_API_KEY` environment variable
   - Confidence Score: 0.95 (if primary logo found), 0.7 (if other assets found)

2. **Logo.dev API** (Alternative)
   - Simple, Clearbit-style replacement
   - Fast and reliable for common brands
   - No API key required
   - Confidence Score: 0.85

3. **HTML Scraping** (Fallback)
   - Extracts logos from website HTML
   - Looks for:
     - `<img>` tags with logo-related classes/IDs
     - `<link rel="icon">` tags
     - `<meta property="og:image">` tags
   - Confidence Score: 0.5-0.7 (depending on what's found)

4. **Google Favicon** (Last Resort)
   - Universal coverage via Google's favicon service
   - Lower quality but always available
   - Confidence Score: 0.4

## Setup

### Brandfetch API (Optional but Recommended)

1. Sign up at [Brandfetch](https://brandfetch.com)
2. Get your API key from the dashboard
3. Set environment variable in Supabase:
   ```bash
   supabase secrets set BRANDFETCH_API_KEY=your_api_key_here
   ```

**Note**: Brandfetch API is optional. The system will work without it, but will skip to Logo.dev and fallbacks.

### Logo.dev

No setup required - works out of the box.

## Usage

### In Supabase Functions

```typescript
import { extractBrandAssets } from "../_shared/brandAssetsExtractor.ts";

const domain = "example.com";
const assets = await extractBrandAssets(domain);

// assets.primaryLogoUrl - Best logo found
// assets.alternativeLogos - Array of alternative logo URLs
// assets.faviconUrl - Favicon URL
// assets.ogImageUrl - Open Graph image URL
// assets.confidenceScore - 0-1 confidence score
// assets.source - Which method succeeded
```

### Response Structure

```typescript
interface BrandAssets {
  primaryLogoUrl?: string;
  alternativeLogos?: string[];
  faviconUrl?: string;
  ogImageUrl?: string;
  confidenceScore: number; // 0-1
  source: 'brandfetch' | 'logo.dev' | 'html_scraping' | 'favicon' | 'none';
}
```

## Integration Points

### analyze-brand-dna Function

The `analyze-brand-dna` function automatically uses the new extraction system. Logo data is included in the brand DNA response:

```json
{
  "logo": {
    "detected": true,
    "url": "https://...",
    "source": "brandfetch",
    "confidenceScore": 0.95,
    "alternatives": ["https://...", "https://..."]
  }
}
```

## Benefits

1. **Higher Success Rate**: Multiple fallback strategies ensure logos are found more often
2. **Better Quality**: Brandfetch provides high-resolution logos and multiple variants
3. **More Data**: Returns alternative logos, favicons, and OG images
4. **Confidence Scoring**: Helps UI decide how to display/trust logo data
5. **Resilient**: Works even if one service is down

## Future Enhancements

Potential improvements:
- Screenshot + AI crop for logo extraction (when HTML scraping finds images but can't identify logo)
- Vision model integration to identify logo candidates from screenshots
- MCP tool wrapper for external use
- Caching layer to reduce API calls

## Troubleshooting

### No Logo Found

If no logo is found:
1. Check that the domain is correct (no protocol, no www)
2. Verify Brandfetch API key is set (if using Brandfetch)
3. Check logs for which extraction methods were attempted
4. The system will gracefully fall back to manual upload

### Low Quality Logos

If logos are low quality:
1. Likely using Google Favicon (last resort)
2. Consider setting up Brandfetch API for better quality
3. Check if Logo.dev has better coverage for your domain

### API Rate Limits

- Brandfetch: Check your plan limits
- Logo.dev: Free tier available, check their docs
- HTML Scraping: No limits, but be respectful of target sites
- Google Favicon: No known limits

