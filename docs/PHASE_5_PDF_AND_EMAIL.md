# Phase 5: One-Time PDF vs "Living" PDF - Complete

## Overview

Phase 5 implements the email notification system for first scans and the PDF generation endpoint for "living" reports.

## Implementation

### Email on First Scan

**Function**: `send-report-email/index.ts`

Sends an email when a brand scan is completed for the first time:

- **Recipient**: Organization owner email
- **Content**:
  - Link to living report page (`/reports/[domain]`)
  - Download PDF link (when PDF generation is implemented)
  - Brand name and domain
  - Report highlights

**Email Features**:
- Professional HTML template
- mapsystem.io branding
- Clear call-to-action buttons
- Responsive design

**Integration**:
- Called automatically from `scan-website` function
- Only triggers on first scan (`scanCount === 1`)
- Fire-and-forget (doesn't block scan completion)
- Graceful failure (scan succeeds even if email fails)

### PDF Generation Endpoint

**Function**: `generate-report-pdf/index.ts`

**Route**: `/api/reports/[domain]/pdf`

Generates PDF from report page URL:

- Takes domain and optional scanId
- Constructs report URL
- **TODO**: Implement Playwright/Puppeteer PDF rendering
- **Current**: Returns instructions for browser print-to-PDF

**Future Implementation**:
```typescript
// When Playwright/Puppeteer is available:
const browser = await playwright.chromium.launch();
const page = await browser.newPage();
await page.goto(reportUrl, { waitUntil: 'networkidle0' });
const pdfBuffer = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
});

// Upload to Supabase Storage
// Save as: reports/{domain}/{timestamp}.pdf
// Also save as: reports/{domain}/latest.pdf
```

### Report Page Updates

**Updated**: `BrandReport.tsx`

- **"Download Latest PDF" Button**:
  - Prominent, large button
  - Calls `generate-report-pdf` endpoint
  - Handles multiple response formats (pdfUrl, latestPdfUrl, fallback)
  - Falls back to browser print-to-PDF if PDF generation not available

- **Living Report Messaging**:
  - Clear indication this is a "living report"
  - Explains that it updates with each new scan
  - Suggests bookmarking the page

### Utility Functions

**Created**: `reportUtils.ts`

Utility functions for reliable data processing:

1. **`normalizeDomain(urlOrDomain)`**
   - Converts URLs to canonical domain format
   - Handles protocols, www, paths, ports, fragments
   - Examples: `https://www.example.com/path` → `example.com`

2. **`normalizeColor(color)`**
   - Converts colors to hex format
   - Handles: rgb(), rgba(), hsl(), named colors, hex
   - Returns `#RRGGBB` format or null

3. **`normalizeColorPalette(colors, options)`**
   - Normalizes array of colors
   - Deduplicates
   - Orders by frequency, hue, or alphabetically

4. **`safeLLMCall(callFn, fallback, options)`**
   - Wraps LLM calls with retry logic
   - Validates results
   - Returns fallback on failure
   - Configurable retries and delays

5. **`cleanLLMJSONResponse(text)`**
   - Removes markdown code blocks
   - Cleans whitespace
   - Prepares JSON for parsing

6. **`validateBrandReport(report)`**
   - Validates BrandReport structure
   - Ensures required fields present
   - Type-safe validation

## Behavior

### On First Scan

1. **Scan Completes**
   - BrandReport generated and saved
   - Domain record updated
   - Scan count = 1

2. **Email Triggered**
   - Detects first scan (`scanCount === 1`)
   - Gets organization owner email
   - Calls `send-report-email` function
   - Email includes:
     - Link to `/reports/[domain]?scanId=latest`
     - Download PDF link (when available)
     - Brand name and highlights

3. **User Receives Email**
   - Professional HTML email
   - Clear call-to-action
   - Can view report or download PDF

### For "Living" Report

1. **Canonical URL**
   - Always link to `/reports/[domain]`
   - Shows latest scan by default
   - Can specify `scanId` for historical scans

2. **Download Latest PDF**
   - Prominent button on report page
   - Calls `/api/reports/[domain]/pdf`
   - Generates PDF on-demand
   - Always reflects latest scan

3. **Optional: Auto-Regenerate PDF**
   - On each new scan, automatically regenerate PDF
   - Save to fixed path: `/storage/reports/{domain}/latest.pdf`
   - Provides truly static "living PDF" URL
   - **Not yet implemented** (requires PDF generation)

## Usage

### Email Flow

```typescript
// Automatically triggered on first scan
// No manual action required
```

### PDF Generation

```typescript
// From frontend
const { data, error } = await supabase.functions.invoke('generate-report-pdf', {
  body: {
    domain: 'example.com',
    scanId: 'latest', // or specific scan ID
  },
});

if (data?.pdfUrl) {
  // Download PDF
  window.open(data.pdfUrl);
}
```

### Report Page

```typescript
// Navigate to report
/reports/example.com?scanId=latest

// Click "Download Latest PDF" button
// PDF generated on-demand
```

## Next Steps

1. **Implement PDF Generation**
   - Add Playwright/Puppeteer to Supabase Functions
   - Render report page as PDF
   - Upload to Supabase Storage
   - Return PDF URL

2. **Auto-Regenerate PDF (Optional)**
   - On new scan, regenerate PDF
   - Save to `/storage/reports/{domain}/latest.pdf`
   - Update email to include PDF attachment

3. **PDF Attachments**
   - Attach PDF to email (when PDF generation available)
   - Provide both link and attachment

4. **Report History**
   - Show scan history on report page
   - Allow downloading historical PDFs
   - Compare scans over time

## Benefits

1. **User Experience**
   - Immediate email notification on first scan
   - Clear path to view/download report
   - Always up-to-date "living" report

2. **Reliability**
   - Utility functions ensure data consistency
   - Safe LLM calls with fallbacks
   - Graceful error handling

3. **Flexibility**
   - Can view latest or historical scans
   - PDF generation on-demand
   - Optional auto-regeneration

4. **Scalability**
   - Email doesn't block scan completion
   - PDF generation can be async
   - Storage-based PDF URLs

