# Phase 2: Website Scanning and Brand Extraction - Complete

## Overview

Phase 2 implements the `/api/scan` endpoint (Supabase Edge Function) that orchestrates the complete website scanning and brand extraction process.

## Implementation

### Scan Endpoint: `scan-website/index.ts`

**Route**: Supabase Edge Function (callable via `supabase.functions.invoke('scan-website')`)

**Request Body**:
```typescript
{
  url: string;              // Website URL to scan
  organizationId: string;   // Organization ID
  forceRescan?: boolean;    // Force new scan even if recent one exists
}
```

**Response**:
```typescript
{
  scan: Scan;              // Scan record with full data
  report: BrandReport;      // Complete brand report
  cached: boolean;         // Whether this was a cached result
}
```

### Process Flow

1. **Input Validation**
   - Validates `url` and `organizationId` are provided
   - Returns 400 error if missing

2. **URL Normalization**
   - Normalizes URL to canonical domain (e.g., `https://www.acme.com/` → `acme.com`)
   - Ensures protocol is present

3. **Domain Record Management**
   - Checks for existing Domain record
   - Creates new Domain record if doesn't exist
   - Updates domain metadata (firstScannedAt, scanCount)

4. **Cache Check** (if not forceRescan)
   - Checks for recent scan (< 24 hours old)
   - Returns cached result if found
   - Skips to new scan if forceRescan=true or no recent scan

5. **Create Scan Record**
   - Creates scan record with `status: 'processing'`
   - Tracks scan start time

6. **Parallel Extraction** (2.3)
   - **Brand Assets**: Uses `extractBrandAssets()` (Brandfetch → Logo.dev → HTML scraping → Favicon)
   - **Site Copy**: Uses `fetchSiteCopy()` (homepage, About page, product page)
   - **Colors**: Uses `extractColorPalette()` with HTML content (Brandfetch → Colorize → CSS parsing → HTML analysis)

7. **Brand Profile Inference** (2.4)
   - Uses `inferBrandProfile()` with extracted site copy
   - LLM analyzes content to extract:
     - Brand name, tagline, positioning
     - Primary audience segments
     - Tone/voice traits
     - Visual keywords
     - Brand archetype
     - Mission, values, essence

8. **Assemble BrandReport** (2.5)
   - Combines all extracted data into BrandReport structure
   - Includes:
     - Site info (domain, URLs, logos)
     - Brand profile (from LLM inference)
     - Colors (from extraction)
     - Scan metadata (timestamps, extraction methods)

9. **Save Scan Record**
   - Updates scan record with:
     - `scan_data`: Full BrandReport JSONB
     - `status`: 'completed'
     - `metadata`: Duration, extraction methods, raw tool results
   - Updates domain metadata (lastScannedAt, scanCount)

10. **Return Results**
    - Returns scan record and BrandReport
    - Includes `cached: false` flag

### Supporting Functions

#### `siteCopyExtractor.ts`

Extracts visible text content from website pages:

- **`fetchSiteCopy(url)`**: Main extraction function
- Fetches homepage, About page, and product/service page
- Extracts visible text, headings, meta descriptions
- Returns combined text for LLM analysis
- Includes raw HTML for CSS parsing

**Features**:
- Removes scripts, styles, nav, footer
- Focuses on main content areas
- Limits text length for LLM processing (15,000 chars)
- Handles relative URL resolution

#### `brandProfileInference.ts`

Uses LLM to infer brand profile from site copy:

- **`inferBrandProfile(input)`**: Main inference function
- Takes SiteCopy and domain/URL
- Uses Gemini AI with structured prompt
- Returns BrandProfile matching BrandReport structure
- Validates and normalizes output

**LLM Prompt Strategy**:
- Structured JSON output requirement
- Clear field definitions
- Guidelines for extraction vs inference
- Temperature: 0.3 (lower for factual extraction)

## Integration Points

### Existing Functions Used

1. **`extractBrandAssets()`** - Already implemented (Brandfetch, Logo.dev, HTML scraping)
2. **`extractColorPalette()`** - Already implemented (Brandfetch, Colorize, CSS parsing)
3. **`fetchSiteCopy()`** - New function for content extraction
4. **`inferBrandProfile()`** - New function for LLM inference

### Database Operations

1. **Domain Management**
   - Get or create Domain record
   - Update domain metadata

2. **Scan Management**
   - Create scan record (pending → processing → completed)
   - Update scan with results
   - Track extraction methods and duration

## Error Handling

- **Input Validation**: Returns 400 for missing required fields
- **Extraction Failures**: 
  - Brand assets: Falls back gracefully, continues scan
  - Colors: Falls back gracefully, continues scan
  - Site copy: Fails scan (critical for brand profile)
- **LLM Failures**: Fails scan with error message
- **Database Errors**: Returns 500 with error details

## Caching Strategy

- **24-hour cache**: Recent scans (< 24 hours) are returned without re-scanning
- **Force Rescan**: `forceRescan=true` bypasses cache
- **Cache Key**: `(organizationId, domain)`

## Performance

- **Parallel Extraction**: Brand assets and colors extracted in parallel
- **Sequential Dependencies**: Site copy fetched first (needed for color CSS parsing)
- **Duration Tracking**: Tracks total scan duration in metadata
- **Text Limits**: Limits extracted text to 15,000 chars for LLM processing

## Usage Example

```typescript
// From frontend
const { data, error } = await supabase.functions.invoke('scan-website', {
  body: {
    url: 'https://www.example.com',
    organizationId: 'org-uuid',
    forceRescan: false,
  },
});

if (data) {
  const { scan, report, cached } = data;
  // Use report for display or PDF generation
}
```

## Next Steps

1. **Add Screenshot Support** - For visual analysis and color clustering
2. **Add Performance Metrics** - Basic SEO/performance checks
3. **Add Report Scoring** - Calculate brand consistency scores
4. **Add Recommendations** - Generate actionable recommendations
5. **Add Typography Detection** - Extract fonts from CSS/Google Fonts

## Testing

Test the endpoint with:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/scan-website \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.example.com",
    "organizationId": "org-uuid"
  }'
```

