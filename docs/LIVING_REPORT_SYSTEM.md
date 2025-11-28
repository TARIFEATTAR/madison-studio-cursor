# Living Report System Architecture

## Overview

The Living Report System provides both a one-off lead magnet PDF and a "living" web-based report that always reflects the latest brand scan. The PDF is treated as an export format, not the source of truth.

## Architecture

### Source of Truth: Database

**`brand_scans` Table** (New Migration)
- Stores all scan results as structured JSONB
- One row per scan per domain per organization
- Includes scan type, status, and full scan data
- Enables version history and "latest scan" queries

**Key Fields:**
- `organization_id` - Links to organization
- `domain` - The scanned domain
- `scan_type` - Type of scan ('brand_dna', 'website_scrape', etc.)
- `scan_data` - Full JSONB scan result
- `status` - Scan status ('pending', 'processing', 'completed', 'failed')
- `created_at` - Timestamp for version tracking

### Report Template

**`BrandReportTemplate` Component** (`src/components/reports/BrandReportTemplate.tsx`)
- Single HTML template used for both web and PDF
- Uses Madison design tokens (mapsystem.io brand)
- Dynamically applies extracted brand colors/logos
- Print-optimized with page breaks
- Responsive for web viewing

**Sections:**
1. Cover Page - Brand name, logo, generation date
2. Core Identity - Mission, values, target audience
3. Brand Voice - Tone, style, perspective
4. Visual Identity - Color palette, typography
5. Strategic Audit - Strengths, weaknesses, opportunities
6. Vocabulary - Keywords, phrases, forbidden words
7. Content Strategy - Themes, narrative hooks

### Report Page

**`BrandReport` Page** (`src/pages/BrandReport.tsx`)
- Route: `/reports/:domainId?scanId=latest`
- Fetches latest scan (or specific scan by ID)
- Displays using BrandReportTemplate
- Includes "Download PDF" button
- Auto-refreshes to show latest data

**Features:**
- Shows latest scan by default (`scanId=latest`)
- Can view historical scans (`scanId=<scan-id>`)
- Download button generates PDF on-demand
- Responsive design for all devices

### PDF Rendering

**`render-pdf-from-url` Function** (`supabase/functions/render-pdf-from-url/index.ts`)
- **Status**: Stub implementation (needs Playwright/Puppeteer)
- Takes a URL and renders it as PDF
- Should use Playwright/Puppeteer MCP tool or headless browser
- Uploads PDF to Supabase Storage
- Returns PDF URL or blob

**TODO**: Implement actual PDF rendering using:
- Playwright MCP tool: `mcp_render_pdf_from_url`
- Or Puppeteer/Playwright directly
- Or external service (browserless.io, etc.)

### Integration Points

**`analyze-brand-dna` Function**
- Now saves scans to `brand_scans` table
- Maintains backward compatibility with `organizations.brand_config`
- Extracts domain from website URL
- Saves full scan data as JSONB

**Onboarding Success Page**
- Shows "Download Initial Brand Audit (PDF)" button
- Includes link to living report: `/reports/:domainId?scanId=latest`
- Both options available to users

## Usage Flow

### Initial Scan (Onboarding)
1. User completes brand DNA scan
2. Scan saved to `brand_scans` table
3. User sees success page with:
   - Download PDF button (one-off lead magnet)
   - Link to living report (always up-to-date)

### Living Report Access
1. User visits `/reports/:domainId?scanId=latest`
2. System fetches latest completed scan
3. Displays using BrandReportTemplate
4. User can download PDF anytime (always latest)

### New Scan
1. User runs new brand scan
2. New scan saved to `brand_scans` table
3. Living report automatically shows new data
4. PDF download reflects latest scan

## Database Schema

```sql
CREATE TABLE brand_scans (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  domain TEXT NOT NULL,
  scan_type TEXT DEFAULT 'brand_dna',
  scan_data JSONB NOT NULL,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Next Steps

### 1. Implement PDF Rendering
- Add Playwright/Puppeteer to Supabase Functions
- Or integrate with browserless.io or similar service
- Or use MCP tool for headless browser rendering

### 2. Add Report History
- Show scan history on report page
- Allow users to compare scans over time
- Add "View Previous Scan" functionality

### 3. Email Integration
- Send one-off PDF via email after first scan
- Include link to living report in email
- Set up email templates

### 4. Report Sharing
- Add shareable links (public/private)
- Generate unique report URLs
- Add password protection option

### 5. Report Customization
- Allow users to customize report sections
- Add/remove sections based on scan type
- Brand the report with their logo/colors

## Benefits

1. **Single Source of Truth**: Database stores all scan data
2. **Always Up-to-Date**: Living report reflects latest scan
3. **Version History**: Can track changes over time
4. **Flexible Export**: PDF generated on-demand from HTML
5. **Consistent Design**: Same template for web and PDF
6. **Brand-Aware**: Uses extracted colors/logos in template

## Technical Notes

- Report template uses Tailwind classes with print media queries
- Page breaks controlled via `print:page-break-after-always`
- Brand colors applied via CSS custom properties
- Responsive design works on mobile and desktop
- PDF rendering will use headless browser for accurate rendering

